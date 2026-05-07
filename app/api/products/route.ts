import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { getSession, requireSession } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { createProductSchema, listProductsQuerySchema } from '@/lib/validation/product';
import { supabase } from '@/lib/auth/supabase';

/**
 * GET /api/products
 * List products with optional filtering
 * Public endpoint (no auth required)
 */
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest) => {
  // Parse query parameters
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const query = listProductsQuerySchema.parse(searchParams);

  // Build Supabase query
  let supabaseQuery = supabase
    .from('products')
    .select('*, manufacturers(id, companyName, logoUrl)', { count: 'exact' });

  // Apply filters
  if (query.category) {
    supabaseQuery = supabaseQuery.eq('category', query.category);
  }

  if (query.manufacturerId) {
    supabaseQuery = supabaseQuery.eq('manufacturerId', query.manufacturerId);
  }

  if (query.isActive) {
    supabaseQuery = supabaseQuery.eq('isActive', query.isActive === 'true');
  }

  if (query.minPrice) {
    supabaseQuery = supabaseQuery.gte('price', parseFloat(query.minPrice));
  }

  if (query.maxPrice) {
    supabaseQuery = supabaseQuery.lte('price', parseFloat(query.maxPrice));
  }

  if (query.search) {
    supabaseQuery = supabaseQuery.or(
      `name.ilike.%${query.search}%,description.ilike.%${query.search}%`
    );
  }

  // Apply pagination
  const limit = query.limit ? parseInt(query.limit) : 20;
  const offset = query.offset ? parseInt(query.offset) : 0;
  supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

  // Order by created date (newest first)
  supabaseQuery = supabaseQuery.order('createdAt', { ascending: false });

  const { data: products, error, count } = await supabaseQuery;

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return successResponse({
    products,
    pagination: {
      total: count || 0,
      limit,
      offset,
    },
  });
});

/**
 * POST /api/products
 * Create a new product
 * Requires: product.create permission
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  // Require authentication
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.PRODUCT_CREATE);

  // Parse and validate request body
  const body = await req.json();
  const validatedData = createProductSchema.parse(body);

  // Verify manufacturer exists
  const { data: manufacturer, error: mfgError } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('id', validatedData.manufacturerId)
    .single();

  if (mfgError || !manufacturer) {
    return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
  }

  // Create product
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.price,
      compareAtPrice: validatedData.compareAtPrice,
      category: validatedData.category,
      stockQuantity: validatedData.stockQuantity,
      imageUrls: validatedData.imageUrls,
      manufacturerId: validatedData.manufacturerId,
      isActive: validatedData.isActive,
    })
    .select('*, manufacturers(id, companyName, logoUrl)')
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return successResponse(product, 'Product created successfully');
});
