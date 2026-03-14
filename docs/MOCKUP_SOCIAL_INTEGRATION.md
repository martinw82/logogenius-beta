# Mockup & Social Media Integration

## Overview

Mockups and social media assets are now automatically generated after logo generation.

## What's Generated

### Mockups (All Tiers)
Generated using **FREE HTML/CSS templates** with Puppeteer:

| Mockup | Description | Template |
|--------|-------------|----------|
| **Business Card** | Professional business card with logo | HTML/CSS |
| **Letterhead** | Corporate letterhead design | HTML/CSS |
| **T-Shirt** | Apparel mockup with logo | HTML/CSS |

**Cost: $0** (rendered locally)

### Social Media Assets (Tier 3 Only)
Generated using **FREE Canvas API** (Node.js):

| Platform | Size | Use Case |
|----------|------|----------|
| **Instagram Post** | 1080×1080 | Feed posts |
| **Instagram Story** | 1080×1920 | Stories |
| **Facebook Cover** | 820×312 | Page header |
| **Twitter Header** | 1500×500 | Profile banner |
| **LinkedIn Banner** | 1584×396 | Company page |
| **YouTube Thumbnail** | 1280×720 | Video thumbnails |
| **Pinterest Pin** | 1000×1500 | Pinterest posts |
| **TikTok Cover** | 1080×1920 | TikTok profile |
| **Email Header** | 600×200 | Email campaigns |
| **Website Hero** | 1920×1080 | Website banners |

**Cost: $0** (rendered locally)

---

## How It Works

### 1. Order Generation Flow

```
Admin clicks "Generate Logos"
    ↓
Step 1: Generate 4 logos (AI - Together/Replicate)
    ↓
Step 2: Generate 3 mockups (FREE - HTML/CSS)
    ↓
Step 3: Generate brand guide text (AI)
    ↓
Step 4: IF Tier 3 (premium):
          Generate 10 social assets (FREE - Canvas)
    ↓
Order status: "ready_for_review"
```

### 2. Data Storage

**Mockups:**
```
OrderDetail table:
  - orderId: 60001
  - fieldName: "mockup_businesscard"
  - fieldValue: "data:image/png;base64,..."

LogoVariant table:
  - orderId: 60001
  - variantNum: 1
  - mockupPaths: "{\"businesscard\":\"...\",\"letterhead\":\"...\",\"tshirt\":\"...\"}"
```

**Social Media:**
```
OrderDetail table:
  - orderId: 60001
  - fieldName: "social_instagram_post"
  - fieldValue: "data:image/png;base64,..."
```

### 3. Admin Display

**Mockups Section:**
- Shows all 3 mockups for Variant 1
- Download buttons for each
- Displays in "Mockup Preview" card

**Social Media Section:**
- Only visible for Tier 3 (premium) orders
- Grid of 10 social templates
- Shows size dimensions
- Download buttons for each

---

## Customization

### Mockup Templates

Edit templates in `src/lib/services/mockup-generator.ts`:

```typescript
function getBusinessCardTemplate(options: MockupOptions): string {
  // Customize HTML/CSS here
  return `
    <div class="card" style="background: ${options.primaryColor}">
      <img src="${options.logoUrl}" />
      <h2>${options.businessName}</h2>
    </div>
  `;
}
```

### Social Media Templates

Edit templates in `src/lib/services/social-media-generator.ts`:

```typescript
async function generateInstagramPost(options: SocialAssetOptions): Promise<string> {
  const canvas = createCanvas(1080, 1080);
  const ctx = canvas.getContext('2d');
  
  // Customize drawing here
  ctx.fillStyle = options.primaryColor;
  ctx.fillRect(0, 0, 1080, 1080);
  
  return canvas.toDataURL('image/png');
}
```

---

## Testing

### Test Mockup Generation

```bash
# Create a test order
# Go to /admin/create-order
# Fill in business name and industry
# Click "Create Order"

# Go to order detail
# Click "Generate Logos"
# Wait for generation to complete

# Check mockups section - should show 3 mockups
```

### Test Social Media Generation

```bash
# Create a Tier 3 (premium) order
# Generate logos

# Check "Social Media Assets (Tier 3)" section
# Should show 10 social templates
```

---

## Cost Summary

| Component | Provider | Cost |
|-----------|----------|------|
| **Logos (4)** | Together/Replicate | $0.004-$0.20 |
| **Mockups (3)** | HTML/CSS | **$0** |
| **Social (10)** | Canvas API | **$0** |
| **Brand Guide** | AI Text | ~$0.01 |
| **TOTAL Tier 1/2** | - | **$0.01-$0.21** |
| **TOTAL Tier 3** | - | **$0.01-$0.21** |

**Note:** Mockups and social are FREE - no AI cost!

---

## Troubleshooting

### Mockups not showing

1. Check OrderDetail table for `mockup_*` fields
2. Check server logs for "[Generate] Mockups generated"
3. Verify Puppeteer is installed: `npm list puppeteer`

### Social assets not showing

1. Verify order tier is "premium"
2. Check OrderDetail table for `social_*` fields
3. Check server logs for "[Generate] Social assets generated"

### Generation fails

1. Check server logs for error messages
2. Verify logo generation succeeded first
3. Test mockup generator independently:
   ```typescript
   import { generateMockup } from '@/lib/services/mockup-generator';
   const result = await generateMockup('businesscard', testOptions);
   ```

---

## Future Enhancements

- [ ] Add more mockup templates (phone, laptop, signage)
- [ ] Allow custom brand colors in mockups
- [ ] Add animation to social assets (GIF/MP4)
- [ ] Generate mockups for all 4 logo variants (currently only variant 1)
- [ ] Add more social platforms (Snapchat, Twitch, etc.)
