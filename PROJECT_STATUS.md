# LogoGenius Project Status

**Date:** 2026-03-15 (End of Session)
**Branch:** claude/analyze-codebase-plan-g5Vfs
**Status:** Phase 1 Complete - Quality Upgrades Next
**Completion:** ~80% (core product working, quality + polish remaining)

---

## What's Done (Working Now)

### Core Platform
- MySQL database (TiDB Cloud) with all tables
- Admin dashboard with JWT auth, orders list, create/detail/approve/reject
- Customer-facing tier selection, order form, order confirmation
- AI auto-fill (Google Gemini - FREE) from business name + industry
- 5 AI providers supported (Together, Replicate, Fal, Google, Laozhang)

### Logo Generation
- 4 logo variants per order via Together AI ($0.004/order)
- Template-based prompts (deterministic, no AI prompt engineering)
- Provider abstraction - switch via env var

### Mockups (Canvas - Client-Side)
- Business Card (900x500), Letterhead (800x1100), T-Shirt (600x700)
- Generated for all 4 variants (12 mockups total)
- Auto-uploaded to server, $0 cost

### Social Media Assets (Canvas - Tier 3)
- 10 platforms: Instagram Post/Story, Facebook Cover, Twitter Header, LinkedIn Banner, YouTube Thumbnail, Pinterest Pin, TikTok Cover, Email Header, Website Hero
- Generated after logo selection (uses selected variant only)
- Auto-uploaded to server, $0 cost

### Typography System
- 26 curated professional fonts + custom TTF/OTF upload (5MB limit)
- Canvas-based font previews
- PDF font embedding
- Admin font management page

### PDF & Packaging
- PDF brand guide with jsPDF (cover page, TOC, color swatches, typography, mockups)
- ZIP packaging with all assets + README
- Vercel-compatible (/tmp + API route serving)

### Two-Phase Workflow
- Phase 1: Generate 4 logos + 12 mockups (all variants)
- Admin selects preferred logo variant
- Phase 2: Generate social assets + PDF using SELECTED logo only

---

## What's Left To Do

### PRIORITY 1: Mockup & Social Quality Upgrade
**Status:** Planned, not started
**Budget:** $1-2 per order is acceptable (product sells for $20-100+)

The current Canvas mockups and social images are functional but look "generated" - they need to look professional and photo-realistic. This is the single biggest quality gap.

#### Mockups - Need Photorealistic Quality
- **Current:** Basic Canvas shapes with flat colors
- **Goal:** Photo-quality UGC-style mockups with logo placed realistically on real products
- **Approach:** Use specialist 3rd-party mockup/compositing API for final output
- **Research needed:** Find the right API that can composite a logo onto a photo-realistic product shot

**APIs to research:**
| API | What it does | Approx cost |
|-----|-------------|-------------|
| Placeit API | Photo mockups with logo placement | ~$0.10-0.50/mockup |
| Mediamodifier API | Similar, high quality templates | ~$0.10-0.30/mockup |
| Renderforest | Mockup + video | Varies |
| AI image compositing (DALL-E, Midjourney) | Generate product photo with described logo | ~$0.02-0.10/image |
| Custom ComfyUI pipeline | Inpainting/compositing | Self-hosted cost |

**Key question:** Which API gives the best logo-on-product compositing (not just describing it, but actually placing the PNG logo onto a realistic photo)?

#### Social Media Images - Need Professional Quality
- **Current:** Canvas-drawn gradients with logo overlay
- **Goal:** Professional, agency-quality social templates
- **Approach:** Mix of improved Canvas templates (7 platforms) + AI-generated hero images (3 platforms: Instagram Post, YouTube Thumbnail, Website Hero)
- **Cost:** ~$0.009 for 3 AI social images

#### Canvas Improvements (Free)
- Add gradients, shadows, textures to all templates
- Better typography and layout
- Platform-appropriate styling
- Consistent design language across all 10

### PRIORITY 2: PDF Brand Guide Polish
**Status:** Wireframe created at `docs/PDF_REQUIREMENTS_TEMPLATE.md`
- Needs real brand deck examples (Uber, Spotify, Airbnb) to decompose
- Cover page, TOC, color swatches, typography, logo guidelines, do/don't cards
- Estimated: 4-6 hours

### PRIORITY 3: Logo Prompt Optimization
- Make prompts "super tight, super clean"
- Style-specific templates per archetype
- Add negative prompts
- Consider upgrading to Google Imagen 3 (~$0.03/logo) or FLUX.1 (~$0.05/logo)

### PRIORITY 4: Email Integration
- Email templates already exist in code (8 templates)
- Need to integrate Resend (free tier: 100 emails/day)
- Wire up: order confirmation, logo selection link, dashboard access, revision notifications

### PRIORITY 5: Stripe Payments
- 3-tier pricing ($29/$49/$99)
- Stripe checkout + webhooks
- Order auto-creation on payment

### PRIORITY 6: Final Polish & Launch
- Landing page improvements
- E2E testing all tiers
- Production deployment
- Monitoring

---

## Cost Per Order (Current vs Target)

| Component | Current | Target | Notes |
|-----------|---------|--------|-------|
| Logo generation (4) | $0.004 | $0.12-0.20 | Upgrade to Imagen 3 or FLUX.1 |
| Canvas mockups | $0 | $0 | Improved but still free |
| AI photo mockups (3) | N/A | $0.30-1.50 | Specialist API - TBD |
| Canvas social (7) | $0 | $0 | Improved but still free |
| AI social (3) | N/A | $0.009 | Together AI |
| Brand guide text | $0.004 | $0.004 | Together AI |
| PDF/ZIP | $0 | $0 | Server-side |
| **Total** | **$0.008** | **$0.50-1.75** | **Well within budget for $20-100 product** |

---

## Research Items (For Next Session)

1. **Mockup compositing API** - Which service can take a PNG logo and place it realistically onto a product photo? Need actual compositing, not AI-described logos.
2. **ComfyUI/ControlNet pipeline** - Can we use inpainting to place a logo on a product photo? Would need self-hosted or API.
3. **Placeit/Mediamodifier pricing** - Get actual API access and test quality
4. **Google Imagen 3 vs FLUX.1** - Test both for logo quality, pick winner
5. **Resend email setup** - Quick integration, should be <1 hour

---

## Environment Variables

### Required
```bash
DATABASE_URL=mysql://user:pass@host:3306/db
ADMIN_PASSWORD=secure_password
JWT_SECRET=openssl_rand_base64_32
GOOGLE_API_KEY=from_ai.google_dev      # Form auto-fill
TOGETHER_API_KEY=from_together_xyz     # Logo generation
```

### Optional
```bash
IMAGE_GEN_PROVIDER=together            # together | replicate | fal | google | laozhang
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
MODE=testing                           # testing | production
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/services/image-generation.ts` | Provider abstraction (5 providers) |
| `src/lib/services/logo-prompt-builder.ts` | Template-based logo prompts |
| `src/lib/services/pdf-generator.ts` | PDF brand guide (jsPDF) |
| `src/lib/services/order-processor.ts` | Order orchestration |
| `src/hooks/useClientMockupGenerator.ts` | Canvas mockup rendering |
| `src/hooks/useClientSocialGenerator.ts` | Canvas social rendering |
| `src/app/admin/orders/[id]/page.tsx` | Admin order detail |
| `src/app/api/orders/[id]/generate/route.ts` | Logo generation endpoint |
| `src/app/api/orders/[id]/finalize/route.ts` | Phase 2 finalization |
| `src/lib/types/typography.ts` | Typography types/schema |
| `src/components/font-preview.tsx` | Font preview component |

---

## Where to Pick Up

1. Read `AGENTS.md` for universal AI agent context
2. Read this file for current state
3. Read `docs/ROADMAP_QUALITY_IMPROVEMENTS.md` for detailed improvement plan
4. Priority: Research mockup compositing APIs, then implement

---

## Session History

### March 15, 2026 - Session 3 (This Session)
- PDF layout redesigned (branded cover, TOC, swatches, do/don't cards)
- AI text post-processing added (banned phrases, better prompts)
- Tier 3 templates re-enabled (colorPalette bug fixed)
- Two-phase workflow debugged and stabilized
- Prisma import issues fixed across multiple files
- Documentation updated for session close-out

### March 15, 2026 - Session 2
- Typography system fully implemented (26 fonts, upload, PDF embedding)
- PDF generation fixed (PDFKit replaced with jsPDF)
- Vercel storage fixed (/tmp + API route)

### March 15, 2026 - Session 1
- Mockup bug fixes (all 4 variants, field name mapping)
- Social asset rendering moved to client-side
- Admin API fixed to return all variant mockups

### March 14, 2026
- Client-side Canvas mockup & social generation implemented
- Replaced all placehold.co placeholders with real renders
- Upload API for client-side renders

---

*Next: Research mockup compositing APIs, improve Canvas quality, then payments + launch*
