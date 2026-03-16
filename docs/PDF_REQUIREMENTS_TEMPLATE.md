# PDF Brand Guide — Requirements & Wireframe

**Status:** Needs upgrade (current version is functional but not agency-quality)
**Priority:** Deferred — address after mockup/social upgrades
**Goal:** Output should look like it came from a design agency (Pentagram, Collins, Landor)

---

## Current Gaps

| Issue | Current State | Target State |
|-------|--------------|--------------|
| Logo display | Small, embedded inline | Full-page logo showcase with clear space diagram |
| Color palette | Small swatches with hex only | Large swatches with HEX, RGB, CMYK, Pantone mapping |
| Typography | Font names listed | Actual type specimens rendered at multiple sizes |
| Mockups | Inline images | Full-bleed gallery with captions |
| Layout | Generic text dump | Magazine-style editorial layout |
| Cover | Colored bar at top | Full-bleed branded cover with logo hero |
| White space | Minimal | Generous, intentional spacing |

---

## Page-by-Page Wireframe

```
┌─────────────────────────────────────┐
│           PAGE 1: COVER             │
│                                     │
│   ┌─────────────────────────────┐   │
│   │    Full brand color fill    │   │
│   │                             │   │
│   │                             │   │
│   │         [ LOGO ]            │   │
│   │       centered, large       │   │
│   │                             │   │
│   │     BUSINESS NAME           │   │
│   │       (36pt bold)           │   │
│   │                             │   │
│   │      "Tagline here"         │   │
│   │       (14pt light)          │   │
│   │                             │   │
│   │  ─── Brand Guidelines ───   │   │
│   │                             │   │
│   │                             │   │
│   │   Date  |  Prepared for     │   │
│   │   Confidential              │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      PAGE 2: TABLE OF CONTENTS      │
│                                     │
│   Contents                          │
│   ════════                          │
│                                     │
│   01 ........ Brand Story           │
│   02 ........ Brand Identity        │
│   03 ........ Logo                  │
│   04 ........ Logo Guidelines       │
│   05 ........ Color Palette         │
│   06 ........ Typography            │
│   07 ........ Imagery Style         │
│   08 ........ Brand Voice           │
│   09 ........ Applications          │
│   10 ........ Do's & Don'ts         │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     PAGE 3: BRAND STORY             │
│                                     │
│   ▌ Brand Story                     │
│                                     │
│   2-3 paragraphs about the          │
│   company, mission, vision.         │
│   Written in brand voice.           │
│                                     │
│   ┌─────────┐                       │
│   │ Callout │  Key mission          │
│   │   Box   │  statement            │
│   └─────────┘  highlighted          │
│                                     │
│   DATA SOURCE:                      │
│   - sections.projectOverview        │
│   - missionStatement field          │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     PAGE 4: BRAND IDENTITY          │
│                                     │
│   ▌ Brand Identity & Voice          │
│                                     │
│   Personality, archetype,           │
│   voice characteristics.            │
│                                     │
│   ┌────────────────────────────┐    │
│   │ Brand Archetype Card       │    │
│   │ ┌──────┐                   │    │
│   │ │ Icon │ THE [ARCHETYPE]   │    │
│   │ └──────┘                   │    │
│   │ Traits: bold, innovative.. │    │
│   └────────────────────────────┘    │
│                                     │
│   DATA SOURCE:                      │
│   - sections.brandIdentity         │
│   - brandArchetype field            │
│   - companyValues field             │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     PAGE 5: LOGO (Full Page)        │
│                                     │
│   ▌ Our Logo                        │
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │                             │   │
│   │         [ LOGO ]            │   │
│   │      Large, centered        │   │
│   │    on white background      │   │
│   │                             │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│   Logo philosophy text (2 para)     │
│                                     │
│   DATA SOURCE:                      │
│   - logo.url (base64 PNG)           │
│   - sections.logoPhilosophy         │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     PAGE 6: LOGO GUIDELINES         │
│                                     │
│   ▌ Logo Usage                      │
│                                     │
│   Clear Space:                      │
│   ┌─────────────────────────┐       │
│   │  ·  ·  ·  ·  ·  ·  ·   │       │
│   │  ·  ┌──────────┐  ·    │       │
│   │  ·  │  LOGO    │  ·    │       │
│   │  ·  └──────────┘  ·    │       │
│   │  ·  ·  ·  ·  ·  ·  ·   │       │
│   └─────────────────────────┘       │
│   "Maintain 1x height clearance"    │
│                                     │
│   Minimum Size:                     │
│   Print: 25mm | Digital: 80px      │
│                                     │
│   ┌──────────┐  ┌──────────┐       │
│   │  ✓ DO    │  │  ✗ DON'T │       │
│   │ Solid bg │  │ Stretch  │       │
│   │ Clear    │  │ Rotate   │       │
│   │ Approved │  │ Recolor  │       │
│   │ colors   │  │ Add fx   │       │
│   └──────────┘  └──────────┘       │
│                                     │
│   DATA SOURCE:                      │
│   - sections.usageRulesAndDonts     │
│   - Logo image for diagram          │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     PAGE 7: COLOR PALETTE           │
│                                     │
│   ▌ Color Palette                   │
│                                     │
│   Primary Colors                    │
│   ┌─────────┐ ┌─────────┐          │
│   │         │ │         │          │
│   │ (large  │ │ (large  │          │
│   │ swatch) │ │ swatch) │          │
│   │         │ │         │          │
│   └─────────┘ └─────────┘          │
│   #2563EB      #1E40AF              │
│   R37 G99 B235 R30 G64 B175        │
│   C84 M58 Y0   C83 M63 Y0 K31     │
│    K8                               │
│                                     │
│   Secondary Colors                  │
│   ┌──────┐ ┌──────┐ ┌──────┐       │
│   │      │ │      │ │      │       │
│   └──────┘ └──────┘ └──────┘       │
│                                     │
│   Accent Colors                     │
│   ┌──────┐ ┌──────┐                 │
│   │      │ │      │                 │
│   └──────┘ └──────┘                 │
│                                     │
│   Usage: 60% Primary / 30% Sec /   │
│          10% Accent                 │
│                                     │
│   DATA SOURCE:                      │
│   - sections.colorPalette.primary   │
│   - sections.colorPalette.secondary │
│   - sections.colorPalette.accent    │
│   - logo.colors (fallback)          │
│   - Compute RGB/CMYK from hex       │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     PAGE 8: TYPOGRAPHY              │
│                                     │
│   ▌ Typography                      │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Selected Fonts              │   │
│   │                             │   │
│   │ Headings: Montserrat Bold   │   │
│   │ Aa Bb Cc Dd 1234567890     │   │
│   │                             │   │
│   │ Body: Inter Regular         │   │
│   │ The quick brown fox jumps   │   │
│   │ over the lazy dog           │   │
│   └─────────────────────────────┘   │
│                                     │
│   Type Hierarchy:                   │
│                                     │
│   H1 Display (36pt)                │
│   H2 Section Title (24pt)          │
│   H3 Subsection (18pt)             │
│   Body text (12pt)                  │
│   Caption (9pt)                     │
│                                     │
│   DATA SOURCE:                      │
│   - fonts.headings.name             │
│   - fonts.body.name                 │
│   - fonts.other.name                │
│   - sections.typography.*           │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     PAGE 9: IMAGERY STYLE           │
│                                     │
│   ▌ Imagery & Photography Style     │
│                                     │
│   Guidelines for visual content:    │
│   - Photography mood/tone           │
│   - Composition rules               │
│   - Color treatment                 │
│   - Illustration style              │
│                                     │
│   DATA SOURCE:                      │
│   - sections.imageryStyle           │
│   - sections.graphicElements        │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     PAGE 10: BRAND VOICE            │
│                                     │
│   ▌ Brand Voice & Tone              │
│                                     │
│   ┌────────────────────────────┐    │
│   │ We are:    │ We are NOT:   │    │
│   │ ─────────  │ ──────────── │    │
│   │ Confident  │ Arrogant     │    │
│   │ Warm       │ Casual       │    │
│   │ Expert     │ Pretentious  │    │
│   └────────────────────────────┘    │
│                                     │
│   Voice guidelines, messaging       │
│   examples, vocabulary guide.       │
│                                     │
│   DATA SOURCE:                      │
│   - sections.brandVoice             │
│   - sections.visualStyleGuide       │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     PAGE 11-12: MOCKUP GALLERY      │
│                                     │
│   ▌ Applications                    │
│                                     │
│   ┌──────────────────────────┐      │
│   │                          │      │
│   │    Business Card Mockup  │      │
│   │    (full width)          │      │
│   │                          │      │
│   └──────────────────────────┘      │
│   Professional networking           │
│                                     │
│   ┌──────────────────────────┐      │
│   │                          │      │
│   │    Letterhead Mockup     │      │
│   │    (full width)          │      │
│   │                          │      │
│   └──────────────────────────┘      │
│   Official correspondence           │
│                                     │
│   ┌──────────────────────────┐      │
│   │                          │      │
│   │    T-Shirt Mockup        │      │
│   │    (full width)          │      │
│   │                          │      │
│   └──────────────────────────┘      │
│   Branded merchandise               │
│                                     │
│   DATA SOURCE:                      │
│   - mockups.businesscard (base64)   │
│   - mockups.letterhead (base64)     │
│   - mockups.tshirt (base64)         │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     PAGE 13: BACK COVER             │
│                                     │
│   ┌─────────────────────────────┐   │
│   │    Full brand color fill    │   │
│   │                             │   │
│   │                             │   │
│   │                             │   │
│   │      BUSINESS NAME          │   │
│   │       "Tagline"             │   │
│   │                             │   │
│   │    v1.0  |  March 2026      │   │
│   │    email@client.com         │   │
│   │                             │   │
│   │                             │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Data Extraction Map

| PDF Section | Data Source Field(s) | Notes |
|-------------|---------------------|-------|
| Cover — Logo | `logo.url` | Base64 PNG from selected LogoVariant.svgData |
| Cover — Name | `businessName` | From OrderDetail |
| Cover — Tagline | `tagline` / `keyTagline` | From OrderDetail |
| Cover — Date | `createdAt` | Generated timestamp |
| Cover — Email | `authorEmail` / `customerEmail` | From Order record |
| Brand Story | `sections.projectOverview` | AI-generated via Together AI |
| Brand Identity | `sections.brandIdentity` | AI-generated |
| Logo Philosophy | `sections.logoPhilosophy` | AI-generated |
| Color Palette | `sections.colorPalette.{primary,secondary,accent}` | Arrays of hex strings; compute RGB/CMYK |
| Color Palette (fallback) | `logo.colors` | From order form color fields |
| Typography — Fonts | `fonts.headings.name`, `fonts.body.name`, `fonts.other.name` | From order form or font upload |
| Typography — Guidelines | `sections.typography.{headings,body,usage}` | AI-generated |
| Imagery Style | `sections.imageryStyle` | AI-generated |
| Graphic Elements | `sections.graphicElements` | AI-generated |
| Brand Voice | `sections.brandVoice` | AI-generated |
| Visual Style | `sections.visualStyleGuide` | AI-generated |
| Usage Rules | `sections.usageRulesAndDonts` | AI-generated |
| Mockups | `mockups.{businesscard,letterhead,tshirt}` | Base64 PNGs from Canvas rendering |
| Web3 (optional) | `sections.web3Section` | Only if web3BlockchainFocus=true |
| Appendix | `sections.appendix` | AI-generated |

---

## Key Improvements Needed

### 1. Logo Showcase Page
- Dedicate a full page to just the logo on white/light background
- Show logo LARGE (at least 60% of page width)
- Include brief philosophy text below

### 2. Color Palette Page
- Swatches should be at least 35×35mm (current: 25×18mm)
- Show color NAME + HEX + RGB + CMYK
- Add visual usage proportion bar (60/30/10)
- Show color combinations (text-on-background examples)

### 3. Typography Specimens
- Render actual alphabet samples ("Aa Bb Cc Dd...")
- Show heading hierarchy with real sizes
- Include font pairing rationale

### 4. Mockup Gallery
- Each mockup gets generous space
- Add captions describing the application
- Consider full-bleed images (edge to edge)

### 5. Editorial Layout Patterns
- Pull quotes / callout boxes for key statements
- Generous margins (25mm instead of 20mm)
- Section divider pages with large section numbers
- Consistent header/footer with page numbers

---

## Reference Examples to Study

Find and decompose these types of brand decks:
- Uber brand guidelines (clean, minimal, grid-based)
- Spotify brand guidelines (bold colors, strong hierarchy)
- Airbnb brand guidelines (warm, editorial, photography-heavy)
- Stripe brand guidelines (precise, technical, well-structured)

Key patterns from professional brand decks:
1. **Section divider pages** — large number + section title, minimal
2. **Full-bleed images** — mockups/photos extend to page edge
3. **Pull quotes** — key brand statements highlighted in large type
4. **Color-on-color** — sections use the brand palette itself
5. **Generous white space** — less content per page, more breathing room
6. **Consistent grid** — 12-column grid underlying all layouts

---

## Implementation Notes

- **jsPDF limitations:** No CSS, no HTML rendering. Everything is manual drawing commands.
- **Fonts:** Limited to Helvetica, Times, Courier unless we embed custom fonts (possible with jsPDF addFont)
- **Images:** Must be base64 encoded PNG/JPEG
- **Performance:** Keep PDF generation under 5 seconds
- **File size:** Target < 5MB for the final PDF

---

*This document will be updated when we source real brand deck examples to decompose.*
