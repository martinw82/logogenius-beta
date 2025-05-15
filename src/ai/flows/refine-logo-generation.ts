
'use server';

/**
 * @fileOverview Refines logo generation based on user feedback and expanded parameters.
 *
 * - refineLogoGeneration - A function that refines logo generation based on user feedback.
 * - RefineLogoGenerationInput - The input type for the refineLogoGeneration function.
 * - RefineLogoGenerationOutput - The return type for the refineLogoGeneration function.
 */

import {ai} from '@/ai/genkit';
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
  usageContext: z.enum(['digital_only', 'print', 'merchandise', 'digital_and_print']).optional().describe('Optional primary usage context for the logo.'),
  negativeKeywords: z.string().optional().describe('Optional keywords or concepts to avoid.'),
  feedback: z
    .union([
      z.literal('thumbs_up'),
      z.literal('thumbs_down'),
    ])
    .describe('User feedback on the previous logo generation.'),
  previousPrompt: z.string().describe('The prompt used to generate the previous logo.'),
});
export type RefineLogoGenerationInput = z.infer<typeof RefineLogoGenerationInputSchema>;

const RefineLogoGenerationOutputSchema = z.object({
  prompt: z.string().describe('The refined prompt for logo generation.'),
});
export type RefineLogoGenerationOutput = z.infer<typeof RefineLogoGenerationOutputSchema>;

export async function refineLogoGeneration(input: RefineLogoGenerationInput): Promise<RefineLogoGenerationOutput> {
  return refineLogoGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineLogoGenerationPrompt',
  input: {schema: RefineLogoGenerationInputSchema},
  output: {schema: RefineLogoGenerationOutputSchema},
  prompt: `You are an AI logo generation expert. You will refine the prompt based on user feedback and detailed parameters.

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

  Based on the feedback and all available parameters, refine the prompt to generate a better logo.
  The refined prompt should be detailed and specific.
  It should incorporate all relevant fields: business name, keywords, industry, color palette, logo style, icon placement, font style, icon complexity, target audience, inspiration references, usage context, and negative keywords.

  Return the refined prompt.
  `,
});

const refineLogoGenerationFlow = ai.defineFlow(
  {
    name: 'refineLogoGenerationFlow',
    inputSchema: RefineLogoGenerationInputSchema,
    outputSchema: RefineLogoGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
