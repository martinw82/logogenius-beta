# Research: Phase 1 — Stripe Checkout

**Date:** 2026-03-28
**Phase Goal:** Accept payments and automatically create orders on successful payment.

## Stripe Integration Pattern

### Checkout Flow (Recommended)

1. **Frontend:** User selects tier → calls `POST /api/stripe/checkout`
2. **API:** Creates Stripe Checkout Session with metadata (tier, email)
3. **Stripe:** Redirects user to hosted checkout page (PCI-compliant)
4. **Payment:** User completes payment on Stripe's page
5. **Redirect:** Stripe redirects to `/order/success?session_id=cs_xxx`
6. **Webhook:** Stripe fires `checkout.session.completed` → `/api/stripe/webhook`
7. **Webhook handler:** Verifies signature, creates Order in DB, returns 200
8. **Frontend:** Polls order status or shows confirmation

**Why this pattern:**
- Stripe Checkout = PCI-compliant, no custom card form needed
- Webhook is the reliable confirmation source (redirect can be cancelled)
- Metadata on session links payment to tier/email without DB lookup

### Database Schema Changes

Current `Order` model needs:
- `stripeSessionId: String? @unique` — Idempotency key for webhooks
- `paymentStatus: String @default("unpaid")` — Track payment state (unpaid/paid/failed)
- `amount: Int?` — Amount in cents (for receipt display)

Migration: `ALTER TABLE Order ADD COLUMN stripeSessionId VARCHAR(255) UNIQUE, ADD COLUMN paymentStatus VARCHAR(50) DEFAULT 'unpaid', ADD COLUMN amount INT;`

### API Routes Needed

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe webhooks |
| `/order/success` | GET (page) | Order confirmation page |

### Key Libraries

- `stripe` npm package (v17+) — Stripe SDK
- No additional dependencies needed

### Webhook Security

- Verify signature: `stripe.webhooks.constructEvent(body, sig, webhookSecret)`
- Store `STRIPE_WEBHOOK_SECRET` in env vars
- Return 200 immediately (Stripe retries on non-2xx)
- Idempotency: Check `stripeSessionId` before creating order

### Tier Pricing

| Tier | Price | Stripe Price ID (env var) |
|------|-------|--------------------------|
| Starter (basic) | $29.00 | `STRIPE_PRICE_STARTER` |
| Professional (pro) | $49.00 | `STRIPE_PRICE_PRO` |
| Enterprise (premium) | $99.00 | `STRIPE_PRICE_ENTERPRISE` |

### Integration Points in Existing Code

- `src/app/api/orders/create/route.ts` — Currently creates orders directly; will be replaced by Stripe checkout flow
- `src/app/tiers/page.tsx` — Pricing page; needs "Buy Now" buttons
- `src/app/create/page.tsx` — Order form; needs tier selection before payment
- `prisma/schema.prisma` — Order model needs payment fields

### Pitfalls to Avoid

1. **Webhook race condition:** Don't rely solely on redirect; always confirm via webhook
2. **Idempotency:** Store stripe_session_id, check before creating order
3. **Test vs Live:** Use separate env vars for test/live keys
4. **Webhook URL:** Must be publicly accessible (localhost needs Stripe CLI for testing)

---

*Research complete: 2026-03-28*
