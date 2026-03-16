/**
 * AI Social Media Asset Generator
 *
 * Generates 3 high-quality social media assets using AI image generation:
 * - Instagram Post (1080×1080)
 * - YouTube Thumbnail (1280×720)
 * - Website Hero (1920×1080)
 *
 * These are the "hero" social assets — the ones that benefit most from
 * AI generation vs Canvas rendering. The other 7 platforms use improved
 * Canvas templates (client-side, $0 cost).
 *
 * Called during Phase 2 finalization (after logo selection).
 */

import { generateImage } from './image-generation';

export interface AISocialOptions {
  businessName: string;
  brandColors: string[];    // hex codes
  industry: string;
  tagline?: string;
  logoStyle?: string;
}

export interface AISocialResult {
  instagramPost: string;      // base64 data URL
  youtubeThumbnail: string;   // base64 data URL
  websiteHero: string;        // base64 data URL
}

/**
 * Map hex colors to descriptive color names for prompts
 */
function describeColors(colors: string[]): string {
  return colors.slice(0, 3).map(hex => {
    const lower = hex.toLowerCase();
    const r = parseInt(lower.slice(1, 3), 16);
    const g = parseInt(lower.slice(3, 5), 16);
    const b = parseInt(lower.slice(5, 7), 16);
    if (r > 200 && g < 80 && b < 80) return 'bold red';
    if (r < 80 && g > 180 && b < 80) return 'vibrant green';
    if (r < 80 && g < 80 && b > 180) return 'deep blue';
    if (r > 200 && g > 140 && b < 80) return 'warm amber';
    if (r > 200 && g > 200 && b < 100) return 'golden yellow';
    if (r > 140 && g < 80 && b > 140) return 'rich purple';
    if (r < 60 && g < 60 && b < 60) return 'matte black';
    if (r > 30 && r < 100 && g > 30 && g < 100 && b > 100) return 'navy blue';
    if (r > 200 && g > 200 && b > 200) return 'clean white';
    if (r > 180 && g < 120 && b < 120) return 'coral pink';
    if (r < 80 && g > 140 && b > 140) return 'teal';
    return hex;
  }).join(' and ');
}

/**
 * Generate 3 AI social media assets
 */
export async function generateAISocialAssets(options: AISocialOptions): Promise<AISocialResult> {
  const colorDesc = describeColors(options.brandColors);
  const industry = options.industry || 'business';
  const tagline = options.tagline || '';
  const brandName = options.businessName;
  const style = options.logoStyle || 'modern minimalist';

  console.log('[AI Social] Generating 3 AI social media assets...');
  console.log(`[AI Social] Brand: ${brandName}, Colors: ${colorDesc}, Industry: ${industry}`);

  const negativePrompt = 'blurry, low quality, watermark, ugly, deformed, amateur, clip art, stock photo watermark, noisy, pixelated';

  // Instagram Post — brand announcement style (1080×1080 square)
  console.log('[AI Social] Generating Instagram Post...');
  const instagramResult = await generateImage({
    prompt: `Premium Instagram brand post for "${brandName}", a ${industry} company. Square format social media graphic with a ${style} design aesthetic. ${colorDesc} color palette with smooth gradient transitions and abstract geometric accents. Clean centered composition with large bold brand name "${brandName}" in modern sans-serif typography. ${tagline ? `Smaller tagline text below: "${tagline}".` : ''} Subtle texture overlay, professional graphic design quality matching top agencies like Pentagram. No photos or faces, pure brand graphic design, crisp vectors and clean lines`,
    negativePrompt,
    width: 1024,
    height: 1024,
    steps: 35,
  });

  // YouTube Thumbnail — attention-grabbing (1280×720 landscape)
  console.log('[AI Social] Generating YouTube Thumbnail...');
  const youtubeResult = await generateImage({
    prompt: `High-impact YouTube thumbnail for "${brandName}" ${industry} brand channel. Widescreen 16:9 format. Bold ${colorDesc} color scheme with high contrast. Dynamic diagonal composition with large readable text "${brandName}" in thick bold font. ${tagline ? `Supporting text: "${tagline}".` : ''} Abstract geometric background with depth and dimension, slight 3D feel, energetic and click-worthy. Professional YouTube creator aesthetic, not corporate — modern, bold, attention-grabbing. No faces or photos`,
    negativePrompt,
    width: 1024,
    height: 576,
    steps: 35,
  });

  // Website Hero — premium landing page banner (1920×1080 widescreen)
  console.log('[AI Social] Generating Website Hero banner...');
  const heroResult = await generateImage({
    prompt: `Ultra-premium website hero section for "${brandName}", a ${industry} company. Widescreen cinematic format. Flowing gradient mesh background transitioning through ${colorDesc} colors. ${style} design language with subtle abstract shapes — soft blobs, geometric lines, or particles. Clean open layout with generous whitespace, space for a logo on the left third and a call-to-action button area on the right. ${tagline ? `Faint headline text: "${tagline}".` : ''} Modern SaaS landing page aesthetic like Linear or Vercel. Smooth, refined, premium quality`,
    negativePrompt,
    width: 1024,
    height: 576,
    steps: 35,
  });

  console.log('[AI Social] All 3 social assets generated successfully');

  return {
    instagramPost: instagramResult.imageUrl,
    youtubeThumbnail: youtubeResult.imageUrl,
    websiteHero: heroResult.imageUrl,
  };
}
