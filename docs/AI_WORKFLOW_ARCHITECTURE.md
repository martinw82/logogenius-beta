# AI Workflow Architecture & Cost Analysis

## Executive Summary

| Component | Model Type | Cost Per Use | When It Runs |
|-----------|-----------|--------------|--------------|
| **Form Auto-Fill** | Text AI (GPT-4/Gemini) | ~$0.02 | User clicks "AI Assist" on form |
| **Logo Generation** | Image AI (Imagen 3) | $0.05/img | Admin clicks "Generate" |
| **Mockup Generation** | Image AI (Imagen 3) | $0.05/img | After logos generated |
| **Social Media Assets** | Image AI (Imagen 3) | $0.05/img | Tier 3 only |
| **Brand Guide Text** | Text AI (Gemini/Together) | ~$0.01 | After logos generated |

---

## Complete Workflow Map

### Phase 1: Form Completion (User Side)

```
User visits /create-order
    ↓
Selects Tier (1/2/3)
    ↓
Enters Basic Info (Name, Industry)
    ↓
[OPTIONAL] Clicks "✨ Auto-fill with AI"
    ↓
Text AI generates:
  - Mission Statement
  - Brand Pillars
  - Target Audience
  - Keywords
  - Brand Archetype
  - Color Psychology
  - ...etc
    ↓
User reviews & edits AI suggestions
    ↓
Submits form → Payment → Order created
```

**AI Cost: $0.02 per order (if auto-fill used)**

---

### Phase 2: Logo Generation (Admin Side)

```
Admin opens order
    ↓
Clicks "Generate Logos"
    ↓
For EACH of 4 logos:
  1. Build prompt from template + form data
  2. Call Image AI (Replicate/Together)
  3. Save to database
    ↓
4 logos generated
```

**AI Cost: 4 × $0.05 = $0.20 (Replicate)**

---

### Phase 3: Mockup Generation

#### Tier 1 & 2: Basic Mockups
```
Generate 3 mockups for Variant 1 only:
  - Letterhead
  - T-Shirt
  - Business Card
```
**AI Cost: 3 × $0.05 = $0.15**

#### Tier 3: Full Mockups
```
Generate 12 mockups (4 variants × 3 templates):
  - V1: Letterhead, T-Shirt, Business Card
  - V2: Letterhead, T-Shirt, Business Card
  - V3: Letterhead, T-Shirt, Business Card
  - V4: Letterhead, T-Shirt, Business Card
```
**AI Cost: 12 × $0.05 = $0.60**

---

### Phase 4: Social Media Assets (Tier 3 Only)

```
Generate 10 social media templates:
  - Instagram Post (1080×1080)
  - Instagram Story (1080×1920)
  - Facebook Cover (820×312)
  - Twitter Header (1500×500)
  - LinkedIn Banner (1584×396)
  - YouTube Thumbnail (1280×720)
  - Pinterest Pin (1000×1500)
  - TikTok Cover (1080×1920)
  - Email Header (600×200)
  - Website Hero (1920×1080)
```

**AI Cost: 10 × $0.05 = $0.50**

---

### Phase 5: Brand Guide Generation

```
Generate text sections:
  - Project Overview
  - Brand Identity & Voice
  - Logo Philosophy
  - Color Palette (analysis)
  - Color Accessibility
  - Typography Guide
  - Imagery Style
  - Graphic Elements
  - Brand Voice & Tone
  - Visual Style Guide
  - Usage Rules & Don'ts
  - Web3 Section (if applicable)
  - Appendix
```

**AI Cost: ~$0.01 (text is cheap)**

---

## Total Cost Per Tier (Using Replicate/Imagen 3)

| Tier | Price | Logos | Mockups | Social | Form AI | **Total AI Cost** | Margin |
|------|-------|-------|---------|--------|---------|-------------------|--------|
| **1** | $50 | $0.20 | $0.15 | $0 | $0.02 | **$0.37** | 99.3% |
| **2** | $150 | $0.20 | $0.15 | $0 | $0.02 | **$0.37** | 99.8% |
| **3** | $500 | $0.20 | $0.60 | $0.50 | $0.02 | **$1.32** | 99.7% |

**Conclusion**: AI costs are negligible compared to revenue (0.2-0.7%).

---

## Prompt Engineering Strategy: Template-Based ✅

### Recommendation: Use Templates, Not AI Prompt Engineering

**Why Templates Are Better:**
- ✅ **Deterministic**: Same inputs = same quality output
- ✅ **Faster**: No extra API call needed
- ✅ **Cheaper**: $0 extra cost
- ✅ **Debuggable**: You can see exactly what prompt was used
- ✅ **Consistent**: Brand voice stays consistent

### Template Structure

Instead of: `Form Data → AI Prompt Engineer → Image AI`

Use: `Form Data → Template Engine → Image AI`

```typescript
// Template Example
const LOGO_TEMPLATES = [
  {
    name: "Modern Minimalist",
    prompt: `Professional {style} logo design for "{businessName}".
Industry: {industry}.
Style keywords: {keywords}.
Color palette: {colors}.
Composition: {composition}.
Target audience: {targetAudience}.
Brand archetype: {archetype}.

Visual direction: Minimalist, clean lines, simple geometric shapes, 
modern aesthetic. Professional, scalable, vector style.

Technical: Isolated on white background, centered composition, 
1024×1024px, transparent background ready.`
  },
  {
    name: "Bold & Iconic",
    prompt: `...`
  },
  // etc
];

// Usage
function buildPrompt(template: string, formData: FormData): string {
  return template
    .replace('{businessName}', formData.businessName)
    .replace('{industry}', formData.industry)
    .replace('{keywords}', formData.keywords)
    // ... etc
}
```

---

## Token Efficiency: Form Data → Image AI

### The Problem
Form data can be 500+ tokens. Image AI charges per image, not per token, BUT:
- Longer prompts = more processing time
- Cluttered prompts = worse results
- We want to extract ONLY relevant fields

### Solution: Structured Data Extraction

```typescript
interface LogoPromptInput {
  businessName: string;      // "TechFlow"
  industry: string;          // "SaaS / Logistics"
  style: string;             // "Minimalist / Wordmark"
  keywords: string;          // "modern, efficient, connected"
  colors: string;            // "navy blue and electric gold"
  composition: string;       // "horizontal"
  target: string;            // "supply chain managers"
  archetype: string;         // "Creator / Sage"
  mission: string;           // "Simplify logistics through..."
}

// Extract from form data
function extractLogoInput(formData: any): LogoPromptInput {
  return {
    businessName: formData.businessName,
    industry: formData.industry,
    style: STYLE_MAP[formData.preferredLogoStyle] || 'professional',
    keywords: formData.keywords || 
              `${formData.aestheticKeywords}, ${formData.emotionalKeywords}`,
    colors: extractColors(formData.preferredColorPalette),
    composition: formData.composition || 'horizontal',
    target: formData.targetAudience,
    archetype: formData.brandArchetype,
    mission: formData.missionStatement?.slice(0, 100), // Truncate!
  };
}
```

### Field Mapping Examples

| Form Field | Prompt Value | Reason |
|------------|--------------|--------|
| `preferredLogoStyle: "minimalist"` | `"Minimalist, clean geometric shapes"` | Maps code → descriptive text |
| `preferredColorPalette: "["#0a192f","#f4a261"]` | `"Deep navy blue and warm gold"` | Hex codes → human-readable colors |
| `missionStatement` (500 chars) | First 100 chars only | Image AI doesn't need full essay |
| `keywords` (array) | `"modern, professional, innovative"` | Comma-separated for prompt flow |

---

## Implementation Plan

### Step 1: Form Auto-Fill (This Week)
- Add "✨ Auto-fill with AI" button to form
- Use GPT-4/Gemini (text model, super cheap)
- Generate: mission, keywords, audience, archetype

### Step 2: Template-Based Prompts (This Week)
- Create 4 logo prompt templates
- Create mapping functions (form data → prompt variables)
- Replace AI prompt engineering with templates

### Step 3: Tier-Based Mockups (Next Week)
- Tier 1/2: 3 mockups (variant 1 only)
- Tier 3: 12 mockups (all variants)

### Step 4: Social Media Assets (Next Week)
- Create 10 template sizes
- Tier 3 only
- Use same logo + brand colors

### Step 5: Optimize & Scale
- Monitor costs
- A/B test templates
- Fine-tune based on customer feedback

---

## Recommended AI Providers by Use Case

| Use Case | Provider | Model | Cost |
|----------|----------|-------|------|
| **Form Auto-Fill** | OpenAI / Google | GPT-4 / Gemini | $0.002/call |
| **Logos (All Tiers)** | Replicate | Imagen 3 | $0.05/img |
| **Mockups (T1/T2)** | Replicate | Imagen 3 | $0.05/img |
| **Mockups (T3)** | Replicate | Imagen 3 | $0.05/img |
| **Social Media (T3)** | Replicate | Imagen 3 | $0.05/img |
| **Brand Guide Text** | Google / Together | Gemini / LLaMA | $0.01 |

**Why not Together AI for images?**
- You said the logos look "shitty"
- Together = Stable Diffusion XL
- Replicate = Google Imagen 3
- The quality difference is worth $0.04/image

---

## Key Decisions Needed

1. **Mockups for Tier 1/2**: Just variant 1, or all 4 variants?
   - Recommendation: Just variant 1 (saves $0.45 per order)

2. **Social media assets**: How many templates for Tier 3?
   - Recommendation: 10 templates (good variety, $0.50 cost)

3. **Form auto-fill**: Which fields to auto-generate?
   - Recommendation: Mission, Keywords, Audience, Archetype, Pillars

4. **Prompt strategy**: Templates vs. AI engineering?
   - Recommendation: **Templates** (deterministic, debuggable)

What do you think? Should we proceed with this architecture?
