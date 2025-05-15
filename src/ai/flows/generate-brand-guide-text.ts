
'use server';
/**
 * @fileOverview Generates textual content for a brand guide.
 *
 * - generateBrandGuideText - A function that generates brand guide sections.
 * - GenerateBrandGuideTextInput - The input type.
 * - GenerateBrandGuideTextOutput - The return type.
 */

import {ai} from '@/ai/genkit';
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
  userApiKey: z.string().optional().describe('Optional user-provided Google AI API key.'),
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

// Store the Handlebars template string
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

// This is the prompt object defined with the global `ai` instance.
// It's used when NO userApiKey is provided.
const globallyDefinedBrandGuidePrompt = ai.definePrompt({
  name: 'generateBrandGuideTextPrompt',
  // The input schema for this prompt object does not include userApiKey or selectedLogoUrl,
  // as they are not part of the Handlebars template itself.
  input: {schema: GenerateBrandGuideTextInputSchema.omit({ userApiKey: true, selectedLogoUrl: true })},
  output: {schema: GenerateBrandGuideTextOutputSchema},
  prompt: BRAND_GUIDE_TEXT_PROMPT_TEMPLATE,
});

const generateBrandGuideTextFlow = ai.defineFlow(
  {
    name: 'generateBrandGuideTextFlow',
    inputSchema: GenerateBrandGuideTextInputSchema, // Flow input can contain userApiKey etc.
    outputSchema: GenerateBrandGuideTextOutputSchema,
  },
  async (flowInput: GenerateBrandGuideTextInput) => {
    // Prepare the data that will be passed into the Handlebars template
    // This should match the schema defined in `globallyDefinedBrandGuidePrompt.input.schema`
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

    if (flowInput.userApiKey) {
      // Use a temporary AI instance configured with the user's API key
      const userSpecificAi = ai.withConfig({
          plugins: [ai.registry.plugin('googleai')!({apiKey: flowInput.userApiKey})],
        });

      const { output } = await userSpecificAi.generate({
          prompt: BRAND_GUIDE_TEXT_PROMPT_TEMPLATE, // Pass the raw template string
          input: templateData,                       // Pass the data for Handlebars
          model: 'googleai/gemini-2.0-flash',      // Specify the model
          output: { schema: GenerateBrandGuideTextOutputSchema }, // Specify the expected output schema
          // config: { safetySettings: [...] } // Add safety settings if needed
      });

      if (!output) {
        throw new Error("Brand guide text generation failed to produce output (with user API key).");
      }
      return output;
    } else {
      // No user API key, so use the globally defined prompt object.
      // This prompt object was defined with the global `ai` instance and its default API key.
      const { output } = await globallyDefinedBrandGuidePrompt(templateData);

      if (!output) {
        throw new Error("Brand guide text generation failed to produce output (default API key).");
      }
      return output;
    }
  }
);
