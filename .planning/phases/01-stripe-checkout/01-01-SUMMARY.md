# Summary: Plan 01-01 — Stripe Checkout + Pricing Page

**Plan:** 01-01
**Phase:** 01-stripe-checkout
**Status:** Complete

## Tasks Completed

### Task 1: Add Stripe payment fields to Order schema
- Added `stripeSessionId` (String, unique) for idempotency
- Added `paymentStatus` (String, default "unpaid") for payment tracking
- Added `amount` (Int) for receipt display
- Added index on `stripeSessionId` for webhook lookups

**Commit:** `feat(01-01): add Stripe payment fields to Order schema and stripe SDK`

### Task 2: Install Stripe SDK
- Added `stripe` ^17.7.0 to package.json dependencies

**Commit:** (same as Task 1)

### Task 3: Create checkout session API route
- Created `src/app/api/stripe/checkout/route.ts`
- POST handler creates Stripe Checkout Sessions
- Maps tier IDs to Stripe Price IDs via environment variables
- Validates tier input and checks for missing env vars
- Returns `{ sessionId, url }` for frontend redirect

**Commit:** `feat(01-01): create Stripe checkout session API route`

### Task 4: Update pricing page tiers and Buy Now buttons
- Updated `src/app/tiers/page.tsx`
- Renamed tiers: Starter/$29, Professional/$49, Enterprise/$99
- Updated feature lists to match new tier structure
- Buy Now button calls `/api/stripe/checkout` and redirects to Stripe
- Loading state shows "Redirecting to Checkout..."

**Commit:** `feat(01-01): update pricing page tiers and add Buy Now buttons`

### Task 5: Update .env.example with Stripe variables
- Added 6 Stripe-related environment variables to `.env.example`
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_STARTER, STRIPE_PRICE_PRO, STRIPE_PRICE_ENTERPRISE
- NEXT_PUBLIC_BASE_URL

**Commit:** `chore(01-01): add Stripe environment variables to .env.example`

## Files Modified

- `prisma/schema.prisma` — Order model with Stripe fields
- `package.json` — Added stripe dependency
- `src/app/api/stripe/checkout/route.ts` — New checkout API
- `src/app/tiers/page.tsx` — Updated tiers and Buy Now buttons
- `.env.example` — Stripe configuration variables

## Decisions Made

- Keep internal tier IDs as `basic/pro/premium` (matches existing codebase)
- Use Stripe Checkout (hosted) instead of custom Elements (simpler, PCI-compliant)
- Map tier IDs to display names via env vars (flexible pricing changes)

---
*Completed: 2026-03-28*
