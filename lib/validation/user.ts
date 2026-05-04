import { z } from 'zod';

/**
 * Validation schema for creating a user (admin only)
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required').max(255),
  roleId: z.string().uuid('Invalid role ID'),
  manufacturerId: z.string().uuid().optional().nullable(),
  supabaseAuthId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

/**
 * Validation schema for updating a user
 */
export const updateUserSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  roleId: z.string().uuid().optional(),
  manufacturerId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * Validation schema for updating own profile
 */
export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
});

/**
 * Query parameters for listing users
 */
export const listUsersQuerySchema = z.object({
  roleId: z.string().uuid().optional(),
  manufacturerId: z.string().uuid().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
