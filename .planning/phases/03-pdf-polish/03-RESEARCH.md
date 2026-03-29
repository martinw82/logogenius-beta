# Research: Phase 3 — PDF Brand Guide Polish

**Date:** 2026-03-28
**Phase Goal:** Professional-quality PDF brand guide with proper typography, colors, and guidelines.

## Current State

**Existing PDF generator:** `src/lib/services/pdf-generator.ts` (766 lines)

Already has:
- Cover page with logo and business name
- Basic table of contents
- Color palette section (small swatches, hex only)
- Typography section (font names listed, no specimens)
- Mockup embedding (inline, not full-bleed)
- Basic do/don't rules (text-only)

**What needs to change:**
1. Cover page: Full brand color fill, hero logo, offset layout, detailed footer
2. Do/don't cards: Visual examples in grid (5+ do's, 4 don'ts)
3. Mockup gallery: Full-width per mockup, detailed captions, include API mockups
4. All 12 sections: Cover, TOC, Brand Story, Brand Identity, Logo, Logo Guidelines, Color Palette, Typography, Imagery Style, Brand Voice, Mockup Gallery, Back Cover

## Key Decisions (from CONTEXT.md)

- Cover: brand color fill, hero logo, offset layout, detailed footer
- Do/don't: visual examples, 5+ do's, 4 don'ts, grid cards
- Mockups: full-width, canvas + API, detailed captions
- Sections: all 12 sections in scope

## Implementation Approach

**Option A: Upgrade existing jsPDF generator**
- Pros: Keeps serverless-compatible, no new dependencies
- Cons: jsPDF has limited layout capabilities, complex to achieve agency-quality

**Option B: HTML template → jsPDF rendering**
- Pros: Better styling control, closer to wireframe design
- Cons: Requires HTML-to-PDF conversion, may need Puppeteer (Phase 4)

**Recommended:** Option A — upgrade jsPDF directly. The existing 766-line generator already has the structure. Refactor sections into modular functions, improve visual design within jsPDF's capabilities.

## Key Files

- `src/lib/services/pdf-generator.ts` — Main generator (766 lines, needs refactor)
- `src/lib/services/pdf-helpers.ts` — Helper functions
- `src/lib/services/pdf-data-transformer.ts` — Data transformation
- `docs/PDF_REQUIREMENTS_TEMPLATE.md` — Detailed wireframe with page layouts
- `prisma/schema.prisma` — Order/OrderDetail data model

## Color Computation

Need to compute RGB and CMYK from HEX values:
- RGB: Parse hex → R, G, B (0-255)
- CMYK: Convert RGB → CMYK formulas
  - C = 1 - R/255, M = 1 - G/255, Y = 1 - B/255
  - K = min(C, M, Y)
  - C = (C - K) / (1 - K), etc.

---

*Research complete: 2026-03-28*
