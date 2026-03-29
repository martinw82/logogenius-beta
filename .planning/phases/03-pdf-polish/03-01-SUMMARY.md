---
phase: 03-pdf-polish
plan: 03-01
subsystem: ui
tags: [pdf, handlebars, templates, typography, css, cover-page, toc]

# Dependency graph
requires:
  - phase: 02-email-notifications
    provides: email service infrastructure
provides:
  - Polished global layout CSS with improved typography scale and spacing
  - Redesigned cover page with offset magazine-spread layout
  - Table of contents with CSS dotted leader lines
  - Dedicated brand-story, brand-identity, imagery page templates
  - Updated pdf-generator-puppeteer.ts to use new templates
  - Handlebars 'split' helper for comma-separated values
affects: [04-railway-pdf-service]

# Tech tracking
tech-stack:
  added: []
  patterns: [handlebars-dedicated-templates, css-grid-cover-layout, toc-dotted-leaders]

key-files:
  created:
    - templates/pdf/pages/brand-story.hbs
    - templates/pdf/pages/brand-identity.hbs
    - templates/pdf/pages/imagery.hbs
  modified:
    - templates/pdf/layouts/main.hbs
    - templates/pdf/pages/cover.hbs
    - templates/pdf/pages/toc.hbs
    - src/lib/services/pdf-generator-puppeteer.ts
    - src/lib/services/pdf-helpers.ts

key-decisions:
  - "Replaced generic section.hbs with dedicated brand-story, brand-identity, imagery templates for richer page-specific layouts"
  - "Merged graphic-elements section into imagery template — no need for a separate page"
  - "Used CSS Grid for cover page offset layout instead of absolute positioning — cleaner responsive behavior"
  - "Added toc-leader element with flex-grow + border-bottom for dotted leader lines"

patterns-established:
  - "Dedicated template pattern: Create a specific .hbs template when a section needs unique layout instead of reusing the generic section.hbs"
  - "CSS dotted leaders: Use flex-grow element with border-bottom between title and page number"

requirements-completed: [PDF-01, PDF-02]

# Metrics
duration: 15min
completed: 2026-03-28
---

# Phase 03 Plan 01: PDF Template Polish Summary

**Upgraded Handlebars PDF templates with offset cover layout, dotted-leader TOC, and dedicated page templates for brand-story, brand-identity, and imagery sections**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-28T20:22:17Z
- **Completed:** 2026-03-28T20:37:00Z
- **Tasks:** 4
- **Files modified:** 8

## Accomplishments
- Polished global CSS layout: larger typography scale (h1 40-72px), wider accent bars, generous spacing
- Redesigned cover page: CSS Grid offset layout with logo upper-left, business name lower-right, detailed footer row
- Upgraded TOC with CSS dotted leader lines between section titles and page numbers
- Created 3 new dedicated page templates (brand-story, brand-identity, imagery) and wired them into the generator

## Task Commits

Each task was committed atomically:

1. **Task 1: Polish global layout and design tokens** - `ceebd9d` (feat)
2. **Task 2: Redesign cover page template** - `0553812` (feat)
3. **Task 3: Upgrade table of contents with dotted leaders** - `61dd6ab` (feat)
4. **Task 4: Add missing page templates** - `340cdb9` (feat)

## Files Created/Modified
- `templates/pdf/layouts/main.hbs` — Global CSS: typography scale, section headings, swatches, mockup gallery, do/don't cards, page header/footer, callout, section dividers, cover page CSS Grid layout, TOC dotted leaders
- `templates/pdf/pages/cover.hbs` — Redesigned with offset layout: logo upper-left, name lower-right, "Brand Guidelines" label with decorative line, detailed footer (date/email/version/confidential)
- `templates/pdf/pages/toc.hbs` — 10 numbered sections with CSS dotted leader lines between title and page number
- `templates/pdf/pages/brand-story.hbs` — NEW: Project overview with mission callout, target audience, industry
- `templates/pdf/pages/brand-identity.hbs` — NEW: Brand identity with archetype card, brand pillars grid, visual standards
- `templates/pdf/pages/imagery.hbs` — NEW: Photography direction grid (lighting/composition/color/mood), graphic elements
- `src/lib/services/pdf-generator-puppeteer.ts` — loadTemplates() updated with new templates; generateHTML() uses dedicated templates for brand-story, brand-identity, imagery pages
- `src/lib/services/pdf-helpers.ts` — Added 'split' Handlebars helper for comma-separated values

## Decisions Made
- Replaced generic section.hbs with dedicated templates for brand-story, brand-identity, and imagery — richer page-specific layouts
- Merged graphic-elements section into imagery template — no separate page needed
- Used CSS Grid for cover page instead of absolute positioning — cleaner, more maintainable layout
- Added toc-leader element with flex-grow + border-bottom for CSS dotted leader lines

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Templates polished and ready for Railway Puppeteer PDF rendering (Phase 04)
- All 12 wireframe sections have dedicated templates
- Cover page matches wireframe offset design decisions

---
*Phase: 03-pdf-polish*
*Completed: 2026-03-28*

## Self-Check: PASSED

- [x] SUMMARY.md exists at `.planning/phases/03-pdf-polish/03-01-SUMMARY.md`
- [x] 4 task commits present: ceebd9d, 0553812, 61dd6ab, 340cdb9
- [x] All created files exist on disk: brand-story.hbs, brand-identity.hbs, imagery.hbs
- [x] All modified files present: main.hbs, cover.hbs, toc.hbs, pdf-generator-puppeteer.ts, pdf-helpers.ts
- [x] ROADMAP.md updated (phase 03: 1/3 plans complete, In Progress)
