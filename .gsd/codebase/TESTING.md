# Testing Patterns

**Analysis Date:** 2026-03-28

## Test Framework

**Runner:**
- Jest 29.7.x
- Config: `jest.config.ts` in project root
- Preset: `ts-jest`

**Assertion Library:**
- Jest built-in `expect`
- Matchers: `toBe`, `toEqual`, `toThrow`, `toHaveLength`

**Run Commands:**
```bash
npm test                              # Run all tests
npm run test:watch                    # Watch mode
npm run test:coverage                 # Coverage report
npm run test:e2e                      # E2E workflow tests only
```

## Test File Organization

**Location:**
- Separate `tests/` directory at project root (not co-located with source)
- `tests/unit/` for unit tests
- `tests/` root for E2E tests

**Naming:**
- `*.test.ts` for all test files
- `services.test.ts` for service unit tests
- `e2e-workflows.test.ts` for end-to-end tests

**Structure:**
```
tests/
├── setup.ts                      # Jest setup file
├── unit/
│   └── services.test.ts          # Service unit tests
└── e2e-workflows.test.ts         # E2E workflow tests
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from '@jest/globals';

describe('Token Service', () => {
  const getTokenService = async () => {
    return import('../../src/lib/services/token-service');
  };

  it('should generate a dashboard token', async () => {
    const { generateDashboardToken } = await getTokenService();
    const token = generateDashboardToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64);
  });
});
```

**Patterns:**
- Dynamic imports for service loading (avoids module resolution issues)
- `describe` blocks group by service/feature
- `it` blocks for individual test cases
- Async test functions for service calls

## Mocking

**Framework:**
- Jest built-in mocking

**Patterns:**
- Dynamic imports used instead of `jest.mock()` in some tests
- Module resolution handled via `moduleNameMapper` in jest config

**What to Mock:**
- External API calls (AI providers, mockup APIs)
- Database connections
- Environment variables

**What NOT to Mock:**
- Pure utility functions
- Token generation
- Data transformation logic

## Coverage

**Requirements:**
- No enforced coverage target
- Coverage configured to exclude `src/app/` and `src/components/` (UI code)
- Focus on `src/lib/` service logic

**Configuration:**
- Collects from: `src/**/*.ts`
- Excludes: `*.d.ts`, `src/app/**`, `src/components/**`
- Reports: text, lcov, html
- Output: `coverage/` directory

## Test Types

**Unit Tests:**
- Location: `tests/unit/services.test.ts`
- Scope: Individual service functions
- Mocking: Dynamic imports, minimal mocking
- Speed: 60-second timeout configured (generous for API tests)

**E2E Tests:**
- Location: `tests/e2e-workflows.test.ts`
- Framework: Jest (same runner)
- Scope: Full workflow testing
- Configuration: `npm run test:e2e`

## Common Patterns

**Async Testing:**
```typescript
it('should generate unique tokens', async () => {
  const { generateDashboardToken } = await getTokenService();
  const token1 = generateDashboardToken();
  const token2 = generateDashboardToken();
  expect(token1).not.toBe(token2);
});
```

**Error Testing:**
```typescript
it('should throw on invalid input', async () => {
  const { someFunction } = await getService();
  expect(() => someFunction(null)).toThrow();
});
```

**Snapshot Testing:**
- Not used in this codebase

---

*Testing analysis: 2026-03-28*
*Update when test patterns change*
