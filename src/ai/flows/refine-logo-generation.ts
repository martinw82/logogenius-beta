
'use server';

/**
 * @fileOverview Refines logo generation based on user feedback and expanded parameters.
 *
 * - refineLogoGeneration - A function that refines logo generation based on user feedback.
 * - RefineLogoGenerationInput - The input type for the refineLogoGeneration function.
 * - RefineLogoGenerationOutput - The return type for the refineLogoGeneration function.
 */

import {ai} from '@/ai/genkit';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const RefineLogoGenerationInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  keywords: z.string().describe('Descriptive keywords for brand identity (may include Aesthetic, Emotional, Functional categories).'),
  industry: z.string().describe('The target industry/niche.'),
  colorPalette: z.string().optional().describe('Preferred color palette.'),
  logoStyle: z.string().optional().describe('Preferred logo style.'),
  iconPlacement: z.string().optional().describe('Preferred icon placement.'),
  fontStyle: z.string().optional().describe('Preferred font style.'),
  iconComplexity: z.string().optional().describe('Preferred icon complexity (e.g., simple, detailed).'),
  targetAudience: z.string().optional().describe('Optional description of the target audience.'),
  inspirationReferences: z.string().optional().describe('Optional inspiration references.'),
  usageContext: z.string().optional().describe('Optional primary usage context for the logo (e.g., "Digital", "Print & Web").'),
  negativeKeywords: z.string().optional().describe('Optional keywords or concepts to avoid.'),
  variationInstructions: z.string().optional().describe('Optional instructions on how generated variations should differ. This may inform the refined prompt if it is intended for multiple future variations.'),
  feedback: z
    .union([
      z.literal('thumbs_up'),
      z.literal('thumbs_down'),
    ])
    .describe('User feedback on the previous logo generation.'),
  previousPrompt: z.string().describe('The prompt used to generate the previous logo.'),
  userApiKey: z.string().optional().describe('Optional user-provided Google AI API key.'),
});
export type RefineLogoGenerationInput = z.infer<typeof RefineLogoGenerationInputSchema>;

const RefineLogoGenerationOutputSchema = z.object({
  prompt: z.string().describe('The refined prompt for logo generation.'),
});
export type RefineLogoGenerationOutput = z.infer<typeof RefineLogoGenerationOutputSchema>;

export async function refineLogoGeneration(input: RefineLogoGenerationInput): Promise<RefineLogoGenerationOutput> {
  return refineLogoGenerationFlow(input);
}

const REFINE_PROMPT_HANDLEBARS_TEMPLATE = `You are an AI logo generation expert. You will refine the prompt based on user feedback and detailed parameters.

  Previous Prompt: {{{previousPrompt}}}
  Feedback: {{{feedback}}}

  Business Name: {{{businessName}}}
  Keywords: {{{keywords}}}
  Industry: {{{industry}}}
  {{#if colorPalette}}Color Palette: {{{colorPalette}}}{{/if}}
  {{#if logoStyle}}Logo Style: {{{logoStyle}}}{{/if}}
  {{#if iconPlacement}}Icon Placement: {{{iconPlacement}}}{{/if}}
  {{#if fontStyle}}Font Style: {{{fontStyle}}}{{/if}}
  {{#if iconComplexity}}Icon Complexity: {{{iconComplexity}}}{{/if}}
  {{#if targetAudience}}Target Audience: {{{targetAudience}}}{{/if}}
  {{#if inspirationReferences}}Inspiration References: {{{inspirationReferences}}}{{/if}}
  {{#if usageContext}}Usage Context: {{{usageContext}}}{{/if}}
  {{#if negativeKeywords}}Things to Avoid: {{{negativeKeywords}}}{{/if}}
  {{#if variationInstructions}}Previous Variation Instructions (for context): {{{variationInstructions}}}{{/if}}

  Based on the feedback and all available parameters, refine the prompt to generate a better logo.
  The refined prompt should be detailed and specific.
  It should incorporate all relevant fields: businessName, keywords, industry, colorPalette, logoStyle, iconPlacement, fontStyle, iconComplexity, targetAudience, inspirationReferences, usageContext, and negativeKeywords.
  Consider the variation instructions if they provide insight into desired diversity or focus for a single improved concept.

  Return the refined prompt.
  `;

const globallyDefinedPrompt = ai.definePrompt({
  name: 'refineLogoGenerationPrompt',
  input: {schema: RefineLogoGenerationInputSchema.omit({ userApiKey: true })}, // Exclude userApiKey from prompt template data
  output: {schema: RefineLogoGenerationOutputSchema},
  prompt: REFINE_PROMPT_HANDLEBARS_TEMPLATE,
});

const refineLogoGenerationFlow = ai.defineFlow(
  {
    name: 'refineLogoGenerationFlow',
    inputSchema: RefineLogoGenerationInputSchema,
    outputSchema: RefineLogoGenerationOutputSchema,
  },
  async (flowInput: RefineLogoGenerationInput) => {
    let currentAi = ai;
    const promptData = { ...flowInput };
    // Do not pass userApiKey to the Handlebars template itself
    if (promptData.userApiKey) {
        delete (promptData as any).userApiKey;
    }

    if (flowInput.userApiKey) {
      currentAi = genkit({
        plugins: [googleAI({ apiKey: flowInput.userApiKey })],
      });
      
      // Use currentAi.generate with the template string and specific model
      const { output } = await currentAi.generate({
        model: 'googleai/gemini-2.0-flash', // Default model for text prompts in this app
        prompt: REFINE_PROMPT_HANDLEBARS_TEMPLATE,
        input: promptData,
        output: { schema: RefineLogoGenerationOutputSchema },
        // config: globallyDefinedPrompt.config, // if any safetySettings or other configs were on the original prompt
      });
      return output as RefineLogoGenerationOutput; // Cast needed as generate returns candidate value
    } else {
      // Use the globally defined prompt object which uses the global 'ai' instance
      const {output} = await globallyDefinedPrompt(promptData);
      return output!;
    }
  }
);
