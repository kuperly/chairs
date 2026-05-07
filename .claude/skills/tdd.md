---
name: tdd
description: Test-Driven Development workflow - Red, Green, Refactor cycle with Vitest and Playwright
---

# Test-Driven Development (TDD) Workflow

**CRITICAL:** All features MUST follow TDD. Write tests FIRST, then implementation.

## The Red-Green-Refactor-Document Cycle

```
🔴 RED
  ↓ Write failing test
  ↓ Run test (verify it fails)
  ↓ Commit: "test: add failing test for {feature}"
  ↓
🟢 GREEN
  ↓ Write minimal code to pass
  ↓ Run test (verify it passes)
  ↓ Commit: "feat: implement {feature}"
  ↓
♻️ REFACTOR
  ↓ Improve code quality
  ↓ Run tests (verify still passing)
  ↓ Commit: "refactor: improve {feature}"
  ↓
📚 DOCUMENT
  ↓ Update relevant docs (CLAUDE.md, design doc, etc.)
  ↓ Commit: "docs: update {feature} documentation"
  ↓
✅ COMPLETE
```

## TDD Rules

### Always:
1. ✅ Write test BEFORE implementation
2. ✅ Run test to verify it fails (RED)
3. ✅ Write minimal code to pass (GREEN)
4. ✅ Refactor only after test passes
5. ✅ **Update documentation** after refactor
6. ✅ Commit after each step
7. ✅ Test edge cases and error conditions

### Never:
1. ❌ Write code without a test first
2. ❌ Skip running tests
3. ❌ Write implementation during test writing
4. ❌ Add features not covered by tests
5. ❌ Commit failing tests (except RED step)
6. ❌ **Mark task complete without updating docs**

## When to Use Each Test Type

### Unit Tests (Vitest)
**Use for:**
- Pure functions (calculations, transformations)
- Business logic (product visibility, permissions)
- Utility functions
- Validation schemas
- Data formatters

**Example:**
```typescript
// Testing product visibility logic
describe('getProductVisibility', () => {
  it('should hide price before event starts', () => {
    // Arrange
    const product = mockProduct();
    const event = mockLiveEvent({ status: EventStatus.SCHEDULED });

    // Act
    const visibility = getProductVisibility(product, event);

    // Assert
    expect(visibility.showPrice).toBe(false);
  });
});
```

### API Tests (Vitest)
**Use for:**
- API endpoints
- Authentication
- Permission checks
- Database operations
- Validation

**Example:**
```typescript
// Testing API routes
describe('POST /api/products', () => {
  it('should create product with valid data', async () => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(validProductData),
    });

    expect(response.status).toBe(201);
  });
});
```

### Component Tests (Vitest + Testing Library)
**Use for:**
- React components
- User interactions
- Conditional rendering
- Props handling
- Event handlers

**Example:**
```typescript
// Testing React components
describe('ProductCard', () => {
  it('should call onAddToCart when clicked', () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={mockProduct()} onAddToCart={onAddToCart} />);

    fireEvent.click(screen.getByText('BUY NOW'));

    expect(onAddToCart).toHaveBeenCalled();
  });
});
```

### E2E Tests (Playwright)
**Use for:**
- Complete user flows
- Multi-page workflows
- Real browser interactions
- Critical business processes

**Example:**
```typescript
// Testing complete checkout flow
test('customer completes purchase', async ({ page }) => {
  await page.goto('/');
  await page.click('text=JOIN LIVE NOW');
  await page.click('text=BUY NOW');
  await page.fill('[name=email]', 'customer@test.com');
  await page.click('text=Checkout');
  // ... complete flow
});
```

## TDD Workflow Examples

### Example 1: Adding Product Visibility Logic

**Step 1: Write Failing Test (RED) 🔴**

Create `__tests__/lib/utils/product-visibility.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getProductVisibility } from '@/lib/utils/product-visibility';
import { mockProduct, mockLiveEvent } from '@/lib/test-utils';
import { EventStatus } from '@/lib/db/entities';

describe('Product Visibility', () => {
  describe('before event starts', () => {
    it('should hide price when event is scheduled', () => {
      const product = mockProduct();
      const event = mockLiveEvent({
        status: EventStatus.SCHEDULED,
        scheduledStartTime: new Date('2026-05-01'),
      });

      const visibility = getProductVisibility(product, event);

      expect(visibility.showPrice).toBe(false);
      expect(visibility.canPurchase).toBe(false);
      expect(visibility.message).toContain('Available live on');
    });
  });
});
```

**Run test:**
```bash
npm run test -- product-visibility.test.ts
```

**Expected:** Test FAILS - function doesn't exist

**Commit:**
```bash
git add __tests__/lib/utils/product-visibility.test.ts
git commit -m "test: add failing test for product visibility before event

Test verifies that:
- Price is hidden
- Purchase is disabled
- Appropriate message is shown

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Step 2: Make It Pass (GREEN) 🟢**

Create `lib/utils/product-visibility.ts`:

```typescript
import { Product, LiveEvent, EventStatus } from '@/lib/db/entities';

export interface ProductVisibility {
  showPrice: boolean;
  canPurchase: boolean;
  message: string;
}

export function getProductVisibility(
  product: Product,
  event?: LiveEvent
): ProductVisibility {
  if (!event) {
    return {
      showPrice: false,
      canPurchase: false,
      message: 'Coming soon in live events',
    };
  }

  const now = new Date();
  const eventStart = new Date(event.scheduledStartTime);

  // Before event
  if (now < eventStart) {
    return {
      showPrice: false,
      canPurchase: false,
      message: `Available live on ${eventStart.toLocaleDateString()}`,
    };
  }

  // Default (will add more states later)
  return {
    showPrice: true,
    canPurchase: true,
    message: '',
  };
}
```

**Run test:**
```bash
npm run test -- product-visibility.test.ts
```

**Expected:** Test PASSES

**Commit:**
```bash
git add lib/utils/product-visibility.ts
git commit -m "feat: implement product visibility logic for scheduled events

Hides price and purchase option before event starts.
Shows appropriate messaging.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Step 3: Add More Test Cases (Continue RED-GREEN)**

Add test for live event state:

```typescript
describe('during live event', () => {
  it('should show price and enable purchase when live', () => {
    const product = mockProduct();
    const event = mockLiveEvent({ status: EventStatus.LIVE });

    const visibility = getProductVisibility(product, event);

    expect(visibility.showPrice).toBe(true);
    expect(visibility.canPurchase).toBe(true);
    expect(visibility.isLive).toBe(true);
  });
});
```

**Run test:** FAILS (isLive not implemented)

**Implement:**
```typescript
// Update ProductVisibility interface
export interface ProductVisibility {
  showPrice: boolean;
  canPurchase: boolean;
  message: string;
  isLive?: boolean;
}

// Update function
if (event.status === EventStatus.LIVE) {
  return {
    showPrice: true,
    canPurchase: true,
    message: '',
    isLive: true,
  };
}
```

**Run test:** PASSES

**Commit each cycle!**

**Step 4: Refactor (♻️)**

After all tests pass, refactor for better code quality:

```typescript
export function getProductVisibility(
  product: Product,
  event?: LiveEvent
): ProductVisibility {
  if (!event) {
    return createVisibility(false, false, 'Coming soon in live events');
  }

  const now = new Date();
  const eventStart = new Date(event.scheduledStartTime);

  if (now < eventStart) {
    return createVisibility(
      false,
      false,
      `Available live on ${formatDate(eventStart)}`
    );
  }

  if (event.status === EventStatus.LIVE) {
    return createVisibility(true, true, '', { isLive: true });
  }

  // ... more states
}

function createVisibility(
  showPrice: boolean,
  canPurchase: boolean,
  message: string,
  extra?: Partial<ProductVisibility>
): ProductVisibility {
  return {
    showPrice,
    canPurchase,
    message,
    ...extra,
  };
}
```

**Run tests:** Still PASSING

**Commit:**
```bash
git add lib/utils/product-visibility.ts
git commit -m "refactor: extract visibility creation helper

Reduced duplication, improved readability.
All tests still passing.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Example 2: Adding API Endpoint

**Step 1: Write Failing API Test (RED) 🔴**

Create `__tests__/api/products.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { createTestUser, getAuthToken } from '@/lib/test-utils';

describe('Products API', () => {
  let adminToken: string;

  beforeAll(async () => {
    await createTestUser('admin@test.com', 'admin');
    adminToken = await getAuthToken('admin@test.com');
  });

  describe('POST /api/products', () => {
    it('should create product with valid data', async () => {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Chair',
          description: 'A comfortable office chair',
          price: 199.99,
          category: 'Office Chairs',
          imageUrls: ['https://example.com/chair.jpg'],
          stockQuantity: 50,
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.product.name).toBe('Test Chair');
      expect(data.product.price).toBe(199.99);
    });
  });
});
```

**Run test:** FAILS (endpoint doesn't exist)

**Commit test**

**Step 2: Implement API Route (GREEN) 🟢**

Create `app/api/products/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/utils/api-wrapper';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { getSession } from '@/lib/auth/session';
import { getRepository } from '@/lib/db';
import { Product } from '@/lib/db/entities';
import { ProductSchema } from '@/lib/validation/schemas';
import { ApiError, ErrorCodes } from '@/lib/utils/api-errors';

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await getSession();
  await requirePermission(session.user.id, PERMISSIONS.PRODUCT_CREATE);

  const body = await req.json();

  const validationResult = ProductSchema.safeParse(body);
  if (!validationResult.success) {
    throw new ApiError(
      400,
      'Validation failed',
      ErrorCodes.VALIDATION_ERROR,
      validationResult.error.errors
    );
  }

  const repository = await getRepository(Product);
  const product = await repository.save(validationResult.data);

  return NextResponse.json({ product }, { status: 201 });
});
```

**Run test:** PASSES

**Commit implementation**

**Step 3: Add More Test Cases**

Add tests for:
- Validation errors
- Permission denied
- Unauthorized access

```typescript
it('should validate required fields', async () => {
  const response = await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: 'X' }), // Too short
  });

  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.error.code).toBe('VALIDATION_ERROR');
});

it('should prevent unauthorized access', async () => {
  const response = await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validProductData),
  });

  expect(response.status).toBe(401);
});
```

**Run tests:** See which fail, implement, repeat

### Example 3: Adding React Component

**Step 1: Write Failing Component Test (RED) 🔴**

Create `__tests__/components/product-card.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '@/components/customer/product-card';
import { mockProduct, mockLiveEvent } from '@/lib/test-utils';
import { EventStatus } from '@/lib/db/entities';

describe('ProductCard', () => {
  it('renders product name and price during live event', () => {
    const product = mockProduct({
      name: 'Ergonomic Chair',
      price: 189,
    });
    const event = mockLiveEvent({ status: EventStatus.LIVE });

    render(<ProductCard product={product} event={event} />);

    expect(screen.getByText('Ergonomic Chair')).toBeInTheDocument();
    expect(screen.getByText('$189')).toBeInTheDocument();
  });

  it('calls onAddToCart when buy button clicked', () => {
    const onAddToCart = vi.fn();
    const product = mockProduct();
    const event = mockLiveEvent({ status: EventStatus.LIVE });

    render(
      <ProductCard
        product={product}
        event={event}
        onAddToCart={onAddToCart}
      />
    );

    fireEvent.click(screen.getByText('BUY NOW'));

    expect(onAddToCart).toHaveBeenCalledWith(product);
  });
});
```

**Run test:** FAILS (component doesn't exist)

**Commit test**

**Step 2: Implement Component (GREEN) 🟢**

Create `components/customer/product-card.tsx`:

```typescript
'use client';

import { Product, LiveEvent } from '@/lib/db/entities';
import { getProductVisibility } from '@/lib/utils/product-visibility';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
  event?: LiveEvent;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, event, onAddToCart }: ProductCardProps) {
  const visibility = getProductVisibility(product, event);

  return (
    <Card className="p-4">
      <img
        src={product.imageUrls[0]}
        alt={product.name}
        className="w-full aspect-square object-cover rounded"
      />

      <h3 className="text-lg font-bold mt-2">{product.name}</h3>

      {visibility.showPrice && (
        <p className="text-xl font-bold text-primary mt-2">
          ${product.price}
        </p>
      )}

      {visibility.canPurchase && (
        <Button
          onClick={() => onAddToCart?.(product)}
          className="w-full mt-4"
        >
          BUY NOW
        </Button>
      )}
    </Card>
  );
}
```

**Run test:** PASSES

**Commit implementation**

**Step 3: Add More Tests & Features**

Continue RED-GREEN-REFACTOR for:
- Discount badge display
- Stock urgency messaging
- Hide price before event
- Mobile responsiveness (snapshot tests)

## Test Organization

```
__tests__/
├── lib/
│   ├── utils/
│   │   ├── product-visibility.test.ts
│   │   ├── formatters.test.ts
│   │   └── validators.test.ts
│   ├── permissions/
│   │   └── check.test.ts
│   └── validation/
│       └── schemas.test.ts
├── api/
│   ├── products.test.ts
│   ├── events.test.ts
│   └── orders.test.ts
└── components/
    ├── product-card.test.tsx
    ├── event-card.test.tsx
    └── checkout-form.test.tsx

e2e/
├── checkout-flow.spec.ts
├── live-streaming.spec.ts
└── admin-workflow.spec.ts
```

## Test Utilities

Create `lib/test-utils.ts` with helpers:

```typescript
import { Product, LiveEvent, EventStatus, User, Role } from '@/lib/db/entities';
import { getDataSource } from '@/lib/db';
import { supabaseAdmin } from '@/lib/auth/supabase';

// Mock data factories
export function mockProduct(overrides?: Partial<Product>): Product {
  return {
    id: '1',
    name: 'Test Product',
    description: 'Test description that is long enough',
    price: 100,
    compareAtPrice: 150,
    imageUrls: ['https://example.com/image.jpg'],
    stockQuantity: 50,
    category: 'Test Category',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Product;
}

export function mockLiveEvent(overrides?: Partial<LiveEvent>): LiveEvent {
  return {
    id: '1',
    title: 'Test Event',
    description: 'Test event description',
    status: EventStatus.LIVE,
    scheduledStartTime: new Date(),
    scheduledEndTime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as LiveEvent;
}

// Database test helpers
export async function createTestUser(email: string, roleName: string): Promise<User> {
  const ds = await getDataSource();
  const userRepo = ds.getRepository(User);
  const roleRepo = ds.getRepository(Role);

  const role = await roleRepo.findOne({ where: { name: roleName } });
  if (!role) throw new Error(`Role ${roleName} not found`);

  const { data: authData } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'test123',
    email_confirm: true,
  });

  const user = await userRepo.save({
    email,
    fullName: `Test ${roleName}`,
    role,
    supabaseAuthId: authData.user.id,
  });

  return user;
}

export async function getAuthToken(email: string): Promise<string> {
  const { data } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password: 'test123',
  });

  return data.session.access_token;
}

export async function cleanupTestData() {
  const ds = await getDataSource();
  await ds.query('TRUNCATE TABLE users CASCADE');
  await ds.query('TRUNCATE TABLE products CASCADE');
  await ds.query('TRUNCATE TABLE orders CASCADE');
}
```

## Running Tests

```bash
# Unit tests
npm run test                     # Run all tests
npm run test:watch               # Watch mode
npm run test:coverage            # With coverage
npm run test -- pattern          # Run matching tests

# E2E tests
npm run test:e2e                 # All E2E tests
npm run test:e2e -- --ui         # With UI
npm run test:e2e -- --debug      # Debug mode

# Specific test file
npm run test -- product-visibility.test.ts
npm run test:e2e -- checkout-flow.spec.ts
```

## Coverage Goals

- **Unit Tests:** >80% coverage for business logic
- **API Tests:** 100% of endpoints
- **Component Tests:** All interactive components
- **E2E Tests:** Critical user flows

## Common Pitfalls

### ❌ DON'T:
```typescript
// Writing implementation before test
export function calculateDiscount(price, comparePrice) {
  return ((comparePrice - price) / comparePrice) * 100;
}

// Then writing test
it('should calculate discount', () => {
  expect(calculateDiscount(100, 150)).toBe(33.33);
});
```

### ✅ DO:
```typescript
// Write test FIRST
it('should calculate discount percentage', () => {
  const discount = calculateDiscount(100, 150);
  expect(discount).toBeCloseTo(33.33, 2);
});

// THEN implement
export function calculateDiscount(price: number, comparePrice: number): number {
  return ((comparePrice - price) / comparePrice) * 100;
}
```

## Integration with Implementation Plan

When following the implementation plan:

1. **Each task starts with:** "Write the failing test"
2. **Next step:** "Run test to verify it fails"
3. **Then:** "Write minimal implementation"
4. **Finally:** "Run test to verify it passes"
5. **Commit after each step**

## Quick Reference

```bash
# TDD Cycle Commands
npm run test -- {filename}       # Run specific test
npm run test:watch               # Auto-run on changes
git commit -m "test: ..."        # Commit failing test (RED)
git commit -m "feat: ..."        # Commit implementation (GREEN)
git commit -m "refactor: ..."    # Commit refactor
```

## Best Practices

1. **One test at a time** - Don't write multiple failing tests
2. **Minimal implementation** - Just enough to pass
3. **Test edge cases** - Empty, null, invalid data
4. **Descriptive test names** - "should do X when Y"
5. **Arrange-Act-Assert** - Clear test structure
6. **Mock external dependencies** - Database, APIs, services
7. **Fast tests** - < 100ms per unit test
8. **Independent tests** - No shared state
9. **Commit frequently** - After RED, GREEN, REFACTOR

---

**Remember:** Tests are documentation. If code doesn't have tests, it doesn't exist.

**Reference:**
- `CLAUDE.md` - TDD overview
- `@superpowers:test-driven-development` - Built-in TDD skill
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
