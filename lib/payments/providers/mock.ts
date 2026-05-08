/**
 * Mock Payment Provider
 * For testing and development
 */

import {
  PaymentProvider,
  PaymentIntent,
  PaymentResult,
  RefundResult,
} from '../types';

export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock';

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: string;
    customer?: any;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntent> {
    // Simulate API delay
    await this.delay(500);

    const intentId = `mock_pi_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const clientSecret = `${intentId}_secret`;

    return {
      id: intentId,
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      clientSecret,
      metadata: {
        orderId: params.orderId,
        ...params.metadata,
      },
    };
  }

  async confirmPayment(params: {
    paymentIntentId: string;
    paymentMethodId?: string;
  }): Promise<PaymentResult> {
    // Simulate payment processing
    await this.delay(2000);

    // Mock: 95% success rate
    const success = Math.random() > 0.05;

    if (success) {
      return {
        success: true,
        paymentId: params.paymentIntentId,
        transactionId: `mock_txn_${Date.now()}`,
        status: 'succeeded',
      };
    } else {
      return {
        success: false,
        paymentId: params.paymentIntentId,
        status: 'failed',
        errorMessage: 'Mock payment failed - insufficient funds',
      };
    }
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    await this.delay(300);

    return {
      id: paymentIntentId,
      amount: 0,
      currency: 'ILS',
      status: 'succeeded',
    };
  }

  async refundPayment(params: {
    paymentId: string;
    amount?: number;
    reason?: string;
  }): Promise<RefundResult> {
    await this.delay(1000);

    return {
      success: true,
      refundId: `mock_refund_${Date.now()}`,
      amount: params.amount || 0,
      status: 'succeeded',
    };
  }

  verifyWebhookSignature(params: {
    payload: string;
    signature: string;
    secret: string;
  }): boolean {
    // Mock: always valid in development
    return true;
  }

  parseWebhookEvent(payload: any): { type: string; data: any } {
    return {
      type: payload.type || 'payment.succeeded',
      data: payload.data || {},
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
