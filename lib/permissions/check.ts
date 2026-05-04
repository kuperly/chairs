import { PermissionValue } from './definitions';
import { supabase } from '@/lib/auth/supabase';

/**
 * Check if a user has a specific permission
 * @param userId - The user's ID
 * @param permission - The permission to check
 * @returns true if user has permission, false otherwise
 */
export async function hasPermission(
  userId: string,
  permission: PermissionValue
): Promise<boolean> {
  try {
    // Query to check if user has the permission through their role
    const { data, error } = await supabase
      .from('users')
      .select(`
        roleId,
        roles!inner (
          role_permissions!inner (
            permissions!inner (
              name
            )
          )
        )
      `)
      .eq('id', userId)
      .eq('roles.role_permissions.permissions.name', permission)
      .single();

    if (error) {
      // User might not exist or query error
      console.error('Error checking permission:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Require a specific permission, throw error if not authorized
 * Use this in API routes to enforce permissions
 * @param userId - The user's ID
 * @param permission - The required permission
 * @throws Error if user doesn't have permission
 */
export async function requirePermission(
  userId: string,
  permission: PermissionValue
): Promise<void> {
  const allowed = await hasPermission(userId, permission);

  if (!allowed) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Get all permissions for a user
 * @param userId - The user's ID
 * @returns Array of permission names
 */
export async function getUserPermissions(
  userId: string
): Promise<PermissionValue[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        roles!inner (
          role_permissions!inner (
            permissions!inner (
              name
            )
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }

    // Extract permission names from nested structure
    const permissions: PermissionValue[] = [];
    const roleData = data?.roles as any;

    if (roleData?.role_permissions) {
      for (const rp of roleData.role_permissions) {
        if (rp?.permissions?.name) {
          permissions.push(rp.permissions.name as PermissionValue);
        }
      }
    }

    return permissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Check if user has ANY of the specified permissions
 * @param userId - The user's ID
 * @param permissions - Array of permissions to check
 * @returns true if user has at least one permission
 */
export async function hasAnyPermission(
  userId: string,
  permissions: PermissionValue[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user has ALL of the specified permissions
 * @param userId - The user's ID
 * @param permissions - Array of permissions to check
 * @returns true if user has all permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissions: PermissionValue[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission))) {
      return false;
    }
  }
  return true;
}
