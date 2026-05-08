# Meshulam Setup Guide

**Complete step-by-step guide to integrate Meshulam payment processing.**

---

## 📋 Prerequisites

- Israeli business registration (ח.פ or ע.מ)
- Israeli bank account
- Business owner ID/Passport
- Tax clearance (if required)

---

## 🚀 Step 1: Sign Up for Meshulam

### 1.1 Create Account

1. Visit https://www.meshulam.co.il
2. Click "הצטרפות" (Join) or "התחל עכשיו" (Start Now)
3. Fill in business details:
   - Business name (שם העסק)
   - Business registration number (ח.פ)
   - Contact person name
   - Email address
   - Phone number

### 1.2 Submit Documents

You'll need to provide:
- Business registration document (תעודת עוסק מורשה)
- ID/Passport copy
- Bank account details (for settlements)
- Tax clearance (if requested)

### 1.3 Wait for Approval

- Approval typically takes 1-3 business days
- You'll receive an email when approved
- You can start testing immediately with test credentials

### 1.4 Contact Information

If you need help during setup:
- **Email:** support@meshulam.co.il
- **Phone:** 03-123-4567 (example - check their website)
- **Hours:** Sunday-Thursday, 9:00-17:00

---

## 🔑 Step 2: Get API Credentials

### 2.1 Login to Dashboard

1. Go to https://secure.meshulam.co.il
2. Login with your credentials
3. Navigate to "הגדרות" (Settings) → "API"

### 2.2 Get Test Credentials

For development/testing:
1. Click "מפתחות בדיקה" (Test Keys)
2. Copy:
   - **API Key** (מפתח API)
   - **Page Code** (קוד עמוד)

### 2.3 Get Production Credentials

After approval:
1. Click "מפתחות ייצור" (Production Keys)
2. Copy:
   - **API Key** (מפתח API)
   - **Page Code** (קוד עמוד)

### 2.4 Store Credentials Securely

**NEVER commit credentials to git!**

Create `.env.local` (not in git):
```bash
# Meshulam Test Credentials
PAYMENT_PROVIDER=meshulam
NEXT_PUBLIC_PAYMENT_PROVIDER=meshulam
PAYMENT_ENABLED=true
PAYMENT_ENVIRONMENT=test

MESHULAM_API_KEY=your-test-api-key-here
MESHULAM_PAGE_CODE=your-test-page-code-here
```

---

## ⚙️ Step 3: Configure Meshulam Dashboard

### 3.1 Set Payment Page Settings

1. Go to "הגדרות עמוד תשלום" (Payment Page Settings)
2. Configure:
   - **Payment methods:** Credit cards, installments
   - **Logo:** Upload your business logo
   - **Colors:** Match your brand colors
   - **Language:** Hebrew/English

### 3.2 Set Callback URLs

**Critical: These URLs must be configured correctly!**

In Meshulam dashboard, set:

**Success URL:**
```
https://yourdomain.com/checkout/success
```

**Cancel URL:**
```
https://yourdomain.com/checkout/[orderId]
```

**Webhook URL (IPN):**
```
https://yourdomain.com/api/webhooks/meshulam
```

**For local development:**
```
Success: http://localhost:3000/checkout/success
Cancel: http://localhost:3000/checkout/[orderId]
Webhook: Use ngrok (see below)
```

### 3.3 Configure Webhook Security

1. Go to "אבטחת Webhook" (Webhook Security)
2. Add your server IP to whitelist (optional)
3. Enable webhook signature verification
4. Save webhook secret (add to `.env.local`):
   ```bash
   MESHULAM_WEBHOOK_SECRET=your-webhook-secret
   ```

### 3.4 Enable Test Mode

For development:
1. Toggle "מצב בדיקה" (Test Mode) ON
2. This allows testing without real charges
3. Use test credit cards provided by Meshulam

---

## 🧪 Step 4: Test Locally

### 4.1 Start Development Server

```bash
npm run dev
```

### 4.2 Test Payment Flow

1. Add a product to cart
2. Go to checkout
3. Fill shipping information
4. Click "Proceed to Payment"
5. You should be redirected to Meshulam payment page
6. Use test credit card:
   - Card: 4580 4580 4580 4580
   - Expiry: Any future date
   - CVV: 123

### 4.3 Test Webhooks with ngrok

Since Meshulam needs to call your webhook, you need a public URL:

**Install ngrok:**
```bash
brew install ngrok  # Mac
# or download from https://ngrok.com
```

**Start ngrok tunnel:**
```bash
ngrok http 3000
```

**Copy the HTTPS URL:**
```
https://abc123.ngrok.io
```

**Update Meshulam webhook URL:**
```
https://abc123.ngrok.io/api/webhooks/meshulam
```

**Test webhook:**
1. Make a test payment
2. Check your terminal for webhook logs
3. Verify order status updates to "paid"

---

## 🚀 Step 5: Deploy to Production

### 5.1 Add Environment Variables to Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add production variables:

```
PAYMENT_PROVIDER = meshulam
NEXT_PUBLIC_PAYMENT_PROVIDER = meshulam
PAYMENT_ENABLED = true
PAYMENT_ENVIRONMENT = production

MESHULAM_API_KEY = your-production-api-key
MESHULAM_PAGE_CODE = your-production-page-code
MESHULAM_WEBHOOK_SECRET = your-webhook-secret
```

### 5.2 Update Meshulam URLs

In Meshulam dashboard, update to production URLs:

**Success URL:**
```
https://ecommerce-live-six.vercel.app/checkout/success
```

**Cancel URL:**
```
https://ecommerce-live-six.vercel.app/checkout/[orderId]
```

**Webhook URL:**
```
https://ecommerce-live-six.vercel.app/api/webhooks/meshulam
```

### 5.3 Deploy

```bash
git add .
git commit -m "feat: configure Meshulam production credentials"
git push origin main
```

Vercel will auto-deploy.

### 5.4 First Production Payment

**Test with small amount first!**

1. Make a real payment with ₪1
2. Verify payment appears in Meshulam dashboard
3. Verify order status updates in your database
4. Check webhook logs in Vercel
5. Verify payment settles to your bank account (usually 1-3 days)

---

## 🔍 Step 6: Monitor & Verify

### 6.1 Check Meshulam Dashboard

Daily monitoring:
- View all transactions
- Check settlement reports
- Review failed payments
- Monitor refunds

### 6.2 Check Application Logs

In Vercel:
- Go to your project
- Click "Logs"
- Filter for "meshulam"
- Review payment processing logs

### 6.3 Reconcile Payments

Weekly task:
1. Export payments from Meshulam dashboard
2. Compare with orders in your database
3. Verify all payments match
4. Investigate discrepancies

---

## 🧾 Test Credit Cards

Meshulam provides test credit cards for development:

| Card Number | Type | Result |
|-------------|------|--------|
| 4580 4580 4580 4580 | Visa | Success |
| 5326 1234 5678 9012 | Mastercard | Success |
| 4111 1111 1111 1111 | Visa | Decline |

**All test cards:**
- CVV: Any 3 digits
- Expiry: Any future date
- ID: Any 9 digits

---

## 💰 Fees & Settlement

### Transaction Fees
- Israeli credit cards: ~2.5% + ₪0.50
- Installments: Higher fees (check contract)
- Refunds: Usually free

### Settlement
- Standard: T+2 to T+7 (2-7 business days)
- Express: T+1 (additional fee)
- Minimum settlement amount: ₪50

### Monthly Costs
- No monthly fee (verify in contract)
- No setup fee
- Pay only per transaction

---

## 🐛 Troubleshooting

### Payment Not Processing

**Check:**
1. PAYMENT_PROVIDER=meshulam in env vars
2. API credentials are correct (test vs production)
3. PAYMENT_ENVIRONMENT matches credentials
4. Check Vercel logs for errors
5. Verify Meshulam dashboard shows the payment

### Webhook Not Working

**Check:**
1. Webhook URL is correct in Meshulam dashboard
2. URL is HTTPS (required for production)
3. Server is accessible (test with curl)
4. IP whitelist includes Meshulam IPs
5. Check webhook signature verification

### Payment Successful But Order Not Updated

**Check:**
1. Webhook endpoint is receiving calls (check logs)
2. Order ID is passed correctly (uniqueId field)
3. Database permissions allow updates
4. No errors in webhook processing logs

### Common Errors

**"Invalid API key"**
- Using test key in production or vice versa
- API key is incorrect (copy/paste error)
- API key expired (regenerate in dashboard)

**"Page code not found"**
- Page code doesn't match API key environment
- Page is disabled in Meshulam dashboard
- Page code is incorrect

**"Webhook signature invalid"**
- Webhook secret is wrong
- Payload was modified in transit
- IP not whitelisted

---

## 📞 Support Contacts

### Meshulam Support
- **Email:** support@meshulam.co.il
- **Phone:** 03-XXX-XXXX (check website)
- **Hours:** Sun-Thu, 9:00-17:00 IST
- **Dashboard:** https://secure.meshulam.co.il

### For Urgent Issues
- Check status page first
- Email support with order ID and timestamp
- Include error logs from Vercel
- Screenshot of Meshulam transaction

---

## ✅ Post-Setup Checklist

- [ ] Meshulam account approved
- [ ] API credentials obtained (test & production)
- [ ] Environment variables configured
- [ ] Callback URLs set in Meshulam dashboard
- [ ] Webhook endpoint tested with ngrok
- [ ] Test payment completed successfully
- [ ] Webhook received and order updated
- [ ] Production credentials added to Vercel
- [ ] Production URLs updated in Meshulam
- [ ] First real payment tested (₪1)
- [ ] Payment settled to bank account
- [ ] Daily monitoring process established
- [ ] Support contacts saved

---

## 🔄 Next Steps After Setup

1. **Add Email Notifications**
   - Send order confirmation to customer
   - Notify admin of new orders
   - Payment failure alerts

2. **Implement Refunds**
   - Admin interface for refunds
   - Automatic refund processing
   - Partial refund support

3. **Add Payment Analytics**
   - Track conversion rates
   - Monitor failed payments
   - Settlement tracking dashboard

4. **Security Enhancements**
   - Rate limiting on payment endpoints
   - Fraud detection
   - 3D Secure (may be required)

5. **Customer Experience**
   - Save payment methods (if needed)
   - Quick checkout
   - Payment retry logic

---

**Questions? Issues?**

Check the main payment setup guide: `docs/PAYMENT_SETUP.md`

Or contact: support@meshulam.co.il
