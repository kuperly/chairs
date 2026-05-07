import { z } from 'zod';

/**
 * Validation schema for creating a product
 */
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  stockQuantity: z.number().int().min(0, 'Stock must be non-negative').default(0),
  imageUrls: z.array(z.string().url()).min(1, 'At least one image is required'),
  manufacturerId: z.string().uuid('Invalid manufacturer ID'),
  isActive: z.boolean().default(true),
});

/**
 * Validation schema for updating a product
 */
export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional().nullable(),
  category: z.string().min(1).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  imageUrls: z.array(z.string().url()).min(1).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Query parameters for listing products
 */
export const listProductsQuerySchema = z.object({
  category: z.string().optional(),
  manufacturerId: z.string().uuid().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  search: z.string().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
