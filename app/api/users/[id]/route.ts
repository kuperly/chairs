import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { updateUserSchema } from '@/lib/validation/user';
import { supabase } from '@/lib/auth/supabase';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/users/[id]
 * Get a single user by ID
 * Requires: user.read permission (admin only)
 */
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.USER_READ);

  const { data: user, error } = await supabase
    .from('users')
    .select(
      `
      *,
      roles(id, name, description),
      manufacturers(id, companyName, logoUrl, description)
    `
    )
    .eq('id', id)
    .single();

  if (error || !user) {
    return errorResponse('User not found', 404, 'USER_NOT_FOUND');
  }

  return successResponse(user);
});

/**
 * PUT /api/users/[id]
 * Update a user (admin only)
 * Requires: user.update permission
 */
export const PUT = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.USER_UPDATE);

  // Get existing user
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingUser) {
    return errorResponse('User not found', 404, 'USER_NOT_FOUND');
  }

  // Parse and validate update data
  const body = await req.json();
  const validatedData = updateUserSchema.parse(body);

  // If role is being updated, verify it exists
  if (validatedData.roleId) {
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('id', validatedData.roleId)
      .single();

    if (roleError || !role) {
      return errorResponse('Role not found', 404, 'ROLE_NOT_FOUND');
    }
  }

  // If manufacturer is being updated, verify it exists
  if (validatedData.manufacturerId !== undefined) {
    if (validatedData.manufacturerId !== null) {
      const { data: manufacturer, error: mfgError } = await supabase
        .from('manufacturers')
        .select('id')
        .eq('id', validatedData.manufacturerId)
        .single();

      if (mfgError || !manufacturer) {
        return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
      }
    }
  }

  // Update user
  const updateData: any = {
    updatedAt: new Date().toISOString(),
  };

  if (validatedData.fullName) updateData.fullName = validatedData.fullName;
  if (validatedData.roleId) updateData.roleId = validatedData.roleId;
  if (validatedData.manufacturerId !== undefined) {
    updateData.manufacturerId = validatedData.manufacturerId;
  }
  if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select(
      `
      *,
      roles(id, name, description),
      manufacturers(id, companyName, logoUrl)
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return successResponse(user, 'User updated successfully');
});

/**
 * DELETE /api/users/[id]
 * Delete a user (soft delete - deactivate)
 * Requires: user.delete permission
 */
export const DELETE = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.USER_DELETE);

  // Prevent self-deletion
  if (id === session.user.id) {
    return errorResponse('Cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
  }

  // Check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .single();

  if (fetchError || !existingUser) {
    return errorResponse('User not found', 404, 'USER_NOT_FOUND');
  }

  // Soft delete - mark as inactive
  const { error } = await supabase
    .from('users')
    .update({
      isActive: false,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }

  return successResponse({ deleted: true }, 'User deactivated successfully');
});
