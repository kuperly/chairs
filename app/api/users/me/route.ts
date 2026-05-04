import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { updateProfileSchema } from '@/lib/validation/user';
import { supabase } from '@/lib/auth/supabase';
import { getUserPermissions } from '@/lib/permissions/check';

/**
 * GET /api/users/me
 * Get current user's profile
 * Requires: authentication only
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await requireSession();

  // Fetch user with full details
  const { data: user, error } = await supabase
    .from('users')
    .select(
      `
      *,
      roles(id, name, description),
      manufacturers(id, companyName, logoUrl, description, isApproved, isHidden)
    `
    )
    .eq('id', session.user.id)
    .single();

  if (error || !user) {
    return errorResponse('User not found', 404, 'USER_NOT_FOUND');
  }

  // Get user's permissions
  const permissions = await getUserPermissions(session.user.id);

  return successResponse({
    ...user,
    permissions,
  });
});

/**
 * PUT /api/users/me
 * Update current user's profile
 * Requires: authentication only
 * Users can only update their own fullName, not role or manufacturer
 */
export const PUT = withErrorHandling(async (req: NextRequest) => {
  const session = await requireSession();

  // Parse and validate update data
  const body = await req.json();
  const validatedData = updateProfileSchema.parse(body);

  // Update user
  const { data: user, error } = await supabase
    .from('users')
    .update({
      fullName: validatedData.fullName,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', session.user.id)
    .select(
      `
      *,
      roles(id, name, description),
      manufacturers(id, companyName, logoUrl)
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return successResponse(user, 'Profile updated successfully');
});
