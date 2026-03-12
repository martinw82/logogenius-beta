
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
  composition: z.enum(['horizontal', 'vertical', 'circular', 'square']).optional().describe('Optional preferred overall layout or arrangement of logo elements.'),
  iconPlacement: z.string().optional().describe('Preferred icon placement.'),
  fontStyle: z.string().optional().describe('Preferred font style.'),
  iconComplexity: z.string().optional().describe('Preferred icon complexity (e.g., simple, detailed).'),
  iconSpecifics: z.string().optional().describe('Optional specific imagery or concepts desired for the icon portion of the logo.'),
  targetAudience: z.string().optional().describe('Optional description of the target audience.'),
  inspirationReferences: z.string().optional().describe('Optional inspiration references.'),
  usageContext: z.string().optional().describe('Optional primary usage context for the logo (e.g., "Digital", "Print & Web").'),
  negativeKeywords: z.string().optional().describe('Optional keywords or concepts to avoid.'),
  competitorsToAvoid: z.string().optional().describe('Optional list of competitor brands to differentiate from.'),
  variationInstructions: z.string().optional().describe('Optional instructions on how generated variations should differ. This may inform the refined prompt if it is intended for multiple future variations.'),
  feedback: z
    .union([
      z.literal('thumbs_up'),
      z.literal('thumbs_down'),
    ])
    .describe('User feedback on the previous logo generation.'),
  previousPrompt: z.string().describe('The prompt used to generate the previous logo.'),
  userApiKey: z.string().optional().describe('User-provided Google AI API key. THIS IS REQUIRED FOR THE FLOW TO WORK.'),
  referenceImageDataUri: z.string().optional().describe("Optional reference image as a data URI that was used in the previous generation. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
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

  {{#if referenceImageDataUri}}
  Context: The previous generation attempt that received this feedback also used a reference image to guide its style/character. Consider this when refining the textual prompt.
  {{/if}}

  Business Name: {{{businessName}}}
  Keywords: {{{keywords}}}
  Industry: {{{industry}}}
  {{#if colorPalette}}Color Palette: {{{colorPalette}}}{{/if}}
  {{#if logoStyle}}Logo Style: {{{logoStyle}}}{{/if}}
  {{#if composition}}Overall Composition: {{{composition}}}{{/if}}
  {{#if iconPlacement}}Icon Placement: {{{iconPlacement}}}{{/if}}
  {{#if fontStyle}}Font Style: {{{fontStyle}}}{{/if}}
  {{#if iconComplexity}}Icon Complexity: {{{iconComplexity}}}{{/if}}
  {{#if iconSpecifics}}Specific Icon Details: {{{iconSpecifics}}}{{/if}}
  {{#if targetAudience}}Target Audience: {{{targetAudience}}}{{/if}}
  {{#if inspirationReferences}}Inspiration References: {{{inspirationReferences}}}{{/if}}
  {{#if usageContext}}Usage Context: {{{usageContext}}}{{/if}}
  {{#if negativeKeywords}}Things to Avoid: {{{negativeKeywords}}}{{/if}}
  {{#if competitorsToAvoid}}Competitors to Differentiate From: {{{competitorsToAvoid}}}{{/if}}
  {{#if variationInstructions}}Previous Variation Instructions (for context): {{{variationInstructions}}}{{/if}}

  Based on the feedback and all available parameters, refine the prompt to generate a better logo.
  The refined prompt should be detailed and specific.
  It should incorporate all relevant fields: businessName, keywords, industry, colorPalette, logoStyle, composition, iconPlacement, fontStyle, iconComplexity, iconSpecifics, targetAudience, inspirationReferences, usageContext, negativeKeywords, and competitorsToAvoid.
  Consider the variation instructions if they provide insight into desired diversity or focus for a single improved concept.
  If a reference image was part of the context for the previous attempt, ensure the refined textual prompt complements or directs how such an image (if used again) should influence the next generation.

  Return ONLY the refined text prompt.
  `;

// Note: globallyDefinedPromptForSchema is primarily for schema definition and type inference.
// The model is not specified here to avoid issues with global AI instance on Vercel.
const globallyDefinedPromptForSchema = ai.definePrompt({
  name: 'refineLogoGenerationPromptDefinition',
  input: {schema: RefineLogoGenerationInputSchema.omit({ userApiKey: true })},
  output: {schema: RefineLogoGenerationOutputSchema},
  prompt: REFINE_PROMPT_HANDLEBARS_TEMPLATE,
  // model: 'googleai/gemini-2.0-flash', // Removed to avoid Vercel issue with global keyless AI
});

const refineLogoGenerationFlow = ai.defineFlow(
  {
    name: 'refineLogoGenerationFlow',
    inputSchema: RefineLogoGenerationInputSchema,
    outputSchema: RefineLogoGenerationOutputSchema,
  },
  async (flowInput: RefineLogoGenerationInput) => {
    if (!flowInput.userApiKey) {
      throw new Error("A Google AI API key is required to refine logos. Please add your key in the 'Use Your Own API Key' section.");
    }

    const currentAi = genkit({
      plugins: [googleAI({ apiKey: flowInput.userApiKey })],
    });
    
    // Prepare data for the Handlebars template, excluding userApiKey
    const promptData: Omit<RefineLogoGenerationInput, 'userApiKey'> = { ...flowInput };
    delete (promptData as any).userApiKey;


    const { output } = await currentAi.generate({
      model: 'googleai/gemini-1.5-flash', // Model that supports image generation
      prompt: REFINE_PROMPT_HANDLEBARS_TEMPLATE,
      input: promptData, // Pass data for Handlebars template
      output: { schema: RefineLogoGenerationOutputSchema },
    });
    
    if (!output) {
        throw new Error("Logo refinement failed to produce output.");
    }
    return output;
  }
);
