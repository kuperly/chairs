---
name: add-api-route
description: Create a new API route with proper error handling, permissions, and validation
---

# Add API Route Workflow

Use this skill when creating a new API endpoint.

## Prerequisites

- Know the resource and endpoint path
- Understand required permissions
- Have validation schema ready (if POST/PUT)

## Workflow

### Step 1: Create Route File

Create `app/api/{resource}/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/utils/api-wrapper';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { getSession } from '@/lib/auth/session';
import { getRepository } from '@/lib/db';
import { {Entity} } from '@/lib/db/entities';
import { {EntitySchema} } from '@/lib/validation/schemas';

// GET - List/read resources
export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await getSession();
  await requirePermission(session.user.id, PERMISSIONS.{RESOURCE}_READ);

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter');

  const repository = await getRepository({Entity});
  const items = await repository.find({
    where: filter ? { /* filter conditions */ } : {},
    relations: ['relatedEntity'], // if needed
  });

  return NextResponse.json({ items });
});

// POST - Create resource
export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await getSession();
  await requirePermission(session.user.id, PERMISSIONS.{RESOURCE}_CREATE);

  const body = await req.json();

  // Validate input
  const validationResult = {EntitySchema}.safeParse(body);
  if (!validationResult.success) {
    throw new ApiError(
      400,
      'Validation failed',
      ErrorCodes.VALIDATION_ERROR,
      validationResult.error.errors
    );
  }

  const data = validationResult.data;

  const repository = await getRepository({Entity});
  const item = await repository.save({
    ...data,
    // Add relations if needed
  });

  return NextResponse.json({ item }, { status: 201 });
});
```

### Step 2: Create Dynamic Route (if needed)

For routes like `/api/products/[id]`, create `app/api/{resource}/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/utils/api-wrapper';
import { requirePermission, canAccessResource } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { getSession } from '@/lib/auth/session';
import { getRepository } from '@/lib/db';
import { {Entity} } from '@/lib/db/entities';
import { ApiError, ErrorCodes } from '@/lib/utils/api-errors';

interface RouteContext {
  params: { id: string };
}

// GET - Get single resource
export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: RouteContext
) => {
  const session = await getSession();
  await requirePermission(session.user.id, PERMISSIONS.{RESOURCE}_READ);

  const repository = await getRepository({Entity});
  const item = await repository.findOne({
    where: { id: params.id },
    relations: ['relatedEntity'],
  });

  if (!item) {
    throw new ApiError(404, 'Resource not found', ErrorCodes.NOT_FOUND);
  }

  // Check resource ownership if needed
  const canAccess = await canAccessResource(
    session.user.id,
    '{resource}',
    params.id,
    'read'
  );

  if (!canAccess) {
    throw new ApiError(403, 'Access denied', ErrorCodes.FORBIDDEN);
  }

  return NextResponse.json({ item });
});

// PUT - Update resource
export const PUT = withErrorHandling(async (
  req: NextRequest,
  { params }: RouteContext
) => {
  const session = await getSession();
  await requirePermission(session.user.id, PERMISSIONS.{RESOURCE}_UPDATE);

  const body = await req.json();

  // Validate
  const validationResult = {EntitySchema}.safeParse(body);
  if (!validationResult.success) {
    throw new ApiError(
      400,
      'Validation failed',
      ErrorCodes.VALIDATION_ERROR,
      validationResult.error.errors
    );
  }

  const repository = await getRepository({Entity});
  const item = await repository.findOne({ where: { id: params.id } });

  if (!item) {
    throw new ApiError(404, 'Resource not found', ErrorCodes.NOT_FOUND);
  }

  // Check ownership
  const canAccess = await canAccessResource(
    session.user.id,
    '{resource}',
    params.id,
    'update'
  );

  if (!canAccess) {
    throw new ApiError(403, 'Access denied', ErrorCodes.FORBIDDEN);
  }

  const updated = await repository.save({
    ...item,
    ...validationResult.data,
  });

  return NextResponse.json({ item: updated });
});

// DELETE - Delete resource
export const DELETE = withErrorHandling(async (
  req: NextRequest,
  { params }: RouteContext
) => {
  const session = await getSession();
  await requirePermission(session.user.id, PERMISSIONS.{RESOURCE}_DELETE);

  const repository = await getRepository({Entity});
  const item = await repository.findOne({ where: { id: params.id } });

  if (!item) {
    throw new ApiError(404, 'Resource not found', ErrorCodes.NOT_FOUND);
  }

  const canAccess = await canAccessResource(
    session.user.id,
    '{resource}',
    params.id,
    'delete'
  );

  if (!canAccess) {
    throw new ApiError(403, 'Access denied', ErrorCodes.FORBIDDEN);
  }

  await repository.remove(item);

  return NextResponse.json({ success: true });
});
```

### Step 3: Add Validation Schema

If creating/updating resources, add schema to `lib/validation/schemas.ts`:

```typescript
import { z } from 'zod';

export const {EntitySchema} = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  // Add more fields with validation
});

export type {Entity}Input = z.infer<typeof {EntitySchema}>;
```

### Step 4: Test API Route

Create test in `__tests__/api/{resource}.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';

describe('{Resource} API', () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getAuthToken('admin@test.com');
  });

  it('should list {resources}', async () => {
    const response = await fetch('http://localhost:3000/api/{resources}', {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.items)).toBe(true);
  });

  it('should create {resource}', async () => {
    const response = await fetch('http://localhost:3000/api/{resources}', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test {Resource}',
        description: 'Test description',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.item.name).toBe('Test {Resource}');
  });

  it('should prevent unauthorized access', async () => {
    const response = await fetch('http://localhost:3000/api/{resources}');
    expect(response.status).toBe(401);
  });
});
```

### Step 5: Test Manually

```bash
# Start dev server
npm run dev

# Test GET
curl http://localhost:3000/api/{resources}

# Test POST
curl -X POST http://localhost:3000/api/{resources} \
  -H "Content-Type: application/json" \
  -d '{"name":"test","description":"test description"}'
```

### Step 6: Commit

```bash
git add app/api/{resource}/route.ts
git add app/api/{resource}/[id]/route.ts  # if dynamic
git add lib/validation/schemas.ts          # if validation added
git add __tests__/api/{resource}.test.ts   # if tests added
git commit -m "feat: add {resource} API routes

- GET, POST for collection
- GET, PUT, DELETE for single resource
- Permission checks and validation
- Tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Common Patterns

### Pagination

```typescript
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '20');
const skip = (page - 1) * limit;

const [items, total] = await repository.findAndCount({
  skip,
  take: limit,
});

return NextResponse.json({
  items,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
```

### Search/Filter

```typescript
const search = searchParams.get('search');
const category = searchParams.get('category');

const queryBuilder = repository.createQueryBuilder('item');

if (search) {
  queryBuilder.andWhere('item.name ILIKE :search', {
    search: `%${search}%`,
  });
}

if (category) {
  queryBuilder.andWhere('item.category = :category', { category });
}

const items = await queryBuilder.getMany();
```

### File Upload

```typescript
export const POST = withErrorHandling(async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    throw new ApiError(400, 'No file provided', ErrorCodes.VALIDATION_ERROR);
  }

  // Process file (e.g., upload to Cloudinary)
  const url = await uploadFile(file);

  return NextResponse.json({ url });
});
```

## Troubleshooting

**CORS Issues:**
- Add headers in `next.config.js` if needed
- For local testing, use same origin

**Session Not Found:**
- Verify Supabase auth is configured
- Check middleware is running
- Verify cookies are being sent

**Validation Fails:**
- Check Zod schema matches request body
- Verify field names match
- Check data types

## Reference

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Documentation](https://zod.dev/)
- Project: `CLAUDE.md` - Permission system section
