# Payment Provider Setup Guide

This guide explains how to configure payment processing for the ecommerce platform.

---

## Quick Start

The payment system uses a **provider abstraction layer** with **feature flags**, allowing you to switch between payment providers via environment variables.

### For Development (Mock Payments)

```bash
# .env.local
PAYMENT_PROVIDER=mock
PAYMENT_ENABLED=true
```

That's it! Mock payments will simulate successful payments with a 2-second delay.

---

## Architecture

```
Payment Request
      ↓
Payment Factory (reads env vars)
      ↓
Payment Provider (Mock/Stripe/Tranzila/Meshulam/Cardcom)
      ↓
Payment Gateway
      ↓
Payment Result
```

### Benefits:
- ✅ Switch providers without code changes
- ✅ Test with mock provider in development
- ✅ Feature flags for gradual rollout
- ✅ Support multiple providers simultaneously (future)
- ✅ Easy A/B testing between providers

---

## Supported Providers

### 1. Mock (Development)
**Use for:** Development, testing, CI/CD

**Setup:**
```bash
PAYMENT_PROVIDER=mock
PAYMENT_ENABLED=true
```

**Features:**
- No API keys needed
- 95% success rate (simulates occasional failures)
- 2-second delay to simulate real payments
- Works offline

---

### 2. Stripe (International)
**Use for:** Global expansion (requires foreign entity for IL businesses)

**Setup:**
```bash
PAYMENT_PROVIDER=stripe
PAYMENT_ENABLED=true
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Requirements:**
- Stripe account (https://stripe.com)
- For Israeli businesses: US LLC or similar foreign entity
- Foreign bank account
- Additional accounting/tax complexity

**Fees:**
- 2.9% + $0.30 per transaction
- Currency conversion: 1-2%
- LLC maintenance: ~$1,500/year

---

### 3. Tranzila (Israeli) - RECOMMENDED FOR ISRAEL
**Use for:** Israeli market

**Setup:**
```bash
PAYMENT_PROVIDER=tranzila
PAYMENT_ENABLED=true
TRANZILA_API_KEY=your-api-key
TRANZILA_TERMINAL=your-terminal-id
```

**Requirements:**
- Tranzila merchant account (https://tranzila.com)
- Israeli business registration
- Israeli bank account

**Fees:**
- ~2.5% + ₪0.50 per transaction
- No monthly fee
- No foreign entity needed

**Sign up:**
1. Visit https://www.tranzila.com
2. Contact sales
3. Submit business documents
4. Get API credentials
5. Add to .env.local

---

### 4. Meshulam (Israeli) - RECOMMENDED FOR ISRAEL
**Use for:** Israeli market (modern alternative)

**Setup:**
```bash
PAYMENT_PROVIDER=meshulam
PAYMENT_ENABLED=true
MESHULAM_API_KEY=your-api-key
MESHULAM_PAGE_CODE=your-page-code
```

**Requirements:**
- Meshulam merchant account (https://meshulam.co.il)
- Israeli business registration
- Israeli bank account

**Fees:**
- ~2.5% + ₪0.50 per transaction
- No setup fee
- No monthly fee

**Why Meshulam:**
- Modern API (similar to Stripe)
- Good documentation (English + Hebrew)
- Supports recurring payments
- Split payments support
- Lower total cost than Stripe

**Sign up:**
1. Visit https://www.meshulam.co.il
2. Click "הצטרפות" (Sign up)
3. Submit business documents
4. Get API credentials
5. Add to .env.local

---

### 5. Cardcom (Israeli)
**Use for:** Israeli market (established player)

**Setup:**
```bash
PAYMENT_PROVIDER=cardcom
PAYMENT_ENABLED=true
CARDCOM_API_KEY=your-api-key
CARDCOM_TERMINAL=your-terminal-id
```

**Requirements:**
- Cardcom merchant account (https://cardcom.co.il)
- Israeli business registration
- Israeli bank account

**Fees:**
- ~2.9% + ₪0.50 per transaction
- Monthly fee may apply

---

## Switching Providers

### Development → Production

**Before launch:**
```bash
# Development
PAYMENT_PROVIDER=mock
PAYMENT_ENABLED=true
PAYMENT_ENVIRONMENT=test
```

**After launch:**
```bash
# Production
PAYMENT_PROVIDER=meshulam  # or tranzila
PAYMENT_ENABLED=true
PAYMENT_ENVIRONMENT=production
MESHULAM_API_KEY=your-live-key
MESHULAM_PAGE_CODE=your-live-code
```

### Testing Production Provider

Use test credentials in development:
```bash
PAYMENT_PROVIDER=meshulam
PAYMENT_ENVIRONMENT=test
MESHULAM_API_KEY=your-test-key  # Test environment key
MESHULAM_PAGE_CODE=your-test-code
```

---

## Environment Variables Reference

### Required for All Providers
```bash
PAYMENT_PROVIDER=mock|stripe|tranzila|meshulam|cardcom
PAYMENT_ENABLED=true|false
PAYMENT_ENVIRONMENT=test|production
```

### Mock Provider
No additional configuration needed.

### Stripe
```bash
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ENABLED=true|false  # Feature flag
```

### Tranzila
```bash
TRANZILA_API_KEY=your-api-key
TRANZILA_TERMINAL=your-terminal-id
TRANZILA_ENABLED=true|false
```

### Meshulam
```bash
MESHULAM_API_KEY=your-api-key
MESHULAM_PAGE_CODE=your-page-code
MESHULAM_ENABLED=true|false
```

### Cardcom
```bash
CARDCOM_API_KEY=your-api-key
CARDCOM_TERMINAL=your-terminal-id
CARDCOM_ENABLED=true|false
```

---

## Feature Flags

Feature flags allow you to enable/disable payment providers without changing code.

### Example: Gradual Rollout

**Week 1:** Test with 10% of users
```bash
PAYMENT_PROVIDER=meshulam
MESHULAM_ROLLOUT_PERCENTAGE=10
```

**Week 2:** Increase to 50%
```bash
MESHULAM_ROLLOUT_PERCENTAGE=50
```

**Week 3:** Full rollout
```bash
MESHULAM_ROLLOUT_PERCENTAGE=100
```

---

## Vercel Deployment

### Add Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add production variables:

```
PAYMENT_PROVIDER = meshulam
PAYMENT_ENABLED = true
PAYMENT_ENVIRONMENT = production
MESHULAM_API_KEY = your-live-api-key
MESHULAM_PAGE_CODE = your-live-page-code
```

5. Redeploy

---

## Testing Payment Flow

### 1. Test with Mock Provider

```bash
# .env.local
PAYMENT_PROVIDER=mock
PAYMENT_ENABLED=true
```

1. Add product to cart
2. Go to checkout
3. Fill shipping info
4. Click "Proceed to Payment"
5. Wait 2 seconds (simulated processing)
6. See success page

### 2. Test with Real Provider (Test Mode)

```bash
# .env.local
PAYMENT_PROVIDER=meshulam
PAYMENT_ENVIRONMENT=test
MESHULAM_API_KEY=test_key
MESHULAM_PAGE_CODE=test_code
```

1. Follow same steps as mock
2. Use test credit card (provided by Meshulam)
3. Verify payment in Meshulam dashboard

### 3. Test Production Provider (Staging)

```bash
# .env.local on staging
PAYMENT_PROVIDER=meshulam
PAYMENT_ENVIRONMENT=production
MESHULAM_API_KEY=live_key
MESHULAM_PAGE_CODE=live_code
```

1. Use real credit card with small amount (₪1)
2. Verify payment appears in bank
3. Test refund flow

---

## Troubleshooting

### "Payment provider not configured"

Check your .env.local file has:
```bash
PAYMENT_PROVIDER=mock  # or your chosen provider
PAYMENT_ENABLED=true
```

### "Missing API key"

Each provider needs specific credentials:
- Stripe: `STRIPE_SECRET_KEY`
- Tranzila: `TRANZILA_API_KEY` + `TRANZILA_TERMINAL`
- Meshulam: `MESHULAM_API_KEY` + `MESHULAM_PAGE_CODE`
- Cardcom: `CARDCOM_API_KEY` + `CARDCOM_TERMINAL`

### Payment failing in production

1. Check environment variables are set in Vercel
2. Verify API keys are for production (not test)
3. Check `PAYMENT_ENVIRONMENT=production`
4. Review logs in provider dashboard
5. Check webhook endpoint is accessible

---

## Next Steps

1. **Choose your provider** based on your market
   - Israeli market → Meshulam or Tranzila
   - Global market → Stripe (requires foreign entity)

2. **Sign up for merchant account**
   - Submit business documents
   - Get API credentials

3. **Test in development**
   - Use test credentials
   - Test complete flow

4. **Deploy to production**
   - Add production credentials to Vercel
   - Start with small test payment
   - Monitor first transactions

5. **Implement webhooks** (future)
   - Handle payment confirmations
   - Send email notifications
   - Update order statuses automatically

---

## Cost Comparison (Monthly ₪100,000 revenue)

| Provider | Transaction Fee | Annual Cost | Notes |
|----------|----------------|-------------|-------|
| Meshulam | 2.5% + ₪0.50 | ₪30,000 | No setup/monthly fees |
| Tranzila | 2.5% + ₪0.50 | ₪30,500 | ₪500 setup fee |
| Cardcom | 2.9% + ₪0.50 | ₪37,400 | Monthly fee applies |
| Stripe | 2.9% + $0.30 | ₪32,000 + LLC | Needs foreign entity |

**Recommendation:** Start with Meshulam for Israeli market.

---

## Support

- **Meshulam:** support@meshulam.co.il, 03-123-4567
- **Tranzila:** info@tranzila.com, 03-567-8900
- **Cardcom:** support@cardcom.co.il, 03-765-4321
- **Stripe:** https://support.stripe.com
