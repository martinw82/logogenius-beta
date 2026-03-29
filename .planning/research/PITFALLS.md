# Pitfalls Research — Remaining Work

**Analysis Date:** 2026-03-28

## Stripe Payments Pitfalls

### Webhook Race Condition
- **Symptoms:** Order shows "pending" even after successful payment. User sees payment success but no order.
- **Prevention:** Use Stripe Checkout redirect (synchronous confirmation) as primary, webhook as backup. Poll order status on success page until confirmed.
- **Phase:** Payments phase

### Idempotent Order Creation
- **Symptoms:** Duplicate orders created when webhook fires multiple times (Stripe retries on 5xx).
- **Prevention:** Store `stripe_session_id` on Order, check before creating. Return 200 for already-processed events.
- **Phase:** Payments phase

### Price/Plan Mismatch
- **Symptoms:** User pays for Pro but gets Starter features. Or price changes aren't reflected.
- **Prevention:** Store Stripe Price IDs in environment variables, not hardcoded. Validate tier against Price ID in webhook.
- **Phase:** Payments phase

### Test vs Live Mode Confusion
- **Symptoms:** Production charges go to test Stripe account, or test cards fail in production.
- **Prevention:** Use separate env vars for test/live (`STRIPE_SECRET_KEY_TEST` vs `STRIPE_SECRET_KEY`). Verify mode matches `NODE_ENV`.
- **Phase:** Payments phase

## Railway Microservice Pitfalls

### Cold Start Latency
- **Symptoms:** First PDF request takes 10-30 seconds (Railway spins up container).
- **Prevention:** Use Railway's "always on" plan ($5/mo) or implement health-check pings to keep service warm.
- **Phase:** PDF microservice phase

### CORS/Network Issues
- **Symptoms:** Vercel can't reach Railway endpoint. 502/504 errors.
- **Prevention:** Configure Railway service with correct CORS headers. Use Railway's public URL. Add retry logic with exponential backoff.
- **Phase:** PDF microservice phase

### Memory/Timeout Limits
- **Symptoms:** Complex PDFs (many pages, high-res images) crash or timeout on Railway.
- **Prevention:** Set Railway memory to 1GB minimum. Implement pagination for large PDFs. Compress images before embedding.
- **Phase:** PDF microservice phase

### Version Drift
- **Symptoms:** Railway service uses different Puppeteer version than local dev. PDFs render differently.
- **Prevention:** Pin Puppeteer version in Railway service. Use Docker for consistent Chrome version.
- **Phase:** PDF microservice phase

## Email Integration Pitfalls

### Deliverability Issues
- **Symptoms:** Emails land in spam. Users don't receive order confirmations.
- **Prevention:** Verify domain with Resend (SPF/DKIM records). Use consistent from address. Start with transactional emails only (no marketing).
- **Phase:** Email phase

### Email as Blocking Operation
- **Symptoms:** Order processing hangs because email API is slow/down.
- **Prevention:** Send emails asynchronously (fire-and-log, don't await). If email fails, log error but don't block order completion.
- **Phase:** Email phase

## Production Deployment Pitfalls

### Environment Variable Gaps
- **Symptoms:** Features work locally but fail in production. Missing API keys, wrong URLs.
- **Prevention:** Audit `.env.example` before deploy. Add runtime checks for required env vars. Test in Vercel preview deploy first.
- **Phase:** Deployment phase

### Serverless Timeout on Generation
- **Symptoms:** Logo generation or mockup rendering exceeds 10s Vercel timeout.
- **Prevention:** Move long-running tasks to background jobs or Railway. Use streaming responses where possible.
- **Phase:** Deployment phase

### Database Connection Pool Exhaustion
- **Symptoms:** "Too many connections" errors under load.
- **Prevention:** Use Prisma connection pooling (`connection_limit` in DATABASE_URL). Consider Prisma Accelerate for serverless.
- **Phase:** Deployment phase

## Existing Codebase Risks

### Large Component Files
- From CONCERNS.md: `logo-form.tsx` is 68KB, `admin-order-form.tsx` is 50KB
- **Impact on remaining work:** Adding payment flow to these components will make them larger and harder to maintain
- **Mitigation:** Extract payment-related UI into separate components before adding Stripe

### No CI Pipeline
- From CONCERNS.md: No GitHub Actions, tests run manually
- **Impact:** Deploying payment code without CI = high risk of regressions
- **Mitigation:** Add basic CI (lint + typecheck + test) before payments phase

### Limited Test Coverage
- From CONCERNS.md: Only 2 test files, most services untested
- **Impact:** Payment logic without tests = financial risk
- **Mitigation:** Add integration tests for payment webhook handler

## Critical Mistakes to Avoid

| Mistake | Impact | Prevention |
|---------|--------|------------|
| Hardcoding Stripe Price IDs | Can't change pricing without code deploy | Store in env vars |
| Not verifying webhook signatures | Any request can create orders | Always use `constructEvent()` |
| Blocking order flow on email | Orders stuck if email service down | Fire-and-forget emails |
| Running Puppeteer on Vercel | 10s timeout, OOM errors | Use Railway for PDF |
| Skipping E2E test for payment | Silent payment failures | Test full buy → confirm flow |
| Not handling Stripe retries | Duplicate orders/events | Idempotency keys |

---

*Pitfalls research: 2026-03-28*
