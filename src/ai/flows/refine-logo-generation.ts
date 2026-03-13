'use server';

/**
 * @fileOverview Logo prompt refinement using Together AI
 * 
 * Refines logo generation prompts based on user feedback using
 * Together AI's text generation models.
 */

import {z} from 'genkit';

const RefineLogoGenerationInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  keywords: z.string().describe('Keywords for brand identity.'),
  industry: z.string().describe('The target industry.'),
  colorPalette: z.string().optional().describe('Preferred color palette.'),
  logoStyle: z.string().optional().describe('Preferred logo style.'),
  composition: z.enum(['horizontal', 'vertical', 'circular', 'square']).optional(),
  iconPlacement: z.string().optional().describe('Icon placement preference.'),
  fontStyle: z.string().optional().describe('Font style preference.'),
  iconComplexity: z.string().optional().describe('Icon complexity.'),
  iconSpecifics: z.string().optional().describe('Specific icon details.'),
  targetAudience: z.string().optional().describe('Target audience.'),
  inspirationReferences: z.string().optional().describe('Inspiration references.'),
  usageContext: z.string().optional().describe('Usage context.'),
  negativeKeywords: z.string().optional().describe('Keywords to avoid.'),
  competitorsToAvoid: z.string().optional().describe('Competitors to avoid.'),
  variationInstructions: z.string().optional().describe('Variation instructions.'),
  feedback: z.union([z.literal('thumbs_up'), z.literal('thumbs_down')]).describe('User feedback.'),
  previousPrompt: z.string().describe('The previous generation prompt.'),
  userApiKey: z.string().optional().describe('Together AI API key.'),
  referenceImageDataUri: z.string().optional().describe('Reference image data URI.'),
});

export type RefineLogoGenerationInput = z.infer<typeof RefineLogoGenerationInputSchema>;

const RefineLogoGenerationOutputSchema = z.object({
  prompt: z.string().describe('The refined prompt for logo generation.'),
});

export type RefineLogoGenerationOutput = z.infer<typeof RefineLogoGenerationOutputSchema>;

/**
 * Refine logo generation prompt using Together AI
 */
export async function refineLogoGeneration(
  input: RefineLogoGenerationInput
): Promise<RefineLogoGenerationOutput> {
  return refineLogoGenerationFlow(input);
}

async function refineLogoGenerationFlow(
  flowInput: RefineLogoGenerationInput
): Promise<RefineLogoGenerationOutput> {
  const apiKey = flowInput.userApiKey || process.env.TOGETHER_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "Together AI API key is required. Please set TOGETHER_API_KEY environment variable or pass userApiKey."
    );
  }

  // Build the refinement prompt
  let systemPrompt = `You are an expert logo designer and prompt engineer. Your task is to refine image generation prompts based on user feedback.

Original prompt: "${flowInput.previousPrompt}"

User feedback: ${flowInput.feedback === 'thumbs_up' ? 'The user liked the direction but wants improvements' : 'The user did not like the result and wants significant changes'}

Business Details:
- Name: ${flowInput.businessName}
- Industry: ${flowInput.industry}
- Keywords: ${flowInput.keywords}`;

  if (flowInput.colorPalette) systemPrompt += `\n- Color Palette: ${flowInput.colorPalette}`;
  if (flowInput.logoStyle) systemPrompt += `\n- Style: ${flowInput.logoStyle}`;
  if (flowInput.composition) systemPrompt += `\n- Composition: ${flowInput.composition}`;
  if (flowInput.fontStyle) systemPrompt += `\n- Font Style: ${flowInput.fontStyle}`;
  if (flowInput.iconComplexity) systemPrompt += `\n- Icon Complexity: ${flowInput.iconComplexity}`;
  if (flowInput.iconSpecifics) systemPrompt += `\n- Icon Details: ${flowInput.iconSpecifics}`;
  if (flowInput.targetAudience) systemPrompt += `\n- Target Audience: ${flowInput.targetAudience}`;
  if (flowInput.negativeKeywords) systemPrompt += `\n- Avoid: ${flowInput.negativeKeywords}`;

  systemPrompt += `

Based on the feedback and all the details above, generate an improved prompt for an AI image generation model. The prompt should:
1. Be detailed and specific
2. Include quality descriptors (professional, high quality, vector style, etc.)
3. Incorporate the feedback appropriately
4. Mention the business name if relevant
5. Specify logo design best practices

Return ONLY the refined prompt text, nothing else.`;

  console.log('[Refinement] Sending request to Together AI...');

  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the refined prompt:' }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Refinement] API error:', response.status, errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const refinedPrompt = data.choices?.[0]?.message?.content?.trim();
    
    if (!refinedPrompt) {
      throw new Error('No response from Together AI');
    }

    console.log('[Refinement] Prompt refined successfully');
    return { prompt: refinedPrompt };

  } catch (error) {
    console.error('[Refinement] Error:', error);
    // Return a fallback refined prompt
    return { 
      prompt: `Improved logo for ${flowInput.businessName}: ${flowInput.keywords}. Professional design, high quality, vector style, clean and modern aesthetic.` 
    };
  }
}
