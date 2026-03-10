
'use server';
/**
 * @fileOverview Generates logo mockups on different templates (letterhead, t-shirt, business card).
 *
 * - generateLogoMockups - A function that generates mockup images.
 * - GenerateLogoMockupsInput - The input type.
 * - GenerateLogoMockupsOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateLogoMockupsInputSchema = z.object({
  logoImageUrl: z.string().url().describe('URL of the logo image to place on mockups.'),
  businessName: z.string().describe('The name of the business.'),
  industry: z.string().describe('The industry of the business.'),
  mockupTemplates: z
    .array(z.enum(['letterhead', 'tshirt', 'businesscard']))
    .describe('Which mockup templates to generate.'),
  colorPalette: z.string().optional().describe('Description of brand colors for mockup context.'),
  userApiKey: z.string().optional().describe('User-provided Google AI API key. REQUIRED.'),
});

export type GenerateLogoMockupsInput = z.infer<typeof GenerateLogoMockupsInputSchema>;

const GenerateLogoMockupsOutputSchema = z.object({
  letterheadMockup: z
    .string()
    .optional()
    .describe('URL of the logo on letterhead mockup.'),
  tshirtMockup: z
    .string()
    .optional()
    .describe('URL of the logo on t-shirt mockup.'),
  businesscardMockup: z
    .string()
    .optional()
    .describe('URL of the logo on business card mockup.'),
});

export type GenerateLogoMockupsOutput = z.infer<typeof GenerateLogoMockupsOutputSchema>;

export async function generateLogoMockups(
  input: GenerateLogoMockupsInput
): Promise<GenerateLogoMockupsOutput> {
  return generateLogoMockupsFlow(input);
}

const generateLogoMockupsFlow = ai.defineFlow(
  {
    name: 'generateLogoMockupsFlow',
    inputSchema: GenerateLogoMockupsInputSchema,
    outputSchema: GenerateLogoMockupsOutputSchema,
  },
  async (flowInput: GenerateLogoMockupsInput) => {
    if (!flowInput.userApiKey) {
      throw new Error(
        'A Google AI API key is required to generate logo mockups. Please add your key.'
      );
    }

    // Create a new Genkit instance with the user's API key
    const currentAi = genkit({
      plugins: [googleAI({ apiKey: flowInput.userApiKey })],
    });

    const mockups: GenerateLogoMockupsOutput = {};

    // Generate each requested mockup template
    for (const template of flowInput.mockupTemplates) {
      try {
        let mockupPrompt = '';
        let mockupKey: 'letterheadMockup' | 'tshirtMockup' | 'businesscardMockup' =
          'letterheadMockup';

        if (template === 'letterhead') {
          mockupPrompt = `Create a professional mockup of a business letterhead for "${flowInput.businessName}" (${flowInput.industry} industry).
          The mockup should show:
          - A clean, professional letterhead design
          - The logo prominently placed in the top left corner
          - Company name and contact information in the header
          - Lined area for letter content
          - Professional layout suitable for business correspondence
          ${flowInput.colorPalette ? `- Color scheme: ${flowInput.colorPalette}` : ''}
          - Transparent background for the logo area where it should be placed
          Make it look like a high-quality, professional business document.`;
          mockupKey = 'letterheadMockup';
        } else if (template === 'tshirt') {
          mockupPrompt = `Create a mockup of a t-shirt for the brand "${flowInput.businessName}" (${flowInput.industry} industry).
          The mockup should show:
          - A high-quality t-shirt mockup (front view)
          - The logo prominently displayed on the chest area
          - Professional product photography style
          - The logo should be clearly visible and centered on the shirt
          ${flowInput.colorPalette ? `- Color scheme: ${flowInput.colorPalette}` : ''}
          - Modern, professional product mockup style
          - Realistic fabric texture and lighting
          Make it look like a professional branded merchandise piece.`;
          mockupKey = 'tshirtMockup';
        } else if (template === 'businesscard') {
          mockupPrompt = `Create a mockup of a business card for "${flowInput.businessName}" (${flowInput.industry} industry).
          The mockup should show:
          - A professional business card design (both front and back visible or angled)
          - The logo positioned prominently (typically top left or centered)
          - Company name clearly visible
          - Contact information (phone, email, website placeholders)
          - Professional layout suitable for a ${flowInput.industry} business
          ${flowInput.colorPalette ? `- Color scheme: ${flowInput.colorPalette}` : ''}
          - Clean, modern design
          - Realistic card stock appearance
          Make it look like a high-quality, premium business card.`;
          mockupKey = 'businesscardMockup';
        }

        // Generate the mockup
        const response = await currentAi.generate({
          model: 'googleai/gemini-2.0-flash-exp',
          prompt: mockupPrompt,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });

        if (response.media?.url) {
          (mockups as any)[mockupKey] = response.media.url;
        } else {
          console.warn(`[generateLogoMockupsFlow] Failed to generate ${template} mockup`);
        }
      } catch (error) {
        console.error(`[generateLogoMockupsFlow] Error generating ${template} mockup:`, error);
        // Continue with other mockups if one fails
      }
    }

    return mockups;
  }
);
