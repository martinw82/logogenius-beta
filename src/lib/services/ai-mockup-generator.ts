/**
 * AI Photorealistic Mockup Generator
 *
 * Generates 3 high-quality product mockups (t-shirt, coffee mug, tote bag).
 *
 * Two modes:
 * 1. **Real Mockup API** (preferred) — uses mockup-generation.ts providers
 *    (Dynamic Mockups, MockupsJar, MockCity) to composite the actual logo PNG
 *    onto real product templates. Pixel-perfect results.
 *
 * 2. **AI Fallback** — uses image-generation.ts to generate representative
 *    product photos via AI. The logo is described in the prompt, not composited.
 *    Good enough for previews when no mockup API key is configured.
 *
 * Called during Phase 2 finalization (after logo selection).
 */

import { generateImage } from './image-generation';
import { generateMultipleMockups, getProviderInfo } from './mockup-generation';

export interface AIMockupOptions {
  businessName: string;
  brandColors: string[];    // hex codes e.g. ['#2563eb', '#1e40af', '#f59e0b']
  industry: string;
  logoStyle?: string;       // e.g. 'modern geometric', 'classic script', etc.
  keywords?: string;
  /** Public URL of the actual logo image. When provided AND a mockup API is
   *  configured, real template-based mockups are generated instead of AI ones. */
  logoUrl?: string;
}

export interface AIMockupResult {
  tshirt: string;     // base64 data URL
  coffeeMug: string;  // base64 data URL
  toteBag: string;    // base64 data URL
}

/**
 * Map hex colors to natural language descriptions for prompts
 */
function describeColors(colors: string[]): string {
  return colors.slice(0, 3).map(hex => {
    const lower = hex.toLowerCase();
    const r = parseInt(lower.slice(1, 3), 16);
    const g = parseInt(lower.slice(3, 5), 16);
    const b = parseInt(lower.slice(5, 7), 16);

    // Named colors
    if (r > 200 && g < 80 && b < 80) return 'bold red';
    if (r < 80 && g > 180 && b < 80) return 'vibrant green';
    if (r < 80 && g < 80 && b > 180) return 'deep blue';
    if (r > 200 && g > 140 && b < 80) return 'warm amber';
    if (r > 200 && g > 200 && b < 100) return 'golden yellow';
    if (r > 140 && g < 80 && b > 140) return 'rich purple';
    if (r < 60 && g < 60 && b < 60) return 'matte black';
    if (r > 30 && r < 100 && g > 30 && g < 100 && b > 100) return 'navy blue';
    if (r > 200 && g > 200 && b > 200) return 'clean white';
    if (r > 160 && g > 160 && b > 160) return 'soft gray';
    if (r > 180 && g < 120 && b < 120) return 'coral';
    if (r < 80 && g > 140 && b > 140) return 'teal';
    return hex;
  }).join(' and ');
}

/**
 * Get industry-specific scene context for more relevant mockups
 */
function getIndustryContext(industry: string): { scene: string; vibe: string } {
  const lower = industry.toLowerCase();
  if (lower.includes('tech') || lower.includes('software') || lower.includes('saas'))
    return { scene: 'modern minimalist office', vibe: 'clean tech startup' };
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('cafe'))
    return { scene: 'bright artisan cafe', vibe: 'warm foodie' };
  if (lower.includes('fitness') || lower.includes('health') || lower.includes('gym'))
    return { scene: 'bright gym or outdoor', vibe: 'active lifestyle' };
  if (lower.includes('fashion') || lower.includes('beauty') || lower.includes('luxury'))
    return { scene: 'high-end boutique', vibe: 'luxury editorial' };
  if (lower.includes('real estate') || lower.includes('property'))
    return { scene: 'modern architectural space', vibe: 'premium real estate' };
  if (lower.includes('finance') || lower.includes('consulting'))
    return { scene: 'executive office', vibe: 'corporate professional' };
  if (lower.includes('creative') || lower.includes('design') || lower.includes('art'))
    return { scene: 'creative studio', vibe: 'artistic modern' };
  if (lower.includes('eco') || lower.includes('sustain') || lower.includes('organic'))
    return { scene: 'natural outdoor setting', vibe: 'eco-conscious minimal' };
  return { scene: 'clean modern space', vibe: 'professional brand' };
}

/**
 * Generate 3 product mockups.
 *
 * If a logoUrl is provided AND a mockup API provider is configured,
 * uses real template-based compositing (pixel-perfect).
 * Otherwise falls back to AI-generated product photography.
 */
export async function generateAIMockups(options: AIMockupOptions): Promise<AIMockupResult> {
  // Try real mockup API first
  if (options.logoUrl) {
    const providerInfo = getProviderInfo();
    if (providerInfo.configured) {
      console.log(`[Mockups] Using real mockup API (${providerInfo.provider}) for pixel-perfect compositing...`);
      try {
        const results = await generateMultipleMockups(
          options.logoUrl,
          ['tshirt', 'mug', 'totebag'],
          { businessName: options.businessName }
        );

        // Map results by product type
        const byType = Object.fromEntries(results.map(r => [r.productType, r.imageUrl]));

        if (results.length > 0) {
          return {
            tshirt: byType['tshirt'] || '',
            coffeeMug: byType['mug'] || '',
            toteBag: byType['totebag'] || '',
          };
        }
        console.warn('[Mockups] Real mockup API returned no results, falling back to AI generation');
      } catch (error) {
        console.warn('[Mockups] Real mockup API failed, falling back to AI generation:', error);
      }
    } else {
      console.log(`[Mockups] No mockup API configured (${providerInfo.keyName} not set). Using AI generation fallback.`);
    }
  }

  // Fallback: AI-generated product photography
  const colorDesc = describeColors(options.brandColors);
  const styleDesc = options.logoStyle || 'modern minimalist';
  const industry = options.industry || 'business';
  const ctx = getIndustryContext(industry);
  const brandName = options.businessName;

  console.log('[AI Mockups] Generating 3 photorealistic mockups...');
  console.log(`[AI Mockups] Brand: ${brandName}, Colors: ${colorDesc}, Style: ${styleDesc}`);

  const negativePrompt = 'blurry, low quality, distorted text, watermark, ugly, deformed, cartoon, illustration, painting, sketch, drawing, amateur, overexposed, underexposed, noisy, grainy';

  // T-shirt mockup — lifestyle UGC style
  console.log('[AI Mockups] Generating t-shirt mockup...');
  const tshirtResult = await generateImage({
    prompt: `UGC style product photography, person wearing a premium white crew-neck t-shirt with a ${styleDesc} logo printed on the chest in ${colorDesc} colors, the logo design is for "${brandName}" a ${industry} brand. Shot in a ${ctx.scene}, natural daylight, shallow depth of field, iPhone photo aesthetic, authentic lifestyle content, the person is casually posed from waist up, sharp focus on the logo print, ${ctx.vibe} atmosphere, high resolution commercial quality`,
    negativePrompt,
    width: 1024,
    height: 1024,
    steps: 35,
  });

  // Coffee mug mockup — cozy lifestyle
  console.log('[AI Mockups] Generating coffee mug mockup...');
  const mugResult = await generateImage({
    prompt: `Cozy lifestyle product photo of a matte white ceramic coffee mug sitting on a natural wood surface, the mug features a ${styleDesc} logo in ${colorDesc} for "${brandName}" ${industry} brand. Warm morning window light casting soft shadows, steam rising slightly from the cup, ${ctx.scene} background softly blurred, a few tasteful props nearby (notebook, plant leaf), shot at 45 degree angle, commercial product photography, authentic UGC content style, sharp detail on the mug logo, high resolution`,
    negativePrompt,
    width: 1024,
    height: 1024,
    steps: 35,
  });

  // Tote bag mockup — street style UGC
  console.log('[AI Mockups] Generating tote bag mockup...');
  const toteResult = await generateImage({
    prompt: `Street style UGC photo of a person carrying a natural cotton canvas tote bag over their shoulder, the tote bag has a ${styleDesc} logo printed in ${colorDesc} for "${brandName}" ${industry} brand. Shot outdoors in an urban setting, natural daylight, shallow depth of field with blurred city background, the person is walking casually, authentic lifestyle photography, the logo on the bag is clearly visible and sharp, ${ctx.vibe} aesthetic, high resolution commercial quality`,
    negativePrompt,
    width: 1024,
    height: 1024,
    steps: 35,
  });

  console.log('[AI Mockups] All 3 mockups generated successfully');

  return {
    tshirt: tshirtResult.imageUrl,
    coffeeMug: mugResult.imageUrl,
    toteBag: toteResult.imageUrl,
  };
}
