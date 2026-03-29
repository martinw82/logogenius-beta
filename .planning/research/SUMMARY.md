# Research Summary — LogoGenius Remaining Work

**Date:** 2026-03-28

## Stack Recommendations

| Area | Recommendation | Confidence |
|------|---------------|------------|
| PDF Hosting | Railway + Puppeteer (full Chrome) + REST API | High |
| Payments | Stripe Checkout (hosted) + Webhooks | High |
| Email | Resend + React Email templates | High |
| Monitoring | Sentry (@sentry/nextjs) + Vercel Analytics | High |

## Table Stakes Features (Not Yet Built)

1. **Stripe payments** — Revenue generation, blocks everything else
2. **Order confirmation email** — Customers expect receipt after payment
3. **PDF brand guide polish** — Professional quality expected at any price point
4. **Logo ready notification** — Customer needs to know when to review
5. **Brand kit download notification** — Customer needs link to final deliverables
6. **Railway PDF microservice** — Needed for professional PDF rendering (Puppeteer full Chrome)
7. **Production monitoring** — Can't go live without error visibility

## Differentiators

1. **Photo-realistic mockups via API** — Already built, working with Dynamic Mockups
2. **10 social media assets** — Already built via Canvas, quality could improve
3. **AI auto-fill from business name** — Already built (Google Gemini)
4. **Two-phase workflow** — Logo selection → full brand kit, unique UX

## Anti-Features

- Logo editor/design tool — Competes with Canva, outside core value
- Subscription billing — One-time purchase simpler for v1
- Multi-language — English-only sufficient
- AI chat for design feedback — Separate product
- Print ordering — Fulfillment complexity

## Recommended Build Order

1. **Stripe Payments** — Independent, unblocks revenue
2. **Email Integration** — Depends on Stripe (order confirmation). Quick win.
3. **PDF Polish** — Improves existing jsPDF. No external dependencies.
4. **Railway PDF Microservice** — Depends on polished HTML templates. Highest complexity.
5. **Social Image Quality** — Independent. Can be done anytime.
6. **Landing Page** — Depends on pricing tiers. After payments.
7. **Production Monitoring** — Before or during deployment.

## Watch Out For

1. **Stripe webhook race condition** — Use redirect confirmation as primary, webhook as backup. Poll order status.
2. **Idempotent order creation** — Store `stripe_session_id` on Order. Check before creating.
3. **Railway cold starts** — Use "always on" plan or health-check pings.
4. **Email blocking order flow** — Fire-and-forget, don't await email sends.
5. **Large component files** — Extract payment UI before adding Stripe to `logo-form.tsx` (68KB).

## Key Decisions Needed

1. **Railway service structure** — Separate repo or monorepo package?
2. **Stripe Price IDs** — Store in env vars (recommended) vs database?
3. **Email template approach** — Migrate existing 8 templates to React Email?
4. **PDF before/after** — Polish jsPDF first, then replace with Railway Puppeteer? Or jump straight to Railway?
5. **Social image strategy** — Canvas improvements only, or add AI-generated hero images ($0.009/order)?

---

*Research synthesized: 2026-03-28*
