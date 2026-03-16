# LogoGenius Quality Improvements Roadmap

**Date:** March 15, 2026 (Updated end of session)
**Status:** Phase 1 Complete, Phase 2 Next
**Goal:** Transform from "working prototype" to "professional product worth $20-100+"

---

## Current State Summary

| Feature | Status | Quality Level |
|---------|--------|---------------|
| Logo Generation (4 variants) | Working | Basic (Together AI - cheap but adequate) |
| Canvas Mockups (12 total) | Working | **Needs upgrade** - flat/basic look |
| Social Media Assets (10) | Working | **Needs upgrade** - basic Canvas overlays |
| PDF Brand Guide | Working | **Needs polish** - wireframe ready |
| Two-Phase Workflow | Working | Good - logos then selection then socials |
| Typography System | Working | Good - 26 fonts + custom upload |
| AI Text Quality | Improved | Post-processing added, better prompts |

**Cost per order:** $0.008 | **Budget per order:** $1-2 (product sells $20-100+)

---

## Phase 1: Bug Fixes & Quick Wins - DONE

| Task | Status | Notes |
|------|--------|-------|
| PDF layout redesign | Done | Branded cover, TOC, swatches, do/don't cards, page numbers |
| Fix repetitive AI text | Done | Post-processing strips banned phrases |
| Re-enable Tier 3 templates | Done | colorPalette bug fixed, try-catch wrapping |
| Prisma import fixes | Done | getPrisma() used everywhere |
| Two-phase workflow debug | Done | Finalize endpoint stabilized |

---

## Phase 2: Mockup & Social Quality - NEXT UP

### The Big Problem
Current mockups look "generated" - flat Canvas shapes with basic colors. For a product selling at $20-100+, customers expect **photo-realistic, agency-quality output**.

### The Solution: Specialist Compositing APIs

**Key insight:** We can afford $1-2 per order in API costs. The mockups and social images are where the perceived value lives. This is worth investing in.

### 2.1 Photo-Realistic Product Mockups

**Goal:** Logo placed realistically on actual product photos (UGC style)

**Current approach (Canvas):** Flat colored shapes - NOT good enough
**Target approach:** Real photo with logo composited onto product surface

#### APIs to Research

| API | Type | Quality | Est. Cost | Notes |
|-----|------|---------|-----------|-------|
| **Placeit API** | Template-based mockup | High | $0.10-0.50/img | Huge template library, proven quality |
| **Mediamodifier API** | Template-based mockup | High | $0.10-0.30/img | Good API, lots of templates |
| **Smartmockups API** | Template-based mockup | High | Similar | Alternative to Placeit |
| **Dynamic Mockups** | Template-based | High | Pay per use | API-first approach |
| **AI Compositing (ControlNet)** | AI inpainting | Very High | $0.05-0.20/img | Needs logo as input, composites onto scene |
| **Stable Diffusion + IP-Adapter** | AI compositing | High | Self-hosted | Can take logo and place on product |

#### What "Realistic Logo Placement" Actually Needs
1. Take the **actual PNG logo** (not a description of it)
2. Place it on a **real product photo** (t-shirt, mug, tote bag, signage, etc.)
3. Apply **perspective transformation** to match product surface angle
4. Apply **lighting/shadow** to look natural
5. Output a **photo-quality result**

#### Research TODO
- [ ] Sign up for Placeit API and test with sample logo
- [ ] Test Mediamodifier API
- [ ] Research ControlNet/IP-Adapter for logo compositing
- [ ] Compare quality vs cost across options
- [ ] Determine if any API supports batch processing

#### Target Mockup Set (Per Order)
| Mockup | Method | Notes |
|--------|--------|-------|
| Business Card | Canvas (improved) | Good enough with shadows/texture |
| Letterhead | Canvas (improved) | Good enough with proper layout |
| T-Shirt | **API/AI compositing** | Needs photo-real quality |
| Coffee Mug | **API/AI compositing** | NEW - adds perceived value |
| Tote Bag | **API/AI compositing** | NEW - adds perceived value |
| Storefront/Signage | **API/AI compositing** | NEW - impressive for businesses |

---

### 2.2 Canvas Mockup Improvements (Free)

Even the Canvas mockups can be improved significantly:

**Business Card:**
- Rounded corners with drop shadow
- Paper texture overlay (noise pattern)
- Two-card layout (front + back)
- Accent stripe using brand color

**Letterhead:**
- Paper grain background
- Gradient header bar with logo
- Sample letter text with proper hierarchy
- Footer with contact details
- Faint watermark logo at 5% opacity

---

### 2.3 Social Media Quality Upgrade

#### Canvas Templates (7 platforms - Free)
Improve all with:
- Multi-stop gradients using brand colors
- Subtle geometric pattern overlays
- Better text layout with proper padding
- Platform-appropriate styling
- Consistent design language

| Platform | Key Improvements |
|----------|-----------------|
| Instagram Story | Vertical gradient, swipe-up CTA pill, logo upper third |
| Facebook Cover | Asymmetric layout, profile photo safe zone |
| Twitter/X Header | Clean horizontal strip, geometric accent |
| LinkedIn Banner | Corporate clean, subtle grid pattern |
| Pinterest Pin | Vertical layout, text card with brand bg |
| TikTok Cover | Dark background, neon glow effect |
| Email Header | Lightweight, logo left + name right |

#### AI-Generated Social Images (3 platforms - ~$0.009)
| Platform | Why AI? |
|----------|---------|
| Instagram Post | Hero image - needs to look stunning |
| YouTube Thumbnail | Click-worthy - needs professional design |
| Website Hero | First impression - needs to look premium |

---

### 2.4 Integration Plan

**Phase 1 flow (unchanged):**
Generate 4 logos + Canvas mockups for all variants → Admin selects variant

**Phase 2 flow (enhanced):**
1. Canvas social templates (7 platforms) - improved quality
2. AI social templates (3 platforms) - NEW
3. AI photo mockups (3-6 products) - NEW
4. PDF brand guide
5. ZIP package

---

## Phase 3: PDF Final Polish (Deferred)

- Wireframe created at `docs/PDF_REQUIREMENTS_TEMPLATE.md`
- Source real brand deck examples to decompose
- Rebuild page by page to professional standard
- 4-6 hours estimated

---

## Phase 4: Logo Quality Upgrade

| Provider | Model | Quality | Cost/Logo |
|----------|-------|---------|-----------|
| Together AI (current) | FLUX.1 Schnell | Basic | $0.001 |
| Google Imagen 3 | Imagen 3 | Excellent | ~$0.03 |
| Replicate FLUX.1 Pro | FLUX.1 Pro | Excellent | ~$0.05 |

**Decision:** Test both Google and Replicate, pick winner. Budget supports either.

---

## Phase 5: Email + Payments + Launch

| Task | Effort | Status |
|------|--------|--------|
| Resend email integration | 1-2 hrs | Pending |
| Stripe checkout (3 tiers) | 4-6 hrs | Pending |
| Landing page polish | 2-3 hrs | Pending |
| E2E testing | 3-4 hrs | Pending |
| Production deployment | 1-2 hrs | Pending |

---

## Cost Analysis (Target)

| Component | Current | Target | Notes |
|-----------|---------|--------|-------|
| Logos (4) | $0.004 | $0.12-0.20 | Better model |
| Canvas mockups (2-3) | $0 | $0 | Improved free |
| Photo mockups (3-6) | N/A | $0.30-1.50 | Specialist API |
| Canvas social (7) | $0 | $0 | Improved free |
| AI social (3) | N/A | $0.009 | Together AI |
| Brand text | $0.004 | $0.004 | Together AI |
| **Total** | **$0.008** | **$0.50-1.75** | **Worth it** |

**Revenue per order:** $20-100+ | **API cost:** $0.50-1.75 | **Margin:** 92-99%

---

## Research Checklist

- [ ] **Placeit API** - Sign up, test logo placement quality, check batch support
- [ ] **Mediamodifier API** - Compare with Placeit
- [ ] **ControlNet/IP-Adapter** - Can it composite a specific logo onto product photos?
- [ ] **ComfyUI API services** - Any hosted ComfyUI APIs that do logo compositing?
- [ ] **Google Imagen 3** - Test logo generation quality
- [ ] **FLUX.1 Pro** - Test logo generation quality
- [ ] **Resend** - Quick setup for email delivery

---

**Last Updated:** March 15, 2026 (end of session)
**Next Session Priority:** Research mockup compositing APIs, then implement best option
