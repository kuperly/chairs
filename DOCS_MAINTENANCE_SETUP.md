# Documentation Maintenance Setup ✅

Documentation maintenance has been integrated as a mandatory step in the development workflow.

## What's Been Added

### 📚 CLAUDE.md - Documentation Maintenance Section

A comprehensive section added covering:
- What counts as "done"
- Documents to check after changes
- Documentation update workflow
- Review checklist
- Commit message template
- Common mistakes and best practices

### 🎯 @update-docs Skill

Created `.claude/skills/update-docs.md` with:
- Quick decision tree for what to update
- Detailed documentation checklist
- Real-world examples for common scenarios
- Integration with TDD workflow
- Commit message templates

### ♻️ Updated TDD Workflow

The TDD cycle now includes documentation:

```
🔴 RED → Write failing test
🟢 GREEN → Write minimal code
♻️ REFACTOR → Improve quality
📚 DOCUMENT → Update docs  ← NEW!
✅ COMPLETE
```

## The Documentation Rule

```
A task is NOT complete until documentation is updated.
```

### Definition of Done

✅ Code written and tested
✅ Tests pass
✅ Code committed
✅ **Documentation updated** ← MANDATORY
✅ Documentation committed

## What Triggers Documentation Updates

### Always Update Docs When:

1. **Architecture/Pattern Changes**
   - New patterns → CLAUDE.md
   - Architecture decisions → Design doc

2. **Database Changes**
   - New entities → Design doc + CLAUDE.md
   - Schema changes → Design doc
   - Migrations → Implementation plan

3. **API Changes**
   - New endpoints → Design doc + CLAUDE.md
   - Changed routes → Design doc

4. **Business Logic Changes**
   - Logic changes → Design doc
   - Purchase windows → Design doc + CLAUDE.md

5. **Configuration Changes**
   - Environment variables → CLAUDE.md + .env.example
   - New dependencies → README.md

6. **Workflow Changes**
   - New workflows → Create/update skill
   - Common problems → CLAUDE.md troubleshooting

## Documentation Checklist

Use before marking ANY task complete:

```markdown
- [ ] Architecture change? → CLAUDE.md
- [ ] New pattern? → CLAUDE.md
- [ ] Database change? → Design doc
- [ ] API endpoint? → Design doc + CLAUDE.md
- [ ] Business logic? → Design doc
- [ ] New dependency? → README.md
- [ ] Environment variable? → CLAUDE.md + .env.example
- [ ] New workflow? → Create/update skill
- [ ] Task complete? → Implementation plan
- [ ] Problem solved? → CLAUDE.md troubleshooting
```

## Commit Message Template

```bash
git commit -m "feat: add product SKU field

Code changes:
- Added SKU field to Product entity
- Added unique constraint
- Created migration

Tests:
- SKU uniqueness test
- SKU format validation test

Docs updated:
✓ CLAUDE.md - Entity description
✓ Design doc - Schema with SKU
✓ Implementation plan - Task marked complete

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Examples

### Example 1: Adding New Permission

**Code:**
```typescript
PRODUCT_EXPORT: 'product.export'
```

**Docs to update:**
1. CLAUDE.md - Permission list
2. Design doc - Permission definitions
3. Implementation plan - Mark task complete

### Example 2: Changing Business Logic

**Code:**
```typescript
// Changed from 5 to 7 days
purchaseEnd.setDate(purchaseEnd.getDate() + 7);
```

**Docs to update:**
1. CLAUDE.md - Business logic section
2. Design doc - Purchase windows
3. Test comments

### Example 3: Adding Environment Variable

**Code:**
```typescript
const apiKey = process.env.SENDGRID_API_KEY;
```

**Docs to update:**
1. CLAUDE.md - Environment variables
2. .env.example - Add placeholder
3. README.md - Setup instructions

## How to Use

### Option 1: Reference the Skill

```
@update-docs
I just added a new API endpoint for product export.
What documentation needs updating?
```

### Option 2: Follow the Checklist

After every code change:
1. Review documentation checklist
2. Update relevant documents
3. Commit documentation changes
4. Mark task complete

## Integration with Development Flow

### Standard Workflow:

```
1. Write failing test (TDD)
2. Implement code
3. Make test pass
4. Refactor
5. ← Documentation update (NEW!)
6. Commit docs
7. Task complete ✅
```

### Every Commit Should Consider:

- What changed?
- What docs describe this?
- Are those docs still accurate?
- What needs updating?

## Tools to Help

### Pre-commit Checklist

Before every commit, ask:
```
What documentation might this affect?
```

### Documentation Review

Weekly:
- Review CLAUDE.md against recent changes
- Check design doc matches architecture
- Verify .env.example has all variables

After major features:
- Full documentation review
- Update all affected sections

## Common Scenarios

### Scenario 1: "Quick Fix"

❌ Wrong:
```
git commit -m "fix: typo"
# Skip docs because it's just a typo
```

✅ Right:
```
git commit -m "fix: correct product price calculation

Fixed rounding error in price calculation.

Docs: No doc updates needed (internal calc only)"
```

### Scenario 2: "I'll Document Later"

❌ Wrong:
```
# TODO: Update docs later
git commit -m "feat: add export"
```

✅ Right:
```
git commit -m "feat: add export"
git commit -m "docs: update CLAUDE.md and design doc for export"
# Both in same session
```

### Scenario 3: Found Outdated Docs

✅ Do immediately:
```
git commit -m "docs: fix outdated permission list

CLAUDE.md had old permission names.
Updated to match current code."
```

## Skills Reference

- `@update-docs` - Documentation maintenance workflow
- `@tdd` - Includes documentation step
- `@add-entity` - Reminds about doc updates
- `@add-api-route` - Reminds about doc updates
- `@add-component` - Reminds about doc updates

## Verification

Before starting implementation, verify:

- [x] Documentation maintenance section in CLAUDE.md
- [x] @update-docs skill created
- [x] TDD workflow includes documentation
- [x] All skills reference documentation
- [x] Checklist template created
- [x] Commit message template created
- [x] Examples provided

---

**Status:** Documentation maintenance fully integrated
**Remember:** No task is complete without updated documentation! 📚
