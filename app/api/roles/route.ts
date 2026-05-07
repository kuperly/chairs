import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { supabase } from '@/lib/auth/supabase';

/**
 * GET /api/roles
 * List all roles
 * Requires: user.read permission (admin only)
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.USER_READ);

  const { data: roles, error } = await supabase
    .from('roles')
    .select(
      `
      *,
      role_permissions(
        permissions(id, name, description, resource, action)
      )
    `
    )
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch roles: ${error.message}`);
  }

  return successResponse({ roles });
});
