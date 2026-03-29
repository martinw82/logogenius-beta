# Coding Conventions

**Analysis Date:** 2026-03-28

## Naming Patterns

**Files:**
- kebab-case for all files: `order-processor.ts`, `logo-prompt-builder.ts`, `use-client-mockup-generator.ts`
- PascalCase for React components: `LogoForm.tsx`, `AdminOrderForm.tsx`, `BrandArchetypeQuiz.tsx`
- `page.tsx` for Next.js pages, `layout.tsx` for layouts, `route.ts` for API routes
- `use` prefix for hooks: `useClientMockupGenerator.ts`, `useClientSocialGenerator.ts`
- `*.test.ts` for test files

**Functions:**
- camelCase for all functions and exports
- Async functions: no special prefix, just `async function` or `async () =>`
- No consistent handler naming pattern observed (mixed: `handleClick`, `onSubmit`, direct implementations)

**Variables:**
- camelCase for variables and constants
- UPPER_SNAKE_CASE not consistently used for constants (environment vars use UPPER_SNAKE_CASE)
- No underscore prefix for private members

**Types:**
- PascalCase for interfaces and types (no I prefix): `Order`, `LogoVariant`, `OrderDetail`
- Types defined in `src/lib/types/` and `src/types/`
- Zod schemas in `src/lib/schemas/` use camelCase naming

## Code Style

**Formatting:**
- No `.prettierrc` or `.eslintrc` detected
- `next lint` script available (default Next.js ESLint config)
- Indentation: 2 spaces (standard Next.js)
- Quotes: Mixed (single and double quotes both used)
- Semicolons: Used

**Linting:**
- ESLint via `next lint` (default Next.js config)
- TypeScript strict mode enabled in `tsconfig.json`

## Import Organization

**Order (observed):**
1. External packages (`react`, `next`, `@radix-ui/*`)
2. Internal modules via `@/` alias (`@/lib/services/...`, `@/components/...`)
3. Relative imports (`./utils`, `../types`)

**Path Aliases:**
- `@/` maps to `src/` (via `tsconfig.json`)
- `@/lib/*` maps to `src/lib/*`

**Grouping:**
- No consistent blank line separation between groups observed

## Error Handling

**Patterns:**
- API routes: try/catch blocks returning JSON error responses
  ```typescript
  try {
    // logic
    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to...' }, { status: 500 });
  }
  ```
- Services: Throw errors caught by API routes
- Client: Toast notifications via `use-toast` hook

**Error Types:**
- Generic `Error` objects thrown (no custom error classes detected)
- HTTP status codes returned in API responses

## Logging

**Framework:** `console.log` and `console.error` (no structured logger)

**Patterns:**
- Debug logging in services: `console.log('Step name:', data)`
- Error logging: `console.error('Error context:', error)`
- Debug API endpoints: `src/app/api/debug/cookies/route.ts`, `src/app/api/debug/gemini-models/route.ts`

## Comments

**When to Comment:**
- JSDoc-style block comments on test suites
- Inline comments for configuration explanations
- Some TODO comments in code

**JSDoc/TSDoc:**
- Not consistently used
- Test files have descriptive `describe` blocks

**TODO Comments:**
- No standardized format detected

## Function Design

**Size:**
- Large functions common in services (some 200+ lines)
- `logo-form.tsx` is 68KB, `admin-order-form.tsx` is 50KB
- `order-processor.ts` is 26KB

**Parameters:**
- Object parameters for complex functions
- Destructuring used in some places

**Return Values:**
- API routes return `Response.json()`
- Services return typed objects or throw errors

## Module Design

**Exports:**
- Named exports preferred (service files export individual functions)
- React components use default exports in some files
- No barrel files (`index.ts`) detected

**Barrel Files:**
- Not used - direct file imports throughout

---

*Convention analysis: 2026-03-28*
*Update when patterns change*
