/**
 * Payment Provider Factory
 * Selects payment provider based on environment configuration and feature flags
 */

import { PaymentProvider, PaymentProviderType } from './types';
import { MockPaymentProvider } from './providers/mock';
import { MeshulamPaymentProvider } from './providers/meshulam';

/**
 * Get the active payment provider based on environment configuration
 */
export function getPaymentProvider(): PaymentProvider {
  const provider = (process.env.PAYMENT_PROVIDER || 'mock') as PaymentProviderType;
  const enabled = process.env.PAYMENT_ENABLED !== 'false';

  if (!enabled) {
    console.warn('Payment processing is disabled. Using mock provider.');
    return new MockPaymentProvider();
  }

  switch (provider) {
    case PaymentProviderType.MOCK:
      return new MockPaymentProvider();

    case PaymentProviderType.STRIPE:
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is required for Stripe provider');
      }
      // return new StripePaymentProvider(process.env.STRIPE_SECRET_KEY);
      throw new Error('Stripe provider not yet implemented. Set PAYMENT_PROVIDER=mock');

    case PaymentProviderType.TRANZILA:
      if (!process.env.TRANZILA_API_KEY || !process.env.TRANZILA_TERMINAL) {
        throw new Error('TRANZILA_API_KEY and TRANZILA_TERMINAL are required');
      }
      // return new TranzilaPaymentProvider({
      //   apiKey: process.env.TRANZILA_API_KEY,
      //   terminal: process.env.TRANZILA_TERMINAL,
      // });
      throw new Error('Tranzila provider not yet implemented. Set PAYMENT_PROVIDER=mock');

    case PaymentProviderType.MESHULAM:
      if (!process.env.MESHULAM_API_KEY || !process.env.MESHULAM_PAGE_CODE) {
        throw new Error('MESHULAM_API_KEY and MESHULAM_PAGE_CODE are required');
      }
      return new MeshulamPaymentProvider({
        apiKey: process.env.MESHULAM_API_KEY,
        pageCode: process.env.MESHULAM_PAGE_CODE,
        environment: (process.env.PAYMENT_ENVIRONMENT as 'test' | 'production') || 'test',
      });

    case PaymentProviderType.CARDCOM:
      if (!process.env.CARDCOM_API_KEY || !process.env.CARDCOM_TERMINAL) {
        throw new Error('CARDCOM_API_KEY and CARDCOM_TERMINAL are required');
      }
      // return new CardcomPaymentProvider({
      //   apiKey: process.env.CARDCOM_API_KEY,
      //   terminal: process.env.CARDCOM_TERMINAL,
      // });
      throw new Error('Cardcom provider not yet implemented. Set PAYMENT_PROVIDER=mock');

    default:
      console.warn(`Unknown payment provider: ${provider}. Falling back to mock.`);
      return new MockPaymentProvider();
  }
}

/**
 * Check if a specific payment provider is enabled
 */
export function isPaymentProviderEnabled(provider: PaymentProviderType): boolean {
  const activeProvider = process.env.PAYMENT_PROVIDER || 'mock';
  const enabled = process.env.PAYMENT_ENABLED !== 'false';

  return enabled && activeProvider === provider;
}

/**
 * Get payment provider configuration
 */
export function getPaymentProviderConfig() {
  return {
    provider: (process.env.PAYMENT_PROVIDER || 'mock') as PaymentProviderType,
    enabled: process.env.PAYMENT_ENABLED !== 'false',
    environment: (process.env.PAYMENT_ENVIRONMENT || 'test') as 'test' | 'production',
  };
}
