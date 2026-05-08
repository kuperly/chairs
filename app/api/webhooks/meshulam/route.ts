import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/auth/supabase';
import { getPaymentProvider } from '@/lib/payments/factory';

/**
 * POST /api/webhooks/meshulam
 * Handle Meshulam payment webhooks
 *
 * Meshulam sends webhook when:
 * - Payment is completed
 * - Payment fails
 * - Payment is cancelled
 *
 * Configure webhook URL in Meshulam dashboard:
 * https://www.meshulam.co.il/
 */
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Get payment provider
    const paymentProvider = getPaymentProvider();

    // Only process if using Meshulam
    if (paymentProvider.name !== 'meshulam') {
      return NextResponse.json(
        { error: 'Webhook not configured for current payment provider' },
        { status: 400 }
      );
    }

    // Get webhook payload
    const payload = await req.json();
    console.log('Meshulam webhook received:', payload);

    // Verify webhook (Meshulam uses IP whitelist + pageCode verification)
    const signature = req.headers.get('x-meshulam-signature') || '';
    const secret = process.env.MESHULAM_WEBHOOK_SECRET || '';

    const isValid = paymentProvider.verifyWebhookSignature({
      payload: JSON.stringify(payload),
      signature,
      secret,
    });

    if (!isValid) {
      console.error('Invalid Meshulam webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook event
    const event = paymentProvider.parseWebhookEvent(payload);
    console.log('Webhook event type:', event.type);

    // Get order ID from webhook data
    const orderId = payload.uniqueId || payload.customFields?.orderId;

    if (!orderId) {
      console.error('No order ID in webhook payload');
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    // Get order from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Handle different event types
    switch (event.type) {
      case 'payment.succeeded': {
        // Payment successful - update order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripePaymentIntentId: payload.transactionId || payload.pageId,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('Failed to update order:', updateError);
          return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
          );
        }

        console.log(`Order ${orderId} marked as paid`);

        // TODO: Send confirmation email
        // TODO: Notify admin

        break;
      }

      case 'payment.failed':
      case 'payment.canceled': {
        // Payment failed or cancelled - optionally update order status
        console.log(`Payment ${event.type} for order ${orderId}`);

        // Optionally mark order as cancelled
        // await supabase
        //   .from('orders')
        //   .update({ status: 'cancelled' })
        //   .eq('id', orderId);

        break;
      }

      case 'payment.pending': {
        // Payment is pending (e.g., bank transfer)
        console.log(`Payment pending for order ${orderId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Acknowledge webhook
    return NextResponse.json({ received: true, orderId });
  } catch (error) {
    console.error('Meshulam webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
