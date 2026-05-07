import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { updateOrderStatusSchema } from '@/lib/validation/order';
import { supabase } from '@/lib/auth/supabase';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/orders/[id]
 * Get a single order by ID
 * Requires: order.read.own (own order) OR order.read.all (any order)
 */
export const GET = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Fetch order
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      users!customerId(id, email, fullName),
      live_events!purchasedDuringEventId(id, title, status),
      order_items(
        id,
        quantity,
        priceAtPurchase,
        productName,
        productImageUrl,
        products(id, name, description, category, imageUrls)
      )
    `
    )
    .eq('id', id)
    .single();

  if (error || !order) {
    return errorResponse('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  // Check permissions
  const canViewAll = await hasPermission(session.user.id, PERMISSIONS.ORDER_READ_ALL);
  const canViewOwn = await hasPermission(session.user.id, PERMISSIONS.ORDER_READ_OWN);

  // If user can only view own orders, verify ownership
  if (!canViewAll && canViewOwn) {
    if (order.customerId !== session.user.id) {
      return errorResponse('Permission denied', 403, 'PERMISSION_DENIED');
    }
  } else if (!canViewAll && !canViewOwn) {
    return errorResponse('Permission denied', 403, 'PERMISSION_DENIED');
  }

  return successResponse(order);
});

/**
 * PUT /api/orders/[id]
 * Update order status
 * Requires: order.update permission (admin only)
 */
export const PUT = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Check permission (only admins can update orders)
  const canUpdate = await hasPermission(session.user.id, PERMISSIONS.ORDER_UPDATE);
  if (!canUpdate) {
    return errorResponse('Permission denied', 403, 'PERMISSION_DENIED');
  }

  // Get existing order
  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingOrder) {
    return errorResponse('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  // Parse and validate update data
  const body = await req.json();
  const validatedData = updateOrderStatusSchema.parse(body);

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  const allowedStatuses = validTransitions[existingOrder.status] || [];
  if (!allowedStatuses.includes(validatedData.status)) {
    return errorResponse(
      `Cannot transition from ${existingOrder.status} to ${validatedData.status}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  // Update order
  const updateData: any = {
    status: validatedData.status,
    updatedAt: new Date().toISOString(),
  };

  // If status is cancelled, restore product stock
  if (validatedData.status === 'cancelled') {
    // Get order items
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('productId, quantity')
      .eq('orderId', id);

    if (orderItems) {
      // Restore stock for each product
      for (const item of orderItems) {
        const { data: product } = await supabase
          .from('products')
          .select('stockQuantity')
          .eq('id', item.productId)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({ stockQuantity: product.stockQuantity + item.quantity })
            .eq('id', item.productId);
        }
      }
    }
  }

  // Update order in database
  const { data: order, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select(
      `
      *,
      users!customerId(id, email, fullName),
      live_events!purchasedDuringEventId(id, title),
      order_items(
        id,
        quantity,
        priceAtPurchase,
        productName,
        productImageUrl,
        products(id, name, category)
      )
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to update order: ${error.message}`);
  }

  // TODO: Send notification email to customer about status change

  return successResponse(order, `Order status updated to ${validatedData.status}`);
});
