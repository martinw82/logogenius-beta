# LogoGenius Test Suite

This directory contains the comprehensive test suite for LogoGenius Beta.

## Test Structure

```
tests/
├── README.md                 # This file
├── setup.ts                  # Jest setup and configuration
├── e2e-workflows.test.ts     # End-to-end workflow tests
└── unit/
    └── services.test.ts      # Unit tests for services
```

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env.test`):
```env
DATABASE_URL=mysql://user:pass@localhost:3306/logogenius_test
ADMIN_PASSWORD=test-password
JWT_SECRET=test-secret
NEXT_PUBLIC_BASE_URL=http://localhost:9002
TEST_GOOGLE_API_KEY=your-test-api-key  # Optional, for AI generation tests
```

3. Start the development server:
```bash
npm run dev
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Only E2E Tests
```bash
npm run test:e2e
```

### Run Only Unit Tests
```bash
npx jest tests/unit
```

## Test Categories

### 1. Unit Tests (`tests/unit/services.test.ts`)

Tests individual service functions in isolation:
- **Token Service**: Token generation, expiration
- **Version Tracking**: Version number calculations
- **File Manager**: File name generation, sanitization
- **README Generator**: Content generation
- **ZIP Packager**: Archive creation
- **Mockup Renderer**: Mockup generation
- **Email Service**: Email template rendering
- **Admin Analytics**: Metrics calculation
- **Order Processor**: Order processing logic

These tests **do not** require:
- Database connection
- External API calls
- Running server

### 2. E2E Tests (`tests/e2e-workflows.test.ts`)

Tests complete user workflows:
- **Tier 1 (Basic)**: Order creation → logo generation → selection
- **Tier 2 (Pro)**: PDF/ZIP generation → dashboard access
- **Tier 3 (Premium)**: Figma/Canva templates → media assets
- **Admin Operations**: Order management, analytics
- **Error Handling**: Invalid inputs, auth failures
- **Performance**: Concurrent requests, response times

These tests **require**:
- Running development server (`npm run dev`)
- Database connection
- Valid admin credentials

## Test Configuration

### Jest Configuration (`jest.config.ts`)

- **Test Environment**: Node.js
- **TypeScript**: ts-jest preset
- **Module Mapping**: `@/` maps to `src/`
- **Timeout**: 60 seconds (for AI generation)
- **Coverage**: Collects from `src/**/*.ts`

### Test Utilities

Available in `setup.ts`:

```typescript
// Generate test order data
global.testUtils.generateTestOrder('pro');

// Mock fetch responses
global.testUtils.mockFetch({ success: true });
```

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from '@jest/globals';

describe('My Service', () => {
  it('should do something', async () => {
    const { myFunction } = await import('../../src/lib/services/my-service');
    const result = myFunction();
    expect(result).toBe(true);
  });
});
```

### E2E Test Example

```typescript
import { describe, it, expect } from '@jest/globals';

describe('My Feature', () => {
  it('should complete workflow', async () => {
    const response = await fetch('http://localhost:9002/api/my-endpoint', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    });
    
    expect(response.ok).toBe(true);
    const result = await response.json();
    expect(result.success).toBe(true);
  });
});
```

## Expected Test Results

### Unit Tests
- ✅ All service imports work
- ✅ Token generation creates valid UUIDs
- ✅ Version calculations are correct
- ✅ File names are properly sanitized
- ✅ README content includes all sections

### E2E Tests
- ✅ Tier 1: Order creation, retrieval, logo selection
- ⚠️ Tier 2/3: May skip if API key not provided
- ✅ Error handling returns correct status codes
- ✅ Admin authentication works
- ✅ Invalid requests are rejected

## Skipped Tests

Some tests may be skipped if:
1. Server is not running
2. Database is not connected
3. Google API key is invalid
4. Specific endpoints don't exist yet

Skipped tests will show `⏭️  Skipping - [reason]` in the output.

## Continuous Integration

To run tests in CI/CD:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    npm ci
    npx prisma migrate deploy
    npm run test:coverage
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
    ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Troubleshooting

### "Cannot find module" errors
- Run `npx prisma generate`
- Check `tsconfig.json` paths configuration

### "Server not running" warnings
- Start dev server: `npm run dev`
- Check `NEXT_PUBLIC_BASE_URL` env var

### Database connection failures
- Verify MySQL is running
- Check `DATABASE_URL` format
- Ensure database exists

### API key errors in logo generation
- Tests will skip if `TEST_GOOGLE_API_KEY` not provided
- This is expected behavior for CI environments

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Services | 80% | TBD |
| API Routes | 60% | TBD |
| Components | 50% | TBD |
| Overall | 70% | TBD |

## Maintenance

- Update tests when adding new features
- Run full suite before releases
- Keep E2E tests aligned with user workflows
- Document any new test utilities
