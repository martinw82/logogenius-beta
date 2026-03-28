# Architecture Research — Remaining Work

**Analysis Date:** 2026-03-28

## Integration Architecture

### Railway PDF Microservice

**Communication Pattern:**
- REST API: Next.js POST to Railway endpoint with HTML/CSS template data
- Railway renders PDF with full Chromium and returns PDF buffer or URL
- Synchronous call from Next.js API route (not async queue)

**Data Flow:**
1. Admin triggers finalization → `POST /api/orders/[id]/finalize`
2. Next.js gathers all assets (logo SVG, mockup images, brand data)
3. Next.js renders HTML template with Handlebars (brand colors, fonts, content)
4. Next.js POSTs to Railway: `{ html, options: { format: 'A4', printBackground: true } }`
5. Railway runs Puppeteer (full Chrome) → renders PDF → returns buffer
6. Next.js saves PDF, packages into ZIP, stores for download

**Deployment:**
- Separate GitHub repo or monorepo package for Railway service
- Railway auto-deploys on push to main
- Environment variable: `RAILWAY_PDF_URL` in Vercel
- Health check endpoint: `GET /health`

**Integration Points:**
- `src/lib/services/pdf-generator-puppeteer.ts` — Already exists, needs Railway URL config
- `src/lib/services/order-processor.ts` — Calls PDF generation step
- New: Railway service (`railway-pdf/` directory or separate repo)

### Stripe Payments

**Integration Pattern:**
- Stripe Checkout (hosted page, not custom form)
- Webhook handler for async payment confirmation
- Idempotent order creation

**Data Flow:**
1. User selects tier → clicks "Buy Now"
2. Frontend calls `POST /api/stripe/checkout` with tier selection
3. API creates Stripe Checkout Session (with metadata: tier, customer email)
4. User redirected to Stripe-hosted checkout page
5. User completes payment → Stripe redirects back to `/order/success?session_id=xxx`
6. Stripe fires `checkout.session.completed` webhook to `/api/stripe/webhook`
7. Webhook verifies signature, creates Order in database
8. Frontend shows confirmation with order details

**Security Considerations:**
- Webhook signature verification via `stripe.webhooks.constructEvent()`
- Idempotency: Check if order already exists for session_id before creating
- Metadata: Include tier + customer email in checkout session metadata
- Price IDs: Store Stripe Price IDs for each tier in environment variables

**Integration Points:**
- New: `src/app/api/stripe/checkout/route.ts` — Create checkout session
- New: `src/app/api/stripe/webroute.ts` — Handle webhooks
- New: `src/components/PricingSection.tsx` — Pricing page component
- Modified: `src/app/page.tsx` — Add pricing section to landing page

### Email Service

**Trigger Pattern:**
- Inline sends (synchronous) for critical emails (order confirmation)
- Best-effort for non-critical (welcome, follow-up) — fire and forget

**Template Management:**
- React Email components in `src/emails/` directory
- Templates: `order-confirmation.tsx`, `logo-ready.tsx`, `brand-kit-ready.tsx`
- Rendered server-side with `react-email` render function

**Integration Points:**
- New: `src/lib/services/email-service.ts` — Resend client wrapper
- New: `src/emails/` directory — React Email templates
- Triggered from: order-processor.ts, finalize route

### Monitoring

**Integration:**
- `@sentry/nextjs` — Auto-instruments server + client + edge
- `sentry.client.config.ts` + `sentry.server.config.ts` — Configuration files
- Error boundaries in React for graceful degradation

## Build Order

Based on dependencies:

1. **Stripe Payments** — Independent, doesn't depend on other new features. Unblocks revenue.
2. **Email Integration** — Depends on Stripe (order confirmation email). Quick win.
3. **PDF Polish** — Improves existing jsPDF output. No external dependencies.
4. **Railway PDF Microservice** — Depends on polished HTML templates from #3. Highest complexity.
5. **Social Image Quality** — Independent of payments/email. Can be done anytime.
6. **Landing Page** — Depends on pricing tiers from Stripe. Should come after payments.
7. **Production Monitoring** — Should be added before or during production deployment.

## Component Boundaries

```
┌─────────────────────────────────────────────────────┐
│                   Next.js (Vercel)                   │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │ Frontend │  │ API      │  │ Services          │ │
│  │ (React)  │  │ (Routes) │  │ (lib/services/)   │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────────────┘ │
│       │              │              │               │
└───────┼──────────────┼──────────────┼───────────────┘
        │              │              │
        │         ┌────▼─────┐  ┌────▼──────────┐
        │         │ Stripe   │  │ Railway PDF   │
        │         │ (Checkout│  │ (Puppeteer)   │
        │         │ +Webhook)│  │               │
        │         └──────────┘  └───────────────┘
        │              │
        │         ┌────▼─────┐
        │         │ Resend   │
        │         │ (Email)  │
        │         └──────────┘
        │
   ┌────▼─────┐
   │ MySQL    │
   │ (TiDB)   │
   └──────────┘
```

---

*Architecture research: 2026-03-28*
