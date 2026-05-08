import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { supabase } from '@/lib/auth/supabase';
import { getPaymentProvider, getPaymentProviderConfig } from '@/lib/payments/factory';
import { z } from 'zod';

const createPaymentIntentSchema = z.object({
  orderId: z.string().uuid(),
});

/**
 * POST /api/payments/create-intent
 * Create a payment intent using configured payment provider
 * Provider is selected via environment variables:
 * - PAYMENT_PROVIDER=mock|stripe|tranzila|meshulam|cardcom
 * - PAYMENT_ENABLED=true|false
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

  // Get payment provider (uses feature flags and env config)
  const paymentProvider = getPaymentProvider();
  const config = getPaymentProviderConfig();

  console.log(`Creating payment intent with provider: ${config.provider}`);

  try {
    // Create payment intent using configured provider
    const paymentIntent = await paymentProvider.createPaymentIntent({
      amount: order.totalAmount,
      currency: 'ILS', // Default to Israeli Shekels
      orderId: order.id,
      customer: {
        email: session.user.email || '',
        name: order.shippingAddress?.fullName || '',
        phone: order.shippingAddress?.phone,
      },
      metadata: {
        orderNumber: order.orderNumber,
        customerId: session.user.id,
      },
    });

    return successResponse({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      amount: order.totalAmount,
      provider: config.provider,
      environment: config.environment,
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    return errorResponse(
      'Failed to create payment intent',
      500,
      'PAYMENT_INTENT_CREATION_FAILED'
    );
  }
});
