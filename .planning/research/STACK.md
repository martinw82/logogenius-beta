# Stack Research — Remaining Work

**Analysis Date:** 2026-03-28

## PDF Hosting (Railway Microservice)

**Recommended Stack:**
- **Runtime:** Node.js 20 LTS on Railway
- **PDF Engine:** Puppeteer (full Chrome, not @sparticuz/chromium)
- **Communication:** REST API (POST /generate-pdf → returns PDF buffer or S3 URL)
- **Template Engine:** Handlebars (already in dependencies) for HTML template rendering
- **Deployment:** Railway auto-deploy from git, Docker container optional

**Rationale:**
- Full Chromium on Railway avoids the 10s Vercel timeout entirely
- REST API is simplest integration pattern (Next.js fetches Railway endpoint)
- Handlebars already used in codebase — no new dependency
- Railway's $5/mo hobby plan sufficient for expected volume

**Alternatives Considered:**
- Inngest/QStash for async jobs — Overkill for synchronous PDF generation
- Browserless.io — SaaS lock-in, higher cost ($50+/mo)
- Lambda with Chromium — AWS complexity for a Vercel-hosted app

## Payments (Stripe)

**Recommended Stack:**
- **SDK:** `stripe` npm package (latest, v17+)
- **Checkout:** Stripe Checkout (hosted, not custom form)
- **Webhooks:** `stripe.webhooks.constructEvent()` for signature verification
- **Integration:** API route at `/api/stripe/webhook` + `/api/stripe/checkout`

**Rationale:**
- Stripe Checkout is PCI-compliant out of the box (no custom card form)
- Webhooks are the reliable way to handle async payment confirmation
- Already using `jsonwebtoken` and `bcryptjs` — Stripe adds minimal dependencies
- Free tier: no monthly cost, 2.9% + 30¢ per transaction

**Alternatives Considered:**
- LemonSqueezy — Simpler but less control, merchant-of-record model adds cost
- Paddle — Similar to LemonSqueezy, less developer community
- Custom Stripe Elements — More work, PCI compliance burden

## Email (Transactional)

**Recommended Stack:**
- **Service:** Resend (resend.com)
- **SDK:** `resend` npm package (v4+)
- **Templates:** React Email (@react-email/components) for template authoring
- **Free tier:** 100 emails/day, 3,000/month

**Rationale:**
- Resend has the best DX for Next.js (React Email integration)
- Free tier covers testing and early production
- Simple API: `resend.emails.send({ from, to, subject, react })`
- Already has 8 email templates in codebase — can migrate to React Email format

**Alternatives Considered:**
- SendGrid — More mature but worse DX, higher free tier limits but complex setup
- Postmark — Excellent deliverability, but $15/mo minimum
- AWS SES — Cheapest at scale but complex setup, not needed at current volume

## Monitoring

**Recommended Stack:**
- **Error Tracking:** Sentry (`@sentry/nextjs`)
- **Logging:** Structured console (upgrade to pino later if needed)
- **Analytics:** Vercel Analytics (built-in, free on Pro)

**Rationale:**
- Sentry has first-class Next.js integration (auto-captures server + client errors)
- Free tier: 5K errors/month, sufficient for early production
- Vercel Analytics provides performance metrics without additional setup
- Structured console logging is free and sufficient until scale demands pino

**Alternatives Considered:**
- LogRocket — Session replay is nice but overkill and expensive ($99+/mo)
- Datadog — Enterprise-grade but complex and expensive
- Custom logging — Unnecessary for v1

## Summary

| Area | Recommendation | Confidence |
|------|---------------|------------|
| PDF Hosting | Railway + Puppeteer + REST API | High |
| Payments | Stripe Checkout + Webhooks | High |
| Email | Resend + React Email | High |
| Monitoring | Sentry + Vercel Analytics | High |

---

*Stack research: 2026-03-28*
