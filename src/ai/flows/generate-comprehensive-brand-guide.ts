
'use server';
/**
 * @fileOverview Generates comprehensive brand guide with 12+ sections.
 *
 * - generateComprehensiveBrandGuide - A function that generates a full brand guide.
 * - GenerateComprehensiveBrandGuideInput - The input type.
 * - GenerateComprehensiveBrandGuideOutput - The return type.
 */

import { ai } from '@/ai/genkit';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateComprehensiveBrandGuideInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  industry: z.string().describe('The industry of the business.'),
  keywords: z.string().describe('Keywords describing the brand identity.'),
  selectedLogoUrl: z.string().url().describe('URL of the selected logo image.'),
  missionStatement: z.string().optional().describe('The brand\'s mission statement.'),
  brandPillars: z.string().optional().describe('Core brand pillars (e.g., "Innovation, Customer-centricity").'),
  brandArchetype: z.string().optional().describe('The brand\'s archetype (e.g., "The Hero", "The Sage").'),
  keyTagline: z.string().optional().describe('The brand\'s key tagline.'),
  targetAudience: z.string().optional().describe('Description of target audience.'),
  companyValues: z.string().optional().describe('Core company values.'),
  preferredColorPalette: z.string().optional().describe('Preferred color palette description.'),
  preferredLogoStyle: z.string().optional().describe('Preferred logo style.'),
  web3BlockchainFocus: z.boolean().optional().describe('Whether this is a Web3/blockchain project.'),
  web3ProjectType: z.string().optional().describe('Type of Web3 project (DeFi, NFT, DAO, etc.).'),
  web3TokenSymbol: z.string().optional().describe('Token symbol if applicable.'),
  web3CommunityValues: z.string().optional().describe('Community values for Web3 projects.'),
  userApiKey: z.string().optional().describe('User-provided Google AI API key. REQUIRED.'),
});

export type GenerateComprehensiveBrandGuideInput = z.infer<typeof GenerateComprehensiveBrandGuideInputSchema>;

const GenerateComprehensiveBrandGuideOutputSchema = z.object({
  projectOverview: z.string().describe('1. Project Overview section'),
  brandIdentityVoice: z.string().describe('2. Brand Identity & Voice section'),
  logoPhilosophy: z.string().describe('3. Logo Philosophy section'),
  colorPalette: z.string().describe('4. Color Palette section with hex codes'),
  colorAccessibility: z.string().describe('5. Color Accessibility & WCAG section'),
  typography: z.string().describe('6. Typography Guide section'),
  imageryStyle: z.string().describe('7. Imagery & Photography Style section'),
  graphicElements: z.string().describe('8. Graphic Elements section'),
  brandVoiceTone: z.string().describe('9. Brand Voice & Tone Guidelines section'),
  visualStyleGuide: z.string().describe('10. Visual Style Guide section'),
  usageRulesAndDonts: z.string().describe('11. Usage Rules & Don\'ts section'),
  web3Section: z.string().optional().describe('12. Web3/Blockchain Specific section (if applicable)'),
  appendix: z.string().describe('13. Appendix with resources and version history'),
});

export type GenerateComprehensiveBrandGuideOutput = z.infer<typeof GenerateComprehensiveBrandGuideOutputSchema>;

export async function generateComprehensiveBrandGuide(
  input: GenerateComprehensiveBrandGuideInput
): Promise<GenerateComprehensiveBrandGuideOutput> {
  return generateComprehensiveBrandGuideFlow(input);
}

const COMPREHENSIVE_BRAND_GUIDE_PROMPT_TEMPLATE = `You are an expert brand strategist and designer. Your task is to generate a comprehensive, professional brand guide for the following business.

BUSINESS INFORMATION:
- Name: {{businessName}}
- Industry: {{industry}}
- Brand Keywords: {{keywords}}
{{#if missionStatement}}- Mission: {{missionStatement}}{{/if}}
{{#if brandPillars}}- Brand Pillars: {{brandPillars}}{{/if}}
{{#if brandArchetype}}- Brand Archetype: {{brandArchetype}}{{/if}}
{{#if keyTagline}}- Tagline: {{keyTagline}}{{/if}}
{{#if targetAudience}}- Target Audience: {{targetAudience}}{{/if}}
{{#if companyValues}}- Core Values: {{companyValues}}{{/if}}
{{#if preferredColorPalette}}- Color Preference: {{preferredColorPalette}}{{/if}}
{{#if preferredLogoStyle}}- Logo Style: {{preferredLogoStyle}}{{/if}}

{{#if web3BlockchainFocus}}
WEB3/BLOCKCHAIN CONTEXT:
- Project Type: {{web3ProjectType}}
{{#if web3TokenSymbol}}- Token Symbol: {{web3TokenSymbol}}{{/if}}
{{#if web3CommunityValues}}- Community Values: {{web3CommunityValues}}{{/if}}
{{/if}}

Generate a comprehensive brand guide with the following sections. Be specific, practical, and actionable.

1. **PROJECT OVERVIEW** (2-3 paragraphs)
   - Brief company introduction
   - Mission and vision
   - Why the company exists and matters
   - Key success factors

2. **BRAND IDENTITY & VOICE** (2-3 paragraphs)
   - Brand personality and archetype
   - Voice and tone (how you communicate)
   - Key brand attributes
   - How customers should feel when interacting with the brand

3. **LOGO PHILOSOPHY** (2 paragraphs)
   - Why this logo works for this brand
   - Design thinking behind the logo
   - Core message the logo communicates
   - Primary usage context

4. **COLOR PALETTE** (2-3 paragraphs)
   - Primary colors (with hex codes and RGB values)
   - Secondary colors (with hex codes and RGB values)
   - Accent colors (with hex codes and RGB values)
   - Color psychology and meaning
   - How each color is used

5. **COLOR ACCESSIBILITY & WCAG COMPLIANCE** (2 paragraphs)
   - WCAG AA contrast ratio guidelines
   - Specific contrast ratios between primary colors
   - Recommendations for text on backgrounds
   - Accessibility best practices

6. **TYPOGRAPHY GUIDE** (2-3 paragraphs)
   - Primary font family and weights
   - Secondary font family and weights
   - Font sizing hierarchy (H1, H2, H3, body, small)
   - Font usage rules and pairing guidelines
   - Font licensing information if relevant

7. **IMAGERY & PHOTOGRAPHY STYLE** (2-3 paragraphs)
   - Photographic style (e.g., vibrant, minimalist, authentic, lifestyle)
   - Subject matter preferences
   - Composition style (e.g., people-focused, product-focused, environmental)
   - Color treatment (e.g., vibrant, desaturated, muted)
   - What imagery to avoid

8. **GRAPHIC ELEMENTS** (2 paragraphs)
   - Icon style (e.g., line, filled, glyph)
   - Pattern usage guidelines
   - Illustration style if applicable
   - Decorative elements and ornamentation rules
   - Size and spacing guidelines

9. **BRAND VOICE & TONE GUIDELINES** (2-3 paragraphs)
   - Key brand voice characteristics (e.g., professional, friendly, authoritative)
   - Tone variations for different contexts (customer service, marketing, educational)
   - Vocabulary choices (words to use and avoid)
   - Sentence structure preferences
   - Examples of good and poor communication

10. **VISUAL STYLE GUIDE** (2-3 paragraphs)
    - Spacing and grid systems
    - Layout principles
    - Shadow and depth treatments
    - Texture and material treatments
    - Animation and motion principles if applicable

11. **USAGE RULES & DON'TS** (2-3 paragraphs)
    - Clear DON'Ts for logo usage
    - Minimum size requirements
    - Color variations not allowed
    - Common mistakes to avoid
    - What not to do with the brand

{{#if web3BlockchainFocus}}
12. **WEB3/BLOCKCHAIN SPECIFIC GUIDELINES** (2-3 paragraphs)
    - Token symbol and visual representation
    - Blockchain context (which chain, if relevant)
    - DAO/governance visual guidelines if applicable
    - NFT aesthetic guidelines if applicable
    - Community values visual representation
    - How the brand appears in crypto contexts (wallets, exchanges, etc.)
{{/if}}

13. **APPENDIX** (1-2 paragraphs)
    - Font licensing and download links
    - Color palette downloadable formats
    - Brand guide version and date
    - Contact for brand inquiries
    - Resources and inspiration

Return ONLY the generated guide sections in the specified JSON format. Be professional, specific, and actionable. Include practical hex codes and specific measurements where relevant.`;

const globallyDefinedComprehensiveBrandGuidePrompt = ai.definePrompt({
  name: 'generateComprehensiveBrandGuidePromptDefinition',
  input: { schema: GenerateComprehensiveBrandGuideInputSchema.omit({ userApiKey: true }) },
  output: { schema: GenerateComprehensiveBrandGuideOutputSchema },
  prompt: COMPREHENSIVE_BRAND_GUIDE_PROMPT_TEMPLATE,
});

const generateComprehensiveBrandGuideFlow = ai.defineFlow(
  {
    name: 'generateComprehensiveBrandGuideFlow',
    inputSchema: GenerateComprehensiveBrandGuideInputSchema,
    outputSchema: GenerateComprehensiveBrandGuideOutputSchema,
  },
  async (flowInput: GenerateComprehensiveBrandGuideInput) => {
    if (!flowInput.userApiKey) {
      throw new Error(
        "A Google AI API key is required to generate brand guides. Please add your key in the 'Use Your Own API Key' section."
      );
    }

    // Create a new Genkit instance configured with the user's API key
    const currentAi = genkit({
      plugins: [googleAI({ apiKey: flowInput.userApiKey })],
    });

    // Prepare template data
    const templateData: Omit<GenerateComprehensiveBrandGuideInput, 'userApiKey'> = {
      businessName: flowInput.businessName,
      industry: flowInput.industry,
      keywords: flowInput.keywords,
      selectedLogoUrl: flowInput.selectedLogoUrl,
      missionStatement: flowInput.missionStatement,
      brandPillars: flowInput.brandPillars,
      brandArchetype: flowInput.brandArchetype,
      keyTagline: flowInput.keyTagline,
      targetAudience: flowInput.targetAudience,
      companyValues: flowInput.companyValues,
      preferredColorPalette: flowInput.preferredColorPalette,
      preferredLogoStyle: flowInput.preferredLogoStyle,
      web3BlockchainFocus: flowInput.web3BlockchainFocus,
      web3ProjectType: flowInput.web3ProjectType,
      web3TokenSymbol: flowInput.web3TokenSymbol,
      web3CommunityValues: flowInput.web3CommunityValues,
    };

    // Generate comprehensive brand guide
    const { output } = await currentAi.generate({
      prompt: COMPREHENSIVE_BRAND_GUIDE_PROMPT_TEMPLATE,
      input: templateData,
      model: 'googleai/gemini-2.0-flash',
      output: { schema: GenerateComprehensiveBrandGuideOutputSchema },
    });

    if (!output) {
      throw new Error('Brand guide generation failed to produce output.');
    }

    return output;
  }
);
