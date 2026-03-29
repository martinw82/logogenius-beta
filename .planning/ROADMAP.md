# Roadmap: LogoGenius

**Created:** 2026-03-28
**Granularity:** Fine
**Requirements:** 28 v1 requirements across 7 phases
**Mode:** Interactive

---

## Phase Overview

| # | Phase | Goal | Requirements | Plans | Status |
|---|-------|------|--------------|-------|--------|
| 1 | Stripe Checkout | Accept payments and auto-create orders | PAY-01–05 | 3 | ✓ Complete |
| 2 | Email Notifications | Send transactional emails for key events | EMAIL-01–04 | 2 | ✓ Complete |
| 3 | PDF Polish | Professional brand guide PDF design | PDF-01–06 | 3 | ✓ Complete |
| 4 | Railway PDF Service | Server-side Puppeteer PDF rendering | SVC-01–04 | 2 | ✓ Complete |
| 5 | Social Quality | Improve Canvas social template quality | SOC-01–03 | 2 | ✓ Complete |
| 6 | Landing Page | Convert visitors with pricing and social proof | LAND-01–03 | 2 | ○ Pending |
| 7 | Production Ready | Error tracking, CI, deployment hardening | PROD-01–03 | 2 | ○ Pending |

---

## Phase 1: Stripe Checkout

**Goal:** Accept payments and automatically create orders on successful payment.

**Requirements:** PAY-01, PAY-02, PAY-03, PAY-04, PAY-05

**Success Criteria:**
1. Customer can select a tier and be redirected to Stripe Checkout
2. After payment, customer sees order confirmation with order details
3. Order is created in database with correct tier and customer email
4. Duplicate orders are not created when Stripe retries webhooks
5. Payment failure shows clear error message to customer

**Plans:**
- 01-01: Stripe checkout session creation and pricing page
- 01-02: Webhook handler with signature verification and idempotency
- 01-03: Order confirmation page and redirect flow

**Dependencies:** Stripe account, Price IDs for 3 tiers

---

## Phase 2: Email Notifications

**Goal:** Send transactional emails for order lifecycle events.

**Requirements:** EMAIL-01, EMAIL-02, EMAIL-03, EMAIL-04

**Success Criteria:**
1. Customer receives order confirmation email within 60 seconds of payment
2. Customer receives email with dashboard link when logos are ready
3. Customer receives email with download link when brand kit is complete
4. Email failure does not block order processing (logged, not thrown)

**Plans:**
- 02-01: Resend integration and email service wrapper
- 02-02: React Email templates for order confirmation, logo ready, brand kit ready

**Dependencies:** Resend account, domain verification (SPF/DKIM)

---

## Phase 3: PDF Brand Guide Polish

**Goal:** Professional-quality PDF brand guide with proper typography, colors, and guidelines.

**Requirements:** PDF-01, PDF-02, PDF-03, PDF-04, PDF-05, PDF-06

**Success Criteria:**
1. PDF has branded cover page with logo, business name, and tagline
2. PDF has clickable table of contents with page numbers
3. Color palette shows hex/RGB values with visual swatches
4. Typography section shows font specimens at different sizes
5. Logo usage guidelines include minimum size and clear space rules
6. PDF includes embedded mockup images at high resolution

**Plans:**
- 03-01: Cover page, TOC, and color palette sections
- 03-02: Typography and logo usage guideline sections
- 03-03: Mockup embedding and do/don't cards

**Dependencies:** Existing PDF generator (`src/lib/services/pdf-generator.ts`)

---

## Phase 4: Railway PDF Microservice

**Goal:** Server-side Puppeteer PDF rendering via Railway, replacing jsPDF limitations.

**Requirements:** SVC-01, SVC-02, SVC-03, SVC-04

**Success Criteria:**
1. Railway service renders PDF from HTML/CSS template using full Chromium
2. Next.js API route calls Railway service and receives PDF buffer
3. Service handles cold starts with retry logic (max 3 retries)
4. Standard brand guide PDF renders within 30 seconds

**Plans:**
- 04-01: Railway service setup (Dockerfile, Puppeteer config, REST endpoint)
- 04-02: Next.js integration (call Railway, handle response, store PDF)

**Dependencies:** Railway account, HTML template from Phase 3

---

## Phase 5: Social Media Quality

**Goal:** Improve Canvas social templates to professional quality.

**Requirements:** SOC-01, SOC-02, SOC-03

**Success Criteria:**
1. Social templates have gradient backgrounds using brand colors
2. Templates show proper typography hierarchy (headline + subtext)
3. Consistent design language across all 10 platform templates

**Plans:**
- [x] 05-01: Gradient backgrounds and brand color application
- [x] 05-02: Typography hierarchy and design consistency

**Dependencies:** Existing social generator (`src/hooks/useClientSocialGenerator.ts`)

---

## Phase 6: Landing Page

**Goal:** Convert visitors into customers with clear pricing and social proof.

**Requirements:** LAND-01, LAND-02, LAND-03

**Success Criteria:**
1. Hero section showcases example logos with before/after
2. Pricing table clearly shows 3 tiers with feature comparison
3. Social proof section displays testimonials or creation count

**Plans:**
- 06-01: Hero section with example logos and CTA
- 06-02: Pricing table and social proof section

**Dependencies:** Stripe Price IDs (Phase 1)

---

## Phase 7: Production Readiness

**Goal:** Deploy to production with error tracking, CI, and monitoring.

**Requirements:** PROD-01, PROD-02, PROD-03

**Success Criteria:**
1. Sentry captures server and client errors with context
2. All environment variables documented in `.env.example`
3. CI pipeline runs lint, typecheck, and tests on every PR

**Plans:**
- 07-01: Sentry integration and error boundaries
- 07-02: CI pipeline and environment variable audit

**Dependencies:** Sentry account, GitHub repository

---

## Requirement Coverage

| Requirement | Phase | Plan |
|-------------|-------|------|
| PAY-01 | Phase 1 | 01-01 |
| PAY-02 | Phase 1 | 01-01 |
| PAY-03 | Phase 1 | 01-02 |
| PAY-04 | Phase 1 | 01-02 |
| PAY-05 | Phase 1 | 01-03 |
| EMAIL-01 | Phase 2 | 02-01 |
| EMAIL-02 | Phase 2 | 02-02 |
| EMAIL-03 | Phase 2 | 02-02 |
| EMAIL-04 | Phase 2 | 02-01 |
| PDF-01 | Phase 3 | 03-01 |
| PDF-02 | Phase 3 | 03-01 |
| PDF-03 | Phase 3 | 03-01 |
| PDF-04 | Phase 3 | 03-02 |
| PDF-05 | Phase 3 | 03-02 |
| PDF-06 | Phase 3 | 03-03 |
| SVC-01 | Phase 4 | 04-01 |
| SVC-02 | Phase 4 | 04-02 |
| SVC-03 | Phase 4 | 04-02 |
| SVC-04 | Phase 4 | 04-01 |
| SOC-01 | Phase 5 | 05-01 |
| SOC-02 | Phase 5 | 05-02 |
| SOC-03 | Phase 5 | 05-02 |
| LAND-01 | Phase 6 | 06-01 |
| LAND-02 | Phase 6 | 06-02 |
| LAND-03 | Phase 6 | 06-02 |
| PROD-01 | Phase 7 | 07-01 |
| PROD-02 | Phase 7 | 07-02 |
| PROD-03 | Phase 7 | 07-02 |

**Coverage:** 28/28 requirements mapped (100%) ✓

---

*Roadmap created: 2026-03-28*
