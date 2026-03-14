# Testing Cost Optimization Guide

> **Goal**: Keep testing costs near ZERO while maintaining workflow validation

---

## Current vs Optimized Costs

| Component | Current (Paid) | Testing (Free/Cheap) | Production (Paid) |
|-----------|---------------|---------------------|-------------------|
| **Form Auto-Fill** | $0.02 (Together) | **FREE** (Gemini/Groq) | $0.02 (GPT-4) |
| **Logos** | $0.20 (Replicate) | **$0.004** (Together) | $0.20 (Replicate) |
| **Mockups** | $0.15-0.60 (AI) | **FREE** (Templates) | FREE (Templates) |
| **Social Media** | $0.50 (AI) | **FREE** (HTML/CSS) | FREE (HTML/CSS) |
| **Brand Guide** | $0.01 (Text AI) | **FREE** (Template) | $0.01 (Text AI) |
| **TOTAL per order** | $0.88-1.32 | **$0.004** | $0.23 |

**Testing cost: Less than a penny per order!**

---

## 1. Form Auto-Fill - FREE Options

### Option A: Google Gemini (FREE TIER) ⭐ RECOMMENDED
```
Price: FREE (up to 60 requests/minute)
Quality: Excellent
Setup: 2 minutes
```

**How to get free access:**
1. Go to https://ai.google.dev
2. Sign in with Google account
3. Get API key (no credit card needed!)
4. 60 requests/minute free

**Implementation:**
```typescript
// Use Gemini Pro (text model) - completely free
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  }
);
```

### Option B: Groq (FREE TIER)
```
Price: FREE tier available
Quality: Good
Speed: Extremely fast
```

https://console.groq.com - Free credits for testing

### Option C: Together AI ($5 Free Credit)
Already have this, use for testing!

---

## 2. Mockups - FREE (No AI Needed!)

You're right - we discussed this! **AI mockups are wasteful.**

### Solution: HTML/CSS Mockup Templates

Generate mockups by overlaying logo on HTML templates:

```typescript
// Pseudo-code
async function generateMockup(logoUrl: string, template: string): Promise<string> {
  // Use Puppeteer or Playwright to render HTML
  // Overlay logo on template
  // Screenshot = mockup
}
```

**Templates:**
- Business card (HTML/CSS)
- Letterhead (HTML/CSS)
- T-shirt (SVG with logo placement)

**Cost: $0** (just compute time)

### Alternative: Placehold.co + Overlay
```
Base mockup image: https://placehold.co/600x400?text=Business+Card
Overlay logo with Canvas API
```

**Cost: $0**

---

## 3. Social Media - FREE (HTML/CSS Templates)

### Solution: Canvas/Node-based Generation

```typescript
import { createCanvas } from 'canvas';

function generateSocialAsset(logoUrl: string, brandColors: string[], size: {w: number, h: number}) {
  const canvas = createCanvas(size.w, size.h);
  const ctx = canvas.getContext('2d');
  
  // Draw background with brand color
  ctx.fillStyle = brandColors[0];
  ctx.fillRect(0, 0, size.w, size.h);
  
  // Draw logo
  const logo = await loadImage(logoUrl);
  ctx.drawImage(logo, centerX, centerY);
  
  // Export PNG
  return canvas.toDataURL();
}
```

**Templates for Tier 3:**
- Instagram Post (1080×1080)
- Instagram Story (1080×1920)
- Facebook Cover (820×312)
- Twitter Header (1500×500)
- LinkedIn Banner (1584×396)
- YouTube Thumbnail (1280×720)
- Pinterest Pin (1000×1500)

**Cost: $0** (just compute)

---

## 4. Recommended Testing Setup

### Environment Variables (.env.local.testing)

```bash
# === TESTING CONFIG (Near Zero Cost) ===

# Use Gemini for form auto-fill (FREE)
GOOGLE_API_KEY=your_free_gemini_key
USE_FREE_TEXT_AI=true

# Use Together AI for logos (already have $5 credit)
IMAGE_GEN_PROVIDER=together
TOGETHER_API_KEY=your_key

# Mockups: Use HTML templates (FREE)
USE_MOCKUP_TEMPLATES=true
MOCKUP_PROVIDER=html

# Social media: Use Canvas/Node (FREE)
USE_SOCIAL_TEMPLATES=true
SOCIAL_PROVIDER=canvas

# Skip AI brand guide generation
USE_TEMPLATE_BRAND_GUIDE=true
```

### Testing Cost Per Order

| Tier | Form | Logos | Mockups | Social | **Total** |
|------|------|-------|---------|--------|-----------|
| **1** | $0 | $0.004 | $0 | $0 | **$0.004** |
| **2** | $0 | $0.004 | $0 | $0 | **$0.004** |
| **3** | $0 | $0.004 | $0 | $0 | **$0.004** |

**With $5 Together credit: You can test 1250 orders!**

---

## 5. Production Toggle

One config switch moves from testing → production:

```typescript
// config.ts
export const CONFIG = {
  // Mode: 'testing' | 'production'
  MODE: process.env.MODE || 'testing',
  
  get useFreeTextAI() {
    return this.MODE === 'testing';
  },
  
  get useHtmlMockups() {
    return this.MODE === 'testing';
  },
  
  get useCanvasSocial() {
    return this.MODE === 'testing';
  },
  
  get imageProvider() {
    return this.MODE === 'testing' ? 'together' : 'replicate';
  },
};
```

**Switch to production:**
```bash
MODE=production npm run build
```

---

## 6. Testing Workflow

### Phase 1: Internal Testing (Now)
- Use Together AI for logos ($0.001/img)
- Use Gemini for form auto-fill (FREE)
- Use HTML templates for mockups (FREE)
- Use Canvas for social (FREE)
- **Cost: ~$0.01 per full order test**

### Phase 2: "Dry Run" Testing (Later)
When you're ready, allocate $50-100:
- Switch to Replicate for logos ($0.05/img)
- Use Gemini for form (FREE)
- HTML mockups (FREE)
- Canvas social (FREE)
- Run 3-4 complete Tier 3 orders
- **Cost: ~$15-20 for full dry runs**

### Phase 3: Production
- All high-quality paid services
- Replicate for logos
- Optional: GPT-4 for form
- **Cost: ~$0.23-1.32 per order**

---

## 7. Free Services Summary

| Service | Free Tier | Good For |
|---------|-----------|----------|
| **Google Gemini** | 60 req/min | Form auto-fill |
| **Together AI** | $5 credit | Logo generation |
| **HTML/CSS** | Unlimited | Mockups |
| **Canvas API** | Unlimited | Social assets |
| **Node.js/Puppeteer** | Unlimited | PDF generation |

---

## 8. Quick Wins

### Mockup Template (HTML)
```html
<!-- business-card.html -->
<div class="card" style="width: 600px; height: 400px; background: white; padding: 40px;">
  <img id="logo" style="max-width: 200px; max-height: 150px;" />
  <h2 id="companyName"></h2>
  <p id="tagline"></p>
</div>
<script>
  // Injected from Node.js
  document.getElementById('logo').src = '{{LOGO_URL}}';
  document.getElementById('companyName').textContent = '{{COMPANY_NAME}}';
</script>
```

**Convert to PNG:**
```bash
# Using Puppeteer
node scripts/render-mockup.js business-card.html --output card.png
```

---

## Bottom Line

**Testing should cost you less than $5 total.**

Use:
- ✅ Gemini (free) for form text
- ✅ Together ($5 credit) for logos
- ✅ HTML/CSS (free) for mockups
- ✅ Canvas (free) for social

**Only switch to paid (Replicate) when you're ready for "final quality" dry runs.**

Want me to implement the free mockup and social media generators?
