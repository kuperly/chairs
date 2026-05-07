---
name: add-entity
description: Add a new database entity with TypeORM and generate migration
---

# Add Database Entity Workflow

Use this skill when adding a new database entity to the project.

## Prerequisites

- TypeORM is configured
- Database connection is working
- Know the entity relationships

## Workflow

### Step 1: Create Entity File

Create `lib/db/entities/{EntityName}.ts`:

```typescript
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
// Import related entities

@Entity('{table_name}')
export class {EntityName} extends BaseEntity {
  @Column()
  propertyName: string;

  @Column({ nullable: true })
  optionalProperty: string | null;

  @ManyToOne(() => RelatedEntity, relatedEntity => relatedEntity.thisEntity)
  relatedEntity: RelatedEntity;

  // Add more columns and relations
}
```

**Key Points:**
- Always extend `BaseEntity` (provides id, createdAt, updatedAt)
- Use `| null` for nullable, not `?`
- Define relationships with decorators
- Use proper TypeORM column types

### Step 2: Export from Index

Add to `lib/db/entities/index.ts`:

```typescript
export { {EntityName} } from './{EntityName}';
```

### Step 3: Generate Migration

```bash
npm run migration:generate lib/db/migrations/{EntityName}
```

This creates a migration file based on entity changes.

### Step 4: Review Migration

Open the generated file in `lib/db/migrations/` and verify:
- Table name is correct
- Columns are correct types
- Foreign keys are set up
- Indexes are added where needed

### Step 5: Run Migration

```bash
npm run migration:run
```

Verify it runs without errors.

### Step 6: Test in Database

```bash
psql $DATABASE_URL -c "\d {table_name}"
```

Verify table structure matches expectations.

### Step 7: Update Seed Script (if needed)

If test data is needed, update `scripts/seed.ts`:

```typescript
async function create{EntityName}s() {
  const repo = dataSource.getRepository({EntityName});

  await repo.save({
    propertyName: 'test value',
    // ... more test data
  });

  console.log('✓ Created {EntityName}s');
}
```

### Step 8: Commit

```bash
git add lib/db/entities/{EntityName}.ts
git add lib/db/entities/index.ts
git add lib/db/migrations/*{EntityName}*.ts
git commit -m "feat: add {EntityName} entity

- Entity definition with relations
- Database migration
- Updated entity index

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Common Patterns

### One-to-Many Relationship

```typescript
// Parent
@OneToMany(() => Child, child => child.parent)
children: Child[];

// Child
@ManyToOne(() => Parent, parent => parent.children)
parent: Parent;
```

### Many-to-Many Relationship

```typescript
// Entity A
@ManyToMany(() => EntityB)
@JoinTable({
  name: 'entity_a_entity_b',
  joinColumn: { name: 'entityAId', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'entityBId', referencedColumnName: 'id' },
})
entityBs: EntityB[];

// Entity B
@ManyToMany(() => EntityA, entityA => entityA.entityBs)
entityAs: EntityA[];
```

### Enum Column

```typescript
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Column({
  type: 'enum',
  enum: Status,
  default: Status.ACTIVE,
})
status: Status;
```

### JSON Column

```typescript
@Column({ type: 'jsonb', nullable: true })
metadata: any; // Or define proper type
```

## Troubleshooting

**Migration Generation Fails:**
- Ensure all imports are correct
- Check TypeORM decorators syntax
- Verify database connection

**Migration Run Fails:**
- Check for circular dependencies
- Verify foreign key references exist
- Check column type compatibility

**Entity Not Found:**
- Verify export in `index.ts`
- Check file path in data-source.ts
- Restart dev server

## Reference

- [TypeORM Entity Documentation](https://typeorm.io/entities)
- [TypeORM Relations](https://typeorm.io/relations)
- [TypeORM Migrations](https://typeorm.io/migrations)
