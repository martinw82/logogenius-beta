---
phase: 04-railway-pdf-microservice
plan: 04-02
subsystem: pdf-generation
tags: [puppeteer, pdf, integration, vercel, production-readiness]
dependency_graph:
  requires: [04-01]
  provides: [puppeteer-integration-validation]
  affects: [order-processor, pdf-generation-pipeline]
tech_stack:
  added: []
  patterns: [puppeteer-fallback-chain, timing-logs]
key_files:
  modified:
    - src/lib/services/order-processor.ts
  reviewed:
    - src/lib/services/pdf-generator-puppeteer.ts
    - src/lib/services/pdf-data-transformer.ts
    - src/app/api/orders/[id]/finalize/route.ts
    - src/app/api/orders/[id]/generate/route.ts
    - package.json
decisions: []
---

# Phase 04 Plan 04-02: Puppeteer PDF Integration Validation Summary

## One-Liner

End-to-end Puppeteer PDF integration review: order-processor flow verified, timing logs added, test checklist created, Vercel production readiness assessed.

---

## Integration Review Findings

### Order-Processor Puppeteer Flow (Lines 222-306)

The integration is well-architected with proper fallback chain:

```
1. Check USE_PUPPETEER_PDF env var
2. Load brand assets (archetype-based)
3. Transform order data → PuppeteerPDFData
4. Generate PDF with Puppeteer
   └── On failure → catch → fall through to jsPDF
5. jsPDF fallback (if Puppeteer disabled or failed)
   └── On failure → catch → throw (propagates to caller)
```

### Error Handling Assessment

| Scenario | Handling | Status |
|----------|----------|--------|
| Puppeteer env var not set | Falls to jsPDF | ✓ Correct |
| Brand assets fail to load | Caught by try/catch, falls to jsPDF | ✓ Correct |
| Template rendering throws | Caught by try/catch, falls to jsPDF | ✓ Correct |
| Puppeteer browser crash | `finally` block closes browser | ✓ Correct |
| jsPDF also fails | Throws error to caller | ✓ Correct |
| Both generators fail | Error propagates to finalize route | ✓ Correct |

### Browser Cleanup Verification

**`generateBrandGuidePDFPuppeteer()`** (pdf-generator-puppeteer.ts:453-489):

```typescript
const browser = await launchBrowser();
try {
  // ... PDF generation
  return pdfBuffer;
} finally {
  await browser.close();  // ✓ Always closes
}
```

**Verdict:** Browser is properly closed in `finally` block. No leaked Chrome processes possible.

---

## Fixes Applied

### Timing Logs Added

Added millisecond timing + output size logging to both PDF generation paths:

**Puppeteer path (order-processor.ts:254):**
```
[{orderId}] Puppeteer PDF generated in {N}ms ({X}KB)
```

**jsPDF fallback path (order-processor.ts:303):**
```
[{orderId}] jsPDF generated in {N}ms ({X}KB)
```

**Commit:** `fix(04-02): add PDF generation timing logs to order-processor`

---

## Full Order Flow Test Checklist

### Prerequisites

- [ ] Node.js upgraded to 18.18.0+ (currently 18.16.0 — BLOCKER)
- [ ] Database running and accessible
- [ ] `.env.local` configured: `TOGETHER_API_KEY`, `USE_PUPPETEER_PDF=true`, `CHROMIUM_PATH`
- [ ] Dev server running: `npm run dev`

### Step 1: Create Test Order

- [ ] Log in to admin panel at `http://localhost:9002/admin`
- [ ] Create a new order with test customer email
- [ ] Fill out brand form: business name, industry, keywords, archetype
- [ ] **Expected:** Order created with status `pending`

### Step 2: Trigger Logo Generation

- [ ] From admin panel, click "Generate Logos" for the test order
- [ ] **API call:** `POST /api/orders/{id}/generate`
- [ ] **Expected:** 
  - 4 logo variants generated (~5s)
  - 3 mockups generated (letterhead, business card, t-shirt)
  - Brand guide sections generated
  - Status changes to `awaiting_selection`
- [ ] **Verify in DB:** `logoUrl_0` through `logoUrl_3` in `OrderDetail`

### Step 3: Admin Selects Logo & Finalizes

- [ ] In admin panel, preview all 4 logo variants
- [ ] Select preferred variant (e.g., variant 2)
- [ ] Click "Finalize Order"
- [ ] **API call:** `POST /api/orders/{id}/finalize` with `{ selectedVariant: 2 }`
- [ ] **Expected:**
  - Social assets generated client-side (if tier 3)
  - PDF generated via Puppeteer (check server logs for timing)
  - ZIP packaged with all assets
  - Status changes to `ready_for_review`
- [ ] **Check server logs for:** `Puppeteer PDF generated in {N}ms ({X}KB)`

### Step 4: Verify ZIP Contents

- [ ] Download ZIP from admin panel or dashboard
- [ ] Extract and verify contents:
  - [ ] `brand-guide.pdf` — present and non-zero size
  - [ ] Logo SVG/PNG files — 4 variants
  - [ ] Mockup images — letterhead, business card, t-shirt
  - [ ] Social media assets (if tier 3)
  - [ ] `README.md` — brand summary

### Step 5: Visual PDF Review

- [ ] Open `brand-guide.pdf` in a PDF viewer
- [ ] Verify all 12 sections render correctly:
  1. [ ] Cover page — business name, tagline, archetype badge
  2. [ ] Brand Story — project overview text
  3. [ ] Brand Identity — identity & voice content
  4. [ ] Logo Showcase — logo SVG rendered, philosophy text
  5. [ ] Color Palette — color swatches with hex codes
  6. [ ] Color Accessibility — WCAG compliance info
  7. [ ] Typography — font specimens
  8. [ ] Imagery — style and graphic elements
  9. [ ] Brand Voice — tone and visual style guide
  10. [ ] Do's & Don'ts — usage rules
  11. [ ] Web3 (if applicable) — blockchain section
  12. [ ] Appendix — additional info
- [ ] Check: archetype-based textures and accents applied
- [ ] Check: mockup images embedded in relevant sections
- [ ] Check: no broken images or missing text

### Step 6: Fallback Test

- [ ] Set `USE_PUPPETEER_PDF=false` in `.env.local`
- [ ] Repeat Steps 2-5 for a new order
- [ ] **Expected:** jsPDF generates PDF (lower visual quality but functional)
- [ ] **Check server logs for:** `jsPDF generated in {N}ms ({X}KB)`

---

## Vercel Production Readiness Assessment

### Package Versions (package.json)

| Package | Current Version | Recommended | Status |
|---------|----------------|-------------|--------|
| `puppeteer-core` | `^21.0.0` | `^24.0.0` | ⚠️ Outdated |
| `@sparticuz/chromium` | `^119.0.0` | `^130.0.0` | ⚠️ Outdated |
| `handlebars` | `^4.7.8` | `^4.7.8` | ✓ Current |

**Note:** Local testing used puppeteer-core v24.39.1 (via direct install), but package.json specifies `^21.0.0`. The lockfile may resolve to a newer version. Should update the minimum version constraint.

### Vercel Serverless Path Review (pdf-generator-puppeteer.ts:421-444)

```typescript
// ✓ Correct: Uses @sparticuz/chromium for binary download + /tmp caching
const chromium = (await import('@sparticuz/chromium')).default;
const executablePath = await chromium.executablePath();

// ✓ Correct: Filters out --disable-gpu (blocks Page.printToPDF)
const args = chromium.args.filter(a => a !== '--disable-gpu');

// ✓ Correct: LD_LIBRARY_PATH for Amazon Linux 2 NSS libs
process.env.LD_LIBRARY_PATH = `/usr/lib64:/lib64:${existingLdPath}`;

// ✓ Correct: Uses new headless mode (puppeteer-core v21+)
headless: true
```

**Verdict:** Vercel path is properly configured.

### Known Vercel Limitations

| Limitation | Hobby Plan | Pro Plan | Mitigation |
|------------|-----------|----------|------------|
| Function timeout | 10s | 60s | PDF gen ~2.5s locally; Vercel cold start adds ~3-5s. **Hobby plan may be tight.** |
| Memory limit | 1024MB | 3008MB | Chrome uses ~200-400MB. **OK on both plans.** |
| Cold start | ~3-5s | ~3-5s | @sparticuz/chromium caches binary in /tmp. First request slow, subsequent fast. |
| /tmp storage | 512MB | 512MB | Chrome binary ~130MB. **OK.** |
| Bundle size | 50MB | 50MB | @sparticuz/chromium is ~50MB. **Use external package or serverless function.** |

### Deployment Checklist

- [ ] Upgrade to Next.js 15 compatible Node.js version (18.18.0+)
- [ ] Update `puppeteer-core` minimum to `^24.0.0` in package.json
- [ ] Update `@sparticuz/chromium` minimum to `^130.0.0` in package.json
- [ ] Add `USE_PUPPETEER_PDF=true` to Vercel environment variables
- [ ] Add `CHROMIUM_PATH` to Vercel environment variables (if needed — @sparticuz auto-detects)
- [ ] Set function maxDuration to 60s in `vercel.json` for finalize route
- [ ] Test on Vercel preview deployment first
- [ ] Monitor cold start times in Vercel logs
- [ ] Verify PDF quality matches local output
- [ ] Set up fallback: if Puppeteer fails on Vercel, jsPDF takes over

### vercel.json Function Config (Recommended)

```json
{
  "functions": {
    "src/app/api/orders/[id]/finalize/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### Railway Microservice Assessment

**Conclusion: NOT NEEDED for current use case.**

- PDF generation takes ~2.5s locally, expected ~5-8s on Vercel (including cold start)
- Vercel Pro plan (60s timeout) provides ample headroom
- @sparticuz/chromium handles the Chrome binary elegantly
- jsPDF fallback provides safety net if Puppeteer fails
- Railway adds infrastructure complexity (deployment, networking, CORS, auth)

**Recommendation:** Deploy to Vercel first. Only consider Railway if:
1. Vercel function timeouts become a real issue (unlikely with 60s Pro)
2. PDF generation volume exceeds Vercel's concurrent function limits
3. Custom Chrome flags or extensions are needed

---

## Deviations from Plan

None — plan executed as written.

---

## Commits

| Hash | Message |
|------|---------|
| `734af28` | `fix(04-02): add PDF generation timing logs to order-processor` |

---

## Self-Check: PASSED

- [✓] `src/lib/services/order-processor.ts` — modified with timing logs
- [✓] `src/lib/services/pdf-generator-puppeteer.ts` — reviewed, browser cleanup verified
- [✓] `src/lib/services/pdf-data-transformer.ts` — reviewed, data flow verified
- [✓] `src/app/api/orders/[id]/finalize/route.ts` — reviewed, integration confirmed
- [✓] Commit `734af28` exists in git log
