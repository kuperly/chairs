import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { getSession, requireSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { updateManufacturerSchema } from '@/lib/validation/manufacturer';
import { supabase } from '@/lib/auth/supabase';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/manufacturers/[id]
 * Get a single manufacturer by ID
 * Public endpoint (hides if manufacturer is hidden and user is not admin)
 */
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await getSession();

  const { data: manufacturer, error } = await supabase
    .from('manufacturers')
    .select(
      `
      *,
      products(id, name, imageUrls, price, compareAtPrice, category, isActive),
      live_events(id, title, scheduledStartTime, status, thumbnailUrl),
      users!manufacturerId(id, fullName, email)
    `
    )
    .eq('id', id)
    .single();

  if (error || !manufacturer) {
    return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
  }

  // Check if user can view all manufacturers
  const canViewAll = session
    ? await hasPermission(session.user.id, PERMISSIONS.MANUFACTURER_READ)
    : false;

  // If manufacturer is hidden and user is not admin, deny access
  if (manufacturer.isHidden && !canViewAll) {
    return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
  }

  // If not approved and not admin, deny access
  if (!manufacturer.isApproved && !canViewAll) {
    return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
  }

  // Filter out inactive products for non-admins
  if (!canViewAll && manufacturer.products) {
    manufacturer.products = manufacturer.products.filter((p: any) => p.isActive);
  }

  return successResponse(manufacturer);
});

/**
 * PUT /api/manufacturers/[id]
 * Update a manufacturer
 * Requires: manufacturer.update.all OR manufacturer.update.own (if own manufacturer)
 */
export const PUT = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Get existing manufacturer
  const { data: existingManufacturer, error: fetchError } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingManufacturer) {
    return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
  }

  // Check permissions
  const canUpdateAll = await hasPermission(session.user.id, PERMISSIONS.MANUFACTURER_UPDATE_ALL);
  const canUpdateOwn = await hasPermission(session.user.id, PERMISSIONS.MANUFACTURER_UPDATE_OWN);

  // If user can only update own, verify ownership
  if (!canUpdateAll && canUpdateOwn) {
    // Check if user's manufacturer matches
    const { data: user } = await supabase
      .from('users')
      .select('manufacturerId')
      .eq('id', session.user.id)
      .single();

    if (user?.manufacturerId !== id) {
      return errorResponse(
        'You can only update your own manufacturer',
        403,
        'PERMISSION_DENIED'
      );
    }

    // Manufacturer owners cannot approve themselves or change hidden status
    // Parse the body to check what they're trying to update
    const body = await req.json();
    if (body.isApproved !== undefined || body.isHidden !== undefined) {
      return errorResponse(
        'You cannot change approval or hidden status',
        403,
        'PERMISSION_DENIED'
      );
    }
  } else if (!canUpdateAll) {
    return errorResponse('Permission denied', 403, 'PERMISSION_DENIED');
  }

  // Parse and validate update data
  const body = await req.json();
  const validatedData = updateManufacturerSchema.parse(body);

  // If company name is being changed, check for duplicates
  if (validatedData.companyName && validatedData.companyName !== existingManufacturer.companyName) {
    const { data: duplicate } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('companyName', validatedData.companyName)
      .neq('id', id)
      .single();

    if (duplicate) {
      return errorResponse('Company name already exists', 400, 'COMPANY_NAME_EXISTS');
    }
  }

  // Update manufacturer
  const updateData: any = {
    updatedAt: new Date().toISOString(),
  };

  if (validatedData.companyName) updateData.companyName = validatedData.companyName;
  if (validatedData.description !== undefined) updateData.description = validatedData.description;
  if (validatedData.logoUrl !== undefined) updateData.logoUrl = validatedData.logoUrl;
  if (validatedData.isApproved !== undefined) updateData.isApproved = validatedData.isApproved;
  if (validatedData.isHidden !== undefined) updateData.isHidden = validatedData.isHidden;

  const { data: manufacturer, error } = await supabase
    .from('manufacturers')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update manufacturer: ${error.message}`);
  }

  return successResponse(manufacturer, 'Manufacturer updated successfully');
});

/**
 * DELETE /api/manufacturers/[id]
 * Delete a manufacturer (soft delete - mark as hidden)
 * Requires: manufacturer.update.all permission (admin only)
 */
export const DELETE = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Check permission (using update.all since we don't have a delete permission)
  const canDelete = await hasPermission(session.user.id, PERMISSIONS.MANUFACTURER_UPDATE_ALL);
  if (!canDelete) {
    return errorResponse('Permission denied', 403, 'PERMISSION_DENIED');
  }

  // Check if manufacturer exists
  const { data: existingManufacturer, error: fetchError } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('id', id)
    .single();

  if (fetchError || !existingManufacturer) {
    return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
  }

  // Soft delete - mark as hidden and unapproved
  const { error } = await supabase
    .from('manufacturers')
    .update({
      isHidden: true,
      isApproved: false,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete manufacturer: ${error.message}`);
  }

  return successResponse({ deleted: true }, 'Manufacturer hidden successfully');
});
