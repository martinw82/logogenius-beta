# LogoGenius Beta - Project Overview

## Mission
Enable entrepreneurs and businesses to generate professional, AI-powered brand identities across three tiers: essential logos (Basic), brand guides (Pro), and comprehensive brand ecosystems (Premium).

## Core Strategy
1. **Tier-Based Approach:** Different feature sets for different customer needs
2. **AI-Powered Generation:** Use Google Genkit for brand guides, logo generation, and template creation
3. **Fiverr Integration:** Support direct Fiverr gig orders with mockup previews
4. **Admin Control:** Quality gate, manual ordering, archive management
5. **Scalable Architecture:** Modular generation flows, efficient storage

## Key Features by Tier

### Tier 1: Basic
- Logo generation
- Brand archetype selection
- Basic brand guide
- Minimal order form (business name, archetype, industry)

### Tier 2: Pro
- Everything in Tier 1, plus:
- Brand mission, pillars, target audience
- Comprehensive brand guide (12+ sections)
- PDF generation with brand guide
- README with usage rules
- ZIP packaging with all assets

### Tier 3: Premium
- Everything in Tier 2, plus:
- Logo preferences and Web3 support
- File upload for brand assets
- Figma template generation
- Canva template generation
- Full media asset suite (PowerPoint, email, avatars, favicon)
- Revision request system

## Tech Stack
- **Backend:** Next.js API routes, Node.js
- **Database:** MySQL (5 core tables)
- **AI/Generation:** Google Genkit
- **Frontend:** React, TypeScript, TailwindCSS
- **File Handling:** Sharp (image processing), PDFKit (PDF generation), JSZip (ZIP packaging)
- **Design Templates:** Canvas/SVG overlays for mockups

## Critical Feature: Logo Mockup Preview (Fiverr Gigs)

When customers see the 4 generated logo variants, they must be displayed on 3 different mockup templates:
1. **Letterhead** - Logo placement on official letterhead
2. **T-Shirt** - Logo placement on apparel
3. **Business Card** - Logo placement on business card

This allows Fiverr customers to validate logo effectiveness across real-world use cases before selection. System displays all 4 variants × 3 mockups = 12 total mockup views.

## Customer Journey

1. **Landing Page** → Select tier (Basic, Pro, Premium)
2. **Archetype Discovery** → Select brand personality from curated options
3. **Order Form** → Provide inputs based on tier:
   - Tier 1: Minimal (business name, archetype, industry)
   - Tier 2: Expanded (add mission, pillars, audience)
   - Tier 3: Comprehensive (add preferences, Web3, file uploads)
4. **Logo Generation** → AI creates 4 distinct variants
5. **Mockup Preview** → See all variants on 3 mockup templates (letterhead, t-shirt, business card)
6. **Logo Selection** → Choose preferred variant
7. **Asset Generation** → Generate:
   - Brand guide PDF
   - README file
   - Logo SVG files
   - ZIP package (all assets)
   - Figma/Canva templates (Tier 3 only)
8. **Dashboard Access** → Customer receives secure token to:
   - View brand guide PDF
   - Download all assets
   - Request revisions (Tier 2-3)
   - Provide feedback and rating
9. **Archiving** → Order marked complete, archived with customer rating

## Success Metrics

- ✅ All 44 tasks completed across 6 sprints
- ✅ Logo mockups display correctly on 3 templates with 4 variants
- ✅ PDF generation with brand guide, colors, fonts, accessibility info
- ✅ Fiverr integration seamless with mockup preview workflow
- ✅ Admin quality gate functional (review, approve, reject)
- ✅ Customer dashboard operational with all downloads working
- ✅ End-to-end testing passes for all tiers
- ✅ Mockup rendering tested on mobile, tablet, desktop
- ✅ Email notifications sent for order status changes
- ✅ Revision request system functional (Tier 2-3)
- ✅ Ready for production deployment

## Project Timeline

- **Total Tasks:** 44
- **Estimated Duration:** 6 sprints (2-week sprints = ~12 weeks)
- **Critical Path:** Foundation → Brand Guide → PDF/ZIP → Admin Dashboard → Mockup Preview → Quality Gate → Customer Dashboard

## Database Architecture

### Core Tables
1. **orders** - Master order record (id, tier, status, created_at, updated_at, customer_email)
2. **order_details** - Flexible key-value store for order inputs (id, order_id, field_name, field_value)
3. **brand_archetypes** - Predefined brand personalities (id, name, description, traits)
4. **admin_sessions** - Admin authentication (id, admin_id, token, expires_at)
5. **logo_variants** - Generated logo variants (id, order_id, variant_number, svg_path, selected, mockup_paths)

## Key Implementation Principles

### Mockup System Architecture (Critical for Fiverr)
1. **SVG Templates:** Base templates (letterhead, t-shirt, business card) with placeholder regions
2. **Overlay System:** Replace placeholder with generated logo SVG, maintaining aspect ratio and positioning
3. **Export:** Render to PNG/JPG for preview in UI, keep SVG for editing
4. **Modal Display:** Interactive modal showing all 4 variants, each with 3 mockup views
5. **Selection Flow:** Customer clicks variant → modal opens → can preview across all mockups

### Data Flow
Order Input → Brand Guide Generation → Logo Generation → Mockup Generation → PDF/ZIP Generation → Admin Quality Gate → Customer Dashboard

### Quality Gate Workflow
Admins must review and approve:
1. Logo variants quality and creativity
2. Mockup overlay correctness (positioning, scaling)
3. Brand guide content accuracy
4. PDF formatting
5. Mark as ready before customer accesses dashboard

## Notes for Implementation
- Use Canvas for mockup rendering (better browser support than pure SVG transforms)
- Store mockup images in order database for quick retrieval
- Mockup templates should be reusable for future expansion
- Fiverr integration assumes order data paste-in for MVP
- All file downloads should be logged for analytics
- Rate limit asset downloads after delivery to prevent abuse
- Support Web3 narrative presets (DeFi, NFT, DAO, Layer 2)

## Next Steps
See `/docs/roadmap.md` for detailed task breakdown by sprint.
See `/docs/devlog.md` for session tracking and progress.
