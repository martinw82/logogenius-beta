# Session Summary - March 18, 2026 (Prompt Lab v2 - Anti-Pattern)

**Status:** Completed

## ✅ Problem Identified

Generated logos were producing **repeating patterns/wallpapers** instead of single clean marks:
- Phrases like "Professional logo design" triggered Pinterest/Dribbble showcase dataset bias
- No quantity constraints allowed scattered elements
- Missing anti-pattern language to prevent tessellation
- Paragraph format not optimal for SD/Flux models

## ✅ Solution Implemented

### 1. Updated Prompt Templates (SD/Flux Optimized)

**OLD (Paragraph style):**
```
Professional logo design for "{businessName}"...
VISUAL DIRECTION: Modern Minimalist...
KEY ATTRIBUTES: {keywords}...
```

**NEW (Comma-separated with anti-pattern):**
```
Single isolated minimalist logomark for {industry} company, 
{elementCount} {graphicMotif} arranged in {arrangement}, 
centered composition with generous white space on all sides, 
isolated on {backgroundType} background, 
not a pattern, not repeating, not tessellated, not scattered, one cohesive symbol only, 
{colors} solid flat colors, no gradients, no shadows, 
2D vector graphic style, crisp clean edges, perfect symmetry, 
{styleReference} aesthetic, Paul Rand inspired, 
{industry} sector, {keywords}, 
app icon design, favicon style, centered logomark, 
corporate identity symbol, timeless emblem
```

### 2. New Form Fields Added

**Composition Control Section:**
- **Element Count:** Single shape / 2 overlapping forms / 3 geometric elements
- **Arrangement:** Centered / Vertically stacked / Enclosed circle / Left-to-right / Pyramid
- **Graphic Motif:** Abstract geometric / Nature-inspired / Letter-based / Tech circuit / Interlocking shapes / Continuous line / Ascending triangles
- **Background Type:** Pure white / Transparent black / Solid color block

**Style Reference Dropdown:**
- Swiss International Style
- Paul Rand
- Y2K Tech
- Art Deco
- Brutalist
- Mid-Century Modern
- Bauhaus

### 3. Negative Prompt Support

**Default Negative Prompt:**
```
text, words, letters, typography, font, watermark, signature, 
mockup, 3d render, drop shadow, gradient, 
multiple logos, collage, business cards, letterhead, scattered objects, 
pattern, repeating, tessellation, wallpaper, textile, all-over print,
photography, photorealistic texture, blurry, busy composition,
many shapes, scattered elements, random placement
```

- Toggle to enable/disable
- Editable textarea
- Reset to default button
- Passed to Together AI API

### 4. Educational UI

**Alert Box with Tips:**
- Why "single" and "not a pattern" are crucial
- Why SD struggles with text (recommend "icon only")
- How "app icon" and "favicon" keywords help
- Comma-separated format works better than paragraphs

## Files Modified

| File | Changes |
|------|---------|
| `src/app/test/api-test/PromptLabTab.tsx` | Complete rewrite with new templates, fields, negative prompt support |
| `src/app/api/test/single-generation/route.ts` | Pass negativePrompt to generateImage |
| `PROJECT_STATUS.md` | Updated Prompt Lab documentation |

## Key Prompt Engineering Principles Applied

1. **Quantity Locking:** Always "Single", "One", "Exactly N"
2. **Anti-Pattern:** Explicitly forbid "pattern, repeating, tessellated, scattered"
3. **Isolation:** "Isolated on [color] background", "floating", "surrounded by white space"
4. **Format Keywords:** "App icon", "favicon", "vector graphic", "2D flat"
5. **Comma-Separated:** SD models parse comma-separated better than paragraphs
6. **Negative Prompts:** Essential for blocking unwanted elements

## Testing Checklist

Before finalizing a template, verify:
- [ ] **One** central graphic element (not 6 business cards)
- [ ] Solid color blocks (not gradients/3D lighting)
- [ ] Readable at 128x128 thumbnail
- [ ] Background is uniform (not "studio floor" texture)
- [ ] No repeating patterns or tessellation

## Expected Results

With these changes, logos should now be:
- ✅ Single centered logo (not repeating patterns)
- ✅ Clean isolated graphic (not showcase montages)
- ✅ Solid flat colors (not gradients/3D)
- ✅ No text garbling (when "icon only" selected)

## Next Steps

1. Test the new templates with various industries
2. Iterate on the anti-pattern language based on results
3. Consider upgrading to FLUX.1 for even better adherence
4. Apply winning templates to production logo-prompt-builder.ts

---

*Last Updated: 2026-03-18 03:00 UTC*
