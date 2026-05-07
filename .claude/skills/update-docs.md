---
name: update-docs
description: Update documentation after code changes - ensures docs stay in sync with code
---

# Documentation Update Workflow

**CRITICAL:** Documentation must be updated with EVERY code change.

## The Rule

```
Code without updated docs = Incomplete work
```

A task is NOT done until documentation is updated.

## Definition of Done

✅ Code written and tested
✅ Tests pass
✅ Code committed
✅ **Documentation updated** ← MANDATORY
✅ Documentation committed

## Quick Decision Tree

```
Made a code change?
  ↓
Does it affect:
  → Architecture/patterns? → Update CLAUDE.md
  → Database schema? → Update design doc
  → API endpoints? → Update design doc + CLAUDE.md
  → Business logic? → Update design doc
  → Environment config? → Update CLAUDE.md + .env.example
  → Workflow? → Update/create skill
  → Implementation progress? → Update implementation plan
  ↓
Update relevant docs
  ↓
Commit documentation
  ↓
NOW task is complete ✅
```

## Documents to Maintain

### 1. CLAUDE.md

**Update when:**
- Adding new architecture patterns
- Adding new utilities or helpers
- Changing code conventions
- Adding environment variables
- Changing deployment process
- Adding common workflows

**Sections to check:**
- Architecture Decisions
- Code Conventions
- Environment Setup
- Common Tasks
- Troubleshooting

**Example changes:**

```markdown
<!-- New permission added -->
### Permission Checking

**Available Permissions:**
- `product.export` - Export products to CSV (NEW)

<!-- New utility added -->
### Common Utilities

**Date formatting:**
```typescript
import { formatDate } from '@/lib/utils/formatters';
formatDate(new Date()); // "Apr 29, 2026"
```

<!-- New environment variable -->
### Required Environment Variables

```bash
# Email (NEW)
SENDGRID_API_KEY=xxx
```

### 2. Design Document (`docs/plans/*-design.md`)

**Update when:**
- Changing database schema
- Adding/modifying API endpoints
- Changing business logic
- Modifying system architecture
- Changing third-party integrations

**Sections to check:**
- Database Schema
- API Endpoints
- Business Logic
- System Architecture
- User Flows

**Example changes:**

```markdown
<!-- Added field to entity -->
#### Product Entity

@Column({ nullable: true })
sku: string | null;  // NEW: Stock keeping unit for inventory

<!-- Added API endpoint -->
### API Endpoints

**GET /api/products/export** (NEW)
- Permission: `product.export`
- Returns: CSV file of products
- Query params: `format` (csv|json)

<!-- Changed business logic -->
### Purchase Window Logic

Purchase window = event broadcast + 7 days (CHANGED from 5 days)
```

### 3. Implementation Plan (`docs/plans/*-implementation-plan.md`)

**Update when:**
- Completing tasks
- Discovering new tasks
- Changing approach
- Finding blockers

**What to update:**
- Mark tasks complete: `- [x] Task 2.6: Add SKU field`
- Add discovered tasks
- Document blockers or changes

**Example changes:**

```markdown
### Task 2.6: Create Product Entity

**Status:** ✅ COMPLETE

**Changes from plan:**
- Added SKU field (not in original spec)
- Used VARCHAR(50) instead of UUID for SKU
- Added unique constraint on SKU

**Commit:** abc123f

<!-- Add new task discovered -->
### Task 2.7: Add SKU Validation (NEW)

**Discovered during:** Task 2.6

**Description:** Need to validate SKU format and uniqueness
```

### 4. Skills (`.claude/skills/*.md`)

**Update when:**
- Workflow changes
- New patterns emerge
- Common problems solved
- Adding new best practices

**Create new skill when:**
- New repeated workflow identified
- Complex process needs documentation

**Example changes:**

```markdown
<!-- Update existing skill -->
### Step 3: Create Entity File

<!-- NEW: Mention SKU field -->
Create `lib/db/entities/{EntityName}.ts`:

```typescript
@Column({ nullable: true, unique: true })
sku: string | null;  // Stock keeping unit
```

<!-- Create new skill -->
---
name: add-sku
description: Add SKU field to product entities with validation
---
```

### 5. README.md (when exists)

**Update when:**
- Setup process changes
- New dependencies added
- Development workflow changes
- Deployment process changes

### 6. .env.example

**Update when:**
- Adding new environment variables
- Changing existing variables
- New service integrations

**Always:**
- Use placeholder values
- Add comments explaining each variable

```bash
# Email Service (NEW)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Agora (UPDATED - new certificate required)
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate  # Required for RTC
```

## Documentation Update Workflow

### Standard Process

```
1. Make code change
   ↓
2. Write/update tests
   ↓
3. Run tests (verify pass)
   ↓
4. Commit code + tests
   ↓
5. STOP! Documentation check ⚠️
   ↓
6. Review checklist below
   ↓
7. Update relevant docs
   ↓
8. Commit documentation
   ↓
9. Task complete ✅
```

### Documentation Checklist

Use this before marking ANY task complete:

```markdown
## Documentation Review

- [ ] Architecture change? → CLAUDE.md architecture section
- [ ] New pattern/convention? → CLAUDE.md conventions section
- [ ] Database change? → Design doc schema section
- [ ] API endpoint? → Design doc + CLAUDE.md
- [ ] Business logic? → Design doc business logic section
- [ ] New dependency? → README.md setup section
- [ ] Environment variable? → CLAUDE.md + .env.example
- [ ] New workflow? → Create/update skill
- [ ] Task complete? → Implementation plan
- [ ] Common problem solved? → CLAUDE.md troubleshooting
```

## Commit Message Template

Include documentation updates in commit message:

```bash
git commit -m "feat: add product SKU field

Code changes:
- Added SKU field to Product entity
- Added unique constraint
- Created migration

Tests:
- Added SKU uniqueness test
- Added SKU format validation test

Docs updated:
✓ CLAUDE.md - Entity description updated
✓ Design doc - Schema updated with SKU field
✓ Implementation plan - Task 2.6 marked complete

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Real-World Examples

### Example 1: Adding Export Feature

**Code changes:**
- Added `PRODUCT_EXPORT` permission
- Created `/api/products/export` endpoint
- Added CSV generation utility

**Documentation updates:**

1. **CLAUDE.md:**
```markdown
### Permission System

**Available Permissions:**
- `product.export` - Export product catalog to CSV

### API Routes

**Export Products:** GET `/api/products/export`
```

2. **Design Document:**
```markdown
### API Endpoints

**GET /api/products/export**
- Permission: `product.export`
- Query params:
  - `format`: csv | json (default: csv)
- Returns: File download
```

3. **Implementation Plan:**
```markdown
- [x] Task 4.8: Add product export endpoint
  - Status: Complete
  - Commit: abc123f
```

**Commits:**
```bash
git commit -m "feat: add product export functionality"
git commit -m "docs: update CLAUDE.md and design doc for export feature"
```

### Example 2: Changing Purchase Window

**Code changes:**
- Changed purchase window from 5 days to 7 days

**Documentation updates:**

1. **CLAUDE.md:**
```markdown
### Business Logic

**Purchase Windows:**
- Products purchasable during live + 7 days after (changed from 5)
```

2. **Design Document:**
```markdown
### Product Visibility Windows

**After Event (7 days):** (changed from 5 days)
- Full visibility, can purchase
- "Last chance" messaging
```

3. **Test files (comments):**
```typescript
// Purchase window is 7 days (changed from 5)
const purchaseEnd = new Date(eventEnd);
purchaseEnd.setDate(purchaseEnd.getDate() + 7);
```

**Commits:**
```bash
git commit -m "feat: extend purchase window to 7 days

Changed from 5 to 7 days to allow more time for orders.

Docs updated:
✓ CLAUDE.md - Business logic section
✓ Design doc - Purchase window section
✓ Test comments updated"
```

### Example 3: Adding New Entity Field

**Code changes:**
- Added `manufacturer.website` field

**Documentation updates:**

1. **Design Document:**
```markdown
#### Manufacturer Entity

@Column({ nullable: true })
website: string | null;  // Company website URL
```

2. **CLAUDE.md:**
```markdown
### Core Entities

- `Manufacturer` - Company info, approval status, website
```

3. **Skills (add-entity.md):**
```markdown
### Common Column Types

**URL fields:**
```typescript
@Column({ nullable: true })
website: string | null;
```

4. **Implementation Plan:**
```markdown
- [x] Task 2.5: Add website field to Manufacturer
```

**Commits:**
```bash
git commit -m "feat: add website field to Manufacturer entity"
git commit -m "docs: update entity documentation with website field"
```

## When Documentation is Out of Sync

### If you notice docs don't match code:

**Immediate actions:**

1. **Stop development**
2. **Create documentation fix commit:**
```bash
git commit -m "docs: fix outdated permission list

CLAUDE.md listed product.edit.all but code has product.update.all.
Updated docs to match actual permission names."
```
3. **Continue development**

### Regular Documentation Audits

**Weekly:**
- Review CLAUDE.md against recent changes
- Check design doc matches current architecture
- Verify .env.example has all variables

**After major features:**
- Full documentation review
- Update all affected sections
- Check for orphaned sections

## Common Mistakes

### ❌ DON'T:

**Skip docs "temporarily"**
```
"I'll update docs later"
→ You won't. Update now.
```

**Document in code comments only**
```
// Changed to 7 days instead of 5
→ Also update CLAUDE.md and design doc!
```

**Update one doc but not others**
```
Updated design doc but not CLAUDE.md
→ Now they contradict each other
```

**Make docs vague**
```
"Added some new permissions"
→ List exactly which permissions
```

### ✅ DO:

**Update docs with code**
```
Same PR/commit session
```

**Be specific**
```
"Added PRODUCT_EXPORT permission to admin and manufacturer_owner roles"
```

**Update all affected docs**
```
CLAUDE.md, design doc, AND skills
```

**Use examples**
```
Show code examples, not just descriptions
```

## Tools to Help

### Pre-commit Checklist

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Changes

- [ ] Code changes described
- [ ] Tests added/updated
- [ ] Documentation updated

## Documentation Updates

- [ ] CLAUDE.md (if needed)
- [ ] Design doc (if needed)
- [ ] Implementation plan (if needed)
- [ ] Skills (if needed)
- [ ] .env.example (if needed)
- [ ] README.md (if needed)

If any docs not updated, explain why:
```

### Documentation Review Script

```bash
#!/bin/bash
# scripts/check-docs.sh

echo "📚 Documentation Review Checklist"
echo ""
echo "Recent code changes:"
git diff HEAD~1 --name-only

echo ""
echo "Check if these docs need updates:"
echo "- [ ] CLAUDE.md"
echo "- [ ] docs/plans/*-design.md"
echo "- [ ] docs/plans/*-implementation-plan.md"
echo "- [ ] .claude/skills/*.md"
echo "- [ ] .env.example"
echo "- [ ] README.md"
```

## Integration with TDD

Documentation is part of the TDD cycle:

```
🔴 RED
  ↓ Write failing test

🟢 GREEN
  ↓ Write minimal code

♻️ REFACTOR
  ↓ Improve code quality

📚 DOCUMENT
  ↓ Update relevant docs
  ↓ Commit documentation
  ↓ NOW complete ✅
```

## Summary

**Remember:**
- Documentation is NOT optional
- Update docs WITH code, not after
- A task without updated docs is NOT complete
- Good docs = future you saying "thank you"

**Quick wins:**
- Use commit message template
- Review checklist before marking task done
- Update docs in same session as code
- Be specific in documentation

---

**Reference:**
- `CLAUDE.md` - Documentation maintenance section
- Design doc template
- Implementation plan template
