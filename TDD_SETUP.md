# TDD Setup Complete ✅

Test-Driven Development has been integrated into the project setup.

## What's Been Added

### 📚 Documentation

1. **CLAUDE.md** - Updated with TDD section
   - Red-Green-Refactor methodology
   - Quick reference to TDD skill
   - Test running commands

2. **@tdd Skill** - Comprehensive TDD guide
   - Complete Red-Green-Refactor workflow
   - Examples for all test types
   - Test utilities and helpers
   - Best practices and pitfalls
   - Integration with implementation plan

### 🎯 TDD Workflow

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
♻️  REFACTOR
  ↓ Improve code quality
  ↓ Run tests (verify still passing)
  ↓ Commit: "refactor: improve {feature}"
```

## Test Types Covered

### Unit Tests (Vitest)
- Pure functions and business logic
- Utility functions
- Validation schemas
- Permission system
- Product visibility logic

### API Tests (Vitest)
- All API endpoints
- Authentication
- Permission checks
- Database operations
- Input validation

### Component Tests (Vitest + React Testing Library)
- React components
- User interactions
- Conditional rendering
- Event handlers
- Props handling

### E2E Tests (Playwright)
- Complete user flows
- Checkout process
- Live streaming experience
- Admin workflows
- Multi-page interactions

## Test Organization

```
__tests__/
├── lib/
│   ├── utils/                  # Pure functions
│   ├── permissions/            # Permission checks
│   └── validation/             # Zod schemas
├── api/                        # API endpoints
│   ├── products.test.ts
│   ├── events.test.ts
│   └── orders.test.ts
└── components/                 # React components
    ├── product-card.test.tsx
    └── event-card.test.tsx

e2e/
├── checkout-flow.spec.ts       # Critical flows
├── live-streaming.spec.ts
└── admin-workflow.spec.ts
```

## Running Tests

```bash
# Unit & API Tests
npm run test                # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report

# E2E Tests
npm run test:e2e           # All E2E tests
npm run test:e2e -- --ui   # With Playwright UI

# Specific tests
npm run test -- product-visibility.test.ts
npm run test:e2e -- checkout-flow.spec.ts
```

## Test Utilities

Created in `lib/test-utils.ts`:

```typescript
// Mock data factories
mockProduct(overrides)       // Create test products
mockLiveEvent(overrides)     // Create test events
mockUser(overrides)          // Create test users

// Database helpers
createTestUser(email, role)  // Create user in DB + Supabase
getAuthToken(email)          // Get JWT for testing
cleanupTestData()            // Clear test database
```

## TDD Rules

### Always:
1. ✅ Write test BEFORE implementation
2. ✅ Run test to verify it fails (RED)
3. ✅ Write minimal code to pass (GREEN)
4. ✅ Refactor after test passes
5. ✅ Commit after each step
6. ✅ Test edge cases

### Never:
1. ❌ Write code without test first
2. ❌ Skip running tests
3. ❌ Write implementation during test writing
4. ❌ Add features not covered by tests
5. ❌ Commit failing tests (except RED step)

## Example Workflow

### Adding Product Visibility Logic

**1. RED 🔴 - Write failing test:**

```typescript
// __tests__/lib/utils/product-visibility.test.ts
it('should hide price before event starts', () => {
  const product = mockProduct();
  const event = mockLiveEvent({ status: EventStatus.SCHEDULED });

  const visibility = getProductVisibility(product, event);

  expect(visibility.showPrice).toBe(false);
});
```

Run: `npm run test -- product-visibility.test.ts`
Result: FAILS ❌

Commit: `git commit -m "test: add failing test for product visibility"`

**2. GREEN 🟢 - Implement minimal code:**

```typescript
// lib/utils/product-visibility.ts
export function getProductVisibility(product, event) {
  if (event.status === EventStatus.SCHEDULED) {
    return { showPrice: false, canPurchase: false };
  }
  return { showPrice: true, canPurchase: true };
}
```

Run: `npm run test -- product-visibility.test.ts`
Result: PASSES ✅

Commit: `git commit -m "feat: implement product visibility logic"`

**3. REFACTOR ♻️ - Improve code:**

```typescript
// Refactor for better structure, add types, etc.
export interface ProductVisibility {
  showPrice: boolean;
  canPurchase: boolean;
  message: string;
}

export function getProductVisibility(
  product: Product,
  event?: LiveEvent
): ProductVisibility {
  // Improved implementation
}
```

Run: `npm run test -- product-visibility.test.ts`
Result: Still PASSES ✅

Commit: `git commit -m "refactor: improve product visibility types"`

## Coverage Goals

- **Unit Tests:** >80% coverage for business logic
- **API Tests:** 100% of endpoints
- **Component Tests:** All interactive components
- **E2E Tests:** Critical user flows

## Integration with Skills

All project skills now reference TDD:

- `@add-entity` - Write entity tests first
- `@add-api-route` - Write API tests first
- `@add-component` - Write component tests first
- `@tdd` - Complete TDD guide

## Configuration Files

When implementing, create:

### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### `vitest.setup.ts`
```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
```

### `playwright.config.ts`
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
  },
});
```

## Next Steps

### When Starting Implementation:

1. **Use @tdd skill for guidance:**
   ```
   @tdd
   I'm implementing [feature], show me the TDD workflow
   ```

2. **Follow RED-GREEN-REFACTOR:**
   - Write failing test first
   - Make it pass with minimal code
   - Refactor for quality

3. **Commit after each step:**
   - RED: `test: add failing test for X`
   - GREEN: `feat: implement X`
   - REFACTOR: `refactor: improve X`

### Example Session Start:

```
"I'm ready to start implementing the product catalog.
Let's use TDD - first I'll write tests for product visibility logic."

@tdd
Show me how to test product visibility before, during, and after events
```

## Verification Checklist

- [x] TDD section added to CLAUDE.md
- [x] @tdd skill created with comprehensive examples
- [x] Test organization structure defined
- [x] Test utilities patterns documented
- [x] All test types covered (Unit, API, Component, E2E)
- [x] Running commands documented
- [x] Configuration examples provided
- [x] Skills updated to reference TDD
- [x] Coverage goals defined

---

**Status:** TDD fully integrated
**Next:** Start implementation with TDD workflow
**Remember:** No code without tests! 🔴 → 🟢 → ♻️
