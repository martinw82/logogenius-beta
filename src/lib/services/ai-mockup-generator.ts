/**
 * AI Photorealistic Mockup Generator
 *
 * Generates 3 high-quality product mockups (t-shirt, coffee mug, tote bag)
 * using AI image generation for the selected logo variant.
 *
 * Called during Phase 2 finalization (after logo selection).
 * Reuses the existing image-generation.ts provider abstraction.
 */

import { generateImage } from './image-generation';

export interface AIMockupOptions {
  businessName: string;
  brandColors: string[];    // hex codes e.g. ['#2563eb', '#1e40af', '#f59e0b']
  industry: string;
  logoStyle?: string;       // e.g. 'modern geometric', 'classic script', etc.
  keywords?: string;
}

export interface AIMockupResult {
  tshirt: string;     // base64 data URL
  coffeeMug: string;  // base64 data URL
  toteBag: string;    // base64 data URL
}

/**
 * Build a color description string from hex codes
 */
function describeColors(colors: string[]): string {
  const colorNames: Record<string, string> = {
    '#000000': 'black', '#ffffff': 'white', '#ff0000': 'red',
    '#00ff00': 'green', '#0000ff': 'blue', '#ffff00': 'yellow',
    '#ff6600': 'orange', '#800080': 'purple', '#ffc0cb': 'pink',
  };

  return colors.slice(0, 3).map(hex => {
    const lower = hex.toLowerCase();
    if (colorNames[lower]) return colorNames[lower];
    // Parse and describe roughly
    const r = parseInt(lower.slice(1, 3), 16);
    const g = parseInt(lower.slice(3, 5), 16);
    const b = parseInt(lower.slice(5, 7), 16);
    if (r > 200 && g < 100 && b < 100) return 'red';
    if (r < 100 && g > 200 && b < 100) return 'green';
    if (r < 100 && g < 100 && b > 200) return 'blue';
    if (r > 200 && g > 150 && b < 100) return 'orange';
    if (r > 200 && g > 200 && b < 100) return 'yellow';
    if (r > 150 && g < 100 && b > 150) return 'purple';
    if (r < 80 && g < 80 && b < 80) return 'dark';
    if (r > 180 && g > 180 && b > 180) return 'light gray';
    return `${hex} toned`;
  }).join(' and ');
}

/**
 * Generate 3 AI photorealistic product mockups
 */
export async function generateAIMockups(options: AIMockupOptions): Promise<AIMockupResult> {
  const colorDesc = describeColors(options.brandColors);
  const styleDesc = options.logoStyle || 'modern minimalist';
  const industry = options.industry || 'business';

  console.log('[AI Mockups] Generating 3 photorealistic mockups...');

  const negativePrompt = 'blurry, low quality, distorted text, watermark, ugly, deformed, cartoon, illustration, painting, sketch, drawing';

  // Generate t-shirt mockup
  console.log('[AI Mockups] Generating t-shirt mockup...');
  const tshirtResult = await generateImage({
    prompt: `Professional product photography of a white cotton t-shirt on a young person, front view, studio lighting with soft shadows, the t-shirt has a ${styleDesc} printed logo design in ${colorDesc} colors for a ${industry} brand called "${options.businessName}", clean light gray studio background, fashion editorial style, high-end lookbook aesthetic, sharp focus, 4K quality`,
    negativePrompt,
    width: 1024,
    height: 1024,
    steps: 30,
  });

  // Generate coffee mug mockup
  console.log('[AI Mockups] Generating coffee mug mockup...');
  const mugResult = await generateImage({
    prompt: `Professional product photography of a white ceramic coffee mug on a clean wooden desk surface, warm natural window lighting, the mug has a ${styleDesc} logo design in ${colorDesc} colors for "${options.businessName}" ${industry} brand, lifestyle setting with subtle blurred background, minimalist composition, commercial product shot, 4K quality`,
    negativePrompt,
    width: 1024,
    height: 1024,
    steps: 30,
  });

  // Generate tote bag mockup
  console.log('[AI Mockups] Generating tote bag mockup...');
  const toteResult = await generateImage({
    prompt: `Professional product photography of a natural canvas tote bag held by a person outdoors, the tote bag features a ${styleDesc} printed logo in ${colorDesc} colors for "${options.businessName}" ${industry} brand, clean urban background, lifestyle editorial style, soft natural lighting, sharp focus, 4K quality`,
    negativePrompt,
    width: 1024,
    height: 1024,
    steps: 30,
  });

  console.log('[AI Mockups] All 3 mockups generated successfully');

  return {
    tshirt: tshirtResult.imageUrl,
    coffeeMug: mugResult.imageUrl,
    toteBag: toteResult.imageUrl,
  };
}
