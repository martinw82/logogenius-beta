# Mockup API Research - March 2026

## Goal
Find an API that takes a **PNG logo file** and composites it onto **photo-realistic product mockups** (t-shirts, mugs, tote bags, signage, etc.) — pixel-perfect placement, not AI-described approximations.

---

## Market Status

| Service | API Available? | Status |
|---------|---------------|--------|
| Smartmockups | NO | Shut down Sept 2024, absorbed into Canva |
| Placeit (Envato) | NO | Web-only, no API |
| MockupMark | NO | No API |
| Mockey AI | NO | No API |
| ControlNet/IP-Adapter | NOT SUITABLE | AI reinterprets the logo, doesn't faithfully composite |

---

## Five Real Contenders

| | SudoMock | Dynamic Mockups | Mockuuups Studio | Mediamodifier | Artificial Studio |
|---|---|---|---|---|---|
| **API Type** | REST | REST + SDKs (JS, Python) | REST | REST | REST (async) |
| **Accepts Logo PNG** | Yes | Yes | Yes | Yes | Yes |
| **Templates** | BYO PSD | **100K+ built-in** + BYO PSD | 5,000+ built-in | 3,600+ built-in | AI-generated (unlimited) |
| **Per-Render Cost** | **$0.002** | ~$0.05 | ~$0.04 | ~$0.10 | ~$0.06 |
| **Monthly Plan** | Credit packs | From $49/mo (API) | ~$20/mo | $499/mo (5K renders) | From $12 (1K credits) |
| **Free Tier** | 500 credits | **50 credits** ⚠️ | 50 credits | 100 renders | Limited |
| **Logo Fidelity** | Pixel-perfect | Pixel-perfect | Pixel-perfect | Pixel-perfect | Variable (AI) |
| **Render Speed** | <1s | <1s | Fast | Fast | Slower |

---

## Recommendation for LogoGenius

### Primary: Dynamic Mockups ($49/mo API)
- **100K+ built-in templates** — no need to source PSDs
- JS SDK for easy Next.js integration
- $0.05/render = ~$0.15 for 3 product mockups per order
- **50 free credits only** (not 1,000 as previously documented) ⚠️
- Direct e-commerce integrations (Shopify, Etsy)

### Scale option: SudoMock ($0.002/render)
- 25-50x cheaper per render
- Requires sourcing your own PSD templates
- 500 free credits to test
- Use for high-volume once templates are dialed in

### Avoid: Artificial Studio
- AI-generated = inconsistent logo rendering
- Not pixel-perfect — customers expect exact logo placement

---

## Cost Impact for LogoGenius

| Approach | Cost per order (3 mockups) | Monthly cost (100 orders) |
|----------|--------------------------|--------------------------|
| Current (AI-described, Together AI) | $0.009 | $0.90 |
| **Dynamic Mockups (recommended)** | $0.15 + $49/mo | $64 |
| SudoMock (scale option) | $0.006 | $0.60 |
| Mediamodifier (enterprise) | $0.30 + $499/mo | $529 |

**Dynamic Mockups at ~$0.15/order + $49/mo base is well within budget** for a product selling at $20-100+. The quality jump from "AI-described logo on product" to "pixel-perfect logo composited on photo-realistic product" is significant.

---

## Integration Plan

### Phase 1: Test Dynamic Mockups (1-2 hours)
1. Sign up at dynamicmockups.com
2. Use 50 free credits
3. Test with a sample logo PNG → t-shirt, mug, tote bag
4. Evaluate quality

### Phase 2: Integrate (3-4 hours)
1. Install Dynamic Mockups JS SDK
2. Create `src/lib/services/mockup-api-generator.ts`
3. Select 3-5 best templates per product type
4. Replace AI-described mockups with API-composited mockups
5. Fallback to current AI mockups if API fails

### Phase 3: Template Curation (ongoing)
1. Browse template library
2. Select best templates for each product type
3. Add more product types (phone case, hoodie, signage, packaging)
4. A/B test which mockup styles customers prefer

---

## Implementation Status (March 17, 2026)

### What's Been Built

A full **3-provider switchable mockup system** has been implemented, mirroring the image-generation provider pattern:

| Component | File | Status |
|-----------|------|--------|
| Provider abstraction | `src/lib/services/mockup-generation.ts` | Done |
| Smart fallback routing | `src/lib/services/ai-mockup-generator.ts` | Done |
| Base64-to-URL bridge | `src/lib/services/image-hosting.ts` | Done |
| Temp image serving | `src/app/api/serve-image/[id]/route.ts` | Done |
| Test endpoint | `src/app/api/test/mockup-generation/route.ts` | Done |
| Order processor wiring | `src/lib/services/order-processor.ts` | Done |

### Providers Implemented

| Provider | Env Var | Base64 Strategy | Status |
|----------|---------|-----------------|--------|
| **Dynamic Mockups** | `DYNAMIC_MOCKUPS_API_KEY` | FormData binary upload (no hosting needed) | Ready |
| **MockupsJar** | `MOCKUPSJAR_API_KEY` | imgbb upload or local temp serve | Ready |
| **MockCity** | `MOCKCITY_API_KEY` | imgbb upload or local temp serve | Ready |

### Additional Providers Researched (Not Implemented)

| Provider | Why Not |
|----------|---------|
| Mockey AI | No API available |
| SudoMock | Good for future self-hosted option, not needed for LogoGenius MVP |

### How It Works

```
1. Order processor gets selected logo (base64 data URL from database)
2. Passes logoUrl to generateAIMockups()
3. Smart routing checks: is a mockup API key configured?
   YES → Try real mockup API:
     - Dynamic Mockups: decode base64 → Buffer → FormData binary upload
     - MockupsJar/MockCity: upload to imgbb or local temp → pass public URL
   NO → Fall back to AI-generated product photography (Together AI)
4. Results stored as base64 data URLs in OrderDetail
```

### Dynamic Mockups API Response Format

**Important:** The API returns the image URL at a nested path:

```json
{
  "success": true,
  "data": {
    "export_path": "https://app-dynamicmockups-psd-engine-production.s3.eu-central-1.amazonaws.com/...",
    "export_label": null
  },
  "message": ""
}
```

**Extract the URL from:** `response.data.export_path`

NOT from `response.url` or `response.image_url` as you might expect.

---

### What Still Needs Doing

- [x] Sign up for Dynamic Mockups (**50 free credits only**) — https://dynamicmockups.com
- [x] Browse template library and copy mockup_uuid + smart_object_uuid for t-shirt, mug, tote bag
- [x] Populate template UUIDs in `mockup-generation.ts`
- [x] Fix API response parsing (use `data.data.export_path`)
- [x] Test end-to-end with a real logo ✅ **WORKING!**
- [ ] Optionally sign up for MockupsJar (100 free/month) — https://mockupsjar.com/api
- [ ] Optionally get imgbb API key (free) — https://api.imgbb.com/
- [ ] Compare quality across providers
- [ ] Consider SudoMock for future self-hosted high-volume use

---

**Last Updated:** March 17, 2026
**Status:** Implementation complete, awaiting API key signup and template configuration
