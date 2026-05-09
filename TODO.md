# TODO List - What's Next

**Last Updated:** 2026-05-09

---

## 🎯 Critical Path (Must Do Before Launch)

### 1. **Payment Provider Setup** 🔴 BLOCKING
**Status:** Code ready, waiting for credentials

- [ ] Sign up for Meshulam account
- [ ] Get test credentials
- [ ] Configure test environment
- [ ] Test payment flow end-to-end
- [ ] Get production credentials
- [ ] Deploy to production
- [ ] Make first real payment (₪1 test)

**ETA:** 2-4 days (waiting for Meshulam approval)
**Owner:** You
**Docs:** `MESHULAM_IMPLEMENTATION_SUMMARY.md`

---

### 2. **Replace alert() with Toast Notifications** 🟡 HIGH PRIORITY
**Status:** Using alert() in many places

**Locations:**
- `app/shop/[id]/page.tsx` - "Added to cart" (line 256)
- `app/checkout/page.tsx` - Error messages (line 73, 77)
- `app/dashboard/settings/page.tsx` - Success/error (line 42, 52)

**Action:**
- [ ] Install/verify `sonner` library (already imported in some files)
- [ ] Replace all `alert()` calls with `toast.success()` / `toast.error()`
- [ ] Add `<Toaster />` to root layout

**ETA:** 30 minutes
**Impact:** Much better UX

---

### 3. **Email Notifications** 🟡 HIGH PRIORITY
**Status:** Not implemented

**Required emails:**
- [ ] Order confirmation (to customer)
- [ ] Order notification (to admin)
- [ ] Password reset
- [ ] Welcome email
- [ ] Shipping notification

**Options:**
- Resend (modern, good DX)
- SendGrid (established)
- Postmark (transactional focus)

**Action:**
- [ ] Choose email provider
- [ ] Set up account
- [ ] Create email templates
- [ ] Implement sending logic
- [ ] Test all email flows

**ETA:** 2-4 hours
**Impact:** Essential for customer communication

---

## 🔧 Important Improvements

### 4. **Error Handling & Loading States** 🟡 MEDIUM
**Status:** Inconsistent across pages

- [ ] Add proper error boundaries
- [ ] Consistent loading skeletons
- [ ] Better error messages (user-friendly)
- [ ] Retry logic for failed API calls
- [ ] Network error handling

**ETA:** 2-3 hours

---

### 5. **Order Management (Admin)** 🟡 MEDIUM
**Status:** Exists but needs verification

**Verify/Implement:**
- [ ] Test order listing page
- [ ] Order detail view
- [ ] Order status updates (processing, shipped, delivered)
- [ ] Refund processing
- [ ] Order search/filtering
- [ ] Export orders to CSV

**ETA:** 1-2 hours

---

### 6. **Product Management** 🟡 MEDIUM
**Status:** Pages exist, need to test

**Verify:**
- [ ] Test product creation
- [ ] Test product editing
- [ ] Image upload working
- [ ] Multiple images support
- [ ] Category management
- [ ] Stock alerts

**ETA:** 1-2 hours

---

### 7. **Live Streaming Verification** 🟢 LOW (but important)
**Status:** Code exists, needs testing

**Test:**
- [ ] Create event
- [ ] Start broadcast
- [ ] Viewer can join
- [ ] Chat working (if implemented)
- [ ] Product showcase during stream
- [ ] Purchase during stream
- [ ] End broadcast

**ETA:** 1 hour
**Needs:** Agora credentials configured

---

## 🎨 Nice to Have (Future Enhancements)

### 8. **Customer Features**
- [ ] Saved addresses
- [ ] Order tracking with status timeline
- [ ] Review/rating system
- [ ] Wishlist
- [ ] Promo codes/discounts
- [ ] Gift cards

**ETA:** 4-8 hours each

---

### 9. **Analytics & Reporting**
- [ ] Sales dashboard
- [ ] Product performance
- [ ] Customer insights
- [ ] Conversion funnel
- [ ] Revenue reports

**ETA:** 8-12 hours

---

### 10. **SEO & Performance**
- [ ] Meta tags for products
- [ ] Sitemap generation
- [ ] Open Graph images
- [ ] Image optimization
- [ ] Code splitting
- [ ] Performance monitoring

**ETA:** 4-6 hours

---

### 11. **Security Enhancements**
- [ ] Rate limiting on API endpoints
- [ ] CSRF protection
- [ ] Input sanitization review
- [ ] Security headers
- [ ] Audit logging

**ETA:** 2-4 hours

---

### 12. **Testing**
- [ ] E2E tests (Playwright/Cypress)
- [ ] API tests
- [ ] Unit tests for critical logic
- [ ] Load testing

**ETA:** 8-16 hours

---

## 📋 Immediate Next Steps (Priority Order)

**Today/This Week:**
1. ✅ **Meshulam signup** - Start now (2-4 day approval)
2. 🔧 **Replace alert() with toasts** - 30 min quick win
3. 🔧 **Test existing features** - Verify what works
4. 📧 **Choose email provider** - Research options

**After Meshulam Approval:**
5. 💳 **Configure payment** - 30 min setup
6. 💳 **Test payment flow** - 30 min testing
7. 🚀 **Production payment** - Go live

**Week 2:**
8. 📧 **Implement emails** - 2-4 hours
9. 🔧 **Error handling** - 2-3 hours
10. ✅ **Verify all features** - 2-3 hours

---

## 🎯 MVP Launch Checklist

**Required before first customer:**
- [ ] Meshulam payment working
- [ ] Order confirmation emails
- [ ] Error handling solid
- [ ] All alert() replaced with toasts
- [ ] Profile/orders page working
- [ ] Product management tested
- [ ] Mobile UX verified
- [ ] Terms & Privacy pages
- [ ] Contact/support info

**Nice to have for launch:**
- [ ] Live streaming tested
- [ ] Analytics dashboard
- [ ] Email marketing integration
- [ ] SEO optimization

---

## 💡 Recommendations

### Quick Wins (Do First):
1. **Toast notifications** - 30 min, big UX improvement
2. **Test all existing pages** - Find what's broken
3. **Meshulam signup** - Unblock payments

### High Impact:
1. **Email notifications** - Essential for orders
2. **Error handling** - Better reliability
3. **Admin order management** - Daily operations

### Can Wait:
1. Analytics - Can add post-launch
2. Advanced features - Based on user feedback
3. Testing - Add gradually

---

## 🤔 Questions to Clarify

1. **Live streaming priority?** - Is this critical for launch or post-launch?
2. **Email provider preference?** - Any existing accounts or preferences?
3. **Timeline?** - When do you want to launch?
4. **MVP scope?** - Minimal features to start or fully featured?

---

**What should we tackle first?**
