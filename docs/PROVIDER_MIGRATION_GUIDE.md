# Provider Migration Guide

## Quick Answer: Is it hard to switch?

**NO.** With the new abstraction layer, switching providers is as simple as changing one environment variable.

## Provider Comparison

| Provider | Cost/Image | Quality | Setup Difficulty | Best For |
|----------|-----------|---------|------------------|----------|
| **Together AI** | $0.001 | ⭐⭐⭐ | Super Easy | Prototyping, low budget |
| **Replicate** | $0.05 | ⭐⭐⭐⭐⭐ | Easy | Production, Imagen 3 |
| **Fal.ai** | $0.15 | ⭐⭐⭐⭐⭐ | Easy | Fastest generation |
| **Laozhang.ai** | $0.05 | ⭐⭐⭐⭐⭐ | Easy | OpenAI-compatible |
| **Google** | $0.04 | ⭐⭐⭐⭐⭐ | Medium | Best quality at scale |

## How to Switch Providers

### Step 1: Get API Key
Sign up for your chosen provider and get an API key.

### Step 2: Update Environment Variable
```bash
# Switch to Replicate (recommended for quality)
IMAGE_GEN_PROVIDER=replicate
REPLICATE_API_KEY=your_key_here

# That's it! No code changes needed.
```

### Step 3: Redeploy
```bash
git push origin beta
```

## Provider-Specific Notes

### Together AI (Current)
- **Cost**: ~$0.001/image (cheapest)
- **Quality**: Good but requires prompt optimization
- **Model**: Stable Diffusion XL
- **Pros**: Cheap, fast, no setup
- **Cons**: Struggles with text, less consistent

### Replicate (Recommended Upgrade)
- **Cost**: ~$0.05/image (Imagen 3)
- **Quality**: Excellent - matches your previous Google results
- **Model**: Google Imagen 3
- **Pros**: Hosts Google models, simple API, pay-as-you-go
- **Cons**: Async (requires polling), slightly more expensive than direct Google

### Fal.ai
- **Cost**: ~$0.15/image
- **Quality**: Excellent
- **Model**: Google Imagen 3
- **Pros**: Fastest generation, great DX
- **Cons**: Most expensive

### Google Imagen (Direct)
- **Cost**: ~$0.04/image
- **Quality**: Best
- **Model**: Imagen 3
- **Pros**: Native Google quality, cheapest for quality
- **Cons**: Requires Google Cloud setup, billing complexity

## Migration Path Recommendation

### Phase 1: Immediate (Stay with Together)
- Optimize prompts for Together AI
- Accept lower quality for now
- Cost: ~$0.50 for 500 logos

### Phase 2: Quality Upgrade (Switch to Replicate)
- Set `IMAGE_GEN_PROVIDER=replicate`
- Get Imagen 3 quality
- Cost: ~$25 for 500 logos
- **No code changes needed!**

### Phase 3: Scale (Switch to Direct Google)
- Set `IMAGE_GEN_PROVIDER=google`
- Slightly cheaper than Replicate
- Cost: ~$20 for 500 logos
- **No code changes needed!**

## Code Example

```typescript
// This code works with ANY provider:
import { generateImage } from '@/lib/services/image-generation';

const result = await generateImage({
  prompt: "Professional logo for TechStart...",
  width: 1024,
  height: 1024,
});

// Result structure is identical regardless of provider:
// { imageUrl: "data:image/png;base64,...", provider: "replicate", cost: 0.05 }
```

## Troubleshooting

### "Provider not found" error
Make sure `IMAGE_GEN_PROVIDER` is set to one of:
- `together`
- `replicate`
- `fal`
- `google`

### "API key not set" error
Each provider needs its own API key environment variable:
- `TOGETHER_API_KEY`
- `REPLICATE_API_KEY`
- `FAL_API_KEY`
- `GOOGLE_API_KEY`

### Quality issues with Together AI
Together AI (SDXL) needs different prompts than Google Imagen:
- Add "vector style, flat design, clean lines"
- Use negative prompts: "photorealistic, texture, watermark"
- Be more explicit about composition

## Cost Calculator

| Logos/Month | Together | Replicate | Fal | Laozhang | Google |
|-------------|----------|-----------|-----|----------|--------|
| 100 | $0.10 | $5 | $15 | $5 | $4 |
| 500 | $0.50 | $25 | $75 | $25 | $20 |
| 1000 | $1 | $50 | $150 | $50 | $40 |
| 5000 | $5 | $250 | $750 | $250 | $200 |

## Recommendation

**Start with Replicate** if you want quality now:
1. Sign up: https://replicate.com
2. Add $10 credit
3. Set `IMAGE_GEN_PROVIDER=replicate`
4. Get Imagen 3 quality immediately

**Switch to direct Google later** when you have 1000+ logos/month to save ~20% on costs.
