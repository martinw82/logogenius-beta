# Features Research — Remaining Work

**Analysis Date:** 2026-03-28

## PDF Brand Guide

**Table Stakes:**
- Cover page with logo, business name, tagline
- Table of contents with page numbers
- Logo usage guidelines (minimum size, clear space, do/don't examples)
- Color palette with hex/RGB values and usage rules
- Typography section with font specimens and hierarchy
- Contact information page

**Differentiators:**
- Photo-realistic mockup renders embedded in PDF
- Editable brand guidelines (not just static PDF)
- Multiple export formats (PDF + PNG previews)
- QR code linking to digital brand kit

**Quality Benchmarks:**
- Reference: Uber, Spotify, Airbnb brand guidelines
- Clean typography hierarchy (H1/H2/body)
- Consistent grid system
- Professional color swatches with CMYK values
- High-resolution mockup images (300 DPI minimum)

## Social Media Assets

**Table Stakes:**
- Platform-correct dimensions (Instagram 1080x1080, Facebook 820x312, etc.)
- Logo prominently displayed
- Brand colors applied
- Clean, professional appearance

**Quality Benchmarks:**
- Templates should look like they were designed by a professional
- Consistent design language across all 10 platforms
- Typography hierarchy (headline + subtext where appropriate)
- Subtle textures/gradients to add depth
- Platform-appropriate styling (Instagram = modern, LinkedIn = professional)

**Improvement Opportunities:**
- Add gradient backgrounds with brand colors
- Better typography layout (headline + body text hierarchy)
- Add subtle shadows and depth effects
- Platform-specific design patterns (Instagram grid aesthetic, LinkedIn corporate feel)
- AI-generated hero images for Instagram Post, YouTube Thumbnail, Website Hero (~$0.009 for 3 images)

## Payment & Checkout

**Table Stakes:**
- Clear pricing page with 3 tiers
- Secure checkout flow (Stripe-hosted)
- Order confirmation email
- Receipt/invoice generation
- Ability to see what's included in each tier

**Tier Structure Recommendations:**
- **Starter ($29):** 1 logo concept, basic mockups (3), no social assets
- **Professional ($49):** 4 logo concepts, full mockups (12), 10 social assets, PDF brand guide
- **Enterprise ($99):** Everything in Pro + unlimited revisions + priority support + source files

## Email Communications

**Essential Emails:**
1. Order confirmation (after payment)
2. Logo ready notification (with dashboard link)
3. Brand kit ready notification (with download link)
4. Password reset (if auth added later)

**Nice-to-Have:**
5. Welcome email with tips
6. Follow-up email (7 days after delivery)
7. Review/testimonial request
8. Abandoned checkout reminder

## Landing Page

**Conversion Elements:**
- Hero section with before/after logo examples
- Social proof (testimonials, logos created count)
- Clear pricing comparison table
- FAQ section addressing common concerns
- Portfolio/examples section
- CTA above the fold + at page bottom

## Anti-Features

| Feature | Why NOT Build |
|---------|---------------|
| Logo editor/design tool | Competes with Canva, outside core value prop |
| Subscription billing | One-time purchase model is simpler for v1 |
| Multi-language support | English-only sufficient, adds massive complexity |
| AI chat for design feedback | Separate product, not core to generation |
| Print ordering | Fulfillment complexity, not needed for v1 |

## Complexity Matrix

| Feature | Complexity | Dependencies | Priority |
|---------|-----------|--------------|----------|
| PDF aesthetics polish | Medium | Existing PDF generator | High |
| Railway PDF microservice | High | Railway account, Docker setup | High |
| Stripe Checkout | Medium | Stripe account | High |
| Email (Resend) | Low | Resend account | Medium |
| Social image quality | Low-Medium | Canvas improvements | Medium |
| Landing page | Low | Existing Next.js pages | Low |
| Production monitoring | Low | Sentry account | Medium |

---

*Features research: 2026-03-28*
