/**
 * Payment Provider Abstraction Types
 * Supports multiple payment providers with feature flags
 */

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  clientSecret?: string; // For client-side confirmation
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  status: 'succeeded' | 'failed' | 'pending';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'pending';
  errorMessage?: string;
}

export interface PaymentMethodDetails {
  type: 'card' | 'bank_transfer' | 'digital_wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface CustomerDetails {
  id?: string;
  email: string;
  name: string;
  phone?: string;
}

/**
 * Payment Provider Interface
 * All payment providers must implement this interface
 */
export interface PaymentProvider {
  /**
   * Provider name for logging and feature flags
   */
  readonly name: string;

  /**
   * Create a payment intent
   */
  createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: string;
    customer?: CustomerDetails;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntent>;

  /**
   * Confirm a payment (after customer authorization)
   */
  confirmPayment(params: {
    paymentIntentId: string;
    paymentMethodId?: string;
  }): Promise<PaymentResult>;

  /**
   * Retrieve payment status
   */
  getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent>;

  /**
   * Refund a payment
   */
  refundPayment(params: {
    paymentId: string;
    amount?: number; // Partial refund if specified
    reason?: string;
  }): Promise<RefundResult>;

  /**
   * Verify webhook signature (for payment confirmations)
   */
  verifyWebhookSignature(params: {
    payload: string;
    signature: string;
    secret: string;
  }): boolean;

  /**
   * Parse webhook event
   */
  parseWebhookEvent(payload: any): {
    type: string;
    data: any;
  };
}

/**
 * Supported payment providers
 */
export enum PaymentProviderType {
  MOCK = 'mock',
  STRIPE = 'stripe',
  TRANZILA = 'tranzila',
  MESHULAM = 'meshulam',
  CARDCOM = 'cardcom',
}

/**
 * Payment provider configuration
 */
export interface PaymentProviderConfig {
  provider: PaymentProviderType;
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  environment?: 'test' | 'production';
  metadata?: Record<string, any>;
}
