---
name: code-review
description: Comprehensive code review checklist - reviews every change before marking complete
---

# Code Review Workflow

**CRITICAL:** Every implementation must be reviewed before marking complete.

## The Rule

```
Code without review = Not production-ready
```

## When to Use This Skill

**Use BEFORE:**
- Marking any task complete
- Creating pull requests
- Merging to main branch
- Deploying to production

**Use AFTER:**
- Writing implementation code
- Running tests
- Updating documentation

## Self-Review Checklist

### 1. Code Quality ✅

**Readability:**
- [ ] Variable names are descriptive
- [ ] Function names describe what they do
- [ ] Complex logic has comments explaining WHY (not WHAT)
- [ ] Code follows project conventions (see CLAUDE.md)
- [ ] No magic numbers or strings (use constants)

**Structure:**
- [ ] Functions are single-purpose (do one thing)
- [ ] Functions are small (< 50 lines ideally)
- [ ] No duplicate code (DRY principle)
- [ ] Proper separation of concerns
- [ ] TypeScript types are explicit (no `any`)

**Patterns:**
- [ ] Follows mobile-first styling (if UI)
- [ ] Uses permission checks (if API route)
- [ ] Validates input (if accepts data)
- [ ] Handles errors properly
- [ ] Uses project utilities (don't reinvent)

### 2. Security ✅

**Authentication & Authorization:**
- [ ] Permission checks in place
- [ ] No hardcoded credentials
- [ ] Session validation correct
- [ ] User input sanitized

**Data Protection:**
- [ ] No sensitive data in logs
- [ ] Passwords/secrets in environment variables
- [ ] SQL injection prevented (using TypeORM properly)
- [ ] XSS prevented (React escapes by default, check dangerouslySetInnerHTML)
- [ ] CSRF protection (if needed)

**Common Vulnerabilities:**
- [ ] No command injection risks
- [ ] File upload validation (if applicable)
- [ ] Rate limiting considered (if API)
- [ ] Input validation with Zod schemas

### 3. Testing ✅

**Test Coverage:**
- [ ] Unit tests for business logic
- [ ] API tests for endpoints
- [ ] Component tests for React components
- [ ] E2E tests for critical flows (if applicable)
- [ ] Edge cases tested

**Test Quality:**
- [ ] Tests actually test the feature
- [ ] Tests are independent (no shared state)
- [ ] Tests use proper mocks
- [ ] Tests are readable
- [ ] All tests pass (`npm run test`)

**TDD Followed:**
- [ ] Tests written BEFORE implementation
- [ ] Red → Green → Refactor cycle followed
- [ ] Commits show TDD workflow

### 4. Documentation ✅

**Code Documentation:**
- [ ] Complex functions have JSDoc comments
- [ ] Non-obvious logic explained in comments
- [ ] TypeScript types document expected data

**Project Documentation:**
- [ ] CLAUDE.md updated (if needed)
- [ ] Design doc updated (if needed)
- [ ] Implementation plan updated
- [ ] Skills updated (if workflow changed)
- [ ] .env.example updated (if new env vars)

**Commit Messages:**
- [ ] Descriptive commit messages
- [ ] Lists what docs were updated
- [ ] Follows conventional commits format

### 5. Performance ✅

**Database:**
- [ ] No N+1 query problems
- [ ] Proper use of relations/joins
- [ ] Indexes on commonly queried fields
- [ ] No unnecessary database calls

**Frontend:**
- [ ] No unnecessary re-renders
- [ ] Images optimized (using next/image)
- [ ] Code splitting considered (if large bundle)
- [ ] Mobile performance considered

**API:**
- [ ] No excessive data returned
- [ ] Pagination for large datasets
- [ ] Caching considered where appropriate

### 6. Error Handling ✅

**Errors Caught:**
- [ ] Try-catch around risky operations
- [ ] Database errors handled
- [ ] Network errors handled
- [ ] Invalid input handled

**User Experience:**
- [ ] Meaningful error messages
- [ ] Error states shown in UI
- [ ] Loading states shown
- [ ] No silent failures

**Logging:**
- [ ] Important errors logged
- [ ] No sensitive data in logs
- [ ] Enough context to debug

### 7. Mobile-First ✅

**Responsive Design:**
- [ ] Looks good on mobile (< 640px)
- [ ] Looks good on tablet (640-1024px)
- [ ] Looks good on desktop (1024px+)
- [ ] Touch targets are 44px minimum
- [ ] Text is readable (16px minimum on inputs)

**Mobile Optimization:**
- [ ] No horizontal scroll
- [ ] Safe areas respected (notched devices)
- [ ] Performance on mobile acceptable
- [ ] Images lazy-loaded where appropriate

### 8. Accessibility ✅

**Basics:**
- [ ] Semantic HTML used
- [ ] Alt text on images
- [ ] Labels on form inputs
- [ ] Keyboard navigation works
- [ ] Focus states visible

**ARIA:**
- [ ] ARIA labels where needed
- [ ] ARIA roles appropriate
- [ ] Screen reader friendly

### 9. TypeScript ✅

**Type Safety:**
- [ ] No `any` types (use `unknown` if needed)
- [ ] Proper interfaces defined
- [ ] Return types explicit
- [ ] No TypeScript errors
- [ ] No TypeScript warnings

**Type Quality:**
- [ ] Types are accurate
- [ ] Types are reusable
- [ ] Enums used for fixed values
- [ ] Zod schemas for runtime validation

### 10. Dependencies ✅

**Package Management:**
- [ ] No unnecessary dependencies added
- [ ] Existing dependencies used where possible
- [ ] Dependencies are up to date
- [ ] No security vulnerabilities (`npm audit`)

**Imports:**
- [ ] Using absolute imports (@/...)
- [ ] No circular dependencies
- [ ] Proper tree-shaking (no `import *`)

## Review Process

### Step-by-Step Review

**1. Run the Checklist**

Go through entire checklist above for your changes.

**2. Test Manually**

```bash
# Start dev server
npm run dev

# Test the feature:
- [ ] Happy path works
- [ ] Error cases handled
- [ ] Mobile view works
- [ ] Different user roles tested
```

**3. Run Automated Tests**

```bash
# All tests
npm run test

# E2E tests (if applicable)
npm run test:e2e

# Type check
npm run type-check  # or tsc --noEmit

# Lint
npm run lint
```

**4. Check Documentation**

```bash
# Review checklist from @update-docs
- [ ] CLAUDE.md
- [ ] Design doc
- [ ] Implementation plan
- [ ] Skills
- [ ] .env.example
```

**5. Review Your Own Code**

```bash
# See your changes
git diff

# Review line by line:
- Is this the simplest solution?
- Is this secure?
- Is this tested?
- Will I understand this in 6 months?
```

**6. Check Integration**

```bash
# Does it work with:
- [ ] Existing features
- [ ] Other user roles
- [ ] Edge cases (empty state, max data, etc.)
- [ ] Error states
```

## Common Issues to Check

### Security Issues

```typescript
// ❌ Bad: No permission check
export const DELETE = async (req: Request) => {
  await deleteProduct(id);
}

// ✅ Good: Permission checked
export const DELETE = withErrorHandling(async (req: Request) => {
  const session = await getSession();
  await requirePermission(session.user.id, PERMISSIONS.PRODUCT_DELETE);
  await canAccessResource(session.user.id, 'product', id, 'delete');
  await deleteProduct(id);
});

// ❌ Bad: Hardcoded secret
const apiKey = 'sk_live_abc123';

// ✅ Good: Environment variable
const apiKey = process.env.STRIPE_SECRET_KEY;

// ❌ Bad: SQL injection risk (if using raw queries)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Good: Parameterized (TypeORM handles this)
const user = await userRepo.findOne({ where: { email } });
```

### Code Quality Issues

```typescript
// ❌ Bad: Magic number
if (daysAfterEvent > 7) { }

// ✅ Good: Named constant
const PURCHASE_WINDOW_DAYS = 7;
if (daysAfterEvent > PURCHASE_WINDOW_DAYS) { }

// ❌ Bad: Unclear variable name
const x = products.filter(p => p.stock < 50);

// ✅ Good: Descriptive name
const lowStockProducts = products.filter(p => p.stockQuantity < 50);

// ❌ Bad: Function does multiple things
function updateAndNotify(product) {
  updateDatabase(product);
  sendEmail(product);
  logChange(product);
}

// ✅ Good: Single responsibility
function updateProduct(product) {
  return updateDatabase(product);
}

// ❌ Bad: No type
function calculate(price, discount) {
  return price * (1 - discount);
}

// ✅ Good: Explicit types
function calculateDiscountedPrice(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100);
}
```

### Mobile-First Issues

```typescript
// ❌ Bad: Desktop-first
<div className="grid grid-cols-4">

// ✅ Good: Mobile-first
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">

// ❌ Bad: Fixed height breaks on mobile
<div className="h-[600px]">

// ✅ Good: Responsive height
<div className="h-auto min-h-[400px] lg:h-[600px]">

// ❌ Bad: Text too small on mobile
<p className="text-xs">

// ✅ Good: Readable on mobile
<p className="text-sm sm:text-base">
```

### Testing Issues

```typescript
// ❌ Bad: Testing implementation detail
it('should call setState', () => {
  const setState = vi.fn();
  render(<Component setState={setState} />);
  fireEvent.click(button);
  expect(setState).toHaveBeenCalled();
});

// ✅ Good: Testing behavior
it('should update count when button clicked', () => {
  render(<Counter />);
  fireEvent.click(screen.getByText('Increment'));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});

// ❌ Bad: Tests depend on each other
it('creates user', () => { userId = createUser(); });
it('updates user', () => { updateUser(userId); }); // Depends on previous

// ✅ Good: Independent tests
it('updates user', () => {
  const userId = createTestUser(); // Each test sets up its own data
  updateUser(userId);
});
```

## Review Examples

### Example 1: API Endpoint Review

**Code:**
```typescript
// app/api/products/export/route.ts
export const GET = withErrorHandling(async (req: Request) => {
  const session = await getSession();
  await requirePermission(session.user.id, PERMISSIONS.PRODUCT_EXPORT);

  const repository = await getRepository(Product);
  const products = await repository.find();

  const csv = generateCSV(products);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="products.csv"',
    },
  });
});
```

**Review Checklist:**
✅ Permission check present
✅ Error handling with wrapper
✅ TypeScript types used
✅ No hardcoded values
❓ Missing: Pagination for large datasets
❓ Missing: Filter by manufacturer if manufacturer role

**Improvements needed:**
```typescript
export const GET = withErrorHandling(async (req: Request) => {
  const session = await getSession();
  await requirePermission(session.user.id, PERMISSIONS.PRODUCT_EXPORT);

  const repository = await getRepository(Product);

  // Filter by manufacturer if not admin
  const where = session.user.role.name === 'admin'
    ? {}
    : { manufacturer: { id: session.user.manufacturer.id } };

  const products = await repository.find({ where });
  const csv = generateCSV(products);

  const filename = `products-${format(new Date(), 'yyyy-MM-dd')}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
});
```

### Example 2: Component Review

**Code:**
```typescript
export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white p-4 rounded">
      <img src={product.imageUrls[0]} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => addToCart(product)}>Buy</button>
    </div>
  );
}
```

**Review Checklist:**
❌ Missing: Mobile-first styling
❌ Missing: Image optimization (next/image)
❌ Missing: Alt text on image
❌ Missing: Loading states
❌ Missing: Error handling
❌ Missing: Accessibility (button text)
❌ Missing: Type definitions

**Improvements needed:**
```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/db/entities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await onAddToCart?.(product);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="relative aspect-square mb-4">
        <Image
          src={product.imageUrls[0]}
          alt={product.name}
          fill
          className="object-cover rounded"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <h3 className="text-base sm:text-lg font-bold mb-2">
        {product.name}
      </h3>

      <p className="text-lg sm:text-xl font-bold text-primary mb-4">
        ${product.price}
      </p>

      <Button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="w-full"
        aria-label={`Add ${product.name} to cart`}
      >
        {isLoading ? 'Adding...' : 'Buy Now'}
      </Button>
    </Card>
  );
}
```

## Quick Review Command

Create a review script:

```bash
#!/bin/bash
# scripts/review.sh

echo "🔍 Code Review Checklist"
echo ""

echo "1. Running tests..."
npm run test

echo ""
echo "2. Type checking..."
npx tsc --noEmit

echo ""
echo "3. Linting..."
npm run lint

echo ""
echo "4. Security audit..."
npm audit

echo ""
echo "5. Git diff review..."
git diff --stat

echo ""
echo "✅ Automated checks complete"
echo ""
echo "Manual review checklist:"
echo "- [ ] Security vulnerabilities addressed"
echo "- [ ] Mobile-first styling used"
echo "- [ ] Documentation updated"
echo "- [ ] Tests cover new code"
echo "- [ ] Error handling in place"
echo "- [ ] TypeScript strict mode satisfied"
```

Run before marking complete:
```bash
./scripts/review.sh
```

## Integration with Workflow

### Complete Development Cycle

```
1. Write failing test (TDD)
2. Implement code
3. Make test pass
4. Refactor
5. Update documentation
6. ← Self-review (THIS SKILL!)
7. Fix issues found
8. Final test run
9. Commit
10. Task complete ✅
```

## When to Ask for Help

If review reveals:
- Security concerns you're unsure about
- Performance issues you don't know how to fix
- Complex refactoring needed
- Architectural questions

**Don't just commit it - ask for guidance!**

---

**Remember:**
- Quality > Speed
- Review catches bugs before production
- Good code is reviewed code
- Future you will thank present you

**Reference:**
- `CLAUDE.md` - Code conventions
- `@tdd` - Testing practices
- `@update-docs` - Documentation workflow
- Design doc - Architecture patterns
