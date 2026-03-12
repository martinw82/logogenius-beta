# Firebase Studio Migration Guide - LogoGenius

## 🎯 Project Overview

**LogoGenius** is an AI-powered logo and brand identity generation platform.

### Current Status
- ✅ **Database**: Fully operational (TiDB Cloud MySQL)
- ✅ **Admin Dashboard**: Working (orders, create order, view order)
- ✅ **Order Management**: Complete (create, view, update status)
- ❌ **AI Logo Generation**: NOT WORKING (model/endpoint issues)

### Tech Stack
- **Framework**: Next.js 15 + React 18 + TypeScript
- **Database**: MySQL (TiDB Cloud) with custom MySQL2 client
- **AI**: Google Genkit (currently broken model configuration)
- **Hosting**: Vercel (moving to Firebase for AI)

---

## 📁 Project Structure

```
src/
├── ai/
│   ├── genkit.ts              # Genkit configuration
│   └── flows/                 # AI generation flows (NEED FIXING)
│       ├── generate-logo-concepts.ts      # MAIN: Generate 4 logo variants
│       ├── generate-logo-mockups.ts       # Generate mockups (letterhead, tshirt, businesscard)
│       ├── generate-comprehensive-brand-guide.ts  # Generate brand guide text
│       └── ...
├── app/
│   ├── api/
│   │   ├── orders/[id]/generate/route.ts  # API endpoint for generation
│   │   └── admin/orders/route.ts          # Admin API
│   └── admin/
│       ├── dashboard/page.tsx             # Orders list
│       ├── orders/[id]/page.tsx           # Order detail (has Generate Logos button)
│       └── create-order/page.tsx          # Create order form
├── lib/
│   └── database.ts            # MySQL2 database client
└── components/
    └── logo-form.tsx          # Customer-facing logo form
```

---

## 🔧 What Needs to be Fixed

### 1. AI Logo Generation Flows

**Current Issue**: Model names are wrong/outdated

**Files to fix**:
- `src/ai/flows/generate-logo-concepts.ts` - Generate 4 logo variants
- `src/ai/flows/generate-logo-mockups.ts` - Generate mockup images
- `src/ai/flows/generate-comprehensive-brand-guide.ts` - Generate brand guide

**Current broken model**: `googleai/gemini-1.5-flash`
**What we need**: Correct Google AI model for image generation (Imagen 3 or Gemini with image support)

### 2. API Key Configuration

**Current**: Reading from `process.env.GENKIT_API_KEY` or `process.env.TEST_GOOGLE_API_KEY`
**Environment**: Already configured in Vercel/Firebase

---

## 🎨 AI Generation Requirements

### Logo Generation (`generate-logo-concepts.ts`)

**Input** (from order form data in database):
```typescript
{
  businessName: string;           // e.g., "Acme Corp"
  industry: string;               // e.g., "Technology"
  keywords: string;               // e.g., "modern, professional, innovative"
  preferredLogoStyle?: string;    // e.g., "minimalist", "geometric"
  composition?: string;           // e.g., "horizontal", "vertical"
  targetAudience?: string;        // e.g., "young professionals"
  brandArchetype?: string;        // e.g., "The Innovator"
  missionStatement?: string;      // e.g., "To revolutionize..."
  web3BlockchainFocus?: boolean;  // true/false
  userApiKey: string;             // Google AI API key
}
```

**Output**:
```typescript
{
  logoUrls: string[];  // Array of 4 image URLs
}
```

**Expected Behavior**:
- Generate 4 distinct logo concepts
- Each with different design direction:
  1. Modern Minimalist
  2. Geometric/Abstract
  3. Illustrative/Artistic
  4. Wordmark/Typography
- Transparent backgrounds
- High quality PNG/SVG

### Mockup Generation (`generate-logo-mockups.ts`)

**Input**:
```typescript
{
  logoImageUrl: string;           // URL of selected logo
  businessName: string;
  industry: string;
  mockupTemplates: ["letterhead", "tshirt", "businesscard"];
  userApiKey: string;
}
```

**Output**:
```typescript
{
  letterheadMockup?: string;      // Image URL
  tshirtMockup?: string;          // Image URL
  businesscardMockup?: string;    // Image URL
}
```

### Brand Guide Generation (`generate-comprehensive-brand-guide.ts`)

**Output sections**:
- projectOverview
- brandIdentityVoice
- logoPhilosophy
- colorPalette
- colorAccessibility
- typography
- imageryStyle
- graphicElements
- brandVoiceTone
- visualStyleGuide
- usageRulesAndDonts
- web3Section (if applicable)
- appendix

---

## 🗄️ Database Schema

**Orders table**:
```sql
- id (INT, PK)
- tier (STRING: basic/pro/premium)
- status (STRING: pending/processing/generating/ready_for_review/completed)
- customerEmail (STRING)
- selectedLogoId (INT, nullable)
- createdAt/updatedAt (TIMESTAMP)
```

**OrderDetails table** (key-value store):
```sql
- id (INT, PK)
- orderId (INT, FK)
- fieldName (STRING)  // e.g., "businessName", "logoUrl_0"
- fieldValue (TEXT)   // The actual value
```

**BrandArchetypes table**:
- 12 pre-seeded archetypes (The Innovator, The Caregiver, etc.)

---

## 🚀 Migration Tasks for Firebase Agent

### Task 1: Fix AI Model Configuration

**Goal**: Update all AI flows to use correct Google AI models for image generation

**Files**:
1. `src/ai/flows/generate-logo-concepts.ts`
   - Fix `model:` parameter
   - Ensure `responseModalities: ['TEXT', 'IMAGE']` is correct
   
2. `src/ai/flows/generate-logo-mockups.ts`
   - Fix `model:` parameter
   
3. `src/ai/flows/refine-logo-generation.ts`
   - Fix `model:` parameter

**Suggested models to try**:
- `googleai/imagen-3.0-generate-001` (for images)
- `googleai/gemini-1.5-pro` (for text + image)
- Or use Genkit's model discovery

### Task 2: Test Generation Flow

**Test endpoint**: `POST /api/orders/[id]/generate`

**Steps**:
1. Create an order via admin dashboard
2. Click "Generate Logos" button
3. Should generate 4 logos + mockups + brand guide

### Task 3: Verify Output Storage

**Expected**: Logo URLs saved to `OrderDetails` table:
- `logoUrl_0`, `logoUrl_1`, `logoUrl_2`, `logoUrl_3`
- `mockup_letterhead`, `mockup_tshirt`, `mockup_businesscard`
- `guide_projectOverview`, `guide_colorPalette`, etc.

---

## ✅ Success Criteria

1. **Logo Generation**: Generate 4 distinct logo variants for a test order
2. **Mockup Generation**: Create 3 mockup previews (letterhead, t-shirt, business card)
3. **Brand Guide**: Generate comprehensive brand guide sections
4. **Admin Dashboard**: Display generated logos in order detail page
5. **Status Update**: Order status changes to `ready_for_review` after generation

---

## 🔑 API Key

**Environment Variable**: `GENKIT_API_KEY` (already configured)

**API Key Source**: Google AI Studio - https://aistudio.google.com/app/apikey

---

## 📞 Current Error

```
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta
```

**Root Cause**: Model name/version mismatch or endpoint configuration

---

## 🎯 Priority

**CRITICAL**: Fix AI image generation flows
- Without this, the core product doesn't work
- Everything else (database, admin, forms) is already working

---

## 📝 Notes

1. **Database is working** - No changes needed to database layer
2. **Admin UI is working** - Just need AI to populate data
3. **Customer form is working** - Just need AI to process submissions
4. **Focus only on AI flows** - Everything else is production-ready

---

## 🆘 Help Needed

Please fix the Google AI model configuration so that:
1. Logo generation produces 4 image URLs
2. Mockup generation produces 3 mockup images
3. Brand guide generation produces text content

The rest of the application will handle the storage and display automatically.
