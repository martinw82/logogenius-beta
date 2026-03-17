# LogoGenius Project Status

**Date:** 2026-03-17
**Branch:** claude/analyze-codebase-plan-g5Vfs
**Status:** Mockup API System Implemented - Needs API Keys + Template IDs
**Completion:** ~85% (core product working, mockup APIs built, quality + polish remaining)

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

### Mockups - Two Systems
#### Canvas Mockups (Client-Side, FREE)
- Business Card (900x500), Letterhead (800x1100), T-Shirt (600x700)
- Generated for all 4 variants (12 mockups total)
- Auto-uploaded to server, $0 cost

#### API Mockups (Server-Side, 3 Providers)
- Dynamic Mockups, MockupsJar, MockCity - switchable via `MOCKUP_PROVIDER` env var
- Photo-realistic product mockups with pixel-perfect logo compositing
- Smart routing: tries real API first, falls back to AI-generated
- Base64-to-URL bridge: Dynamic Mockups uses FormData binary upload, others use imgbb
- **Status: Code complete, needs API keys + template UUIDs to activate**

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

### PRIORITY 1: Activate Mockup API Providers
**Status:** Code complete, needs API keys and template configuration
**Budget:** $1-2 per order is acceptable (product sells for $20-100+)

#### What's Already Built
- 3-provider switchable mockup system (Dynamic Mockups, MockupsJar, MockCity)
- Base64-to-URL bridge (FormData binary for Dynamic Mockups, imgbb for others)
- Smart fallback routing (real API → AI-generated)
- Test endpoint at `/api/test/mockup-generation`
- Full integration with order processor pipeline

#### What Still Needs Doing
1. **Sign up for Dynamic Mockups** (https://dynamicmockups.com) — 1,000 free renders
2. **Browse template library** and copy `mockup_uuid` + `smart_object_uuid` for each product
3. **Populate template UUIDs** in `src/lib/services/mockup-generation.ts`
4. **Set `DYNAMIC_MOCKUPS_API_KEY`** in `.env.local`
5. **Test end-to-end** with a real logo
6. Optionally: sign up for MockupsJar (100 free/month), get imgbb API key (free)

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

1. **Activate mockup APIs** - Sign up for Dynamic Mockups, get template UUIDs, test end-to-end
2. **Google Imagen 3 vs FLUX.1** - Test both for logo quality, pick winner
3. **Resend email setup** - Quick integration, should be <1 hour
4. **SudoMock** - Evaluate for self-hosted high-volume use (other projects)

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

# Mockup API (photo-realistic product mockups)
MOCKUP_PROVIDER=dynamicmockups         # dynamicmockups | mockupsjar | mockcity
DYNAMIC_MOCKUPS_API_KEY=your_key       # 1,000 free renders
IMGBB_API_KEY=your_key                 # Free, needed for MockupsJar/MockCity only
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/services/image-generation.ts` | Logo provider abstraction (5 providers) |
| `src/lib/services/mockup-generation.ts` | **Mockup API provider abstraction (3 providers)** |
| `src/lib/services/ai-mockup-generator.ts` | **Smart routing (real API → AI fallback)** |
| `src/lib/services/image-hosting.ts` | **Base64-to-URL bridge (imgbb + local temp serve)** |
| `src/lib/services/logo-prompt-builder.ts` | Template-based logo prompts |
| `src/lib/services/pdf-generator.ts` | PDF brand guide (jsPDF) |
| `src/lib/services/order-processor.ts` | Order orchestration (wired to mockup APIs) |
| `src/hooks/useClientMockupGenerator.ts` | Canvas mockup rendering |
| `src/hooks/useClientSocialGenerator.ts` | Canvas social rendering |
| `src/app/admin/orders/[id]/page.tsx` | Admin order detail |
| `src/app/api/orders/[id]/generate/route.ts` | Logo generation endpoint |
| `src/app/api/orders/[id]/finalize/route.ts` | Phase 2 finalization |
| `src/app/api/serve-image/[id]/route.ts` | **Temp image serving for mockup APIs** |
| `src/app/api/test/mockup-generation/route.ts` | **Mockup provider test endpoint** |
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

### March 17, 2026 (This Session)
- Mockup API provider system built (Dynamic Mockups, MockupsJar, MockCity)
- Base64-to-URL bridge implemented (FormData binary for Dynamic Mockups, imgbb for others)
- Smart routing: tries real mockup API first, falls back to AI-generated
- Image hosting utility created (imgbb + local temp serve strategies)
- Temp image serving endpoint created (/api/serve-image/[id])
- Order processor wired to pass logoUrl to mockup generation pipeline
- All documentation updated

### March 15, 2026 - Session 3
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

*Next: Sign up for Dynamic Mockups, populate template UUIDs, test end-to-end, then payments + launch*
