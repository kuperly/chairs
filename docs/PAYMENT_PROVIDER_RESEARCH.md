# Payment Provider Research for Israel

**Date:** 2026-05-08
**Critical Issue:** Most payments will be made in Israel. Need to evaluate payment providers.

---

## Stripe and Israel - Current Status

### Historical Issues:
1. **No Direct Business Account:** Stripe doesn't allow Israeli businesses to create merchant accounts directly
2. **Workaround Used:** Many Israeli businesses use:
   - Foreign entity (US LLC, UK Ltd, etc.)
   - Payment through foreign bank account
   - This adds complexity and fees

3. **Receiving Payments TO Israel:** Works fine (Israeli customers can pay)
4. **Business BASED IN Israel:** Problematic without foreign entity

### Stripe Limitations:
- ❌ Cannot open Stripe account with Israeli business registration
- ❌ Need foreign entity (Delaware LLC, Singapore company, etc.)
- ❌ Need foreign bank account
- ✅ Can accept payments FROM Israeli credit cards
- ⚠️ Currency conversion fees if not using ILS
- ⚠️ Higher transaction fees for international payments

---

## Alternative Payment Providers for Israel

### 1. **Tranzila** (🇮🇱 Israeli)
**Website:** tranzila.com

**Pros:**
- Israeli company, fully local support
- Supports Israeli Shekels (ILS) natively
- Easy integration with Israeli banks
- Hebrew support
- No need for foreign entity
- Lower fees for local transactions
- PCI-DSS compliant

**Cons:**
- Less known internationally
- Documentation primarily in Hebrew
- Smaller ecosystem than Stripe
- Less advanced features

**Fees:**
- ~2.5% + ₪0.50 per transaction (Israeli cards)
- Setup fee varies by bank

**Integration:**
- REST API available
- Payment page redirect
- Direct API integration
- Webhooks support

---

### 2. **Cardcom** (🇮🇱 Israeli)
**Website:** cardcom.co.il

**Pros:**
- Major Israeli payment processor
- Supports ILS and multiple currencies
- Good reputation in Israel
- Hebrew and English support
- Works with all Israeli banks
- Recurring payments support
- No foreign entity needed

**Cons:**
- Higher setup complexity
- Requires Israeli business license
- Documentation not as good as Stripe

**Fees:**
- ~2.9% + ₪0.50 per transaction
- Monthly fee may apply
- Volume discounts available

**Integration:**
- REST API
- Hosted payment page
- Tokenization for recurring payments
- Webhooks

---

### 3. **PayPal** (🌍 International)
**Website:** paypal.com

**Pros:**
- Works in Israel (both business and customers)
- Well-known and trusted
- Multi-currency support
- Easy integration
- Buyer protection

**Cons:**
- Higher fees (~3.9% + fixed fee)
- Currency conversion fees
- Account can be frozen/limited
- Not preferred by Israeli consumers
- Disputes favor buyers heavily

**Fees:**
- 3.9% + $0.30 for international transactions
- 2.9% + fixed fee for domestic
- Currency conversion: 3-4%

---

### 4. **Stripe (via Foreign Entity)**
**Website:** stripe.com

**Pros:**
- Best developer experience
- Excellent documentation
- Advanced features (subscriptions, invoicing, etc.)
- Global reach
- Strong ecosystem

**Cons:**
- ❌ Requires foreign entity (US LLC ~$1,500/year)
- ❌ Requires foreign bank account
- ❌ Tax complications (US, IL)
- ❌ Additional accounting costs
- Higher total cost due to setup

**Fees:**
- 2.9% + $0.30 per transaction (US)
- Currency conversion: 1-2%
- LLC maintenance: ~$1,500/year
- Accounting: $2,000-5,000/year

---

### 5. **Meshulam (משולם)** (🇮🇱 Israeli)
**Website:** meshulam.co.il

**Pros:**
- Modern Israeli payment gateway
- Good developer experience
- Supports ILS natively
- Recurring payments
- Split payments
- No foreign entity needed
- Hebrew and English support

**Cons:**
- Newer company (less proven)
- Smaller market share

**Fees:**
- ~2.5% + ₪0.50 per transaction
- No setup fee
- No monthly fee

**Integration:**
- Modern REST API
- Payment page redirect
- React/Vue components available
- Good documentation (Hebrew/English)

---

### 6. **Yaad Sarig (יעד שריג)** (🇮🇱 Israeli)
**Website:** yaadpay.co.il

**Pros:**
- Well-established in Israel
- Bank of Jerusalem backed
- Supports all Israeli credit cards
- No foreign entity needed
- PCI compliant

**Cons:**
- Older technology
- Less developer-friendly
- Hebrew-heavy documentation

**Fees:**
- ~2.8% + ₪0.50 per transaction
- Setup fee varies

---

## Recommendation for Your Use Case

### Primary Recommendation: **Tranzila or Meshulam**

**Why:**
1. ✅ No need for foreign entity
2. ✅ Lower fees for Israeli transactions
3. ✅ ILS native support
4. ✅ Easier accounting (single country)
5. ✅ Faster setup
6. ✅ Hebrew support for customer service

### Secondary Option: **Multi-Provider with Feature Flags**

Implement architecture that supports multiple providers:

```typescript
// Payment provider configuration
PAYMENT_PROVIDER=tranzila  // or 'stripe', 'cardcom', 'meshulam'
TRANZILA_API_KEY=xxx
TRANZILA_TERMINAL=xxx
STRIPE_SECRET_KEY=xxx  // Keep for future international expansion
```

---

## Implementation Strategy

### Phase 1: Israeli Market (MVP)
**Provider:** Tranzila or Meshulam
**Timeline:** 1-2 weeks
**Cost:** Low (no foreign entity)
**Market:** Israel only

### Phase 2: International Expansion (Future)
**Provider:** Add Stripe (via foreign entity)
**Timeline:** 2-3 months (entity setup)
**Cost:** Medium-High
**Market:** Global

### Phase 3: Multi-Provider (Scale)
**Architecture:** Provider abstraction layer
**Support:** Multiple providers simultaneously
**Routing:** By customer location/currency

---

## Recommended Architecture

```typescript
// lib/payments/provider.ts
interface PaymentProvider {
  createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent>;
  confirmPayment(intentId: string): Promise<PaymentResult>;
  refundPayment(paymentId: string): Promise<RefundResult>;
}

// Providers
class TranzilaProvider implements PaymentProvider { ... }
class StripeProvider implements PaymentProvider { ... }
class MeshulamProvider implements PaymentProvider { ... }

// Factory with feature flag
function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER;

  switch(provider) {
    case 'tranzila':
      return new TranzilaProvider();
    case 'stripe':
      return new StripeProvider();
    case 'meshulam':
      return new MeshulamProvider();
    default:
      throw new Error('No payment provider configured');
  }
}
```

---

## Next Steps

1. **Immediate:**
   - [ ] Choose Israeli payment provider (Tranzila vs Meshulam)
   - [ ] Open merchant account with provider
   - [ ] Get API credentials
   - [ ] Implement provider abstraction layer

2. **Short-term (1-2 weeks):**
   - [ ] Integrate chosen provider
   - [ ] Test with Israeli credit cards
   - [ ] Implement webhook handling
   - [ ] Add payment page

3. **Future (when expanding globally):**
   - [ ] Consider Stripe via foreign entity
   - [ ] Implement provider switching
   - [ ] Add multi-currency support
   - [ ] Set up currency conversion

---

## Cost Comparison (Israeli Business, ₪100,000/month revenue)

| Provider | Transaction Fee | Monthly Fee | Setup | Annual Cost |
|----------|----------------|-------------|-------|-------------|
| Tranzila | ₪2,500 + ₪500 | ₪0 | ₪500 | ₪30,500 |
| Meshulam | ₪2,500 + ₪500 | ₪0 | ₪0 | ₪30,000 |
| Cardcom | ₪2,900 + ₪500 | ₪200 | ₪1,000 | ₪37,400 |
| Stripe (foreign) | ₪2,900 + ₪300 | ₪0 | ~$1,500 | ₪32,000 + LLC fees |

**Winner for Israeli Market:** Meshulam (lowest total cost, modern API)

---

## Questions to Answer Before Choosing

1. **Do you already have Israeli business registration?** (Yes → Local provider, No → Need to setup)
2. **Will you expand internationally?** (Yes → Plan for Stripe later, No → Local only)
3. **What currencies will you accept?** (ILS only → Local provider, Multi → Need flexibility)
4. **Do you need recurring payments?** (All modern providers support this)
5. **Hebrew customer support important?** (Yes → Local provider, No → Stripe okay)

---

## My Recommendation

**Start with Meshulam:**
- Modern API (similar to Stripe developer experience)
- Lower fees than Cardcom
- No setup fees
- Good documentation in English
- Supports future features (subscriptions, split payments)
- Can add Stripe later via provider abstraction

**Implementation:**
```env
# .env.local
PAYMENT_PROVIDER=meshulam
MESHULAM_API_KEY=xxx
MESHULAM_PAGE_CODE=xxx

# Future-ready
STRIPE_SECRET_KEY=xxx  # Leave empty for now
STRIPE_ENABLED=false   # Feature flag
```

---

## References

1. Stripe Israel Status: https://support.stripe.com/questions/stripe-availability-in-israel
2. Tranzila: https://www.tranzila.com/
3. Meshulam: https://www.meshulam.co.il/
4. Cardcom: https://www.cardcom.co.il/
5. Israeli Payment Processing Guide: (various fintech blogs)

---

**Action Required:** Decision on payment provider before implementation.
