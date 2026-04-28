# E-commerce Live Video Platform - Design Document

**Date:** 2026-04-29
**Status:** Approved
**Version:** 1.0

## Executive Summary

A live e-commerce platform connecting Chinese office furniture manufacturers with global customers through live video presentations. Manufacturers upload product catalogs, admins schedule and broadcast live events, and customers purchase during live streams or within a 7-day purchase window.

## Business Model

### Core Concept
- **Manufacturers:** Upload office accessories (chairs, tables, etc.) catalogs
- **Admin:** Creates and broadcasts live events featuring manufacturer products
- **Customers:** Watch live presentations, interact via chat, and purchase products
- **Purchase Windows:** Products available during live events + 7 days after

### Key Differentiators
1. Live video selling creates urgency and authenticity
2. Direct factory pricing with live demonstrations
3. Time-limited purchase windows enable batch fulfillment
4. Hidden manufacturer identities (POC phase) for unified brand experience

## System Architecture

### Technology Stack

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS (Mobile-first)
- Shadcn/ui components
- next-i18next (i18n)
- React Hook Form + Zod (validation)

**Backend:**
- Next.js API Routes
- TypeORM (ORM)
- PostgreSQL (via Supabase)

**Third-Party Services:**
- **Supabase:** PostgreSQL database + Authentication (email/password + OAuth)
- **Agora.io:** Live video streaming + real-time chat
- **Stripe:** Payment processing
- **Cloudinary:** Image storage and CDN
- **LaunchDarkly:** Feature flags (free tier)

**Deployment:**
- Vercel (hosting + edge network)
- Supabase Cloud (database)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Frontend (App Router)                     │  │
│  │  - Public pages (/, /shop, /live/[id])                │  │
│  │  - Dashboard (unified for all roles)                  │  │
│  │  - Auth pages (/login, /register)                     │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              API Routes (/api/*)                       │  │
│  │  - /api/auth/* (Supabase Auth integration)            │  │
│  │  - /api/products/* (CRUD, search, import)             │  │
│  │  - /api/events/* (live event management)              │  │
│  │  - /api/orders/* (purchase, checkout)                 │  │
│  │  - /api/agora/* (streaming tokens)                    │  │
│  │  - /api/webhooks/stripe (payment confirmations)       │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Supabase    │   │   Agora.io   │   │    Stripe    │
│ - PostgreSQL │   │ - Live Video │   │ - Payments   │
│ - Auth       │   │ - Chat (RTM) │   │ - Webhooks   │
└──────────────┘   └──────────────┘   └──────────────┘
        │
        ▼
┌──────────────┐
│  Cloudinary  │
│ - Images CDN │
└──────────────┘
```

## Database Design

### Permission-Based Role System

**Entities:**
- `Permission` - Granular permissions (e.g., 'product.create', 'event.broadcast')
- `Role` - Groups of permissions (admin, manufacturer_owner, customer, guest)
- `User` - Links to Role (many-to-one)
- `Manufacturer` - Company/factory information
- `Product` - Product catalog
- `LiveEvent` - Scheduled live streaming events
- `Order` - Customer purchases
- `OrderItem` - Line items in orders

**Key Relationships:**
- Role ←→ Permission (many-to-many)
- User → Role (many-to-one)
- User → Manufacturer (many-to-one, nullable)
- Manufacturer → Products (one-to-many)
- Manufacturer → LiveEvents (one-to-many)
- LiveEvent ←→ Products (many-to-many, featured products)
- Order → User (many-to-one, customer)
- Order → OrderItems → Products
- Order → LiveEvent (optional, tracks live purchases)

### Base Entity

All entities extend `BaseEntity` with:
- `id` (UUID, primary key)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Event Status Flow

```
draft → scheduled → live → ended → purchase_window → closed
```

- **draft:** Admin creating event
- **scheduled:** Published, waiting for start time
- **live:** Admin broadcasting (customers can watch & buy)
- **ended:** Broadcast ended, purchase window opens
- **purchase_window:** 1-7 days after event (can still buy)
- **closed:** 7+ days after event (prices hidden again)

## User Roles & Permissions

### Role Definitions

**Admin:**
- Full platform control
- Create/manage events
- Broadcast live streams
- Approve manufacturers
- View all orders/analytics

**Manufacturer Owner:**
- Manage product catalog (CRUD + CSV import)
- View assigned events (read-only)
- View their orders (read-only)
- View their analytics

**Customer:**
- Browse products
- Watch live streams
- Purchase products (during events + 7-day window)
- View own orders

**Guest:**
- Browse products (no prices before/after events)
- Watch live streams
- Must register to purchase

### Permission System

Permissions follow pattern: `{resource}.{action}.{scope}`

Examples:
- `product.create` - Create products
- `product.update.own` - Update own products
- `product.update.all` - Update any product
- `event.broadcast` - Start/end live broadcasts
- `order.read.all` - View all orders
- `order.read.own` - View own orders

Benefits:
- Easy to add/remove permissions from roles
- Fine-grained access control
- Scalable for future role variations

## Product Visibility & Purchase Windows

### Visibility States

**Before Event (Scheduled):**
- ✅ Show: Product images, name, description, ratings
- ❌ Hide: Price, stock, purchase buttons
- Display: "Available live on [DATE]"

**During Event (Live):**
- ✅ Show: Everything including prices
- ✅ Enable: Purchase buttons
- Display: "Live now! Event ends in [TIME]"

**After Event (1-7 days):**
- ✅ Show: Everything including prices
- ✅ Enable: Purchase buttons
- Display: "Last chance! Offer ends in [X] days"

**After Purchase Window (7+ days):**
- ✅ Show: Product images, name, description
- ❌ Hide: Price, stock, purchase buttons
- Display: "Featured in past event. Watch for next live!"

### Business Logic

1. Products can only be purchased during associated event or 7-day window
2. Purchase window starts when admin ends broadcast
3. `purchaseWindowEndTime` = `actualEndTime + 7 days`
4. Stock decrements on successful payment
5. Enables batch order fulfillment from manufacturers

## Application Structure

### Unified Route Structure (No Role Prefixes)

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (public)/
│   ├── page.tsx                    # Homepage with countdown
│   ├── shop/
│   │   ├── page.tsx                # Product catalog
│   │   └── [productId]/page.tsx    # Product detail
│   └── live/
│       ├── page.tsx                # Events list
│       └── [eventId]/page.tsx      # Live stream page
├── dashboard/
│   ├── page.tsx                    # Role-based dashboard
│   ├── products/                   # Products management
│   ├── events/                     # Events management
│   ├── orders/                     # Orders (filtered by role)
│   ├── manufacturers/              # Admin only
│   └── analytics/                  # Analytics (scoped by role)
├── cart/page.tsx
├── checkout/page.tsx
└── api/
    ├── auth/
    ├── products/
    ├── events/
    ├── orders/
    ├── agora/
    └── webhooks/stripe/
```

### Dynamic Navigation

Navigation items show/hide based on user permissions using `usePermissions()` hook.

## Live Streaming Experience

### Customer View

**Layout (Mobile-first):**
- Mobile: Stacked (video → products → chat modal)
- Desktop: Side-by-side (video + chat | products sidebar)

**Features:**
1. **Video Player:** Agora.io RTC stream
2. **Live Chat:** Agora RTM overlay/modal
3. **Product Highlights:** Admin can highlight product → appears as overlay on video
4. **Hot Live Deals:** Horizontal carousel below video with featured products
5. **One-click Purchase:** Add to cart without leaving stream

**Product Card Overlay:**
```
┌──────────────────┐
│ -37% OFF (badge) │
│ [Product Image]  │
│ X-PRO ERGO CHAIR │
│ $189  $299       │
│ 23 UNITS LEFT    │
│ [BUY NOW]        │
└──────────────────┘
```

### Admin Broadcast Interface

**Controls:**
- Start/End broadcast button
- Camera/Mic toggle
- Select product to highlight (dropdown)
- Viewer count (real-time)
- Chat monitor
- Featured products list

**Flow:**
1. Admin navigates to `/dashboard/events/[id]/broadcast`
2. Clicks "Start Broadcasting"
3. Agora SDK initializes camera/mic
4. Event status updates to "live"
5. Admin selects products to highlight during stream
6. Product overlay appears for all viewers
7. Admin ends broadcast → event status "ended" → purchase window begins

## Mobile-First Design

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: 1024px+

### Mobile Optimizations

1. **Touch-friendly:** 44px minimum tap targets
2. **Safe areas:** Support for notched devices
3. **No zoom on input:** 16px font size on inputs
4. **Horizontal scroll:** Product carousels with snap scrolling
5. **Collapsible navigation:** Hamburger menu on mobile
6. **Sticky elements:** Cart and navbar
7. **Optimized images:** Cloudinary responsive images

### Key Mobile Components

- Mobile chat modal (overlays video)
- Horizontal product scroll
- Stacked countdown timer
- Responsive product grid (2 columns mobile, 4-5 desktop)
- Mobile-optimized forms

## Internationalization (i18n)

### Implementation

- **Library:** next-i18next
- **POC Language:** English only
- **Structure:** JSON files per namespace (`common.json`, `products.json`, etc.)
- **Namespaces:** common, auth, products, events, checkout, dashboard

### Translation Files

```
public/locales/
└── en/
    ├── common.json        # Nav, hero, footer
    ├── auth.json          # Login, register
    ├── products.json      # Product catalog
    ├── events.json        # Live events
    ├── checkout.json      # Cart, checkout
    └── dashboard.json     # Dashboard sections
```

### Future Languages

Prepared for:
- Chinese (zh)
- Spanish (es)
- Others as needed

## Feature Flags (LaunchDarkly)

### Purpose

1. **Gradual Rollout:** Release features to subset of users
2. **A/B Testing:** Test variations (e.g., checkout flow)
3. **Kill Switches:** Disable features instantly if issues arise
4. **Role-based Access:** Enable features for specific roles first

### Key Flags (POC)

- `live-streaming` - Enable/disable streaming
- `stripe-payments` - Enable/disable real payments
- `csv-import` - CSV bulk product import
- `google-auth` - Google OAuth login

### Future Flags

- `order-fulfillment` - Order management workflow
- `email-notifications` - Email system
- `product-reviews` - Review/rating system
- `new-checkout-flow` - A/B test checkout UI

## Development Tools

### Mock Services

For rapid development without external dependencies:

**Mock Stripe:**
- Fake checkout page with success/fail buttons
- Simulates webhooks
- No real payment processing

**Mock Agora:**
- Placeholder video player
- Console-logged events
- Simulated chat messages

**Mock Cloudinary:**
- Local file URLs
- No external upload

### Development Environment

```bash
# Run with all mocks
npm run dev:mocks

# Run with real services
npm run dev
```

### Dev Admin Panel

`/dev/admin` (development only):
- Mock service status
- Database seeding
- Test user credentials
- Feature flag toggles
- Trigger test events

### Test Users

```
Admin:
  Email: admin@test.com
  Password: admin123

Manufacturer:
  Email: manufacturer@test.com
  Password: manu123

Customer:
  Email: customer@test.com
  Password: customer123
```

## Security & Validation

### Authentication

- Supabase Auth (email/password + Google OAuth)
- JWT tokens
- Secure session management
- Protected API routes

### Authorization

- Permission-based access control
- Resource ownership checks
- Middleware guards on routes
- API route permission validation

### Input Validation

- Zod schemas for all forms
- Server-side validation
- Client-side validation (React Hook Form + Zod)
- Sanitized database queries (TypeORM)

### Payment Security

- Stripe handles all payment data
- PCI compliance via Stripe
- Webhook signature verification
- HTTPS only

## Error Handling

### API Errors

Standardized error format:
```json
{
  "error": {
    "message": "Product not found",
    "code": "NOT_FOUND",
    "details": {}
  }
}
```

### Error Codes

- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - No permission
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input
- `PURCHASE_WINDOW_CLOSED` - Cannot buy product
- `INSUFFICIENT_STOCK` - Out of stock
- `PERMISSION_DENIED` - Lacks permission

### User-Facing Errors

- Toast notifications for errors
- Inline form validation
- Graceful degradation
- Clear error messages

## Performance Optimization

### Next.js Features

- Server-Side Rendering (SSR) for SEO
- Static Generation (SSG) for static pages
- Image optimization (next/image)
- Code splitting (automatic)
- Edge caching (Vercel)

### Caching Strategy

- Static pages: ISR (Incremental Static Regeneration)
- Product catalog: Revalidate every 60 seconds
- Live events: No cache (real-time)
- Images: Cloudinary CDN

### Database

- Indexed columns (userId, manufacturerId, eventId)
- Efficient queries (TypeORM relations)
- Connection pooling (Supabase)

## Testing Strategy (POC)

### Focus Areas

1. Critical user flows (auth, checkout, streaming)
2. Payment webhooks
3. Permission system
4. Product visibility logic

### Testing Tools

- Vitest (unit tests)
- Playwright (E2E tests)
- React Testing Library (component tests)

### Test Coverage

**Unit Tests:**
- Product visibility logic
- Permission checks
- Validation schemas
- Utility functions

**Integration Tests:**
- API routes
- Database operations
- Auth flows

**E2E Tests:**
- Complete checkout flow
- Live stream viewing
- Product catalog browsing

## Deployment

### Environments

1. **Development:** Local + mock services
2. **Staging:** Vercel preview + real services (test mode)
3. **Production:** Vercel production + real services

### Deployment Flow

```
1. Push to GitHub
2. Vercel auto-deploys
3. Run migrations (if needed)
4. Verify deployment
5. Monitor errors (Vercel logs)
```

### Environment Variables

- Supabase credentials
- Stripe API keys
- Agora credentials
- Cloudinary credentials
- LaunchDarkly SDK keys

## POC Scope (Phase 1 - 2-3 Weeks)

### Included Features

✅ User authentication (Supabase)
✅ Role-based permissions system
✅ Product catalog management (CRUD + CSV import)
✅ Live event creation (admin only)
✅ Live streaming (Agora - admin broadcasts)
✅ Live chat (Agora RTM)
✅ Product visibility based on event status
✅ Purchase windows (live + 7 days after)
✅ Shopping cart
✅ Stripe checkout
✅ Basic order management (view only)
✅ Countdown timer on homepage
✅ Mobile-first responsive design
✅ i18n support (English only)
✅ Feature flags (LaunchDarkly)
✅ Development tools & mock services

### Excluded Features (Phase 2)

❌ Order fulfillment workflow
❌ Email notifications
❌ Manufacturer self-service event creation
❌ Advanced analytics dashboard
❌ Multi-language support
❌ Mobile native apps
❌ Event recording/replay
❌ Product reviews/ratings
❌ Wish lists
❌ Push notifications

## Success Metrics

### POC Goals

1. **Technical Validation:**
   - Live streaming works smoothly
   - Payment processing reliable
   - Mobile experience excellent

2. **Business Validation:**
   - Users watch live events
   - Users purchase during/after events
   - Batch order fulfillment viable

3. **Key Metrics:**
   - Live event viewer count
   - Conversion rate (viewers → buyers)
   - Average order value during live vs. post-event
   - Mobile vs. desktop usage

## Future Phases

### Phase 2 (Post-POC)

- Order fulfillment workflow (status updates, tracking)
- Email notifications (order confirmations, event reminders)
- Manufacturer self-service (create events, broadcast)
- Advanced analytics
- Product reviews/ratings

### Phase 3 (Scale)

- Multi-language support (Chinese, Spanish)
- Mobile native apps
- Event recording/replay
- Multi-vendor payment splits
- Automated manufacturer notifications
- API for third-party integrations

## Risks & Mitigations

### Technical Risks

**Risk:** Agora streaming quality issues
- **Mitigation:** Use Agora's adaptive bitrate, fallback to lower quality

**Risk:** Stripe webhook failures
- **Mitigation:** Implement retry logic, manual order verification

**Risk:** Database scaling
- **Mitigation:** Start with Supabase Pro if needed, optimize queries

### Business Risks

**Risk:** Low live event attendance
- **Mitigation:** Email reminders, countdown timers, promotional campaigns

**Risk:** High cart abandonment
- **Mitigation:** Simplify checkout, guest checkout option

**Risk:** Manufacturer onboarding complexity
- **Mitigation:** Clear documentation, CSV templates, admin support

## Conclusion

This design provides a complete blueprint for an MVP live e-commerce platform. The architecture is scalable, the tech stack is modern and proven, and the development tools enable rapid iteration. The POC focuses on validating the core concept while laying groundwork for future growth.

---

**Approved by:** Guy Kuperly
**Date:** 2026-04-29
