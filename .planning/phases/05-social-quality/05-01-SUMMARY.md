---
phase: 05-social-quality
plan: 05-01
subsystem: social-templates
tags: [canvas, social-media, gradients, accents, visual-quality]
dependency_graph:
  requires: []
  provides: [SOC-01, SOC-03]
  affects: [social-asset-generation]
tech_stack:
  added: [organic-curves, geometric-accents, accent-helpers]
  patterns: [bezier-curves, polygon-shapes, gradient-backgrounds]
key_files:
  modified:
    - src/hooks/useClientSocialGenerator.ts
decisions:
  - Used bezier curves for organic accents rather than arc-based curves for smoother rendering
  - Moved TikTok @handle to H*0.73 to stay above bottom 25% UI overlay zone
  - Email header kept minimal (no complex accents) due to 600x200 size constraint
  - Facebook Cover logo/text positions already safe (right of 170px profile zone) — added left-side accents only
metrics:
  duration_minutes: ~25
  completed_date: "2026-03-29"
  tasks_completed: 8
  files_modified: 1
  lines_added: ~120
  lines_removed: ~3
---

# Phase 05 Plan 01: Gradient Backgrounds and Brand Color Summary

## One-Liner

Upgraded all 7 Canvas social templates with reusable accent helpers (organic curves + geometric shapes), platform-specific safe zone awareness, and richer gradient layering using all 3 brand colors.

## What Was Built

### Reusable Helper Functions

**`drawOrganicCurve(ctx, x1, y1, cx1, cy1, cx2, cy2, x2, y2, color, opacity, lineWidth)`**
- Draws bezier curve accent lines with configurable opacity and line width
- Uses `hexToRgb()` for consistent color handling
- Used across all 7 templates for flowing decorative accents

**`drawAccentShape(ctx, type, x, y, size, color, opacity)`**
- Draws geometric shapes: `'triangle'`, `'diamond'`, `'hexagon'`, `'circle'`
- Consistent API — single function for all shape types
- Triangle uses equilateral geometry, hexagon uses 6-point polygon

### Per-Template Upgrades

| Template | Accents Added | Safe Zone |
|----------|--------------|-----------|
| **Instagram Story** | 2 organic curves (bottom), 4 diamond shapes (top corners) | Middle 66% (top 14% + bottom 20% avoided) |
| **Facebook Cover** | 3 triangle shapes (left side), 1 organic curve (middle) | Left 170px profile zone respected |
| **Twitter Header** | 3 hexagon shapes (right side), 2 organic curves (bottom edge) | Bottom-left profile photo zone avoided |
| **LinkedIn Banner** | Larger secondary accent block, 2 organic curves (top), 3 diamond shapes | Top 90% (bottom 10% avoided) |
| **Pinterest Pin** | 3 organic curves (upper section), upgraded gradient divider with flanking diamonds | Two-section layout preserved |
| **TikTok Cover** | 4 hexagon neon shapes, 3 organic curves (neon-colored) | Top 75% (bottom 25% UI overlay avoided, @handle moved to H*0.73) |
| **Email Header** | Subtle gradient background (primary 5% → white), 3-color bottom border (accent → secondary → primary) | No complex accents — 600×200 too small |

## Commits

| Hash | Message |
|------|---------|
| `01d7481` | `feat(05-01): create reusable accent helper functions` |
| `99a8371` | `feat(05-01): upgrade Instagram Story gradients and accents` |
| `a587b8f` | `feat(05-01): upgrade Facebook Cover gradients and accents` |
| `7840eba` | `feat(05-01): upgrade Twitter Header gradients and accents` |
| `768092a` | `feat(05-01): upgrade LinkedIn Banner gradients and accents` |
| `6dc67d8` | `feat(05-01): upgrade Pinterest Pin gradients and accents` |
| `a8bfeb5` | `feat(05-01): upgrade TikTok Cover gradients and accents` |
| `8671f62` | `feat(05-01): upgrade Email Header gradients` |

## Deviations from Plan

None — plan executed exactly as written. All 8 tasks completed with all acceptance criteria met.

## Known Stubs

None — all templates have real accent implementations wired to the rendering pipeline.

## Self-Check: PASSED

- All helper functions exist in `src/hooks/useClientSocialGenerator.ts`
- All 7 template functions modified with accent elements
- All 8 commits verified in git log
- TypeScript compilation clean (no errors from modified file)
