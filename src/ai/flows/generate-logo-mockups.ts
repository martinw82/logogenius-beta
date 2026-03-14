'use server';

/**
 * @fileOverview Logo mockup generation using Together AI
 * 
 * Generates mockup images showing the logo on various templates
 * (letterhead, t-shirt, business card) using Together AI.
 */

import {z} from 'genkit';

const GenerateLogoMockupsInputSchema = z.object({
  logoImageUrl: z.string().describe('Base64 data URL or URL of the logo image.'),
  businessName: z.string().describe('The name of the business.'),
  industry: z.string().describe('The industry of the business.'),
  mockupTemplates: z.array(z.enum(['letterhead', 'tshirt', 'businesscard'])).describe('Which mockup templates to generate.'),
  colorPalette: z.string().optional().describe('Description of brand colors.'),
  userApiKey: z.string().optional().describe('Together AI API key.'),
});

export type GenerateLogoMockupsInput = z.infer<typeof GenerateLogoMockupsInputSchema>;

const GenerateLogoMockupsOutputSchema = z.object({
  letterheadMockup: z.string().optional().describe('Base64 data URL of letterhead mockup.'),
  tshirtMockup: z.string().optional().describe('Base64 data URL of t-shirt mockup.'),
  businesscardMockup: z.string().optional().describe('Base64 data URL of business card mockup.'),
});

export type GenerateLogoMockupsOutput = z.infer<typeof GenerateLogoMockupsOutputSchema>;

/**
 * Generate logo mockups using Together AI
 */
export async function generateLogoMockups(
  input: GenerateLogoMockupsInput
): Promise<GenerateLogoMockupsOutput> {
  return generateLogoMockupsFlow(input);
}

async function generateLogoMockupsFlow(
  flowInput: GenerateLogoMockupsInput
): Promise<GenerateLogoMockupsOutput> {
  const apiKey = flowInput.userApiKey || process.env.TOGETHER_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "Together AI API key is required. Please set TOGETHER_API_KEY environment variable or pass userApiKey."
    );
  }

  const mockups: GenerateLogoMockupsOutput = {};

  for (const template of flowInput.mockupTemplates) {
    try {
      let prompt = '';
      let mockupKey: keyof GenerateLogoMockupsOutput;

      if (template === 'letterhead') {
        prompt = `Professional business letterhead mockup for "${flowInput.businessName}" (${flowInput.industry}). `;
        prompt += `Show a clean letterhead document with the logo prominently displayed at the top. `;
        prompt += `Include company name, address placeholder, and contact information. `;
        prompt += `Professional layout, business correspondence style, high quality mockup.`;
        if (flowInput.colorPalette) {
          prompt += ` Color scheme: ${flowInput.colorPalette}.`;
        }
        mockupKey = 'letterheadMockup';
      } else if (template === 'tshirt') {
        prompt = `Professional t-shirt mockup for "${flowInput.businessName}" (${flowInput.industry}). `;
        prompt += `Show a high-quality cotton t-shirt with the logo printed on the chest area. `;
        prompt += `Front view, professional product photography style, realistic fabric texture. `;
        prompt += `Clean background, modern merchandise presentation.`;
        if (flowInput.colorPalette) {
          prompt += ` T-shirt color matching brand: ${flowInput.colorPalette}.`;
        }
        mockupKey = 'tshirtMockup';
      } else if (template === 'businesscard') {
        prompt = `Professional business card mockup for "${flowInput.businessName}" (${flowInput.industry}). `;
        prompt += `Show a premium business card with the logo, company name, and contact details. `;
        prompt += `Professional layout, high-quality card stock appearance, elegant design. `;
        prompt += `Clean background, realistic shadows, premium finish.`;
        if (flowInput.colorPalette) {
          prompt += ` Card design using brand colors: ${flowInput.colorPalette}.`;
        }
        mockupKey = 'businesscardMockup';
      } else {
        continue;
      }

      console.log(`[Mockups] Generating ${template} mockup...`);

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
        console.error(`[Mockups] API error for ${template}:`, response.status, errorText);
        
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
        
        continue;
      }

      const data = await response.json();
      const imageData = data.data?.[0]?.b64_json;
      
      if (imageData) {
        (mockups as any)[mockupKey] = `data:image/png;base64,${imageData}`;
        console.log(`[Mockups] ${template} mockup generated successfully`);
      } else {
        console.error(`[Mockups] No image data for ${template}`);
      }
    } catch (error) {
      console.error(`[Mockups] Error generating ${template} mockup:`, error);
    }
  }

  console.log(`[Mockups] Generated mockups:`, Object.keys(mockups));
  return mockups;
}
