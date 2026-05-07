import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { getSession, requireSession } from '@/lib/auth/session';
import { hasPermission, requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { createManufacturerSchema, listManufacturersQuerySchema } from '@/lib/validation/manufacturer';
import { supabase } from '@/lib/auth/supabase';

/**
 * GET /api/manufacturers
 * List manufacturers
 * Public endpoint (filters hidden manufacturers for non-admins)
 */
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await getSession();

  // Parse query parameters
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const query = listManufacturersQuerySchema.parse(searchParams);

  // Build Supabase query
  let supabaseQuery = supabase
    .from('manufacturers')
    .select(
      `
      *,
      products(count),
      live_events(count)
    `,
      { count: 'exact' }
    );

  // Check if user can view all manufacturers
  const canViewAll = session
    ? await hasPermission(session.user.id, PERMISSIONS.MANUFACTURER_READ)
    : false;

  // If not admin, hide manufacturers marked as hidden
  if (!canViewAll) {
    supabaseQuery = supabaseQuery.eq('isHidden', false);
    // Also only show approved manufacturers to public
    supabaseQuery = supabaseQuery.eq('isApproved', true);
  } else {
    // Admin can filter by approved/hidden status
    if (query.isApproved) {
      supabaseQuery = supabaseQuery.eq('isApproved', query.isApproved === 'true');
    }
    if (query.isHidden) {
      supabaseQuery = supabaseQuery.eq('isHidden', query.isHidden === 'true');
    }
  }

  // Apply search filter
  if (query.search) {
    supabaseQuery = supabaseQuery.or(
      `companyName.ilike.%${query.search}%,description.ilike.%${query.search}%`
    );
  }

  // Apply pagination
  const limit = query.limit ? parseInt(query.limit) : 20;
  const offset = query.offset ? parseInt(query.offset) : 0;
  supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

  // Order by company name
  supabaseQuery = supabaseQuery.order('companyName', { ascending: true });

  const { data: manufacturers, error, count } = await supabaseQuery;

  if (error) {
    throw new Error(`Failed to fetch manufacturers: ${error.message}`);
  }

  return successResponse({
    manufacturers,
    pagination: {
      total: count || 0,
      limit,
      offset,
    },
  });
});

/**
 * POST /api/manufacturers
 * Create a new manufacturer
 * Requires: manufacturer.create permission (admin only)
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.MANUFACTURER_CREATE);

  // Parse and validate request body
  const body = await req.json();
  const validatedData = createManufacturerSchema.parse(body);

  // Check if company name already exists
  const { data: existingManufacturer } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('companyName', validatedData.companyName)
    .single();

  if (existingManufacturer) {
    return errorResponse('Company name already exists', 400, 'COMPANY_NAME_EXISTS');
  }

  // Create manufacturer
  const { data: manufacturer, error } = await supabase
    .from('manufacturers')
    .insert({
      companyName: validatedData.companyName,
      description: validatedData.description,
      logoUrl: validatedData.logoUrl,
      isApproved: validatedData.isApproved,
      isHidden: validatedData.isHidden,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create manufacturer: ${error.message}`);
  }

  // TODO: Send notification email to admin for approval if not auto-approved

  return successResponse(manufacturer, 'Manufacturer created successfully');
});
