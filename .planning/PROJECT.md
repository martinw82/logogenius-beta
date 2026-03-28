# LogoGenius

## What This Is

LogoGenius is an AI-powered logo generation SaaS that creates professional brand identity packages. Customers submit a brief, AI generates 4 logo variants, an admin selects the best one, and the system produces a complete brand kit: photo-realistic product mockups, social media assets, and a PDF brand guide — all packaged in a downloadable ZIP.

## Core Value

Deliver agency-quality brand identity packages at self-service pricing, using AI to automate what traditionally requires a design team.

## Requirements

### Validated

<!-- Shipped and confirmed valuable — inferred from existing codebase. -->

- ✓ Core order flow (create → process → approve/reject) — existing
- ✓ Admin dashboard with JWT authentication — existing
- ✓ Customer dashboard with token-based access — existing
- ✓ AI logo generation (5 providers: Together, Replicate, Fal, Google, Laozhang) — existing
- ✓ Recraft AI integration (native SVG output) — existing
- ✓ Prompt Lab with anti-pattern optimization — existing
- ✓ Canvas mockups (business card, letterhead, t-shirt) — existing
- ✓ API mockups (Dynamic Mockups, MockupsJar, MockCity) with smart routing — existing
- ✓ Social media assets (10 platforms via Canvas) — existing
- ✓ Typography system (26 fonts + custom upload) — existing
- ✓ PDF brand guide generation (jsPDF) — existing
- ✓ ZIP packaging with all assets — existing
- ✓ Two-phase workflow (logos+mockups → social+PDF after selection) — existing
- ✓ Base64-to-URL bridge for mockup APIs — existing
- ✓ AI auto-fill from business name + industry (Google Gemini) — existing

### Active

- [ ] PDF aesthetics polish (cover page, TOC, color swatches, typography, do/don't cards)
- [ ] PDF hosting via Railway microservice (server-side Puppeteer rendering)
- [ ] Recraft API key testing and quality comparison
- [ ] Social media image quality improvements (Canvas + AI hybrid)
- [ ] Email integration (Resend — order confirmation, dashboard links, revision notifications)
- [ ] Stripe payments (3-tier pricing: $29/$49/$99)
- [ ] Landing page improvements
- [ ] Production deployment and monitoring

### Out of Scope

- Real-time collaboration — Not needed for single-user order flow
- Mobile native app — Web-first, responsive design sufficient
- User accounts/authentication for customers — Token-based access is simpler and sufficient
- Multi-language support — English-only for v1
- AI chat assistant — Separate feature, not core to logo generation

## Context

### Technical Environment
- Next.js 15 full-stack monolith on Vercel
- MySQL (TiDB Cloud) via Prisma ORM
- Serverless-compatible (Puppeteer with @sparticuz/chromium)
- Multiple AI providers with pluggable architecture

### Current State
- ~92% complete — core flow works end-to-end
- Main gaps: PDF polish, payments, email, production hardening
- Cost per order: ~$0.008 currently, target $0.50-1.75 with upgrades

### Prior Work
- 8+ development sessions since March 14, 2026
- Mockup API system fully built and working
- Typography system complete with font embedding
- Two-phase workflow stabilized

## Constraints

- **Deployment**: Must run on Vercel serverless (10s function timeout Hobby, 60s Pro)
- **Database**: MySQL on TiDB Cloud (via DATABASE_URL)
- **Cost**: Keep per-order cost under $2 (product sells for $20-100+)
- **Compatibility**: Serverless-compatible PDF generation (no long-running processes)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| jsPDF for PDF generation | Lightweight, serverless-compatible | ✓ Good — works but limited styling |
| Puppeteer for PDF (new) | Better HTML/CSS rendering for brand guides | — Pending — needs Railway hosting |
| Token-based customer access | Simpler than full user auth system | ✓ Good — sufficient for v1 |
| Canvas for social/mockups | Zero cost, works in browser | ✓ Good — quality could improve |
| Dynamic Mockups as primary mockup API | Best free tier, PSD template support | ✓ Good — working in production |
| Multiple AI providers | Flexibility, cost optimization | ✓ Good — easy to switch/compare |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after initialization*
