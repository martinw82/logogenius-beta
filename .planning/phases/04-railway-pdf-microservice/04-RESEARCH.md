# Phase 4: Railway PDF Microservice - Research

**Researched:** 2026-03-29
**Status:** Ready for planning

## Key Finding

The Puppeteer PDF generator already exists and is complete (`pdf-generator-puppeteer.ts`, 573 lines). Phase 4 is **validation and integration**, not new development.

## What Already Exists

### pdf-generator-puppeteer.ts (573 lines)
- `launchBrowser()` — Two paths: local (CHROMIUM_PATH) and Vercel (@sparticuz/chromium)
- `generateBrandGuidePDFPuppeteer()` — Main entry: opens browser, renders templates, generates PDF
- `generateCoverPagePDF()` — Cover-only PDF
- `getHTMLPreview()` — HTML output for debugging
- `saveHTMLPreview()` — Save HTML to disk

### Templates (15 files)
- `templates/pdf/layouts/main.hbs` — Master layout (1128 lines of CSS + HTML structure)
- `templates/pdf/pages/` — 14 page templates (cover, toc, colors, typography, logo-showcase, mockups, dos-donts, brand-voice, brand-story, brand-identity, imagery, section, section-divider, back-cover)

### Supporting Services
- `pdf-helpers.ts` — Handlebars helpers (hexToRgb, contrastColor, formatDate, etc.)
- `pdf-data-transformer.ts` — Transforms order data → PuppeteerPDFData interface
- `font-loader.ts` — Google Fonts URL generation, custom font loading, @font-face CSS
- `brand-assets.ts` — Archetype-based SVG asset packs (6 groups, 50 SVGs inlined as data URIs)

### Integration (Already Wired)
- `order-processor.ts` line 222: `if (process.env.USE_PUPPETEER_PDF === 'true')`
- `order-processor.ts` line 253: Dynamic import of `pdf-generator-puppeteer`
- `order-processor.ts` line 254: `generateBrandGuidePDFPuppeteer(pdfData)`
- Graceful fallback to jsPDF on Puppeteer failure (line 257)

### Test Endpoint
- `POST /api/test/pdf-generation` with `generatePdf: true`
- Accepts: businessName, archetype, colors, fonts, logoSvg, mockups, brandAssets
- Returns: HTML preview + PDF base64

## Environment Variables Needed

| Variable | Value | Purpose |
|----------|-------|---------|
| `CHROMIUM_PATH` | `C:\Program Files\Google\Chrome\Application\chrome.exe` | Local Chrome binary |
| `USE_PUPPETEER_PDF` | `true` | Enable Puppeteer in order-processor |

## Verified Working

- Local Chrome launches successfully (tested 2026-03-29)
- Basic PDF generation produces 36KB test PDF
- puppeteer-core v24.39.1 installed
- Chrome path: `C:\Program Files\Google\Chrome\Application\chrome.exe`

## Vercel Production

- `@sparticuz/chromium` already configured in package.json
- Auto-downloads Chrome binary to `/tmp` on cold start
- Known issue: ~50MB download on first invocation per instance
- `LD_LIBRARY_PATH` set for Amazon Linux 2 NSS libs

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cold start latency (Vercel) | PDF takes 10-30s first time | Show loading state, consider Railway always-on later |
| Chrome crash during render | PDF generation fails | Existing fallback to jsPDF (already wired) |
| Large images in PDF | Timeout on Vercel | Images are inlined as data URIs, no filesystem reads |
| Font loading fails | PDF renders with fallback fonts | @sparticuz/chromium includes basic fonts |

## Railway (Deferred)

If needed later:
- Separate repo preferred
- Dockerfile with @sparticuz/chromium
- Express REST endpoint accepting JSON + returning PDF buffer
- Health check at GET /health
- "Always-on" plan ($5/mo) to avoid cold starts
