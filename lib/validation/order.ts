import { z } from 'zod';

/**
 * Order status enum
 */
export const orderStatusEnum = z.enum([
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

/**
 * Shipping address schema
 */
export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

/**
 * Order item schema (for creating orders)
 */
export const orderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
});

/**
 * Validation schema for creating an order
 */
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  shippingAddress: shippingAddressSchema,
  eventId: z.string().uuid().optional().nullable(), // If purchased during/after an event
});

/**
 * Validation schema for updating order status
 */
export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Query parameters for listing orders
 */
export const listOrdersQuerySchema = z.object({
  status: orderStatusEnum.optional(),
  customerId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
