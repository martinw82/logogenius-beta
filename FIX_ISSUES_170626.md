# LogoGenius Fix & Test Infrastructure Plan

**Date:** March 17, 2026  
**Session:** FIX_ISSUES_170626

---

## Issue Summary (Cross-Referenced with Previous Conversations)

| Issue | Root Cause | Status |
|-------|------------|--------|
| Dynamic Mockups URLs not displaying | `imageUrl` extraction didn't match API response shape | ✅ Already fixed in code (logging added) |
| Phase 1 uses placeholders | `mockup-generator.ts` + `social-media-generator.ts` return placehold.co | ⚠️ Needs fix |
| BrandSheet crashes | Import error (`BrandGuideDisplay` vs `BrandSheet`) | ⚠️ Needs fix |
| Only 3 logos generated | Config change in create flow | ⚠️ Needs fix |
| No single-call test infrastructure | Not implemented yet | 📋 To do |
| Order pipeline may regenerate | No guard to skip if already exists | ⚠️ Needs fix |

---

## Phase 1: Fix Broken Components

### 1.1 Fix BrandSheet Import
- **File:** `src/app/create/page.tsx`
- **Issue:** Imports non-existent `BrandGuideDisplay`
- **Fix:** Change to `import { BrandSheet } from "@/components/brand-sheet"`

### 1.2 Restore BrandSheet Component
- **File:** `src/components/brand-sheet.tsx`
- **Replace with** working version that includes:
  - Original brand details sections (Colors, Typography, Notes)
  - NEW: `generateAIMockups` + `generateAISocialAssets` button
  - Display real mockup/social images when generated

### 1.3 Fix Logo Count to 4
- **File:** `src/app/create/page.tsx` (or wherever logo generation is called)
- **Ensure:** `numberOfLogos: 4` is passed to generation
- **Search for:** `n=3` or `for (let i = 0; i < 3` and change to `4`

### 1.4 Add Order-Processor Guard
- **File:** `src/lib/services/order-processor.ts`
- **Add check:** If mockups/social already exist in DB, skip regeneration
- **Prevents:** Double credit usage

---

## Phase 2: Fix Phase 1 Generation (Architecture Decision)

### Current Architecture

| Phase | What's Generated | Method |
|-------|-----------------|--------|
| Phase 1 (initial) | Logos (4) + Canvas Mockups (placeholder) | Fast, free |
| Phase 2 (after selection) | AI Mockups + Social Assets | Real API, Dynamic Mockups |

### Decision Required

**Option A (Recommended):** Keep Phase 1 as placeholders
- Pros: Fast, free, customer sees progress quickly
- Cons: Initial preview shows placeholder images

**Option B:** Use real AI in Phase 1
- Pros: Immediate premium output
- Cons: Slower, uses more credits

**Recommendation:** Option A - Keep placeholders for Phase 1, use real AI in Phase 2 (BrandSheet button). This is the intended design - Phase 2 is where the premium assets are generated after the customer selects their preferred logo.

---

## Phase 3: Create Test Infrastructure

### 3.1 Create Single-Call Test Endpoint

**New File:** `src/app/api/test/single-generation/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/services/image-generation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType } = body;

    // Single logo generation
    if (testType === 'logo') {
      const result = await generateImage({
        prompt: "Professional logo design for Test Company, modern minimalist style, clean vector, transparent background",
        width: 1024,
        height: 1024,
      });
      return NextResponse.json({ success: true, result });
    }

    // Single mockup generation  
    if (testType === 'mockup') {
      const { generateAIMockups } = await import("@/lib/services/ai-mockup-generator");
      const result = await generateAIMockups({
        businessName: "Test Company",
        brandColors: ["#2563eb", "#1e40af", "#f59e0b"],
        industry: "technology",
        logoUrl: body.logoUrl,
      });
      return NextResponse.json({ success: true, result });
    }

    // Single social asset generation
    if (testType === 'social') {
      const { generateAISocialAssets } = await import("@/lib/services/ai-social-generator");
      const result = await generateAISocialAssets({
        businessName: "Test Company", 
        brandColors: ["#2563eb", "#1e40af", "#f59e0b"],
        industry: "technology",
      });
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: "Invalid testType" }, { status: 400 });

  } catch (error) {
    console.error("Test generation error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
```

### 3.2 Add Test Documentation

**Update:** `docs/testing-guide.md`

Add section for single-call testing:

```markdown
## Single-Call Test Mode (Credit Conservation)

### Purpose
Test API connectivity and functionality using exactly 1 call per component.

### Endpoints

#### Test Logo Generation
```bash
curl -X POST http://localhost:3000/api/test/single-generation \
  -H "Content-Type: application/json" \
  -d '{"testType": "logo"}'
```

#### Test Mockup Generation
```bash
curl -X POST http://localhost:3000/api/test/single-generation \
  -H "Content-Type: application/json" \
  -d '{"testType": "mockup", "logoUrl": "https://..."}'
```

#### Test Social Asset Generation
```bash
curl -X POST http://localhost:3000/api/test/single-generation \
  -H "Content-Type: application/json" \
  -d '{"testType": "social"}'
```

### Expected Credit Usage
| Test | Credit Cost |
|------|-------------|
| Logo | ~$0.001 |
| Mockup | ~$0.01-0.05 |
| Social | ~$0.003 |
| **Total** | **~$0.015** |
```

---

## Phase 4: Verification

### 4.1 Run E2E Test

1. Create test order via admin or customer form
2. Verify 4 logos generated (not 3)
3. Go to step 2 / BrandSheet
4. Click "Generate Mockups & Social Assets"
5. Verify mockups display (Dynamic Mockups URLs visible in browser)
6. Verify social assets display
7. Complete order processing
8. Verify PDF and ZIP contain correct assets

### 4.2 Check Credit Usage

- Confirm only expected API calls made
- Check Dynamic Mockups dashboard for render count
- Verify no duplicate generations in order-processor logs

---

## Implementation Order

```
1. Fix BrandSheet import (create/page.tsx)
2. Replace BrandSheet component (brand-sheet.tsx)  
3. Fix logo count to 4
4. Add order-processor guard
5. Create single-call test endpoint
6. Test end-to-end
7. Update documentation
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/app/create/page.tsx` | Fix import, fix logo count |
| `src/components/brand-sheet.tsx` | Replace with working version |
| `src/lib/services/order-processor.ts` | Add regeneration guard |
| `src/app/api/test/single-generation/route.ts` | Create new file |
| `docs/testing-guide.md` | Add test documentation |

---

## Environment Variables Required

For testing, ensure:

```bash
TOGETHER_API_KEY=your_key          # Required for all generation
DYNAMIC_MOCKUPS_API_KEY=your_key   # For mockup API (optional - will fallback to AI)
MOCKUP_PROVIDER=dynamicmockups     # or leave empty for AI fallback
```

---

*Plan created: March 17, 2026*
*For implementation, start new session and read this file first.*
