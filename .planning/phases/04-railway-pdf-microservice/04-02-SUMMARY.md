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
  added: [vercel.json]
  patterns: [puppeteer-fallback-chain, timing-logs]
key_files:
  modified:
    - src/lib/services/order-processor.ts
    - vercel.json
  reviewed:
    - src/lib/services/pdf-generator-puppeteer.ts
    - src/lib/services/pdf-data-transformer.ts
    - src/app/api/orders/[id]/finalize/route.ts
    - src/app/api/orders/[id]/generate/route.ts
    - package.json
decisions:
  - vercel.json maxDuration: 60s finalize, 120s generate (Puppeteer needs headroom)
  - Keep puppeteer-core ^21.0.0 and @sparticuz/chromium ^119.0.0 (working, upgrade risk not justified)
  - Railway microservice deferred as unnecessary (Vercel Pro sufficient)
---

# Phase 04 Plan 04-02: End-to-End Puppeteer Integration Validation Summary

**One-liner:** Reviewed order-processor Puppeteer integration, verified error handling and browser cleanup, added timing logs and vercel.json, created full order flow test checklist, assessed Vercel production readiness.

---

## Integration Review Findings

### Order-Processor Puppeteer Flow (Lines 222-306)

The integration is well-architected with proper fallback chain:

```
1. Check USE_PUPPETEER_PDF env var (line 222)
2. Load brand assets - archetype-based (line 226)
3. Transform order data → PuppeteerPDFData (line 236)
4. Dynamic import + generateBrandGuidePDFPuppeteer() (lines 253-255)
   └── On failure → catch → fall through to jsPDF (line 258)
5. jsPDF fallback if Puppeteer not enabled or failed (line 265)
   └── On failure → catch → throw (line 304)
```

**Verified via whitespace analysis (`cat -A`):** `getRandomBrandAssets()`, `transformOrderDataToPDFData()`, and `generateBrandGuidePDFPuppeteer()` are all INSIDE the try block (8-space indent vs 6-space try keyword). The fallback chain is correctly structured.

### Error Handling Assessment

| Scenario | Handling | Status |
|----------|----------|--------|
| Puppeteer env var not set | Falls to jsPDF (line 265) | ✓ Correct |
| Brand assets fail to load | Caught by try/catch, falls to jsPDF | ✓ Correct |
| Template rendering throws | Caught by try/catch, falls to jsPDF | ✓ Correct |
| Puppeteer browser crash | `finally` block closes browser | ✓ Correct |
| jsPDF also fails | Throws error to caller (line 306) | ✓ Correct |
| Both generators fail | Error propagates to finalize route | ✓ Correct |

### Browser Cleanup Verification

**`generateBrandGuidePDFPuppeteer()`** (pdf-generator-puppeteer.ts:453-489):

```typescript
const browser = await launchBrowser(options.headless !== false);
try {
  const page = await browser.newPage();
  const html = await generateHTML(data, options);
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(500);
  const pdfBuffer = await page.pdf({ ... });
  return pdfBuffer;
} finally {
  await browser.close();  // ✓ Always closes
}
```

**Also verified:**
- `generateCoverPagePDF()` (lines 494-551): Same try/finally pattern with `browser.close()`
- `launchBrowser()` (lines 399-444): Two paths (local CHROMIUM_PATH + Vercel @sparticuz/chromium), both return browser correctly

**Verdict:** Browser is properly closed in `finally` block. No leaked Chrome processes possible.

### Data Transformer Review

`pdf-data-transformer.ts` handles missing data gracefully:
- Missing fields → empty strings (line 188-200)
- Missing colors → defaults `#2563eb`, `#1e40af`, `#f59e0b` (lines 123-131)
- Missing fonts → defaults to `Inter` (lines 169-170)
- guide_* prefix fields checked first, then raw field, then fallback (lines 188-200)

### API Route Integration

**`/api/orders/[id]/finalize/route.ts`:**
- Calls `processOrderAssets()` at line 115
- Checks `result.success && result.pdfPath` (line 121)
- Verifies PDF in database after generation (line 133-152)
- Sets status to `ready_for_review` on success, `generation_failed` on failure
- Error handling: catches PDF errors, continues to status update

**Verdict:** Finalize route correctly consumes the order-processor output.

---

## Fixes Applied

### 1. Timing Logs Added (Previous Execution)

Added millisecond timing + output size logging to both PDF generation paths:

**Puppeteer path (order-processor.ts:254-257):**
```
[{orderId}] Puppeteer PDF generated in {N}ms ({X}KB)
```

**jsPDF fallback path (order-processor.ts:302-303):**
```
[{orderId}] jsPDF generated in {N}ms ({X}KB)
```

**Commit:** `734af28` — `fix(04-02): add PDF generation timing logs to order-processor`

### 2. Vercel Function Timeout Config (This Execution)

Created `vercel.json` with function maxDuration settings:

```json
{
  "functions": {
    "src/app/api/orders/[id]/finalize/route.ts": { "maxDuration": 60 },
    "src/app/api/orders/[id]/generate/route.ts": { "maxDuration": 120 }
  }
}
```

- **Finalize route (60s):** Puppeteer PDF generation + ZIP packaging. Local time ~2.5s, Vercel cold start adds ~3-5s. 60s provides ample headroom even on Pro plan.
- **Generate route (120s):** Logo generation (Together AI) + mockups + brand guide. Multiple AI calls can take 30-60s total. 120s covers worst case.

**Commit:** `1fba119` — `chore(04-02): add vercel.json with function timeout config`

---

## Full Order Flow Test Checklist

### Prerequisites

- [ ] Node.js upgraded to 18.18.0+ (currently 18.16.0 — **BLOCKER** for `npm run dev`)
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

### Step 6: Isolated PDF Test (No Full Order Flow)

- [ ] Test endpoint: `POST /api/test/pdf-generation` with `{ "generatePdf": true }`
- [ ] **Expected:** Returns HTML preview + PDF base64
- [ ] **Note:** Requires dev server running (Node.js 18.18.0+)
- [ ] **Alternative:** Use standalone script `scripts/test-puppeteer.mjs` (bypasses Next.js)

### Step 7: Fallback Test

- [ ] Set `USE_PUPPETEER_PDF=false` in `.env.local`
- [ ] Repeat Steps 2-5 for a new order
- [ ] **Expected:** jsPDF generates PDF (lower visual quality but functional)
- [ ] **Check server logs for:** `jsPDF generated in {N}ms ({X}KB)`

---

## Vercel Production Readiness Assessment

### Package Versions (Verified Against Installed)

| Package | package.json | Installed | Status |
|---------|-------------|-----------|--------|
| `puppeteer-core` | `^21.0.0` | `21.11.0` | ⚠️ Old but functional |
| `@sparticuz/chromium` | `^119.0.0` | `119.0.2` | ⚠️ Old but functional |
| `handlebars` | `^4.7.8` | `^4.7.8` | ✓ Current |

**Decision: Keep current versions.** Both packages work correctly (verified in 04-01). Upgrading introduces risk of breaking changes. The `@sparticuz/chromium` v119 matches Chrome 119, which is compatible with puppeteer-core v21. Upgrade only if Vercel deployment fails.

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

**Verdict:** Vercel path is properly configured. `--disable-gpu` filtering is critical and correctly implemented.

### Known Vercel Limitations

| Limitation | Hobby Plan | Pro Plan | Mitigation |
|------------|-----------|----------|------------|
| Function timeout | 10s | 60s | PDF gen ~2.5s locally; Vercel cold start adds ~3-5s. **Hobby: tight. Pro: safe.** |
| Memory limit | 1024MB | 3008MB | Chrome uses ~200-400MB. **OK on both plans.** |
| Cold start | ~3-5s | ~3-5s | @sparticuz/chromium caches binary in /tmp. First request slow, subsequent fast. |
| /tmp storage | 512MB | 512MB | Chrome binary ~130MB. **OK.** |
| Bundle size | 50MB | 50MB | @sparticuz/chromium is ~50MB. Consider serverless function optimization. |

### Deployment Checklist

- [x] Create `vercel.json` with function maxDuration (done — `1fba119`)
- [ ] Upgrade to Next.js 15 compatible Node.js version (18.18.0+) for local dev
- [ ] Add `USE_PUPPETEER_PDF=true` to Vercel environment variables
- [ ] DO NOT set `CHROMIUM_PATH` on Vercel — @sparticuz/chromium auto-detects
- [ ] Test on Vercel preview deployment first
- [ ] Monitor cold start times in Vercel logs
- [ ] Verify PDF quality matches local output
- [ ] Verify jsPDF fallback works if Puppeteer fails on Vercel

### vercel.json (Created)

```json
{
  "functions": {
    "src/app/api/orders/[id]/finalize/route.ts": { "maxDuration": 60 },
    "src/app/api/orders/[id]/generate/route.ts": { "maxDuration": 120 }
  }
}
```

### Railway Microservice Assessment

**Conclusion: NOT NEEDED for current use case.**

- PDF generation takes ~2.5s locally, expected ~5-8s on Vercel (including cold start)
- Vercel Pro plan (60s timeout) provides ample headroom with vercel.json config
- @sparticuz/chromium handles the Chrome binary elegantly in serverless
- jsPDF fallback provides safety net if Puppeteer fails
- Railway adds infrastructure complexity (deployment, networking, CORS, auth)

**Recommendation:** Deploy to Vercel first. Only consider Railway if:
1. Vercel function timeouts become a real issue (unlikely with 60s Pro)
2. PDF generation volume exceeds Vercel's concurrent function limits
3. Custom Chrome flags or extensions are needed

---

## Deviations from Plan

### Deviation: Previous Execution Already Completed Tasks 1-3

**Found during:** Initial git status check
**Issue:** Commits `734af28` and `a5e2fba` from a previous execution already addressed Tasks 1-3 (timing logs, SUMMARY with test checklist).
**Fix:** Verified all findings, corrected package version info (puppeteer-core is 21.11.0 not 24.39.1), added vercel.json creation (deployment checklist item missed by previous execution), updated SUMMARY with complete data.
**Impact:** No code regressions. Additional vercel.json is net-new production readiness improvement.

---

## Known Stubs

None — all reviewed code contains real implementations. No placeholder text, TODO comments blocking functionality, or hardcoded empty values found.

---

## Commits

| Hash | Message | Task |
|------|---------|------|
| `734af28` | `fix(04-02): add PDF generation timing logs to order-processor` | Task 2 (previous) |
| `1fba119` | `chore(04-02): add vercel.json with function timeout config` | Task 2 (this execution) |

---

## Self-Check: PASSED

- [✓] `src/lib/services/order-processor.ts` — modified with timing logs (verified via `cat -A`)
- [✓] `src/lib/services/pdf-generator-puppeteer.ts` — reviewed, browser cleanup verified in finally block
- [✓] `src/lib/services/pdf-data-transformer.ts` — reviewed, data flow and fallbacks verified
- [✓] `src/app/api/orders/[id]/finalize/route.ts` — reviewed, integration confirmed
- [✓] `src/app/api/orders/[id]/generate/route.ts` — reviewed, full order flow understood
- [✓] `vercel.json` — created with function timeout config
- [✓] Commit `734af28` exists in git log
- [✓] Commit `1fba119` exists in git log
