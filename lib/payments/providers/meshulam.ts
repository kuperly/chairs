/**
 * Meshulam Payment Provider
 * Modern Israeli payment gateway
 *
 * API Documentation: https://meshulam.docs.apiary.io/
 * Dashboard: https://www.meshulam.co.il/
 */

import {
  PaymentProvider,
  PaymentIntent,
  PaymentResult,
  RefundResult,
} from '../types';

interface MeshulamConfig {
  apiKey: string;
  pageCode: string;
  environment?: 'test' | 'production';
}

interface MeshulamCreatePageResponse {
  status: string;
  url: string;
  pageId: string;
}

export class MeshulamPaymentProvider implements PaymentProvider {
  readonly name = 'meshulam';
  private apiKey: string;
  private pageCode: string;
  private baseUrl: string;

  constructor(config: MeshulamConfig) {
    this.apiKey = config.apiKey;
    this.pageCode = config.pageCode;

    // Meshulam uses the same endpoint for test and production
    // Test mode is controlled by the page configuration in dashboard
    this.baseUrl = 'https://secure.meshulam.co.il/api';
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: string;
    customer?: any;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntent> {
    try {
      // Meshulam uses "pages" - create a payment page
      const response = await fetch(`${this.baseUrl}/light/server/1.0/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageCode: this.pageCode,
          apiKey: this.apiKey,
          action: 'createPaymentProcess',
          data: {
            // Amount in agorot (₪1 = 100 agorot)
            sum: Math.round(params.amount * 100),

            // Customer details
            fullName: params.customer?.name || '',
            email: params.customer?.email || '',
            phone: params.customer?.phone || '',

            // Order reference
            description: `Order ${params.metadata?.orderNumber || params.orderId}`,
            uniqueId: params.orderId, // Your order ID

            // Callback URLs
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${params.orderId}`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${params.orderId}`,
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/meshulam`,

            // Additional settings
            maxPayments: 1, // One-time payment (not installments)
            currency: 1, // 1 = ILS

            // Custom fields for tracking
            customFields: {
              customerId: params.metadata?.customerId || '',
              orderNumber: params.metadata?.orderNumber || '',
            },
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meshulam API error: ${JSON.stringify(error)}`);
      }

      const data: MeshulamCreatePageResponse = await response.json();

      if (data.status !== '1') {
        throw new Error('Failed to create Meshulam payment page');
      }

      return {
        id: data.pageId,
        amount: params.amount,
        currency: params.currency,
        status: 'pending',
        clientSecret: data.url, // Payment page URL
        metadata: {
          pageId: data.pageId,
          orderId: params.orderId,
        },
      };
    } catch (error) {
      console.error('Meshulam createPaymentIntent error:', error);
      throw error;
    }
  }

  async confirmPayment(params: {
    paymentIntentId: string;
    paymentMethodId?: string;
  }): Promise<PaymentResult> {
    try {
      // Check payment status
      const response = await fetch(`${this.baseUrl}/light/server/1.0/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageCode: this.pageCode,
          apiKey: this.apiKey,
          action: 'getPaymentStatus',
          data: {
            pageId: params.paymentIntentId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();

      // Meshulam status codes:
      // 1 = Success
      // 2 = Pending
      // 3 = Failed
      // 4 = Cancelled

      const statusMap: Record<string, 'succeeded' | 'failed' | 'pending'> = {
        '1': 'succeeded',
        '2': 'pending',
        '3': 'failed',
        '4': 'failed',
      };

      const status = statusMap[data.status] || 'failed';

      return {
        success: status === 'succeeded',
        paymentId: params.paymentIntentId,
        transactionId: data.transactionId || data.pageId,
        status,
        errorMessage: status === 'failed' ? data.errorMessage : undefined,
        metadata: data,
      };
    } catch (error) {
      console.error('Meshulam confirmPayment error:', error);
      return {
        success: false,
        paymentId: params.paymentIntentId,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Payment confirmation failed',
      };
    }
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/light/server/1.0/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageCode: this.pageCode,
          apiKey: this.apiKey,
          action: 'getPaymentStatus',
          data: {
            pageId: paymentIntentId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get payment status');
      }

      const data = await response.json();

      const statusMap: Record<string, 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'> = {
        '1': 'succeeded',
        '2': 'pending',
        '3': 'failed',
        '4': 'canceled',
      };

      return {
        id: paymentIntentId,
        amount: data.sum ? data.sum / 100 : 0, // Convert from agorot
        currency: 'ILS',
        status: statusMap[data.status] || 'failed',
        metadata: data,
      };
    } catch (error) {
      console.error('Meshulam getPaymentStatus error:', error);
      throw error;
    }
  }

  async refundPayment(params: {
    paymentId: string;
    amount?: number;
    reason?: string;
  }): Promise<RefundResult> {
    try {
      const response = await fetch(`${this.baseUrl}/light/server/1.0/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageCode: this.pageCode,
          apiKey: this.apiKey,
          action: 'cancelPayment',
          data: {
            transactionId: params.paymentId,
            sum: params.amount ? Math.round(params.amount * 100) : undefined, // Partial refund
            reason: params.reason,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const data = await response.json();

      return {
        success: data.status === '1',
        refundId: data.refundId || params.paymentId,
        amount: params.amount || 0,
        status: data.status === '1' ? 'succeeded' : 'failed',
        errorMessage: data.status !== '1' ? data.errorMessage : undefined,
      };
    } catch (error) {
      console.error('Meshulam refundPayment error:', error);
      return {
        success: false,
        refundId: params.paymentId,
        amount: params.amount || 0,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Refund failed',
      };
    }
  }

  verifyWebhookSignature(params: {
    payload: string;
    signature: string;
    secret: string;
  }): boolean {
    // Meshulam uses IP whitelist for webhook security
    // You configure allowed IPs in the dashboard
    // For additional security, you can verify the webhook secret

    // Simple verification: check if webhook contains the page code
    try {
      const data = JSON.parse(params.payload);
      return data.pageCode === this.pageCode;
    } catch {
      return false;
    }
  }

  parseWebhookEvent(payload: any): { type: string; data: any } {
    // Meshulam webhook payload structure
    const event = {
      type: 'payment.succeeded', // Default type
      data: payload,
    };

    // Determine event type based on status
    if (payload.status === '1') {
      event.type = 'payment.succeeded';
    } else if (payload.status === '2') {
      event.type = 'payment.pending';
    } else if (payload.status === '3') {
      event.type = 'payment.failed';
    } else if (payload.status === '4') {
      event.type = 'payment.canceled';
    }

    return event;
  }
}
