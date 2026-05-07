import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { supabase } from '@/lib/auth/supabase';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

const querySchema = z.object({
  isActive: z.enum(['true', 'false']).optional(),
  category: z.string().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

/**
 * GET /api/manufacturers/[id]/products
 * Get all products for a manufacturer
 * Public endpoint (filters inactive products for non-admins)
 */
export const GET = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await getSession();

  // Verify manufacturer exists
  const { data: manufacturer, error: mfgError } = await supabase
    .from('manufacturers')
    .select('id, isApproved, isHidden')
    .eq('id', id)
    .single();

  if (mfgError || !manufacturer) {
    return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
  }

  // Check if user can view all
  const canViewAll = session
    ? await hasPermission(session.user.id, PERMISSIONS.PRODUCT_READ)
    : false;

  // If manufacturer is hidden or not approved and user is not admin, deny access
  if ((manufacturer.isHidden || !manufacturer.isApproved) && !canViewAll) {
    return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
  }

  // Parse query parameters
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const query = querySchema.parse(searchParams);

  // Build Supabase query
  let supabaseQuery = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('manufacturerId', id);

  // Filter by active status for non-admins
  if (!canViewAll) {
    supabaseQuery = supabaseQuery.eq('isActive', true);
  } else if (query.isActive) {
    supabaseQuery = supabaseQuery.eq('isActive', query.isActive === 'true');
  }

  // Apply category filter
  if (query.category) {
    supabaseQuery = supabaseQuery.eq('category', query.category);
  }

  // Apply pagination
  const limit = query.limit ? parseInt(query.limit) : 20;
  const offset = query.offset ? parseInt(query.offset) : 0;
  supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

  // Order by created date
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
