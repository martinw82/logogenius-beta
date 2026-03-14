# Mockup & Social Media Integration

> **Status:** ✅ REAL RENDERING IMPLEMENTED (Not placeholders!)

---

## Overview

Mockups and social media assets are now **REAL RENDERED IMAGES** generated using HTML5 Canvas in the browser.

**Previous:** Placeholder images from placehold.co  
**Current:** Real rendered mockups with brand colors and logo overlay

---

## What's Generated

### Mockups (All Tiers)
Generated using **HTML5 Canvas** (client-side rendering):

| Mockup | Dimensions | Description |
|--------|------------|-------------|
| **Business Card** | 900×500px | Professional card with logo, company name, contact |
| **Letterhead** | 800×1100px | Corporate letterhead with header, content, footer |
| **T-Shirt** | 600×700px | Apparel mockup with centered logo |

**Cost: $0** (rendered client-side, no API calls)

### Social Media Assets (Tier 3 Only)
Generated using **HTML5 Canvas** (client-side rendering):

| Platform | Dimensions | Description |
|----------|------------|-------------|
| **Instagram Post** | 1080×1080 | Square feed post with gradient + logo |
| **Instagram Story** | 1080×1920 | Vertical story with swipe up CTA |
| **Facebook Cover** | 820×312 | Page header with split design |
| **Twitter Header** | 1500×500 | Profile banner with pattern |
| **LinkedIn Banner** | 1584×396 | Professional company banner |
| **YouTube Thumbnail** | 1280×720 | Video thumbnail with play button |
| **Pinterest Pin** | 1000×1500 | Vertical pin layout |
| **TikTok Cover** | 1080×1920 | Dark trendy profile design |
| **Email Header** | 600×200 | Compact email campaign header |
| **Website Hero** | 1920×1080 | Full-width website banner |

**Cost: $0** (rendered client-side, no API calls)

---

## How It Works

### 1. Order Generation Flow

```
Admin clicks "Generate Logos"
    ↓
Step 1: Server generates 4 logos (Together AI)     ~5 seconds
    ↓
Step 2: Client renders 3 mockups (Canvas)          ~2 seconds
        → Auto-uploads to server
    ↓
Step 3: Client renders 10 social assets (Canvas)   ~5 seconds [Tier 3]
        → Auto-uploads to server
    ↓
Step 4: Server generates PDF with embedded mockups
    ↓
Order status: "ready_for_review"
```

### 2. Technical Architecture

#### Client-Side Rendering
```typescript
// useClientMockupGenerator.ts
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// 1. Draw template background with brand colors
ctx.fillStyle = primaryColor;
ctx.fillRect(0, 0, width, height);

// 2. Draw template elements (text, shapes, etc.)
drawTemplate(ctx, template, options);

// 3. Overlay logo
const logo = await loadImage(logoUrl);
ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

// 4. Export as PNG
const imageData = canvas.toDataURL('image/png');
```

#### Auto-Upload Pattern
```typescript
// Render in browser
const mockups = await generateMockups(options);

// Upload to server
await fetch(`/api/orders/${orderId}/upload-mockups`, {
  method: 'POST',
  body: JSON.stringify({ mockups })
});

// Server stores in database
await prisma.orderDetail.create({
  data: {
    orderId,
    fieldName: 'mockup_businesscard',
    fieldValue: imageData, // base64 data URL
  }
});
```

### 3. Data Storage

**Mockups:**
```
OrderDetail table:
  - orderId: 60001
  - fieldName: "mockup_businesscard"
  - fieldValue: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."

LogoVariant table:
  - orderId: 60001
  - variantNum: 1
  - mockupPaths: "{\"businesscard\":\"data:image/...\",\"letterhead\":\"...\",\"tshirt\":\"...\"}"
```

**Social Media:**
```
OrderDetail table:
  - orderId: 60001
  - fieldName: "social_instagram_post"
  - fieldValue: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
```

---

## Key Files

### Client-Side Hooks
| File | Purpose |
|------|---------|
| `src/hooks/useClientMockupGenerator.ts` | Renders 3 mockup templates using Canvas |
| `src/hooks/useClientSocialGenerator.ts` | Renders 10 social platforms using Canvas |

### API Routes
| File | Purpose |
|------|---------|
| `src/app/api/orders/[id]/upload-mockups/route.ts` | Receives client renders, stores in DB |

### Services
| File | Purpose |
|------|---------|
| `src/lib/services/pdf-generator.ts` | Embeds mockups in PDF brand guide |
| `src/lib/services/order-processor.ts` | Fetches mockups for ZIP packaging |

---

## Customization

### Mockup Templates

Edit `src/hooks/useClientMockupGenerator.ts`:

```typescript
const TEMPLATE_CONFIGS = {
  businesscard: {
    width: 900,
    height: 500,
    logoX: 50,
    logoY: 50,
    logoWidth: 100,
    logoHeight: 100,
    bgColor: '#ffffff',
  },
  // ... customize dimensions and positions
};
```

Modify the `drawTemplate()` function to change design elements:

```typescript
async function drawTemplate(ctx, template, options, config) {
  switch (template) {
    case 'businesscard':
      // Background
      ctx.fillStyle = primaryColor;
      ctx.fillRect(0, 0, config.width, config.height);
      
      // Company name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(options.businessName, 50, 200);
      
      // Add your custom elements here
      break;
  }
}
```

### Social Media Templates

Edit `src/hooks/useClientSocialGenerator.ts`:

Each platform has its own `draw[Platform]()` function:

```typescript
const drawInstagramPost = async (ctx, spec, options, colors) => {
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, spec.width, spec.height);
  gradient.addColorStop(0, primaryColor);
  gradient.addColorStop(1, secondaryColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, spec.width, spec.height);
  
  // Logo in center
  const logo = await loadImage(options.logoUrl);
  ctx.drawImage(logo, 340, 250, 400, 400);
  
  // Business name
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(options.businessName, spec.width / 2, 720);
};
```

---

## Testing

### Test Mockup Generation

```bash
# 1. Create a test order
# Go to /admin/create-order
# Fill in business name and industry
# Click "Create Order"

# 2. Generate logos
# Go to order detail
# Click "Generate Logos"

# 3. Watch progress
# See "Generating logos..." → "Creating mockups..." → Done

# 4. Verify mockups
# Check "Mockup Preview" section
# Should show 3 rendered mockups (not placeholder text)
# Download buttons should work
```

### Test Social Media Generation

```bash
# 1. Create a Tier 3 (premium) order
# Select "Premium" tier

# 2. Generate logos
# Click "Generate Logos"

# 3. Watch progress
# Should show "Creating social assets (X/10)..."

# 4. Verify social assets
# Check "Social Media Assets (Tier 3)" section
# Should show 10 rendered social templates
```

---

## Performance

### Rendering Times
| Asset Type | Count | Time | Output Size |
|------------|-------|------|-------------|
| Mockups | 3 | ~2 seconds | 50-100KB each |
| Social Assets | 10 | ~5 seconds | 30-80KB each |
| **Total Client-Side** | 13 | ~7 seconds | ~1MB total |

### Server Upload
| Operation | Time |
|-----------|------|
| Upload 3 mockups | ~1 second |
| Upload 10 social | ~2 seconds |
| **Total Upload** | ~3 seconds |

### Full Generation Flow
| Step | Provider | Time |
|------|----------|------|
| Generate 4 logos | Together AI | ~5 seconds |
| Render 3 mockups | Canvas | ~2 seconds |
| Upload mockups | Server | ~1 second |
| Render 10 social | Canvas | ~5 seconds [T3] |
| Upload social | Server | ~2 seconds [T3] |
| Generate PDF | PDFKit | ~2 seconds |
| **Total Time** | - | **~15-20 seconds** |

---

## Cost Summary

| Component | Method | Cost |
|-----------|--------|------|
| **Logos (4)** | Together AI | $0.004 |
| **Mockups (3)** | Canvas (client) | **FREE** |
| **Social (10)** | Canvas (client) | **FREE** |
| **Brand Guide Text** | Google Gemini | **FREE** |
| **PDF** | PDFKit | **FREE** |
| **ZIP** | Archiver | **FREE** |
| **TOTAL Tier 1/2** | - | **$0.004** |
| **TOTAL Tier 3** | - | **$0.004** |

**With $5 Together credit: 1,250 test orders!**

---

## Troubleshooting

### Mockups not rendering

1. Check browser console for errors
2. Verify logo loaded correctly (CORS issues)
3. Check Canvas is supported (all modern browsers)
4. Verify upload API responded with success

### Social assets not generating

1. Verify order tier is "premium"
2. Check browser console for Canvas errors
3. Ensure logo URL is accessible
4. Check OrderDetail table for `social_*` fields

### PDF not showing mockups

1. Verify mockups uploaded successfully
2. Check OrderDetail has `mockup_*` fields
3. Verify PDF generator received mockup data
4. Check base64 data URLs are valid

### Generation is slow

1. Logo generation (Together AI) takes ~5s - this is the bottleneck
2. Client rendering is fast (~7s for all mockups + social)
3. Consider reducing social platform count if needed
4. Use `setTimeout` to allow UI updates between renders

---

## Future Enhancements

- [ ] Add more mockup templates (phone, laptop, signage)
- [ ] Generate mockups for all 4 logo variants (currently only variant 1)
- [ ] Add animation support (GIF/MP4) for social assets
- [ ] Add more social platforms (Snapchat, Twitch, etc.)
- [ ] WebGL rendering for higher quality
- [ ] SVG output option for mockups

---

## Migration from Placeholders

If you previously used placeholder images:

1. **Old mockups** were from `placehold.co` (text images)
2. **New mockups** are real rendered images with brand colors
3. **Data format** is the same (base64 data URLs in OrderDetail)
4. **No migration needed** - new orders will use new system automatically

---

**Last Updated:** 2026-03-14  
**Status:** ✅ Real rendering implemented and working
