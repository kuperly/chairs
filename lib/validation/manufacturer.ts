import { z } from 'zod';

/**
 * Validation schema for creating a manufacturer
 */
export const createManufacturerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  description: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  isApproved: z.boolean().default(false),
  isHidden: z.boolean().default(false),
});

/**
 * Validation schema for updating a manufacturer
 */
export const updateManufacturerSchema = z.object({
  companyName: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  isApproved: z.boolean().optional(),
  isHidden: z.boolean().optional(),
});

/**
 * Validation schema for manufacturer approval
 */
export const approveManufacturerSchema = z.object({
  isApproved: z.boolean(),
  notes: z.string().optional(),
});

/**
 * Query parameters for listing manufacturers
 */
export const listManufacturersQuerySchema = z.object({
  isApproved: z.enum(['true', 'false']).optional(),
  isHidden: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

export type CreateManufacturerInput = z.infer<typeof createManufacturerSchema>;
export type UpdateManufacturerInput = z.infer<typeof updateManufacturerSchema>;
export type ApproveManufacturerInput = z.infer<typeof approveManufacturerSchema>;
export type ListManufacturersQuery = z.infer<typeof listManufacturersQuerySchema>;
