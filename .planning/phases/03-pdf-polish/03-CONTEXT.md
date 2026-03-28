# Phase 3: PDF Brand Guide Polish - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Upgrade the existing jsPDF-based PDF brand guide to agency-quality output. The PDF must look like it came from a professional design studio. Covers the visual design of all 12 sections — does NOT include the Railway microservice migration (that's Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Cover page style
- **D-01:** Full brand color fill background (primary brand color as full-bleed)
- **D-02:** Large/hero-sized logo treatment — dominates the cover
- **D-03:** Offset layout — logo positioned left/top, business name + tagline right/bottom
- **D-04:** Detailed footer — date, client email, version number, "Confidential" label

### Logo do/don't cards
- **D-05:** Visual examples (not text-only) — show correct and incorrect logo usage graphically
- **D-06:** 5+ "Do" examples (solid background, clear space, approved colors, proper scaling, dark/light variants)
- **D-07:** 4 "Don't" examples (stretch, rotate, recolor, add effects)
- **D-08:** Grid of mini cards layout — each example in its own card, arranged in a grid

### Mockup gallery layout
- **D-09:** Full-width per mockup — each mockup gets its own section with generous spacing
- **D-10:** Include ALL available mockups — canvas (business card, letterhead, t-shirt) + API mockups (photo-realistic) if available
- **D-11:** Detailed captions — use case description, placement guidelines under each mockup

### Section completeness
- **D-12:** All 12 sections in scope:
  1. Cover page
  2. Table of contents
  3. Brand story (mission, vision)
  4. Brand identity (archetype, personality)
  5. Logo showcase (full-page)
  6. Logo guidelines (clear space, minimum size, do/don't)
  7. Color palette (primary, secondary, accent with HEX/RGB/CMYK)
  8. Typography (font specimens, hierarchy)
  9. Imagery style (photography/illustration guidelines)
  10. Brand voice (we are / we are not matrix)
  11. Mockup gallery (all available mockups)
  12. Back cover (branded, with contact info)

### KiloCode's Discretion
- Exact font sizes and spacing within sections
- Color computation (RGB/CMYK from HEX) implementation
- jsPDF vs HTML template rendering approach
- How to handle missing data (e.g., no tagline, no brand story)
- Page numbering and TOC generation logic

</decisions>

<specifics>
## Specific Ideas

- Reference: `docs/PDF_REQUIREMENTS_TEMPLATE.md` — detailed wireframe with page-by-page layout
- Goal aesthetic: "Should look like it came from a design agency (Pentagram, Collins, Landor)"
- Magazine-style editorial layout with generous white space
- Color swatches should show HEX, RGB, and CMYK values (compute RGB/CMYK from HEX)

</specifics>

<canonical_refs>
## Canonical References

### PDF wireframe
- `docs/PDF_REQUIREMENTS_TEMPLATE.md` — Full page-by-page wireframe, data extraction map, section layouts

### Existing PDF code
- `src/lib/services/pdf-generator.ts` — Current jsPDF implementation (766 lines)
- `src/lib/services/pdf-generator-puppeteer.ts` — Puppeteer-based alternative (Phase 4)
- `src/lib/services/pdf-helpers.ts` — PDF helper functions
- `src/lib/services/pdf-data-transformer.ts` — Data transformation for PDF

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/services/pdf-generator.ts` — Existing 766-line jsPDF generator with cover, TOC, color, typography, mockup sections
- `src/lib/services/pdf-helpers.ts` — Helper functions for PDF generation
- `src/lib/services/pdf-data-transformer.ts` — Transforms order data into PDF-ready format
- Typography system (26 fonts) already has font embedding capability

### Established Patterns
- jsPDF used for PDF generation (lightweight, serverless-compatible)
- HTML template rendering available via Handlebars (used in pdf-generator-puppeteer.ts)
- Order data available via `getOrderById()` with details, logo variants, mockup paths

### Integration Points
- `src/lib/services/order-processor.ts` — Calls PDF generation during finalization
- `src/app/api/orders/[id]/finalize/route.ts` — Triggers PDF generation

</code_context>

<deferred>
## Deferred Ideas

- Railway microservice migration (Puppeteer-based) — Phase 4
- CMYK/Pantone accurate color matching — requires external color library
- Interactive PDF features (clickable links, embedded video) — not supported by jsPDF
- Multi-language PDF generation — out of scope for v1

</deferred>

---

*Phase: 03-pdf-polish*
*Context gathered: 2026-03-28*
