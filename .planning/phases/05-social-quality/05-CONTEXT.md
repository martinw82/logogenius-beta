# Phase 5: Social Media Quality - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the 10 social media Canvas templates to professional quality. Templates are rendered client-side using HTML5 Canvas via `src/hooks/useClientSocialGenerator.ts` (855 lines). 7 Canvas-rendered platforms + 3 AI-generated platforms.

No new platforms. No new features. Quality improvement only.
</domain>

<decisions>
## Implementation Decisions

### Visual Richness

- **D-01:** Simple gradient backgrounds — 2-3 color stops, smooth transitions. Clean and readable. No mesh/blob effects or noise textures.
- **D-02:** Rich visual density — multiple decorative elements layered (geometric shapes, patterns, glows). Not minimal.
- **D-03:** Logo-dominant layouts — logo is the hero element, large and centered/prominent. Business name is secondary.
- **D-04:** Edge-to-edge layout — content extends to canvas edges with minimal padding. Full-bleed feel.

### Typography Treatment

- **D-05:** Brand fonts — use the brand's chosen fonts (from order data) when available. Fallback to web fonts loaded via Canvas.
- **D-06:** Three-tier hierarchy — bold large business name, medium tagline, light accent text (e.g., URL, CTA, or tagline secondary).
- **D-07:** Contained text — frosted glass pill/container behind text blocks for readability on gradient backgrounds.
- **D-08:** Proportional text sizing — scale text relative to canvas dimensions, not fixed pixel sizes.

### Cross-Platform Consistency

- **D-09:** Platform-specific layouts — each of the 10 platforms gets its own unique optimized layout. Not a one-size-fits-all approach.
- **D-10:** Adaptive placement — logo placement varies by platform (left on banners, centered on stories, prominent on thumbnails).
- **D-11:** Respect platform safe zones — account for Facebook profile photo overlay, Instagram Story crop areas, etc.
- **D-12:** 10 unique layouts — one optimized layout per platform, sharing only colors, fonts, and design language.

### Accent Elements

- **D-13:** Mixed accent style — geometric shapes (lines, grids, angular dividers) AND organic elements (curves, circles, soft shapes). Style varies by platform.
- **D-14:** Moderate accent density — 3-4 decorative accents per template. Noticeable but not overwhelming.
- **D-15:** Full color usage — all 3 brand colors (primary, secondary, accent) used prominently throughout. Each has a distinct role.
- **D-16:** Clean gradients — no grain/noise textures. Smooth, clean gradient transitions only.

### KiloCode's Discretion

- Exact accent element types per platform
- Specific frosted glass opacity values
- Gradient angle/direction per platform
- Font loading strategy (preload vs lazy)
- Error handling when brand font fails to load
</decisions>

<canonical_refs>
## Canonical References

### Existing Social Code
- `src/hooks/useClientSocialGenerator.ts` — 855 lines, Canvas social template generator
- `src/hooks/useClientMockupGenerator.ts` — Canvas mockup generator (reference for patterns)

### Platform Specs
| Platform | Dimensions | Aspect | Current Status |
|----------|-----------|--------|----------------|
| Instagram Story | 1080×1920 | Portrait | Canvas — has gradients, glows, patterns |
| Facebook Cover | 820×312 | Landscape | Canvas — has gradients, geometric shapes |
| Twitter Header | 1500×500 | Landscape | Canvas — has gradients, geometric accents |
| LinkedIn Banner | 1584×396 | Landscape | Canvas — has gradients |
| Pinterest Pin | 1000×1500 | Portrait | Canvas — has gradients |
| TikTok Cover | 1080×1920 | Portrait | Canvas — has gradients |
| Email Header | 600×200 | Compact | Canvas — has gradients |
| Instagram Post | 1080×1080 | Square | AI-generated (server-side) |
| YouTube Thumbnail | 1280×720 | Landscape | AI-generated (server-side) |
| Website Hero | 1920×1080 | Landscape | AI-generated (server-side) |

### Design Patterns Already Used
- Multi-stop linear gradients
- Radial glows (behind logo area)
- Diagonal lines (3% opacity)
- Dot patterns (3% opacity)
- Geometric dividers (angled shapes)
- Frosted glass pills (tagline containers)
- Gradient accent bars (bottom edges)
- Chevron arrows (CTA elements)
</canonical_refs>

<code_context>
## Existing Code Insights

### Template Structure
Each platform has a dedicated render function:
- `drawInstagramStory()` — lines 228-310
- `drawFacebookCover()` — lines 312-363
- `drawTwitterHeader()` — lines 365-399+
- `drawLinkedInBanner()` — further in file
- `drawPinterestPin()` — further in file
- `drawTikTokCover()` — further in file
- `drawEmailHeader()` — further in file

### Helper Functions Available
- `hexToRgb()` — hex to RGB conversion
- `lightenHex()` — lighten a hex color by percentage
- `isLightColor()` — check if color is light (for contrast)
- `drawLogo()` — draw logo with fallback
- `roundedRect()` — draw rounded rectangle
- `drawDiagonalLines()` — diagonal line pattern
- `drawDotPattern()` — dot grid pattern

### Font Loading
Currently uses system fonts only (`sans-serif`). No web font loading implemented. Brand fonts from order data are available in `options` but not used in Canvas rendering.

### Data Available
`SocialAssetOptions` interface provides:
- `logoUrl: string`
- `businessName: string`
- `tagline?: string`
- `primaryColor: string`
- `secondaryColor: string`
- `accentColor?: string`

Note: Font names from order data are NOT currently passed to social generator. May need to extend the interface.
</code_context>

<specifics>
## Specific Ideas

- Load Google Fonts via `document.fonts.load()` before Canvas rendering
- Extend `SocialAssetOptions` to include `fontHeadings` and `fontBody` from order data
- Create reusable accent element functions (geometric shapes, organic curves)
- Platform-specific safe zone overlays (Facebook profile photo circle, Instagram Story crop guides)
- Proportional text sizing: `const fontSize = Math.round(canvas.width * 0.05)`
- Frosted glass effect: semi-transparent white fill with rounded corners

</specifics>

<deferred>
## Deferred Ideas

- Animation/video social templates
- A/B testing template variants
- User-customizable template layouts
- Additional platforms (Snapchat, Threads, etc.)
- AI-powered layout optimization

</deferred>

---

*Phase: 05-social-quality*
*Context gathered: 2026-03-29*
