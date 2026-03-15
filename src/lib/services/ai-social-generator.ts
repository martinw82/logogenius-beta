/**
 * AI Social Media Asset Generator
 *
 * Generates 3 high-quality social media assets using AI image generation:
 * - Instagram Post (1080×1080)
 * - YouTube Thumbnail (1280×720)
 * - Website Hero (1920×1080)
 *
 * Called during Phase 2 finalization (after logo selection).
 * Reuses the existing image-generation.ts provider abstraction.
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
 * Build a color description from hex codes
 */
function describeColors(colors: string[]): string {
  return colors.slice(0, 3).map(hex => {
    const lower = hex.toLowerCase();
    const r = parseInt(lower.slice(1, 3), 16);
    const g = parseInt(lower.slice(3, 5), 16);
    const b = parseInt(lower.slice(5, 7), 16);
    if (r > 200 && g < 100 && b < 100) return 'red';
    if (r < 100 && g > 200 && b < 100) return 'green';
    if (r < 100 && g < 100 && b > 200) return 'blue';
    if (r > 200 && g > 150 && b < 100) return 'warm orange';
    if (r > 200 && g > 200 && b < 100) return 'yellow';
    if (r > 150 && g < 100 && b > 150) return 'purple';
    if (r < 80 && g < 80 && b < 80) return 'dark navy';
    if (r > 180 && g > 180 && b > 180) return 'light gray';
    return `${hex}`;
  }).join(', ');
}

/**
 * Generate 3 AI social media assets
 */
export async function generateAISocialAssets(options: AISocialOptions): Promise<AISocialResult> {
  const colorDesc = describeColors(options.brandColors);
  const industry = options.industry || 'business';
  const tagline = options.tagline || '';

  console.log('[AI Social] Generating 3 AI social media assets...');

  const negativePrompt = 'blurry, low quality, watermark, ugly, deformed, photorealistic face closeup, stock photo watermark';

  // Instagram Post (1080×1080 square)
  console.log('[AI Social] Generating Instagram Post...');
  const instagramResult = await generateImage({
    prompt: `Professional branded social media post design for a ${industry} company called "${options.businessName}", square format, modern clean design with ${colorDesc} color scheme, abstract geometric shapes and gradients, centered logo area with clean typography, professional brand post aesthetic, high quality graphic design, Instagram post format${tagline ? `, tagline: "${tagline}"` : ''}`,
    negativePrompt,
    width: 1024,
    height: 1024,
    steps: 30,
  });

  // YouTube Thumbnail (1280×720 landscape)
  console.log('[AI Social] Generating YouTube Thumbnail...');
  const youtubeResult = await generateImage({
    prompt: `Eye-catching YouTube thumbnail design for "${options.businessName}" ${industry} brand, bold text layout, high contrast ${colorDesc} color scheme, dynamic composition, professional graphic design with geometric elements, clean modern typography, widescreen 16:9 format, attention-grabbing design${tagline ? `, text: "${tagline}"` : ''}`,
    negativePrompt,
    width: 1024,
    height: 576,
    steps: 30,
  });

  // Website Hero (1920×1080 widescreen)
  console.log('[AI Social] Generating Website Hero banner...');
  const heroResult = await generateImage({
    prompt: `Modern website hero banner design for a ${industry} company called "${options.businessName}", gradient mesh background using ${colorDesc} colors, clean minimalist layout with space for logo and call-to-action button, professional web design aesthetic, abstract shapes and subtle patterns, ultra-wide format${tagline ? `, headline: "${tagline}"` : ''}`,
    negativePrompt,
    width: 1024,
    height: 576,
    steps: 30,
  });

  console.log('[AI Social] All 3 social assets generated successfully');

  return {
    instagramPost: instagramResult.imageUrl,
    youtubeThumbnail: youtubeResult.imageUrl,
    websiteHero: heroResult.imageUrl,
  };
}
