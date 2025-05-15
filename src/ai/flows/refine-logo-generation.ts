'use server';

/**
 * @fileOverview Refines logo generation based on user feedback.
 *
 * - refineLogoGeneration - A function that refines logo generation based on user feedback.
 * - RefineLogoGenerationInput - The input type for the refineLogoGeneration function.
 * - RefineLogoGenerationOutput - The return type for the refineLogoGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineLogoGenerationInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  keywords: z.string().describe('Descriptive keywords for brand identity.'),
  industry: z.string().describe('The target industry/niche.'),
  colorPalette: z.string().optional().describe('Preferred color palette.'),
  logoStyle: z.string().optional().describe('Preferred logo style.'),
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
  prompt: `You are an AI logo generation expert. You will refine the prompt based on user feedback.

  Previous Prompt: {{{previousPrompt}}}
  Feedback: {{{feedback}}}

  Business Name: {{{businessName}}}
  Keywords: {{{keywords}}}
  Industry: {{{industry}}}
  Color Palette: {{{colorPalette}}}
  Logo Style: {{{logoStyle}}}

  Based on the feedback, refine the prompt to generate a better logo. The prompt should be detailed and specific.
  The prompt should include the business name, keywords, industry, color palette, and logo style.

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
