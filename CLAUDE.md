# E-commerce Live Video Platform - Claude Context

## Project Overview

A live e-commerce platform connecting Chinese office furniture manufacturers with global customers through live video presentations. Admin broadcasts live events, customers watch and purchase products with a 7-day purchase window after events.

**Status:** POC Phase (2-3 weeks)
**Design Doc:** `docs/plans/2026-04-29-ecommerce-live-platform-design.md`
**Implementation Plan:** `docs/plans/2026-04-29-implementation-plan.md`

## Tech Stack

### Core
- **Frontend:** Next.js 14+ (App Router), TypeScript, TailwindCSS, Shadcn/ui
- **Backend:** Next.js API Routes, TypeORM
- **Database:** PostgreSQL via Supabase
- **i18n:** next-i18next (English only for POC)

### Third-Party Services
- **Supabase:** Database + Authentication (email/password + Google OAuth)
- **Agora.io:** Live video streaming + real-time chat
- **Stripe:** Payment processing
- **Cloudinary:** Image storage and CDN
- **LaunchDarkly:** Feature flags (free tier)

### Deployment
- **Vercel:** Hosting + edge network
- **Supabase Cloud:** Database

## Architecture Decisions

### Permission-Based Role System
- **NOT** enum-based roles
- **YES** Permission entities with Role groupings
- Users → Role → Permissions (many-to-many)
- Easier to modify permissions without code changes

### Unified Routes (No Role Prefixes)
- **NOT** `/admin/*`, `/manufacturer/*`, `/customer/*`
- **YES** `/dashboard/*` with permission-based rendering
- Navigation items show/hide based on user permissions
- Same route shows different data based on role

### Mobile-First Design
- All components built mobile-first
- Responsive breakpoints: mobile (<640px), tablet (640-1024px), desktop (1024px+)
- Touch-friendly tap targets (44px minimum)
- Safe areas for notched devices

### Product Visibility Windows
Products have 4 states:
1. **Before Event:** Images visible, prices hidden
2. **During Live:** Full visibility, can purchase
3. **After Event (7 days):** Full visibility, can purchase, "Last chance" messaging
4. **After Window (7+ days):** Images visible, prices hidden again

**Business Logic:** Purchase window = event broadcast + 7 days
**Purpose:** Batch order fulfillment from manufacturers

### Event Flow
```
draft → scheduled → live → ended
```

**Status reflects broadcast state only, NOT purchase availability.**

- **Admin creates** events (not manufacturers in POC)
- **Admin broadcasts** (not manufacturers in POC)
- Manufacturers can view their events (read-only)
- **Broadcasts can be restarted** after ending, as long as within scheduled time window
- **Purchase availability** determined by time windows, not status:
  - Purchasable during `live` status
  - Purchasable for 7 days after `ended` status
  - `purchaseWindowEndTime` = `scheduledEndTime` + 7 days

## Database Schema

All entities extend `BaseEntity`:
```typescript
{
  id: string (UUID)
  createdAt: Date
  updatedAt: Date
}
```

### Core Entities
- `Permission` - Granular permissions (e.g., 'product.create')
- `Role` - Permission groups (admin, manufacturer_owner, customer, guest)
- `User` - Links to Role and optionally Manufacturer
- `Manufacturer` - Company info, approval status, isHidden flag
- `Product` - Catalog items with pricing and stock
- `LiveEvent` - Scheduled broadcasts with featured products
- `Order` - Customer purchases
- `OrderItem` - Line items with product snapshots

### Key Relationships
- Role ←→ Permission (many-to-many)
- User → Role (many-to-one)
- User → Manufacturer (many-to-one, nullable)
- Manufacturer → Products (one-to-many)
- LiveEvent ←→ Products (many-to-many, featured)
- Order → OrderItems → Products

## Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_live_dev
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Agora
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate
NEXT_PUBLIC_AGORA_APP_ID=your_app_id

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# LaunchDarkly
LAUNCHDARKLY_SDK_KEY=sdk-xxx
NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID=xxx

# App
NEXT_PUBLIC_URL=http://localhost:3000
NODE_ENV=development

# Mock Services (development)
NEXT_PUBLIC_USE_MOCKS=true
MOCK_STRIPE=true
MOCK_AGORA=true
MOCK_CLOUDINARY=true
```

### Development Commands

```bash
# Run with real services
npm run dev

# Run with mock services
npm run dev:mocks

# Database
npm run migration:generate  # Generate migration from entities
npm run migration:run       # Apply migrations
npm run migration:revert    # Rollback last migration

# Seed database with test data
npm run seed
npm run seed:clear          # Clear and re-seed

# Testing
npm run test                # Unit tests (Vitest)
npm run test:e2e            # E2E tests (Playwright)
```

### Test Users (after seeding)

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

## Code Conventions

### File Organization

```
app/
  (auth)/           # Authentication pages
  (public)/         # Public pages (homepage, shop, live)
  dashboard/        # Unified dashboard for all roles
  api/              # API routes

components/
  ui/               # Shadcn/ui components
  shared/           # Shared components
  customer/         # Customer-specific
  manufacturer/     # Manufacturer-specific
  admin/            # Admin-specific

lib/
  db/               # Database (entities, data-source, migrations)
  auth/             # Authentication utilities
  permissions/      # Permission system
  agora/            # Agora integration
  stripe/           # Stripe integration
  cloudinary/       # Cloudinary integration
  feature-flags/    # LaunchDarkly
  dev/              # Development mocks
  utils/            # Utilities
  validation/       # Zod schemas

public/
  locales/          # i18n translations
```

### Naming Conventions

- **Files:** kebab-case (`product-card.tsx`, `user-profile.tsx`)
- **Components:** PascalCase (`ProductCard`, `UserProfile`)
- **Functions:** camelCase (`getUserById`, `calculateTotal`)
- **Constants:** UPPER_SNAKE_CASE (`PERMISSIONS`, `API_ENDPOINTS`)
- **Types/Interfaces:** PascalCase (`User`, `ProductVisibility`)

### TypeScript Patterns

**Always use:**
- Explicit return types on functions
- Interface over type for objects
- Zod schemas for validation
- Proper null handling (`| null` instead of `?` when nullable)

**Avoid:**
- `any` type (use `unknown` if needed)
- Inline type definitions (extract to types file)
- Optional chaining abuse (handle nulls explicitly)

### Component Patterns

**Server Components (default):**
```typescript
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductGrid products={products} />;
}
```

**Client Components (when needed):**
```typescript
// components/customer/product-card.tsx
'use client';

import { useState } from 'react';

export function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  // ... interactive logic
}
```

**When to use 'use client':**
- useState, useEffect, or other hooks
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Third-party client libraries (Agora SDK)

### API Route Patterns

```typescript
// app/api/products/route.ts
import { withErrorHandling } from '@/lib/utils/api-wrapper';
import { requirePermission } from '@/lib/permissions/check';

export const GET = withErrorHandling(async (req: Request) => {
  // Permission check
  const session = await getSession();
  await requirePermission(session.user.id, PERMISSIONS.PRODUCT_READ);

  // Business logic
  const products = await productRepository.find();

  return NextResponse.json({ products });
});
```

**Always:**
- Wrap in `withErrorHandling`
- Check permissions first
- Use standardized error responses
- Validate input with Zod

### Permission Checking

**Server-side:**
```typescript
import { requirePermission, hasPermission } from '@/lib/permissions/check';

// Throw error if no permission
await requirePermission(userId, PERMISSIONS.PRODUCT_CREATE);

// Boolean check
if (await hasPermission(userId, PERMISSIONS.EVENT_BROADCAST)) {
  // ...
}
```

**Client-side:**
```typescript
import { usePermissions } from '@/hooks/usePermissions';

function Component() {
  const { can } = usePermissions();

  return (
    <>
      {can.createEvent() && <CreateEventButton />}
    </>
  );
}
```

### Mobile-First Styling

```typescript
// Always start mobile, use breakpoints for larger screens
<div className="
  flex flex-col gap-2          // Mobile: stacked
  sm:flex-row sm:gap-4         // Tablet: side-by-side
  lg:gap-6                     // Desktop: more spacing
">
```

**Common patterns:**
- `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` - Responsive grid
- `text-sm sm:text-base lg:text-lg` - Responsive text
- `p-4 sm:p-6 lg:p-8` - Responsive spacing
- `hidden lg:block` - Hide on mobile, show on desktop

## Development Tools

### Mock Services

Set `NEXT_PUBLIC_USE_MOCKS=true` to enable mocks.

**Mock Stripe:**
- Redirects to `/dev/mock-checkout` instead of Stripe
- Buttons to simulate success/failure
- Triggers webhook simulation

**Mock Agora:**
- Console logs instead of real streaming
- Placeholder video player with mock UI
- Simulated chat messages

**Mock Cloudinary:**
- Uses local blob URLs
- No external upload

**Dev Admin Panel:**
- Access at `/dev/admin` (development only)
- View mock status
- Seed database
- Trigger test events

## Feature Flags (LaunchDarkly)

### Key Flags

```typescript
import { FeatureFlags } from '@/lib/feature-flags/flags';

// Usage in API routes
const enabled = await getFeatureFlag(FeatureFlags.CSV_IMPORT, user);

// Usage in components
const flags = useFlags();
if (flags[FeatureFlags.LIVE_STREAMING]) {
  // Show feature
}
```

**POC Flags:**
- `live-streaming` - Enable streaming
- `stripe-payments` - Enable real payments
- `csv-import` - CSV bulk import
- `google-auth` - Google OAuth

**Future Flags:**
- `order-fulfillment` - Order workflow
- `email-notifications` - Email system
- `product-reviews` - Reviews/ratings

## Common Tasks

### Add a new entity

1. Create entity file in `lib/db/entities/`
2. Export from `lib/db/entities/index.ts`
3. Generate migration: `npm run migration:generate`
4. Review migration
5. Run migration: `npm run migration:run`

### Add a new API route

1. Create `app/api/{resource}/route.ts`
2. Wrap handler in `withErrorHandling`
3. Add permission checks
4. Validate input with Zod
5. Test with mock data first

### Add a new component

1. Decide: Server or Client component?
2. Create in appropriate folder (`shared/`, `customer/`, etc.)
3. Use Shadcn components where possible
4. Mobile-first styling
5. Add translations if user-facing text

### Add a new permission

1. Add to `PERMISSIONS` in `lib/permissions/definitions.ts`
2. Add to role mappings in `ROLE_PERMISSIONS`
3. Run seed script to update database
4. Use in permission checks

## Documentation Maintenance

### CRITICAL: Keep Documentation Updated

**After EVERY feature, bug fix, or change, you MUST update relevant documentation.**

### What Counts as "Done"

A task is NOT complete until:
1. ✅ Code is written and tested
2. ✅ Tests pass
3. ✅ Code is committed
4. ✅ **Documentation is updated**

### Documents to Check After Changes

**Always review and update if needed:**

1. **CLAUDE.md** (this file)
   - New architecture decisions
   - New patterns or conventions
   - New utilities or helpers
   - Configuration changes
   - New environment variables

2. **Design Document** (`docs/plans/*-design.md`)
   - Database schema changes
   - API endpoint changes
   - Business logic changes
   - Architecture changes

3. **Implementation Plan** (`docs/plans/*-implementation-plan.md`)
   - Completed tasks
   - Blockers or changes in approach
   - New tasks discovered

4. **Skills** (`.claude/skills/*.md`)
   - New workflows
   - Updated patterns
   - Common problems and solutions

5. **README.md** (when created)
   - Setup instructions
   - Environment changes
   - New dependencies

6. **API Documentation** (if separate)
   - New endpoints
   - Changed request/response formats
   - New authentication requirements

### Documentation Update Workflow

```
1. Make code change
2. Update tests
3. Run tests (verify pass)
4. Commit code + tests
5. ← STOP! Check documentation
6. Update relevant docs
7. Commit documentation changes
8. NOW task is complete ✅
```

### Example: Adding New Permission

**Code changes:**
```typescript
// lib/permissions/definitions.ts
export const PERMISSIONS = {
  // ... existing
  PRODUCT_EXPORT: 'product.export', // NEW
}

export const ROLE_PERMISSIONS = {
  admin: [..., PERMISSIONS.PRODUCT_EXPORT],
  manufacturer_owner: [..., PERMISSIONS.PRODUCT_EXPORT],
}
```

**Documentation updates required:**

1. **CLAUDE.md** - Add to permission examples:
   ```markdown
   ### Permission Checking
   - `PRODUCT_EXPORT` - Export products to CSV
   ```

2. **Design Document** - Update permission list:
   ```markdown
   ### Permissions
   - `product.export` - Export product catalog
   ```

3. **API Documentation** - If new API endpoint:
   ```markdown
   ### GET /api/products/export
   Requires: `product.export` permission
   ```

### Example: Changing Database Schema

**Code changes:**
```typescript
// Added new field to Product entity
@Column({ nullable: true })
sku: string | null;
```

**Documentation updates required:**

1. **CLAUDE.md** - Update entity description:
   ```markdown
   ### Core Entities
   - `Product` - Catalog items with pricing, stock, and SKU
   ```

2. **Design Document** - Update database schema:
   ```markdown
   #### Product Entity
   - sku (string, nullable) - Stock keeping unit
   ```

3. **Implementation Plan** - Mark task complete:
   ```markdown
   - [x] Task 2.6: Add SKU field to Product entity
   ```

### Example: Adding New Environment Variable

**Code changes:**
```typescript
// Using new service
const apiKey = process.env.SENDGRID_API_KEY;
```

**Documentation updates required:**

1. **CLAUDE.md** - Update environment variables section:
   ```bash
   # Email
   SENDGRID_API_KEY=xxx
   ```

2. **.env.example** - Add placeholder:
   ```bash
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

3. **README.md** - Update setup instructions:
   ```markdown
   4. Get SendGrid API key from sendgrid.com
   ```

### Documentation Review Checklist

Before marking any task complete:

- [ ] Does this change architecture? → Update design doc
- [ ] Does this add/change a pattern? → Update CLAUDE.md
- [ ] Does this add a new workflow? → Create/update skill
- [ ] Does this change database? → Update schema docs
- [ ] Does this add dependencies? → Update setup docs
- [ ] Does this change environment? → Update .env.example
- [ ] Does this add API endpoint? → Update API docs
- [ ] Does this change business logic? → Update design doc

### Automated Reminders

Use this commit message template:

```bash
git commit -m "feat: add product export functionality

- Added export permission
- Created /api/products/export endpoint
- Added CSV generation utility

Docs updated:
- [ ] CLAUDE.md - Permission added
- [ ] Design doc - API endpoint documented
- [ ] .env.example - No new env vars needed

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### When Documentation is Out of Sync

If you notice documentation doesn't match code:

1. **Stop immediately**
2. Update documentation first
3. Commit doc fix separately:
   ```bash
   git commit -m "docs: fix outdated permission list in CLAUDE.md"
   ```

### Common Documentation Mistakes

❌ **DON'T:**
- Skip documentation "to save time"
- Update docs "later" (you'll forget)
- Document in comments instead of proper docs
- Assume docs will update themselves

✅ **DO:**
- Update docs as part of the task
- Use commit message to track doc updates
- Review docs before marking task complete
- Treat docs as code (they're tested by users reading them)

---

## Code Review Process

### CRITICAL: Review Before Complete

**Every implementation must be reviewed before marking task complete.**

### Review Workflow

```
1. Code implemented ✅
2. Tests passing ✅
3. Documentation updated ✅
4. ← Self-review (MANDATORY)
5. Issues fixed
6. Final verification
7. Commit
8. Task complete ✅
```

### Quick Review Checklist

Before marking ANY task complete:

**Code Quality:**
- [ ] Follows project conventions
- [ ] No code duplication (DRY)
- [ ] Functions are single-purpose
- [ ] TypeScript types explicit

**Security:**
- [ ] Permission checks in place
- [ ] Input validated (Zod schemas)
- [ ] No hardcoded secrets
- [ ] No SQL injection risks

**Testing:**
- [ ] Tests written first (TDD)
- [ ] All tests pass
- [ ] Edge cases covered

**Documentation:**
- [ ] CLAUDE.md updated (if needed)
- [ ] Design doc updated (if needed)
- [ ] Implementation plan updated

**Mobile-First:**
- [ ] Mobile layout works (< 640px)
- [ ] Touch targets 44px minimum
- [ ] Responsive on all breakpoints

**Use `@code-review` skill for comprehensive review checklist.**

---

## Test-Driven Development (TDD)

### Methodology: Red-Green-Refactor

**CRITICAL:** All features MUST follow TDD. Write tests FIRST, then implementation.

```
🔴 RED    → Write failing test
🟢 GREEN  → Write minimal code to pass
♻️  REFACTOR → Improve code quality
```

### TDD Workflow

**Every feature follows this cycle:**

1. **Write the test (RED)** - Test describes desired behavior, run to verify it fails
2. **Make it pass (GREEN)** - Write minimal code to pass, no extra features (YAGNI)
3. **Refactor** - Improve code quality while tests still pass

### Running Tests

```bash
npm run test              # Unit tests (Vitest)
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:e2e          # E2E tests (Playwright)
```

See full TDD examples and patterns in `@tdd` skill.

**Reference:**
- `@tdd` - Comprehensive TDD workflow
- `@superpowers:test-driven-development` - Built-in TDD skill

## Deployment

### Vercel Setup

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Auto-deploys on push to main

### Database Migrations

```bash
# On deployment, run migrations
npm run migration:run
```

### Stripe Webhooks

Set webhook endpoint in Stripe dashboard:
```
https://your-domain.vercel.app/api/webhooks/stripe
```

## Troubleshooting

### TypeORM Connection Issues

```bash
# Check database URL
echo $DATABASE_URL

# Test connection
npm run typeorm -- -d lib/db/data-source.ts
```

### Migration Issues

```bash
# Revert last migration
npm run migration:revert

# Clear and re-seed
npm run seed:clear
```

### Agora Streaming Issues

1. Check `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`
2. Verify tokens are generating correctly
3. Check browser console for SDK errors
4. Use mock mode for local development

### Stripe Webhook Testing

```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Important Notes

### POC Scope

**Included:**
✅ Authentication & permissions
✅ Product catalog
✅ Live events & streaming
✅ Shopping cart & checkout
✅ Basic order viewing
✅ Mobile-first UI
✅ i18n (English only)

**Excluded (Phase 2):**
❌ Order fulfillment workflow
❌ Email notifications
❌ Manufacturer broadcasting
❌ Advanced analytics
❌ Product reviews

### Business Logic

**Purchase Windows:**
- Products ONLY purchasable during live events OR 7 days after
- Purchase window = `scheduledEndTime` + 7 days (time-based, not status-based)
- Window automatically closes after 7 days

**Event Flow:**
- Admin creates events (not manufacturers)
- Admin edits events (draft and scheduled status only)
- Admin broadcasts (can start, end, and restart within scheduled time window)
- Manufacturers view events (read-only)

**Broadcast Controls:**
- **Start broadcast:** Available 1 hour before `scheduledStartTime` until `scheduledEndTime`
- **End broadcast:** Available anytime during live broadcast, with 1-hour grace period after `scheduledEndTime`
- **Restart broadcast:** Can restart ended broadcasts if still within valid time window
- Route protection: Broadcast control panel only accessible when event status is `live`

**Manufacturer Visibility:**
- Manufacturers are hidden from customers (POC)
- Products appear as unified brand
- Future: Individual manufacturer stores

## Getting Help

**Documentation:**
- Design Doc: `docs/plans/2026-04-29-ecommerce-live-platform-design.md`
- Implementation Plan: `docs/plans/2026-04-29-implementation-plan.md`

**Key Skills:**
- `@superpowers:executing-plans` - Execute implementation plan
- `@superpowers:systematic-debugging` - Debug issues
- `@superpowers:test-driven-development` - TDD workflow

**External Docs:**
- [Next.js 14 Docs](https://nextjs.org/docs)
- [TypeORM Docs](https://typeorm.io/)
- [Agora Docs](https://docs.agora.io/)
- [Stripe Docs](https://stripe.com/docs)

---

---

## Recent Changes (Session Log)

### 2026-05-07
- ✅ **Event Editing** - Added `/dashboard/events/edit/[id]/page.tsx`
  - Pre-populates form with existing event data
  - Supports editing draft and scheduled events
  - Updates featured products
  - Edit button available on events list page

- ✅ **Broadcast Restart Capability**
  - Can restart broadcasts after ending them
  - Validates time window (1 hour before start until scheduled end)
  - "Go Live" button shows for ended events within valid time
  - Server-side validation in `/api/events/[id]/broadcast/start`

- ✅ **Event Status Redesign**
  - Changed from `draft → scheduled → live → ended → purchase_window → closed`
  - To: `draft → scheduled → live → ended`
  - Purchase availability now time-based, not status-based
  - Updated `eventStatusEnum` in `lib/validation/event.ts`
  - Updated all event pages and hooks

- ✅ **Broadcaster Control Panel**
  - Real WebRTC camera/microphone integration
  - Route protected - only accessible when event is `live`
  - Live analytics display
  - Chat moderation interface
  - "Enter Broadcast" button from multiple entry points

---

**Last Updated:** 2026-05-07
**Project Owner:** Guy Kuperly
