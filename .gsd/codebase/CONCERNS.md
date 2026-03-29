# Codebase Concerns

**Analysis Date:** 2026-03-28

## Tech Debt

**Large component files:**
- Issue: `src/components/logo-form.tsx` is 68KB (2,400+ lines), `src/components/admin-order-form.tsx` is 50KB (1,700+ lines)
- Why: Rapid prototyping during MVP phase, all form logic in single components
- Impact: Difficult to maintain, hard to test individual pieces, slow IDE performance
- Fix approach: Extract sub-forms, validation logic, and state management into separate modules

**Large service files:**
- Issue: `src/lib/services/pdf-generator.ts` is 27KB (900+ lines), `src/lib/services/order-processor.ts` is 26KB (870+ lines)
- Why: Feature-rich services that grew organically
- Impact: Difficult to understand full flow, risky to modify
- Fix approach: Extract PDF sections into focused modules, split order processing into steps

**No structured logging:**
- Issue: All logging via `console.log`/`console.error` throughout codebase
- Why: No logging framework set up initially
- Impact: Hard to debug production issues, no structured search/filter of logs
- Fix approach: Add pino or similar structured logger with context objects

**Inconsistent error handling:**
- Issue: Generic `Error` objects thrown, no custom error classes
- Why: Rapid development without error taxonomy
- Impact: Hard to distinguish error types programmatically, generic 500 responses
- Fix approach: Create typed error classes (ValidationError, NotFoundError, ExternalAPIError)

## Known Bugs

**No known bugs tracked externally** (bugs may exist in code but not documented)

## Security Considerations

**Admin password in env var:**
- Risk: Single password for all admin access, no per-user accounts
- Files: `src/app/api/admin/login/route.ts`, `src/lib/auth.ts`
- Current mitigation: bcrypt hashing, JWT session tokens
- Recommendations: Add multi-admin support with role-based access

**Dashboard tokens in URL:**
- Risk: Customer dashboard accessed via token in URL path (`/api/dashboard/[token]/`)
- Files: `src/app/api/dashboard/[token]/route.ts`
- Current mitigation: Tokens are 64-char hex strings (high entropy)
- Recommendations: Consider moving to header-based auth for sensitive operations

**No CSRF protection detected:**
- Risk: API routes may be vulnerable to cross-site request forgery
- Current mitigation: Same-origin policy enforced by browsers for API calls
- Recommendations: Add CSRF token validation for state-changing operations

## Performance Bottlenecks

**Logo generation pipeline:**
- Problem: Sequential generation of 4 logos + mockups + social + PDF
- File: `src/app/api/orders/[id]/generate/route.ts`, `src/lib/services/order-processor.ts`
- Cause: Each step waits for previous to complete
- Improvement path: Parallelize independent generation steps (mockups can run concurrently with social assets)

**Client-side canvas rendering:**
- Problem: 3 mockups + 10 social assets rendered sequentially in browser
- Files: `src/hooks/useClientMockupGenerator.ts`, `src/hooks/useClientSocialGenerator.ts`
- Cause: Canvas operations are synchronous per asset
- Improvement path: Use OffscreenCanvas or Web Workers for parallel rendering

**Large component bundle:**
- Problem: `logo-form.tsx` (68KB) and `admin-order-form.tsx` (50KB) contribute to large initial bundle
- Files: `src/components/logo-form.tsx`, `src/components/admin-order-form.tsx`
- Cause: All logic in single component files
- Improvement path: Code splitting, lazy loading sub-forms

## Fragile Areas

**Order processing pipeline:**
- File: `src/lib/services/order-processor.ts` (26KB)
- Why fragile: Complex orchestration of multiple external APIs with fallback logic
- Common failures: External API timeouts, partial generation states
- Safe modification: Add thorough integration tests before changes, test each step independently
- Test coverage: E2E test exists but unit test coverage unclear

**Mockup generation with provider switching:**
- Files: `src/lib/services/mockup-generation.ts`, `src/lib/services/ai-mockup-generator.ts`
- Why fragile: Smart routing between 3 providers + AI fallback, each with different API contracts
- Common failures: Provider API changes, auth failures, image format mismatches
- Safe modification: Test each provider path independently, verify fallback chain
- Test coverage: Test endpoints exist at `/api/test/mockup-generation`

**PDF generation:**
- Files: `src/lib/services/pdf-generator.ts` (27KB), `src/lib/services/pdf-generator-puppeteer.ts`
- Why fragile: Two PDF generation approaches (jsPDF + Puppeteer), complex template rendering
- Common failures: Font embedding issues, image embedding failures, Puppeteer serverless compatibility
- Safe modification: Test with various logo/mockup combinations
- Test coverage: Test endpoint at `/api/test/pdf-generation`

## Scaling Limits

**Single admin account:**
- Current capacity: 1 admin user (env var password)
- Limit: Team growth requires multi-admin
- Symptoms: Shared credentials, no audit trail
- Scaling path: Add `Admin` model with per-user credentials

**Database schema:**
- Current capacity: MySQL with Prisma ORM
- Limit: No connection pooling detected
- Symptoms: Potential connection exhaustion under load
- Scaling path: Add Prisma connection pooling, consider read replicas

**Serverless function limits:**
- Current capacity: Vercel serverless functions
- Limit: 10s timeout (Hobby), 60s (Pro) for API routes
- Symptoms: PDF generation or AI calls may timeout
- Scaling path: Move long-running tasks to background jobs (Vercel Cron, Inngest, etc.)

## Dependencies at Risk

**@tanstack-query-firebase/react:**
- Risk: Firebase dependency for potentially minimal usage
- Impact: Large bundle size for Firebase SDK
- Migration plan: Evaluate if Firebase features are actually used, remove if not

**puppeteer-core + @sparticuz/chromium:**
- Risk: Serverless Chromium compatibility can break with platform updates
- Impact: PDF generation fails silently
- Migration plan: Maintain fallback to jsPDF-only generation

## Missing Critical Features

**No automated testing in CI:**
- Problem: No `.github/workflows` detected, tests run manually only
- Current workaround: Manual `npm test` before commits
- Blocks: Automated quality gates, regression prevention
- Implementation complexity: Low (add GitHub Actions workflow)

**No error monitoring:**
- Problem: No Sentry, LogRocket, or similar error tracking
- Current workaround: Manual testing, console.log debugging
- Blocks: Production error visibility, user impact tracking
- Implementation complexity: Low-Medium (add Sentry SDK)

**No input sanitization on some API routes:**
- Problem: Some routes may accept unvalidated input
- Current workaround: Zod schemas exist but coverage unclear
- Blocks: Security hardening
- Implementation complexity: Medium (audit all routes, add Zod validation)

## Test Coverage Gaps

**Service unit tests:**
- What's not tested: Most service files beyond token-service
- Files: `src/lib/services/order-processor.ts`, `image-generation.ts`, `mockup-generation.ts`, `pdf-generator.ts`
- Risk: Business logic regressions go undetected
- Priority: High
- Difficulty to test: Need to mock external APIs and database

**Component tests:**
- What's not tested: All React components (explicitly excluded from coverage)
- Files: `src/components/*.tsx`
- Risk: UI regressions, broken user flows
- Priority: Medium
- Difficulty to test: Need React Testing Library setup

**API route integration tests:**
- What's not tested: API route handlers with real-ish dependencies
- Files: `src/app/api/**/*.ts`
- Risk: Request/response contract breaks
- Priority: High
- Difficulty to test: Need test database and API mocking

---

*Concerns audit: 2026-03-28*
*Update as issues are fixed or new ones discovered*
