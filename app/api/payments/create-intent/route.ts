import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { supabase } from '@/lib/auth/supabase';
import { z } from 'zod';

const createPaymentIntentSchema = z.object({
  orderId: z.string().uuid(),
});

/**
 * POST /api/payments/create-intent
 * Create a Stripe payment intent for an order
 * For POC: Returns mock client secret
 * For Production: Would create real Stripe payment intent
 */
export const dynamic = 'force-dynamic';

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireSession();

  // Parse request body
  const body = await req.json();
  const { orderId } = createPaymentIntentSchema.parse(body);

  // Get order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
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
      `Cannot create payment for order with status: ${order.status}`,
      400,
      'INVALID_ORDER_STATUS'
    );
  }

  // TODO: For production, create real Stripe payment intent
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: Math.round(order.totalAmount * 100), // Convert to cents
  //   currency: 'usd',
  //   metadata: {
  //     orderId: order.id,
  //     orderNumber: order.orderNumber,
  //   },
  // });

  // For POC, return mock client secret
  const mockClientSecret = `mock_secret_${orderId}_${Date.now()}`;

  return successResponse({
    clientSecret: mockClientSecret,
    orderId: order.id,
    amount: order.totalAmount,
  });
});
