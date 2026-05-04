import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { supabase } from '@/lib/auth/supabase';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().optional(), // Stripe payment intent ID
  paymentMethod: z.enum(['stripe', 'mock']).default('mock'),
});

/**
 * POST /api/orders/[id]/payment/confirm
 * Confirm payment for an order
 * For POC: Mock payment confirmation
 * For Production: Would be triggered by Stripe webhook
 */
export const POST = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Get order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !order) {
    return errorResponse('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  // Verify order belongs to current user
  if (order.customerId !== session.user.id) {
    return errorResponse('Permission denied', 403, 'PERMISSION_DENIED');
  }

  // Validate order status
  if (order.status !== 'pending') {
    return errorResponse(
      `Order is already ${order.status}`,
      400,
      'INVALID_ORDER_STATUS'
    );
  }

  // Parse request body
  const body = await req.json();
  const validatedData = confirmPaymentSchema.parse(body);

  // TODO: For production, verify Stripe payment intent here
  // For POC, we'll accept mock payments

  // Update order to paid status
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      stripePaymentIntentId: validatedData.paymentIntentId || null,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select(
      `
      *,
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

  if (updateError) {
    throw new Error(`Failed to update order: ${updateError.message}`);
  }

  // TODO: Send order confirmation email
  // TODO: Notify admin about new paid order

  return successResponse(
    updatedOrder,
    'Payment confirmed successfully. Your order is being processed.'
  );
});
