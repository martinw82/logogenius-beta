'use server';

/**
 * @fileOverview Comprehensive brand guide generation using Together AI
 * 
 * Generates a complete brand guide with 13 sections using Together AI's
 * text generation capabilities.
 */

import {z} from 'genkit';

const GenerateComprehensiveBrandGuideInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  industry: z.string().describe('The industry of the business.'),
  keywords: z.string().describe('Keywords describing the brand identity.'),
  selectedLogoUrl: z.string().describe('URL of the selected logo image.'),
  missionStatement: z.string().optional().describe('Mission statement.'),
  brandPillars: z.string().optional().describe('Core brand pillars.'),
  brandArchetype: z.string().optional().describe('Brand archetype.'),
  keyTagline: z.string().optional().describe('Key tagline.'),
  targetAudience: z.string().optional().describe('Target audience.'),
  companyValues: z.string().optional().describe('Company values.'),
  preferredColorPalette: z.string().optional().describe('Color palette.'),
  preferredLogoStyle: z.string().optional().describe('Logo style.'),
  web3BlockchainFocus: z.boolean().optional().describe('Web3 project.'),
  web3ProjectType: z.string().optional().describe('Web3 project type.'),
  web3TokenSymbol: z.string().optional().describe('Token symbol.'),
  web3CommunityValues: z.string().optional().describe('Community values.'),
  userApiKey: z.string().optional().describe('Together AI API key.'),
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
  web3Section: z.string().optional().describe('12. Web3/Blockchain Specific section'),
  appendix: z.string().describe('13. Appendix with resources'),
});

export type GenerateComprehensiveBrandGuideOutput = z.infer<typeof GenerateComprehensiveBrandGuideOutputSchema>;

/**
 * Generate comprehensive brand guide using Together AI
 */
export async function generateComprehensiveBrandGuide(
  input: GenerateComprehensiveBrandGuideInput
): Promise<GenerateComprehensiveBrandGuideOutput> {
  return generateComprehensiveBrandGuideFlow(input);
}

async function generateComprehensiveBrandGuideFlow(
  flowInput: GenerateComprehensiveBrandGuideInput
): Promise<GenerateComprehensiveBrandGuideOutput> {
  const apiKey = flowInput.userApiKey || process.env.TOGETHER_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "Together AI API key is required. Please set TOGETHER_API_KEY environment variable or pass userApiKey."
    );
  }

  // Build the prompt
  let prompt = `You are an expert brand strategist and designer. Generate a comprehensive brand guide for the following business.

BUSINESS INFORMATION:
- Name: ${flowInput.businessName}
- Industry: ${flowInput.industry}
- Brand Keywords: ${flowInput.keywords}`;

  if (flowInput.missionStatement) prompt += `\n- Mission: ${flowInput.missionStatement}`;
  if (flowInput.brandPillars) prompt += `\n- Brand Pillars: ${flowInput.brandPillars}`;
  if (flowInput.brandArchetype) prompt += `\n- Brand Archetype: ${flowInput.brandArchetype}`;
  if (flowInput.keyTagline) prompt += `\n- Tagline: ${flowInput.keyTagline}`;
  if (flowInput.targetAudience) prompt += `\n- Target Audience: ${flowInput.targetAudience}`;
  if (flowInput.companyValues) prompt += `\n- Core Values: ${flowInput.companyValues}`;
  if (flowInput.preferredColorPalette) prompt += `\n- Color Preference: ${flowInput.preferredColorPalette}`;
  if (flowInput.preferredLogoStyle) prompt += `\n- Logo Style: ${flowInput.preferredLogoStyle}`;

  if (flowInput.web3BlockchainFocus) {
    prompt += `\n\nWEB3/BLOCKCHAIN CONTEXT:`;
    if (flowInput.web3ProjectType) prompt += `\n- Project Type: ${flowInput.web3ProjectType}`;
    if (flowInput.web3TokenSymbol) prompt += `\n- Token Symbol: ${flowInput.web3TokenSymbol}`;
    if (flowInput.web3CommunityValues) prompt += `\n- Community Values: ${flowInput.web3CommunityValues}`;
  }

  prompt += `\n\nGenerate a comprehensive brand guide with EXACTLY these 13 sections. Return as a JSON object with these keys:

{
  "projectOverview": "2-3 paragraphs about company intro, mission, vision, why they exist. Start directly with the company name.",
  "brandIdentityVoice": "2-3 paragraphs about personality, archetype, voice, tone, attributes. Use vivid descriptors.",
  "logoPhilosophy": "2 paragraphs about why the logo works, design thinking, core message. Focus on symbolism.",
  "colorPalette": "2-3 paragraphs with primary, secondary, accent colors with hex codes, color psychology. List specific hex codes.",
  "colorAccessibility": "2 paragraphs about WCAG compliance, contrast ratios, accessibility best practices. Include specific ratios.",
  "typography": "2-3 paragraphs about primary/secondary fonts, sizing hierarchy, usage rules. Name specific font families.",
  "imageryStyle": "2-3 paragraphs about photographic style, composition, color treatment. Describe mood and feel.",
  "graphicElements": "2 paragraphs about icon style, patterns, decorative elements. Keep practical and specific.",
  "brandVoiceTone": "2-3 paragraphs about voice characteristics, tone variations, vocabulary. Give concrete examples.",
  "visualStyleGuide": "2-3 paragraphs about spacing, grid, shadows, textures, animations. Include measurements.",
  "usageRulesAndDonts": "2-3 paragraphs about logo don'ts, minimum sizes, color restrictions. Be prescriptive.",
  ${flowInput.web3BlockchainFocus ? '"web3Section": "2-3 paragraphs about token, blockchain context, DAO/governance guidelines",' : ''}
  "appendix": "1-2 paragraphs about font licensing, color downloads, version info, contact"
}

CRITICAL INSTRUCTIONS:
1. NEVER start paragraphs with "In addition to..." - use varied transitions
2. NEVER repeat the same sentence structure across sections
3. NEVER use filler phrases like "it is important to note that" or "as mentioned previously"
4. Each section must have a distinct voice and approach
5. Use specific details, not generic statements
6. Include actual hex codes (#RRGGBB format) for colors
7. Be concise - every sentence should add value
8. Write like a top-tier brand agency, not an AI

Return ONLY the JSON object, no markdown formatting.`;

  console.log('[Brand Guide] Generating comprehensive brand guide...');

  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        messages: [
          { role: 'system', content: 'You are an expert brand strategist. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Brand Guide] API error:', response.status, errorText);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No response from Together AI');
    }

    // Clean up the response - remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Parse the JSON response
    const brandGuide = JSON.parse(content);
    
    console.log('[Brand Guide] Successfully generated brand guide');
    
    // Ensure all required fields are present
    return {
      projectOverview: brandGuide.projectOverview || `${flowInput.businessName} is a ${flowInput.industry} company.`,
      brandIdentityVoice: brandGuide.brandIdentityVoice || `Brand voice for ${flowInput.businessName}.`,
      logoPhilosophy: brandGuide.logoPhilosophy || `Logo designed to represent ${flowInput.keywords}.`,
      colorPalette: brandGuide.colorPalette || `Primary brand colors for ${flowInput.businessName}.`,
      colorAccessibility: brandGuide.colorAccessibility || "WCAG compliant color combinations.",
      typography: brandGuide.typography || "Professional typography guidelines.",
      imageryStyle: brandGuide.imageryStyle || "Brand imagery style guidelines.",
      graphicElements: brandGuide.graphicElements || "Graphic element usage guidelines.",
      brandVoiceTone: brandGuide.brandVoiceTone || "Brand voice and tone guidelines.",
      visualStyleGuide: brandGuide.visualStyleGuide || "Visual style guidelines.",
      usageRulesAndDonts: brandGuide.usageRulesAndDonts || "Logo usage rules and restrictions.",
      web3Section: flowInput.web3BlockchainFocus ? (brandGuide.web3Section || "Web3 specific guidelines.") : undefined,
      appendix: brandGuide.appendix || "Brand guide appendix.",
    };

  } catch (error) {
    console.error('[Brand Guide] Error:', error);
    
    // Return fallback brand guide
    return {
      projectOverview: `${flowInput.businessName} is a ${flowInput.industry} company focused on delivering exceptional value through innovative solutions. Our mission is to create meaningful impact in our industry while maintaining the highest standards of quality and service.`,
      brandIdentityVoice: `The ${flowInput.businessName} brand embodies ${flowInput.keywords}. We communicate with authenticity, professionalism, and clarity. Our voice is confident yet approachable, authoritative without being arrogant.`,
      logoPhilosophy: `The ${flowInput.businessName} logo represents our core values of ${flowInput.keywords}. The design balances modern aesthetics with timeless principles, creating a memorable mark that resonates with our target audience.`,
      colorPalette: `Primary colors include a professional palette reflecting ${flowInput.industry} standards. Use colors that convey trust, innovation, and quality.`,
      colorAccessibility: "All color combinations meet WCAG AA standards. Ensure sufficient contrast ratios between text and background colors.",
      typography: "Use clean, professional sans-serif fonts for headlines and body text. Maintain consistent font weights and sizes across all materials.",
      imageryStyle: "Professional photography with natural lighting. Images should reflect diversity, authenticity, and real-world scenarios relevant to our industry.",
      graphicElements: "Use geometric shapes and clean lines that complement the logo. Maintain consistent spacing and proportions.",
      brandVoiceTone: "Professional yet approachable. Use clear, concise language. Avoid jargon unless speaking to technical audiences.",
      visualStyleGuide: "Maintain consistent spacing using a grid system. Use subtle shadows for depth. Keep designs clean and uncluttered.",
      usageRulesAndDonts: "Always use the logo with proper clear space. Don't stretch, rotate, or alter the logo colors. Don't place the logo on busy backgrounds.",
      web3Section: flowInput.web3BlockchainFocus ? "Web3 guidelines for blockchain presence, token usage, and community engagement." : undefined,
      appendix: `Brand guide version 1.0 for ${flowInput.businessName}. Contact information for brand inquiries.`,
    };
  }
}
