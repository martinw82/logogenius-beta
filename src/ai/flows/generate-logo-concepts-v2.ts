'use server';

/**
 * @fileOverview Logo concept generation - Provider Agnostic Version
 * 
 * This flow uses the provider abstraction layer, making it easy to switch
 * between Together AI, Replicate, Fal.ai, or Google Imagen.
 * 
 * To switch providers, just set IMAGE_GEN_PROVIDER env var:
 * - together (default, cheapest)
 * - replicate ($0.05/imagen)
 * - fal ($0.15/imagen)
 * - google ($0.04/imagen - best quality)
 */

import { generateMultipleImages, ImageGenOptions } from '@/lib/services/image-generation';

export interface GenerateLogoConceptsInput {
  businessName: string;
  industry: string;
  keywords: string;
  preferredColorPalette?: string;
  preferredLogoStyle?: 'logomark' | 'wordmark' | 'lettermark' | 'combination' | 'emblem' | 'abstract' | 'mascot' | 'minimalist';
  composition?: 'horizontal' | 'vertical' | 'circular' | 'square';
  targetAudience?: string;
  missionStatement?: string;
  brandPillars?: string;
  brandArchetype?: string;
  negativeKeywords?: string;
  numberOfLogos: number;
}

export interface GenerateLogoConceptsOutput {
  logoUrls: string[];
  provider: string;
  totalCost: number;
}

/**
 * Build an optimized prompt for logo generation
 */
function buildLogoPrompt(input: GenerateLogoConceptsInput, variationIndex: number): string {
  const styleModifiers = [
    { name: "Modern Minimalist", modifier: "Minimalist, clean lines, simple geometric shapes, modern aesthetic" },
    { name: "Bold & Iconic", modifier: "Bold, iconic, memorable, strong visual impact" },
    { name: "Elegant & Refined", modifier: "Elegant, refined, sophisticated, premium feel" },
    { name: "Creative & Unique", modifier: "Creative, unique, artistic, distinctive" },
  ];
  
  const direction = styleModifiers[variationIndex % styleModifiers.length];
  
  let prompt = `Professional logo design for "${input.businessName}", ${input.industry} industry. `;
  prompt += `Style: ${input.keywords}. `;
  
  if (input.preferredColorPalette) {
    prompt += `Colors: ${input.preferredColorPalette}. `;
  }
  if (input.preferredLogoStyle) {
    prompt += `${input.preferredLogoStyle} style. `;
  }
  if (input.composition) {
    prompt += `${input.composition} composition. `;
  }
  if (input.targetAudience) {
    prompt += `Target audience: ${input.targetAudience}. `;
  }
  if (input.brandArchetype) {
    prompt += `Brand archetype: ${input.brandArchetype}. `;
  }
  
  // Add variation-specific modifier
  prompt += `${direction.modifier}. Direction: ${direction.name}. `;
  
  // Technical requirements optimized for all providers
  prompt += "Professional logo, vector style, clean lines, transparent background, high quality. ";
  prompt += "Isolated on white background, centered composition, suitable for business branding.";

  return prompt;
}

/**
 * Generate logo concepts using configured provider
 */
export async function generateLogoConceptsV2(
  input: GenerateLogoConceptsInput
): Promise<GenerateLogoConceptsOutput> {
  console.log(`[Logo Concepts V2] Starting generation for ${input.businessName}`);
  console.log(`[Logo Concepts V2] Provider: ${process.env.IMAGE_GEN_PROVIDER || 'together (default)'}`);

  const negativePrompt = input.negativeKeywords 
    ? `${input.negativeKeywords}, ` 
    : '';
  
  const baseOptions: ImageGenOptions = {
    width: 1024,
    height: 1024,
    steps: 30,
    negativePrompt: `${negativePrompt}textile, fabric, texture, watermark, signature, blurry, low quality, distorted text, illegible font, crowded composition, photorealistic, photography, sketch, hand-drawn, messy lines`,
  };

  // Generate each logo with unique prompt
  const results: string[] = [];
  let totalCost = 0;
  let provider = 'together';

  for (let i = 0; i < input.numberOfLogos; i++) {
    try {
      const prompt = buildLogoPrompt(input, i);
      console.log(`[Logo Concepts V2] Generating logo ${i + 1}/${input.numberOfLogos}`);

      const result = await generateMultipleImages({
        ...baseOptions,
        prompt,
      }, 1);

      if (result.length > 0) {
        results.push(result[0].imageUrl);
        totalCost += result[0].cost || 0;
        provider = result[0].provider;
        console.log(`[Logo Concepts V2] Logo ${i + 1} generated successfully`);
      }
    } catch (error) {
      console.error(`[Logo Concepts V2] Failed to generate logo ${i + 1}:`, error);
      // Continue with other logos
    }
  }

  if (results.length === 0) {
    throw new Error('Failed to generate any logos. Please check your API configuration.');
  }

  console.log(`[Logo Concepts V2] Generated ${results.length} logos via ${provider}, total cost: $${totalCost.toFixed(4)}`);

  return {
    logoUrls: results,
    provider,
    totalCost,
  };
}
