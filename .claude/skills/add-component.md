---
name: add-component
description: Create a new React component following mobile-first patterns
---

# Add Component Workflow

Use this skill when creating a new React component.

## Prerequisites

- Know if component needs to be Server or Client component
- Understand mobile-first responsive design
- Have Shadcn/ui components available

## Decision: Server vs Client Component

**Use Server Component (default) when:**
- No interactivity (no state, no event handlers)
- Fetching data from database
- Using environment variables (server-side only)
- No browser APIs needed

**Use Client Component when:**
- Using React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Third-party client libraries (Agora SDK)

## Workflow

### Step 1: Determine Component Location

```
components/
  ui/              # Shadcn/ui components (rarely add new)
  shared/          # Used across multiple user types
  customer/        # Customer-specific (product cards, event cards)
  manufacturer/    # Manufacturer-specific (product forms, event lists)
  admin/           # Admin-specific (approval forms, broadcast controls)
```

### Step 2: Create Server Component

Create `components/{folder}/{component-name}.tsx`:

```typescript
import { ComponentProps } from '@/types';

interface {ComponentName}Props {
  data: DataType;
  className?: string;
}

export function {ComponentName}({ data, className }: {ComponentName}Props) {
  return (
    <div className={className}>
      {/* Mobile-first markup */}
    </div>
  );
}
```

### Step 3: Create Client Component

Create `components/{folder}/{component-name}.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface {ComponentName}Props {
  initialData?: DataType;
  onAction?: (data: DataType) => void;
}

export function {ComponentName}({ initialData, onAction }: {ComponentName}Props) {
  const [state, setState] = useState(initialData);

  const handleAction = () => {
    // Handle interaction
    onAction?.(state);
  };

  return (
    <div className="
      flex flex-col gap-2          // Mobile: stacked
      sm:flex-row sm:gap-4         // Tablet: side-by-side
    ">
      <Button onClick={handleAction}>
        Action
      </Button>
    </div>
  );
}
```

### Step 4: Add Translations (if user-facing text)

Update `public/locales/en/{namespace}.json`:

```json
{
  "{component}": {
    "title": "Component Title",
    "action": "Action Button",
    "message": "Message text"
  }
}
```

Use in component:

```typescript
import { useTranslation } from 'next-i18next';

export function Component() {
  const { t } = useTranslation('{namespace}');

  return <h1>{t('{component}.title')}</h1>;
}
```

### Step 5: Style with Mobile-First Approach

**Always start with mobile, add breakpoints for larger screens:**

```typescript
<div className="
  p-4 sm:p-6 lg:p-8                    // Responsive spacing
  text-sm sm:text-base lg:text-lg      // Responsive text
  grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4  // Responsive grid
">
```

**Common patterns:**

```typescript
// Stacked on mobile, side-by-side on desktop
<div className="flex flex-col lg:flex-row gap-4">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Different widths
<div className="w-full sm:w-1/2 lg:w-1/3">

// Touch-friendly tap targets
<button className="min-h-[44px] min-w-[44px]">
```

### Step 6: Use Shadcn/ui Components

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function Component() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Input placeholder="Search..." />
        <Badge>New</Badge>
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

### Step 7: Add Loading & Error States

```typescript
export function Component({ data }: Props) {
  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="text-red-500 p-4">
        Error: {data.error}
      </div>
    );
  }

  return <div>{/* Normal content */}</div>;
}
```

### Step 8: Test Component

Create `__tests__/components/{component-name}.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { {ComponentName} } from '@/components/{folder}/{component-name}';

describe('{ComponentName}', () => {
  it('renders correctly', () => {
    render(<{ComponentName} data={mockData} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles interaction', async () => {
    const onAction = vi.fn();
    render(<{ComponentName} onAction={onAction} />);

    await userEvent.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalled();
  });
});
```

### Step 9: Commit

```bash
git add components/{folder}/{component-name}.tsx
git add public/locales/en/{namespace}.json  # if translations
git add __tests__/components/{component-name}.test.tsx  # if tests
git commit -m "feat: add {ComponentName} component

- Mobile-first responsive design
- {Server/Client} component
- Translations added
- Tests included

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Common Patterns

### Form Component

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { {Schema} } from '@/lib/validation/schemas';

export function {Form}({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver({Schema}),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register('field')} placeholder="Field" />
        {errors.field && (
          <span className="text-red-500 text-sm">
            {errors.field.message}
          </span>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Submit'}
      </Button>
    </form>
  );
}
```

### Data Fetching (Server Component)

```typescript
import { getRepository } from '@/lib/db';
import { Product } from '@/lib/db/entities';

export async function ProductList() {
  const repository = await getRepository(Product);
  const products = await repository.find();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Modal/Dialog

```typescript
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function {Modal}({ open, onClose, children }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

### Responsive Image

```typescript
import Image from 'next/image';

export function ProductImage({ src, alt }: Props) {
  return (
    <div className="relative aspect-square">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-lg"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}
```

### Permission-Gated Content

```typescript
'use client';

import { usePermissions } from '@/hooks/usePermissions';

export function AdminActions() {
  const { can } = usePermissions();

  if (!can.createEvent()) {
    return null;
  }

  return (
    <Button>Create Event</Button>
  );
}
```

## Styling Guidelines

### Mobile-First Breakpoints

```typescript
// Mobile (default): < 640px
className="text-sm p-4"

// Tablet: 640px - 1024px
className="sm:text-base sm:p-6"

// Desktop: 1024px+
className="lg:text-lg lg:p-8"
```

### Common Responsive Patterns

```typescript
// Stacked on mobile, grid on desktop
<div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3">

// Full width on mobile, auto on desktop
<div className="w-full lg:w-auto">

// Hidden on mobile
<div className="hidden sm:block">

// Shown only on mobile
<div className="block sm:hidden">
```

### Spacing Scale

```
p-2  = 0.5rem (8px)    // Tight spacing
p-4  = 1rem (16px)     // Default
p-6  = 1.5rem (24px)   // Medium
p-8  = 2rem (32px)     // Large
p-12 = 3rem (48px)     // Extra large
```

## Troubleshooting

**Component Not Rendering:**
- Check if it's in the right folder
- Verify imports are correct
- Check for TypeScript errors

**Hooks Error:**
- Add `'use client'` if using hooks
- Verify hook is imported correctly

**Styling Not Working:**
- Check Tailwind class names
- Verify breakpoint prefixes (sm:, lg:)
- Check for conflicting classes

## Reference

- [Next.js Components](https://nextjs.org/docs/app/building-your-application/rendering)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- Project: `CLAUDE.md` - Component patterns section
