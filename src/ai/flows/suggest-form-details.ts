
'use server';
/**
 * @fileOverview AI flow to suggest branding details for the logo form.
 *
 * - suggestFormDetails - A function that suggests form details.
 * - SuggestFormDetailsInput - The input type.
 * - SuggestFormDetailsOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';
import { brandArchetypes, colorPaletteMoodsData, logoFormSchema } from '@/components/logo-form-types'; // Assuming enums are here

// Prepare enum lists for the prompt
const availableLogoStyles = logoFormSchema.shape.preferredLogoStyle._def.innerType._def.values.filter((v: string) => v && v !== '_NONE_').join(', ');
const availableBrandArchetypes = brandArchetypes.filter((v: string) => v && v !== '_NONE_').join(', ');
// colorPaletteMoodsData is an array of objects, we need names for the prompt
const availableColorPaletteMoods = colorPaletteMoodsData.map(m => m.name).join(', ');


const SuggestFormDetailsInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  industry: z.string().describe('The industry of the business.'),
  userApiKey: z.string().describe('User-provided Google AI API key. THIS IS REQUIRED for the flow to work.'),
});
export type SuggestFormDetailsInput = z.infer<typeof SuggestFormDetailsInputSchema>;

// Output schema should mirror parts of LogoFormData
export const SuggestFormDetailsOutputSchema = z.object({
  aestheticKeywords: z.string().optional(),
  emotionalKeywords: z.string().optional(),
  functionalKeywords: z.string().optional(),
  primaryColors: z.string().optional().describe("Suggest 1-2 primary colors (name or hex). E.g., Deep Blue, #00008B"),
  secondaryColors: z.string().optional().describe("Suggest 1-2 secondary colors. E.g., Light Grey, #D3D3D3"),
  accentColors: z.string().optional().describe("Suggest 1 accent color. E.g., Bright Yellow, #FFFF00"),
  colorPaletteMoodDescription: z.string().optional().describe("Describe an overall mood for the suggested colors. E.g., 'A vibrant and energetic feel' or 'Calm and trustworthy'. This helps user pick from mood dropdown."),
  preferredLogoStyle: z.string().optional().describe(`Suggest one style from this list: ${availableLogoStyles}`),
  fontStyle: z.string().optional().describe("Suggest a font style for the logo. E.g., Clean sans-serif, Modern script, Geometric"),
  targetAudience: z.string().optional().describe("Suggest a brief target audience description."),
  brandArchetype: z.string().optional().describe(`Suggest one archetype from this list: ${availableBrandArchetypes}`),
  keyTagline: z.string().optional().describe("Suggest a concise and catchy tagline."),
  missionStatement: z.string().optional().describe("Suggest a brief mission statement (1-2 sentences)."),
  brandPillars: z.string().optional().describe("Suggest 3-5 comma-separated brand pillars. E.g., Innovation, Trust, Community"),
});
export type SuggestFormDetailsOutput = z.infer<typeof SuggestFormDetailsOutputSchema>;

export async function suggestFormDetails(
  input: SuggestFormDetailsInput
): Promise<SuggestFormDetailsOutput> {
  return suggestFormDetailsFlow(input);
}

const SUGGEST_FORM_PROMPT_TEMPLATE = `
You are an expert brand strategist and creative consultant.
For a business named "{{businessName}}" in the "{{industry}}" industry, please suggest the following branding elements.
Be concise, creative, and provide practical suggestions that can be directly used or inspire the user.

Suggestions Needed:
1.  Aesthetic Keywords (e.g., modern, minimalist, playful):
2.  Emotional Keywords (e.g., trustworthy, innovative, friendly):
3.  Functional Keywords (e.g., scalable, secure, easy-to-use):
4.  Primary Colors (Suggest 1-2 color names or hex codes, e.g., "Ocean Blue, #CCCCCC"):
5.  Secondary Colors (Suggest 1-2 color names or hex codes):
6.  Accent Colors (Suggest 1 color name or hex code):
7.  Color Palette Mood Description (Briefly describe the feel of the suggested colors, e.g., "Professional and trustworthy" or "Vibrant and energetic"):
8.  Preferred Logo Style (Choose one from: ${availableLogoStyles}):
9.  Font Style for Logo (Describe the font style, e.g., "Geometric Sans-Serif", "Elegant Script", "No text"):
10. Target Audience (Brief description, e.g., "Young professionals aged 25-35" or "Eco-conscious families"):
11. Brand Archetype (Choose one from: ${availableBrandArchetypes}):
12. Key Tagline (Short and memorable):
13. Mission Statement (1-2 sentences):
14. Brand Pillars (3-5 comma-separated words, e.g., Innovation, Integrity, Excellence):

Return ONLY the suggestions in the specified JSON output format. Ensure values for 'preferredLogoStyle' and 'brandArchetype' are exactly from the provided lists.
`;

const suggestFormDetailsFlow = ai.defineFlow(
  {
    name: 'suggestFormDetailsFlow',
    inputSchema: SuggestFormDetailsInputSchema,
    outputSchema: SuggestFormDetailsOutputSchema,
  },
  async (flowInput: SuggestFormDetailsInput) => {
    if (!flowInput.userApiKey) {
      throw new Error("A Google AI API key is required to suggest form details. Please add your key in the 'Use Your Own API Key' section.");
    }

    const currentAi = genkit({
      plugins: [googleAI({ apiKey: flowInput.userApiKey })],
    });
    
    const templateInput = {
        businessName: flowInput.businessName,
        industry: flowInput.industry,
    };

    const { output } = await currentAi.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: SUGGEST_FORM_PROMPT_TEMPLATE,
      input: templateInput,
      output: { schema: SuggestFormDetailsOutputSchema },
      config: {
        safetySettings: [ // Relax safety settings slightly if needed for creative branding terms
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      }
    });

    if (!output) {
      throw new Error("AI form fill suggestion failed to produce output.");
    }
    return output;
  }
);
