import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { supabase } from '@/lib/auth/supabase';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']),
});

/**
 * PUT /api/orders/[id]/status
 * Update order status
 * Customers can only update their own pending orders to paid (after payment)
 * Admins can update any order status
 */
export const dynamic = 'force-dynamic';

export const PUT = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Parse request body
  const body = await req.json();
  const { status } = updateStatusSchema.parse(body);

  // Get order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !order) {
    return errorResponse('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  // Check permissions
  const isOwner = order.customerId === session.user.id;
  const canManageOrders = await hasPermission(session.user.id, PERMISSIONS.ORDER_UPDATE);

  // Customers can only mark their pending orders as paid (after payment confirmation)
  if (isOwner && !canManageOrders) {
    if (order.status !== 'pending' || status !== 'paid') {
      return errorResponse(
        'You can only confirm payment for pending orders',
        403,
        'PERMISSION_DENIED'
      );
    }
  } else if (!canManageOrders) {
    return errorResponse('Permission denied', 403, 'PERMISSION_DENIED');
  }

  // Update order status
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      status,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(`Failed to update order status: ${updateError.message}`);
  }

  return successResponse(updatedOrder, `Order status updated to ${status}`);
});
