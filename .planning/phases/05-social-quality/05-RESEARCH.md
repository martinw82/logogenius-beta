# Phase 5: Social Media Quality - Research

**Researched:** 2026-03-29
**Status:** Ready for planning

## Key Finding

The 7 Canvas social templates already have gradient backgrounds and decorative elements. Phase 5 is a **visual upgrade** — brand fonts, richer accents, platform-specific layouts, and proportional typography. No new platforms or architectural changes.

## What Already Exists

### useClientSocialGenerator.ts (855 lines)
- 7 Canvas render functions (one per platform)
- Each function: creates gradient → adds decorative elements → draws logo → adds text
- `renderSocialAsset()` dispatches by platform via switch statement
- `generateAndUploadSocialAssets()` batches rendering + uploads to server

### Current Template Quality Assessment

| Platform | Current State | Upgrade Needed |
|----------|--------------|----------------|
| Instagram Story (1080×1920) | Multi-stop gradient, radial glow, frosted pill, CTA | Best template — minor polish |
| Facebook Cover (820×312) | Horizontal gradient, geometric divider, dot pattern | Logo too small, needs safe zone |
| Twitter Header (1500×500) | Gradient, geometric accent shapes | Good base, needs more accents |
| LinkedIn Banner (1584×396) | Gradient, grid lines, accent triangle | Most basic — needs significant upgrade |
| Pinterest Pin (1000×1500) | Two-section layout, cross pattern, CTA pill | Good structure, needs typography upgrade |
| TikTok Cover (1080×1920) | Dark gradient, neon glows, corner brackets, handle | Strong aesthetic, needs font upgrade |
| Email Header (600×200) | White background, minimal — logo + divider + text | Too plain — needs gradient + accents |

### Font Loading (NOT implemented)
- Current: All text uses `sans-serif` (system font)
- Available in order data: `fontHeadings`, `fontBody` — NOT passed to social generator
- Canvas font loading: `document.fonts.load()` → wait → use in Canvas
- Google Fonts CSS: `<link>` or `@import` → wait for `document.fonts.ready`

### Helper Functions Available
- `hexToRgb()`, `lightenHex()`, `isLightColor()`
- `drawLogo()`, `roundedRect()`
- `drawDiagonalLines()`, `drawDotPattern()`

### Helper Functions NEEDED
- `drawFrostedPill()` — frosted glass container for text
- `drawOrganicCurve()` — bezier curve accents
- `drawGeometricShape()` — triangles, hexagons, diamonds
- `loadBrandFonts()` — Google Fonts loader for Canvas
- `scaleFontSize()` — proportional text sizing

## Platform Safe Zones

| Platform | Safe Zone Concern |
|----------|------------------|
| Facebook Cover | Profile photo circle at (16,16) with ~170px diameter. Logo must avoid left ~170px |
| Instagram Story | Top 14% and bottom 20% get cropped by UI. Keep critical content in middle 66% |
| Twitter Header | Bottom-left gets covered by profile photo. Keep important content top/right |
| LinkedIn Banner | Bottom 10% overlapped by profile info. Keep content in top 90% |
| Pinterest Pin | Top 10% may be cropped in feed. Safe content in lower 90% |
| TikTok Cover | Bottom 25% has UI overlay. Keep content in top 75% |
| Email Header | Full canvas is visible — no safe zone issues |

## Proportional Text Sizing

Current fixed sizes (e.g., `bold 58px`, `26px`) don't scale across platforms.

Formula approach:
```
const baseSize = Math.round(Math.min(width, height) * 0.05);
const headlineSize = baseSize;
const taglineSize = Math.round(baseSize * 0.45);
const accentSize = Math.round(baseSize * 0.35);
```

Per-platform overrides may be needed for extreme aspect ratios (email header 600×200).

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Font loading race condition | Canvas renders before font loads | Wait for `document.fonts.ready` before first render |
| Performance regression | 7 templates × font loading = slow | Pre-load fonts once, reuse across all templates |
| Facebook safe zone conflicts | Logo placement clashes with edge-to-edge directive | Prioritize safe zone over edge-to-edge for this platform only |
| Email header too small | Rich accents don't fit 600×200 | Simplified treatment for compact platforms |

---

*Research completed: 2026-03-29*
