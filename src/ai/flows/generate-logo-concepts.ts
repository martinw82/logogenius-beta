'use server';

/**
 * @fileOverview Logo concept generation using Together AI
 * 
 * This flow generates multiple logo concepts using Together AI's image generation API.
 * It uses Stable Diffusion XL for high-quality logo generation.
 */

import {z} from 'genkit';

const GenerateLogoConceptsInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  industry: z.string().describe('The industry of the business.'),
  keywords: z.string().describe('Keywords describing the brand identity.'),
  preferredColorPalette: z.string().optional().describe('Preferred color palette.'),
  preferredLogoStyle: z.enum(['logomark', 'wordmark', 'lettermark', 'combination', 'emblem', 'abstract', 'mascot', 'minimalist']).optional(),
  composition: z.enum(['horizontal', 'vertical', 'circular', 'square']).optional(),
  iconPlacement: z.enum(['above_text', 'left_of_text', 'right_of_text', 'below_text', 'no_icon', 'icon_only']).optional(),
  fontStyle: z.string().optional().describe('Preferred font style.'),
  iconComplexity: z.enum(['simple', 'detailed']).optional(),
  iconSpecifics: z.string().optional().describe('Specific imagery for the icon.'),
  targetAudience: z.string().optional().describe('Target audience description.'),
  inspirationReferences: z.string().optional().describe('Inspiration references.'),
  usageContext: z.string().optional().describe('Usage context.'),
  negativeKeywords: z.string().optional().describe('Keywords to avoid.'),
  competitorsToAvoid: z.string().optional().describe('Competitors to differentiate from.'),
  variationInstructions: z.string().optional().describe('Variation instructions.'),
  numberOfLogos: z.number().default(4).describe('Number of logos to generate'),
  userApiKey: z.string().optional().describe('Together AI API key.'),
  referenceImageDataUri: z.string().optional().describe('Reference image data URI.'),
});

export type GenerateLogoConceptsInput = z.infer<typeof GenerateLogoConceptsInputSchema>;

const GenerateLogoConceptsOutputSchema = z.object({
  logoUrls: z.array(z.string()).describe('Array of generated logo image URLs (base64 data URLs).'),
});

export type GenerateLogoConceptsOutput = z.infer<typeof GenerateLogoConceptsOutputSchema>;

/**
 * Generate logo concepts using Together AI
 */
export async function generateLogoConcepts(
  input: GenerateLogoConceptsInput
): Promise<GenerateLogoConceptsOutput> {
  return generateLogoConceptsFlow(input);
}

async function generateLogoConceptsFlow(
  flowInput: GenerateLogoConceptsInput
): Promise<GenerateLogoConceptsOutput> {
  // Get API key from input or environment
  const apiKey = flowInput.userApiKey || process.env.TOGETHER_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "Together AI API key is required. Please set TOGETHER_API_KEY environment variable or pass userApiKey."
    );
  }

  const logoUrls: string[] = [];
  
  // Build base prompt
  let basePrompt = `Professional logo design for "${flowInput.businessName}", ${flowInput.industry} industry. `;
  basePrompt += `Style: ${flowInput.keywords}. `;
  
  if (flowInput.preferredColorPalette) {
    basePrompt += `Colors: ${flowInput.preferredColorPalette}. `;
  }
  if (flowInput.preferredLogoStyle) {
    basePrompt += `${flowInput.preferredLogoStyle} style. `;
  }
  if (flowInput.composition) {
    basePrompt += `${flowInput.composition} composition. `;
  }
  if (flowInput.iconComplexity) {
    basePrompt += `${flowInput.iconComplexity} design. `;
  }
  if (flowInput.iconSpecifics) {
    basePrompt += `Icon: ${flowInput.iconSpecifics}. `;
  }
  if (flowInput.targetAudience) {
    basePrompt += `Target: ${flowInput.targetAudience}. `;
  }
  if (flowInput.negativeKeywords) {
    basePrompt += `Avoid: ${flowInput.negativeKeywords}. `;
  }
  
  // Add quality modifiers for better logos
  basePrompt += "Professional logo, vector style, clean design, transparent background, high quality.";

  // Define design directions for variety
  const designDirections = [
    { name: "Modern Minimalist", modifier: "Minimalist, clean lines, simple geometric shapes, modern aesthetic" },
    { name: "Bold & Iconic", modifier: "Bold, iconic, memorable, strong visual impact" },
    { name: "Elegant & Refined", modifier: "Elegant, refined, sophisticated, premium feel" },
    { name: "Creative & Unique", modifier: "Creative, unique, artistic, distinctive" },
  ];

  // Generate each logo
  for (let i = 0; i < flowInput.numberOfLogos; i++) {
    const direction = designDirections[i % designDirections.length];
    let prompt = `${basePrompt} ${direction.modifier}. Direction: ${direction.name}.`;
    
    console.log(`[Logo Concepts] Generating logo ${i + 1}/${flowInput.numberOfLogos}: ${direction.name}`);

    try {
      const response = await fetch('https://api.together.xyz/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'stabilityai/stable-diffusion-xl-base-1.0',
          prompt: prompt,
          width: 1024,
          height: 1024,
          steps: 30,
          n: 1,
          response_format: 'b64_json',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Logo Concepts] API error for logo ${i + 1}:`, response.status, errorText);
        
        // Parse error for detailed reporting
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { raw: errorText };
        }
        
        // Handle specific error codes
        if (response.status === 401) {
          throw new Error("Invalid Together AI API key. Please check your TOGETHER_API_KEY setting.");
        }
        if (response.status === 402) {
          throw new Error("Together AI credits depleted or not activated. Wait 10-30 mins if you just added credit, or check your balance at together.ai");
        }
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Too many requests. Please wait a moment and try again.");
        }
        if (response.status === 400) {
          throw new Error(`Bad request: ${errorData.error?.message || errorText}`);
        }
        
        // For other errors, continue to next logo but log it
        continue;
      }

      const data = await response.json();
      const imageData = data.data?.[0]?.b64_json;
      
      if (imageData) {
        const dataUrl = `data:image/png;base64,${imageData}`;
        logoUrls.push(dataUrl);
        console.log(`[Logo Concepts] Logo ${i + 1} generated successfully`);
      } else {
        console.error(`[Logo Concepts] No image data for logo ${i + 1}`);
      }
    } catch (error) {
      console.error(`[Logo Concepts] Error generating logo ${i + 1}:`, error);
    }
  }

  if (logoUrls.length === 0) {
    throw new Error("Failed to generate any logos. Please check your API key and credits.");
  }

  console.log(`[Logo Concepts] Generated ${logoUrls.length} logos successfully`);
  return { logoUrls };
}
