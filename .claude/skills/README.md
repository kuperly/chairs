# Project Skills

Custom workflows and patterns specific to this e-commerce live platform.

## Available Skills

### `@tdd` ⭐
**CORE SKILL** - Test-Driven Development workflow with Red-Green-Refactor cycle.

**Use when:** Starting ANY feature development

**Includes:**
- Complete TDD methodology
- Unit test examples (Vitest)
- API test examples
- Component test examples
- E2E test examples (Playwright)
- Test utilities and helpers

**Example:**
```
@tdd
I need to implement product visibility logic with TDD
```

### `@update-docs` ⭐
**CORE SKILL** - Documentation maintenance workflow - keeps docs in sync with code.

**Use when:** After EVERY code change (mandatory)

**Includes:**
- Documentation update checklist
- What to update and when
- Commit message templates
- Real-world examples
- Common mistakes to avoid

**Example:**
```
@update-docs
I just added a new API endpoint, what docs need updating?
```

### `@code-review` ⭐
**CORE SKILL** - Comprehensive code review checklist - review before marking complete.

**Use when:** Before marking ANY task complete (mandatory)

**Includes:**
- 10-point review checklist (quality, security, testing, docs, performance, errors, mobile, accessibility, TypeScript, dependencies)
- Common issues and fixes
- Review examples
- Integration with workflow

**Example:**
```
@code-review
I've finished implementing product export. Review my code before I commit.
```

### `@add-entity`
Add a new database entity with TypeORM and generate migration.

**Use when:** Creating new database tables or models

**Note:** Follow TDD - write entity tests first!

**Example:**
```
@add-entity
I need to add a ProductReview entity with rating and comment fields
```

### `@add-api-route`
Create a new API route with proper error handling, permissions, and validation.

**Use when:** Adding new REST endpoints

**Note:** Follow TDD - write API tests first!

**Example:**
```
@add-api-route
I need to create an API route for managing product categories
```

### `@add-component`
Create a new React component following mobile-first patterns.

**Use when:** Building UI components

**Note:** Follow TDD - write component tests first!

**Example:**
```
@add-component
I need a ProductReviewCard component for displaying customer reviews
```

## How to Use Skills

In Claude Code or any Claude session in this project:

1. Reference the skill with `@skill-name`
2. Describe what you need
3. The skill guides you through the correct workflow

## Skill Principles

All skills in this project follow these principles:

1. **Mobile-First:** Always start with mobile layout
2. **Permission-Based:** Always check permissions
3. **Type-Safe:** Use TypeScript strictly
4. **Validated:** Use Zod for all inputs
5. **Tested:** Include tests where appropriate
6. **Documented:** Add inline comments for complex logic

## Adding New Skills

Create a new `.md` file in this directory:

```markdown
---
name: skill-name
description: Brief description
---

# Skill Title

Detailed workflow and patterns...
```

Then update this README with the new skill.

## Related Documentation

- `CLAUDE.md` - Project context for Claude
- `docs/plans/2026-04-29-ecommerce-live-platform-design.md` - Design document
- `docs/plans/2026-04-29-implementation-plan.md` - Implementation plan

## Support

If a skill doesn't cover your use case:
1. Check `CLAUDE.md` for general patterns
2. Check the design doc for architectural decisions
3. Ask for guidance - new patterns can become skills
