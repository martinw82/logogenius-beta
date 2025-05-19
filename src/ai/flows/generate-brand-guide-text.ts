
'use server';
/**
 * @fileOverview Generates textual content for a brand guide.
 *
 * - generateBrandGuideText - A function that generates brand guide sections.
 * - GenerateBrandGuideTextInput - The input type.
 * - GenerateBrandGuideTextOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import { genkit } from 'genkit'; // Import genkit
import { googleAI } from '@genkit-ai/googleai'; // Import googleAI
import {z} from 'genkit';

const GenerateBrandGuideTextInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  industry: z.string().describe('The industry of the business.'),
  keywords: z.string().describe('Keywords describing the brand identity (may include Aesthetic, Emotional, Functional categories).'),
  selectedLogoUrl: z.string().url().describe('URL of the selected logo image.'),
  preferredColorPalette: z.string().optional().describe('User-defined preferred color palette description.'),
  fontStyle: z.string().optional().describe('User-defined preferred font style for the logo.'),
  missionStatement: z.string().optional().describe('The brand\'s mission statement.'),
  brandPillars: z.string().optional().describe('Core brand pillars or values (e.g., "Innovation, Customer-centricity").'),
  brandArchetype: z.string().optional().describe('The brand\'s archetype (e.g., "The Hero", "The Sage", "The Creator").'),
  keyTagline: z.string().optional().describe('The brand\'s key tagline.'),
  userApiKey: z.string().optional().describe('User-provided Google AI API key. THIS IS REQUIRED FOR THE FLOW TO WORK.'),
});

export type GenerateBrandGuideTextInput = z.infer<typeof GenerateBrandGuideTextInputSchema>;

const GenerateBrandGuideTextOutputSchema = z.object({
  projectOverviewSummary: z.string().describe('Generated summary for the Project Overview section, based on mission and pillars.'),
  brandIdentitySummary: z.string().describe('Generated summary for the Brand Identity section, covering brand voice and personality based on archetype, tagline, and keywords.'),
});

export type GenerateBrandGuideTextOutput = z.infer<typeof GenerateBrandGuideTextOutputSchema>;

export async function generateBrandGuideText(
  input: GenerateBrandGuideTextInput
): Promise<GenerateBrandGuideTextOutput> {
  return generateBrandGuideTextFlow(input);
}

const BRAND_GUIDE_TEXT_PROMPT_TEMPLATE = `You are an expert brand strategist. Based on the following information, generate concise and professional text for a brand guide.

Business Name: {{businessName}}
Industry: {{industry}}
Brand Keywords: {{keywords}}
{{#if preferredColorPalette}}Design Color Palette Preference: "{{preferredColorPalette}}"{{/if}}
{{#if fontStyle}}Design Font Style Preference: "{{fontStyle}}"{{/if}}

{{#if missionStatement}}
Mission Statement: "{{missionStatement}}"
{{/if}}
{{#if brandPillars}}
Brand Pillars: "{{brandPillars}}"
{{/if}}
{{#if brandArchetype}}
Brand Archetype: "{{brandArchetype}}"
{{/if}}
{{#if keyTagline}}
Key Tagline: "{{keyTagline}}"
{{/if}}

Generate the following sections:

1.  **Project Overview Summary**:
    *   Briefly introduce the project ({{businessName}}).
    *   Incorporate the mission statement if provided.
    *   Reflect the brand pillars if provided.
    *   Keep it 1-2 paragraphs.

2.  **Brand Identity Summary**:
    *   Describe the overall brand personality and voice.
    *   Use the brand archetype (if provided) as a strong guide for tone and style.
    *   Incorporate the key tagline (if provided) naturally.
    *   Reflect the essence of the brand keywords.
    *   Describe the general feeling the brand should evoke.
    *   Keep it 1-2 paragraphs.

Return ONLY the generated text for these sections in the specified JSON output format.
`;

// This prompt object is for schema definition and type inference.
// Not directly used for execution if userApiKey is always required.
const globallyDefinedBrandGuidePromptForSchema = ai.definePrompt({
  name: 'generateBrandGuideTextPromptDefinition', // Renamed
  input: {schema: GenerateBrandGuideTextInputSchema.omit({ userApiKey: true, selectedLogoUrl: true })},
  output: {schema: GenerateBrandGuideTextOutputSchema},
  prompt: BRAND_GUIDE_TEXT_PROMPT_TEMPLATE,
  model: 'googleai/gemini-2.0-flash', // Specify model for schema association
});

const generateBrandGuideTextFlow = ai.defineFlow(
  {
    name: 'generateBrandGuideTextFlow',
    inputSchema: GenerateBrandGuideTextInputSchema,
    outputSchema: GenerateBrandGuideTextOutputSchema,
  },
  async (flowInput: GenerateBrandGuideTextInput) => {
    if (!flowInput.userApiKey) {
      throw new Error("A Google AI API key is required to generate brand guide text. Please add your key in the 'Use Your Own API Key' section.");
    }

    // Use ai.withConfig for a temporary, one-off configuration with the user's key.
    // This is cleaner if the base `ai` object from `genkit.ts` is already minimally set up.
    const userSpecificAi = ai.withConfig({
        plugins: [ai.registry.plugin('googleai')!({apiKey: flowInput.userApiKey})],
      });

    const templateData: Omit<GenerateBrandGuideTextInput, 'userApiKey' | 'selectedLogoUrl'> = {
      businessName: flowInput.businessName,
      industry: flowInput.industry,
      keywords: flowInput.keywords,
      preferredColorPalette: flowInput.preferredColorPalette,
      fontStyle: flowInput.fontStyle,
      missionStatement: flowInput.missionStatement,
      brandPillars: flowInput.brandPillars,
      brandArchetype: flowInput.brandArchetype,
      keyTagline: flowInput.keyTagline,
    };

    const { output } = await userSpecificAi.generate({
        prompt: BRAND_GUIDE_TEXT_PROMPT_TEMPLATE, 
        input: templateData,                      
        model: 'googleai/gemini-2.0-flash',      
        output: { schema: GenerateBrandGuideTextOutputSchema }, 
    });

    if (!output) {
      throw new Error("Brand guide text generation failed to produce output.");
    }
    return output;
  }
);
