# Phase 4: Railway PDF Microservice - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Validate that the existing Puppeteer PDF generator works end-to-end via the full order flow (order creation → finalization → PDF → ZIP). Optimize local development workflow and confirm Vercel production deployment works with @sparticuz/chromium. Railway microservice deferred as optional future enhancement.

</domain>

<decisions>
## Implementation Decisions

### Service architecture
- **D-01:** Local-first approach — test existing Puppeteer setup before building new infrastructure
- **D-02:** Railway microservice deferred to optional phase — only needed if Vercel production has reliability issues
- **D-03:** Separate repo preferred for Railway if/when built — keeps Next.js app lean

### Vercel production
- **D-04:** Use @sparticuz/chromium for Vercel serverless (already configured in pdf-generator-puppeteer.ts)
- **D-05:** Accept cold start latency (~5-10s for Chrome download on first invocation)
- **D-06:** Fallback to jsPDF if Puppeteer fails (existing behavior in order-processor.ts)

### Testing approach
- **D-07:** Full order flow test — create order → generate logos → admin finalize → Puppeteer PDF → ZIP
- **D-08:** Visual quality review of PDF output — verify layout, fonts, colors, sections look professional
- **D-09:** Test endpoint available at `/api/test/pdf-generation` with `generatePdf: true`

### Cold start & reliability
- **D-10:** Retry strategy with loading screen for user-facing calls
- **D-11:** Consider Railway "always-on" plan ($5/mo) if production needs sub-10s PDF generation
- **D-12:** Health check endpoint: `GET /health` (for Railway if/when built)

### KiloCode's Discretion
- Exact retry count and backoff strategy
- How to surface PDF generation progress to users
- Whether to add PDF generation time logging
- How to handle Chrome crash recovery

</decisions>

<canonical_refs>
## Canonical References

### Existing PDF code
- `src/lib/services/pdf-generator-puppeteer.ts` — Puppeteer PDF generator (573 lines, complete)
- `src/lib/services/pdf-generator.ts` — jsPDF fallback generator (766 lines)
- `src/lib/services/pdf-helpers.ts` — Handlebars helpers
- `src/lib/services/pdf-data-transformer.ts` — Order data → PDF data transformation
- `src/lib/services/font-loader.ts` — Google Fonts + custom font loading
- `src/lib/services/brand-assets.ts` — Archetype-based visual asset packs

### Templates and assets
- `templates/pdf/layouts/main.hbs` — Master layout with full CSS (1128 lines)
- `templates/pdf/pages/` — 14 page templates (cover, toc, colors, typography, etc.)
- `assets/` — 50 SVG files across 6 archetype packs (inlined as data URIs)

### Order integration
- `src/lib/services/order-processor.ts` — PDF generation during finalization (line 222-303)
- `src/app/api/orders/[id]/finalize/route.ts` — Triggers PDF generation
- `src/app/api/test/pdf-generation/route.ts` — Test endpoint for Puppeteer PDF

### Research docs
- `.planning/research/ARCHITECTURE.md` — Railway microservice architecture plan
- `.planning/research/PITFALLS.md` — Known pitfalls (cold start, CORS, memory, version drift)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `pdf-generator-puppeteer.ts` — Complete Puppeteer implementation with local + serverless Chrome support
- `pdf-data-transformer.ts` — Transforms order data into PuppeteerPDFData interface
- 15 Handlebars templates — Already polished in Phase 3
- SVG assets inlined as data URIs — No filesystem dependency for rendering

### Established Patterns
- `USE_PUPPETEER_PDF=true` env var switches between Puppeteer and jsPDF
- `CHROMIUM_PATH` env var for local Chrome binary
- @sparticuz/chromium auto-downloads Chrome on Vercel/serverless
- Graceful fallback: Puppeteer fails → jsPDF (existing in order-processor.ts)

### Integration Points
- `order-processor.ts` line 222 — `USE_PUPPETEER_PDF` check
- `order-processor.ts` line 253 — Dynamic import of pdf-generator-puppeteer
- `order-processor.ts` line 254 — `generateBrandGuidePDFPuppeteer(pdfData)` call
- Test endpoint: `POST /api/test/pdf-generation` with `generatePdf: true`

</code_context>

<specifics>
## Specific Ideas

- Test with `CHROMIUM_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe` on Windows
- Set `USE_PUPPETEER_PDF=true` in `.env.local` for testing
- Visual quality comparison: Puppeteer PDF vs jsPDF output side by side
- Railway service: separate repo, Dockerfile with @sparticuz/chromium, Express REST endpoint
- If Vercel production works reliably, Railway becomes truly optional

</specifics>

<deferred>
## Deferred Ideas

- Railway microservice (separate repo) — if Vercel production has timeout/reliability issues
- PDF generation progress streaming (SSE) — future enhancement
- PDF caching (same order data → same PDF) — optimization
- Multi-page PDF preview in browser before download — UX enhancement

</deferred>

---

*Phase: 04-railway-pdf-microservice*
*Context gathered: 2026-03-29*
