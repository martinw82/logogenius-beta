# Requirements: LogoGenius

**Defined:** 2026-03-28
**Core Value:** Deliver agency-quality brand identity packages at self-service pricing, using AI to automate what traditionally requires a design team.

## v1 Requirements

Requirements for production launch. Each maps to roadmap phases.

### Payments

- [ ] **PAY-01**: Customer can select a pricing tier (Starter $29, Professional $49, Enterprise $99)
- [ ] **PAY-02**: Customer can complete checkout via Stripe (hosted checkout page)
- [ ] **PAY-03**: System creates order automatically after successful payment (via webhook)
- [ ] **PAY-04**: System prevents duplicate orders from webhook retries (idempotency)
- [ ] **PAY-05**: Customer receives redirect to order confirmation after payment

### Email

- [ ] **EMAIL-01**: Customer receives order confirmation email after payment
- [ ] **EMAIL-02**: Customer receives email with dashboard link when logos are ready
- [ ] **EMAIL-03**: Customer receives email with download link when brand kit is complete
- [ ] **EMAIL-04**: Email sending does not block order processing (fire-and-forget)

### PDF Brand Guide

- [ ] **PDF-01**: PDF has professional cover page with logo, business name, tagline
- [ ] **PDF-02**: PDF has table of contents with page numbers
- [ ] **PDF-03**: PDF has color palette section with hex/RGB values and swatches
- [ ] **PDF-04**: PDF has typography section with font specimens
- [ ] **PDF-05**: PDF has logo usage guidelines (minimum size, clear space, do/don't)
- [ ] **PDF-06**: PDF includes embedded photo-realistic mockup images

### PDF Microservice

- [ ] **SVC-01**: Railway service renders PDF using full Chromium Puppeteer
- [ ] **SVC-02**: Next.js calls Railway service via REST API to generate PDF
- [ ] **SVC-03**: Service handles cold starts gracefully (retry or warm-up)
- [ ] **SVC-04**: Service returns PDF within 30 seconds for standard brand guide

### Social Media Quality

- [ ] **SOC-01**: Canvas social templates have gradient backgrounds with brand colors
- [ ] **SOC-02**: Canvas social templates have proper typography hierarchy
- [ ] **SOC-03**: Social templates have consistent design language across platforms

### Landing Page

- [ ] **LAND-01**: Landing page has hero section with example logos
- [ ] **LAND-02**: Landing page has pricing comparison table for 3 tiers
- [ ] **LAND-03**: Landing page has social proof section (testimonials or count)

### Production Readiness

- [ ] **PROD-01**: Sentry error tracking configured for server and client
- [ ] **PROD-02**: All required environment variables documented in `.env.example`
- [ ] **PROD-03**: Basic CI pipeline (lint + typecheck + test) runs on PR

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Features

- **RECRAFT-01**: Test Recraft AI integration for native SVG output ($0.044/image)
- **RECRAFT-02**: Compare logo quality across providers (Together vs Recraft vs Imagen 3)
- **EMAIL-05**: Welcome email with tips for using brand kit
- **EMAIL-06**: Follow-up email 7 days after delivery
- **EMAIL-07**: Abandoned checkout reminder
- **SOC-04**: AI-generated hero images for Instagram/YouTube/Website ($0.009/order)
- **LAND-04**: Portfolio/examples section with real brand kits
- **LAND-05**: FAQ section addressing common concerns
- **PROD-04**: Structured logging with pino
- **PROD-05**: Performance monitoring via Vercel Analytics

### User Accounts

- **AUTH-01**: Customer can create account to manage multiple orders
- **AUTH-02**: Customer can view order history
- **AUTH-03**: Customer can re-download past brand kits

## Out of Scope

| Feature | Reason |
|---------|--------|
| Logo editor/design tool | Competes with Canva, outside core value prop |
| Subscription billing | One-time purchase model simpler for v1 |
| Multi-language support | English-only sufficient, massive complexity |
| AI chat for design feedback | Separate product, not core to generation |
| Print ordering/fulfillment | Supply chain complexity, not needed for v1 |
| Real-time collaboration | Single-user order flow, no need |
| Mobile native app | Web-first responsive design sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PAY-01 | Phase 1 | Pending |
| PAY-02 | Phase 1 | Pending |
| PAY-03 | Phase 1 | Pending |
| PAY-04 | Phase 1 | Pending |
| PAY-05 | Phase 1 | Pending |
| EMAIL-01 | Phase 2 | Pending |
| EMAIL-02 | Phase 2 | Pending |
| EMAIL-03 | Phase 2 | Pending |
| EMAIL-04 | Phase 2 | Pending |
| PDF-01 | Phase 3 | Pending |
| PDF-02 | Phase 3 | Pending |
| PDF-03 | Phase 3 | Pending |
| PDF-04 | Phase 3 | Pending |
| PDF-05 | Phase 3 | Pending |
| PDF-06 | Phase 3 | Pending |
| SVC-01 | Phase 4 | Pending |
| SVC-02 | Phase 4 | Pending |
| SVC-03 | Phase 4 | Pending |
| SVC-04 | Phase 4 | Pending |
| SOC-01 | Phase 5 | Pending |
| SOC-02 | Phase 5 | Pending |
| SOC-03 | Phase 5 | Pending |
| LAND-01 | Phase 6 | Pending |
| LAND-02 | Phase 6 | Pending |
| LAND-03 | Phase 6 | Pending |
| PROD-01 | Phase 7 | Pending |
| PROD-02 | Phase 7 | Pending |
| PROD-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after initial definition*
