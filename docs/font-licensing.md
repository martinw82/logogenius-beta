# Font Licensing Guide - LogoGenius

## Overview

This document clarifies the usage rights, commercial permissions, and attribution requirements for fonts used in LogoGenius brand assets. All customers receive full commercial licensing for the fonts included in their brand package.

## Font Categories

### Category 1: Unrestricted Commercial Fonts
These fonts are included with full commercial licensing and require no attribution:

- **Google Fonts Library** (all Google Fonts are open source, SIL Open Font License 1.1)
  - Free for personal and commercial use
  - No attribution required (but recommended)
  - Can be modified and redistributed
  - Examples: Roboto, Playfair Display, Inter, Poppins, Lato

- **System Fonts**
  - macOS: San Francisco, Helvetica Neue
  - Windows: Segoe UI, Calibri
  - Linux: Ubuntu, DejaVu
  - Included by default, full commercial rights

### Category 2: Licensed Commercial Fonts
These fonts are licensed through paid subscriptions with commercial rights included:

- **Adobe Fonts** (if used)
  - Licensed through Creative Cloud subscriptions
  - Full commercial use rights included
  - Attribution not required but appreciated
  - Cannot modify or redistribute standalone

- **Typekit Fonts** (if used)
  - Licensed through subscription services
  - Commercial use permitted within licensing terms
  - Attribution not required but appreciated

### Category 3: Premium Custom Fonts
Proprietary fonts created specifically for LogoGenius platform:

- **LogoGenius Signature Fonts**
  - Custom-designed for brand uniqueness
  - Full commercial licensing included in all packages
  - Can be embedded in documents, websites, and materials
  - Cannot be redistributed as standalone font files
  - Attribution appreciated

## Customer Font Usage Rights

### What Customers Can Do

✅ **Allowed Uses:**
- Embed fonts in brand materials (social media, print, presentations)
- Use in business documents, presentations, and website
- Include in PDF documents and printed materials
- Use on social media and digital marketing
- Use in email signatures and communications
- Embed in web designs and digital products
- Modify font colors, sizes, weights, styles
- Use across team members and organization

### What Customers Cannot Do

❌ **Prohibited Uses:**
- Redistribute fonts as standalone files to third parties
- Modify font design or create derivative font files
- Claim ownership or attribution of commercial fonts
- Use fonts for illegal or offensive content
- Sublicense fonts to other users or organizations
- Convert fonts to other formats for redistribution

## Commercial License Scope

### Tier 1 (Basic) - Single User License
- **Permitted Users:** 1 individual
- **Permitted Uses:** Personal business, freelance work, startup
- **Domain Scope:** Single brand/business
- **Duration:** Perpetual for fonts included in package
- **Redistribution:** Not permitted

### Tier 2 (Pro) - Small Business License
- **Permitted Users:** Up to 5 team members
- **Permitted Uses:** Small business, agency (up to 5 employees)
- **Domain Scope:** Single brand/business
- **Duration:** Perpetual for fonts included in package
- **Redistribution:** Not permitted
- **Sub-licensing:** Not permitted

### Tier 3 (Premium) - Enterprise License
- **Permitted Users:** Unlimited within organization
- **Permitted Uses:** Enterprise business, marketing agencies, corporations
- **Domain Scope:** Single brand/business (multiple products allowed)
- **Duration:** Perpetual for fonts included in package
- **Redistribution:** Not permitted (except to team members for brand use)
- **Sub-licensing:** Limited - can license to direct partners with restriction

## Font Attribution Guidelines

### When Attribution is Required
Some fonts require attribution in public-facing materials:

**Google Fonts Attribution (recommended but not required):**
```
Font: [Font Name]
Designed by [Designer Name]
Licensed under SIL Open Font License 1.1
Source: https://fonts.google.com
```

**Adobe Fonts (not required):**
```
Uses Adobe Fonts (https://adobe.com/fonts)
```

### Best Practice Attribution Format

For brand guides and documentation, include:

```
TYPEFACE INFORMATION

Primary Typeface: [Font Name]
- Designer: [Creator]
- License: [License Type]
- Commercial Rights: Included
- Web Safe: Yes/No
- Available Formats: TTF, WOFF2, OTF

For attribution details, see fonts-attribution.txt
```

## Web Font Embedding

### WOFF2 Format (Recommended)
- Modern, compressed format
- Supported by all modern browsers
- Faster loading than other formats
- Recommended for web use

### TTF Format (Universal)
- Traditional True Type format
- Works in all design applications
- Larger file size than WOFF2
- Use for desktop applications

### OTF Format (Professional)
- OpenType format
- Better kerning and advanced features
- Use for print-quality applications
- Supported by all professional design software

## Web Implementation

### Self-Hosted Fonts (Google Fonts, Open Fonts)

```css
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/roboto.woff2') format('woff2'),
       url('/fonts/roboto.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Google Fonts CDN

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
```

## WCAG Accessibility Requirements

### Font Readability Standards
- **Minimum Size:** 12pt for body text (14px on web)
- **Minimum Contrast:** 4.5:1 for normal text, 3:1 for large text
- **Line Height:** 1.5x font size minimum
- **Font Weight:** Avoid overly thin weights for accessibility

### Font Pairing Guidance
- Primary font for headlines (bold, distinctive)
- Secondary font for body text (highly readable)
- Avoid more than 3 font families
- Maintain consistent hierarchy

## License Renewal and Updates

### Perpetual License
- Fonts provided in your package are included **perpetually**
- No renewal fees required
- Updates and new versions available at no additional cost

### Subscription Services
If using Adobe Fonts or similar services:
- Subscription required to maintain active licenses
- Canceling subscription removes usage rights
- Embedded fonts may remain in published materials

## Compliance and Enforcement

### Our Responsibility
- LogoGenius warrants right to distribute included fonts
- All licenses comply with original creator terms
- Updated annually for regulatory compliance

### Your Responsibility
- Use fonts only within licensed scope
- Maintain attribution where required
- Report any unauthorized use
- Do not circumvent license restrictions

## Reporting Font Issues

### License Violations
If you discover unauthorized font use or licensing violations:

**Email:** support@logogenius.com
**Subject:** Font License Violation Report

Include:
- Description of violation
- URL or location of violation
- Proof of unauthorized use
- Recommended action

### Font Technical Support
For font rendering or installation issues:

**Email:** support@logogenius.com
**Subject:** Font Technical Issue

Include:
- Font name and package
- Software/platform affected
- Error message or screenshot
- Device specifications

## Frequently Asked Questions

### Q: Can I use these fonts on multiple devices?
**A:** Yes, for individual and organizational use. You can install on all devices used by licensed users.

### Q: Can I modify the fonts?
**A:** For most fonts, color and styling changes are permitted. Modifying the font design itself (bezier curves, weights) is not permitted.

### Q: What if I switch brands?
**A:** The fonts are licensed to specific brand usage. Transferring fonts to new brands requires new brand package.

### Q: Can an agency use these fonts for client projects?
**A:** Tier 3 Enterprise licenses permit this. Tier 1-2 licenses are single-brand only. Contact support for multi-brand licensing.

### Q: Are fonts included in my final ZIP package?
**A:** Font files are included in brand guide and Figma/Canva templates. Desktop font files available by request.

### Q: What format should I use for print?
**A:** OTF or TTF format for highest quality. Ask your printer for font format preferences.

## Related Documents

- `/docs/projectoverview.md` - Project overview
- `/docs/roadmap.md` - Feature roadmap
- Font information included in `/orders/[id]/dashboard` - Customer dashboard
- Brand guide PDF - Includes font specifications and usage

---

**Version:** 1.0
**Last Updated:** 2026-03-11
**Next Review:** 2026-06-11

For questions about font licensing, contact support@logogenius.com
