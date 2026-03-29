/**
 * Prompt Chain Builder
 *
 * Assembles a complete AI prompt chain package from form data.
 * Outputs a structured JSON that an operator can use to manually
 * generate brand assets using different AI tools.
 */

import type { ExtendedLogoGenerationInputs } from '@/components/logo-form-types';
import { buildAllLogoPrompts, buildPromptVariables, LOGO_TEMPLATES } from './logo-prompt-builder';

// ==================== Types ====================

export interface PromptChainPackage {
  meta: {
    generatedAt: string;
    businessName: string;
    version: string;
  };
  brandBrief: BrandBrief;
  prompts: {
    logoGeneration: LogoPromptEntry[];
    mockups: MockupPromptEntry[];
    socialMedia: SocialMediaPromptEntry[];
    brandGuidelines: { prompt: string; provider: string };
  };
  operatorGuide: OperatorGuide;
}

interface BrandBrief {
  identity: {
    businessName: string;
    industry: string;
    archetype?: string;
    missionStatement?: string;
    brandPillars?: string;
    tagline?: string;
  };
  storyBrand: {
    customerProblem?: string;
    internalProblem?: string;
    philosophicalProblem?: string;
    plan?: string;
    successOutcome?: string;
    failureStakes?: string;
  };
  customerGoals: {
    lifeGoals?: string;
    experienceGoals?: string;
    endGoals?: string;
  };
  audience: {
    targetAudience?: string;
    usageContext?: string;
    competitorsToAvoid?: string;
  };
  visual: {
    colors: {
      palette?: string;
      mood?: string;
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    typography: {
      headings?: string;
      body?: string;
      other?: string;
      logoFontStyle?: string;
    };
    logoStyle: {
      preferredStyle?: string;
      composition?: string;
      iconPlacement?: string;
      iconComplexity?: string;
      iconSpecifics?: string;
    };
    keywords: {
      combined: string;
      negative?: string;
    };
    inspirationReferences?: string;
  };
  web3?: {
    blockchainFocus?: string;
    projectType?: string;
    ensDomainIdeas?: string;
    tokenSymbolIdea?: string;
    communityValues?: string;
    nftAesthetic?: string;
  };
}

interface LogoPromptEntry {
  name: string;
  direction: string;
  prompt: string;
  provider: string;
  settings: string;
}

interface MockupPromptEntry {
  name: string;
  prompt: string;
  dimensions: string;
  provider: string;
}

interface SocialMediaPromptEntry {
  platform: string;
  prompt: string;
  dimensions: string;
  provider: string;
}

interface OperatorGuide {
  overview: string;
  workflow: string[];
  toolRecommendations: Record<string, string>;
  tips: string[];
}

// ==================== Social Media Specs ====================

const SOCIAL_SPECS = [
  { platform: 'Instagram Post', width: 1080, height: 1080 },
  { platform: 'Instagram Story', width: 1080, height: 1920 },
  { platform: 'Facebook Cover', width: 820, height: 312 },
  { platform: 'Twitter/X Header', width: 1500, height: 500 },
  { platform: 'LinkedIn Banner', width: 1584, height: 396 },
  { platform: 'YouTube Thumbnail', width: 1280, height: 720 },
  { platform: 'Pinterest Pin', width: 1000, height: 1500 },
  { platform: 'TikTok Cover', width: 1080, height: 1920 },
  { platform: 'Email Header', width: 600, height: 200 },
  { platform: 'Website Hero', width: 1920, height: 1080 },
] as const;

// ==================== Build Functions ====================

function buildBrandBrief(input: ExtendedLogoGenerationInputs): BrandBrief {
  const brief: BrandBrief = {
    identity: {
      businessName: input.businessName,
      industry: input.industry,
      archetype: input.brandArchetype || undefined,
      missionStatement: input.missionStatement || undefined,
      brandPillars: input.brandPillars || undefined,
      tagline: input.keyTagline || undefined,
    },
    storyBrand: {
      customerProblem: input.storyBrandCustomerProblem || undefined,
      internalProblem: input.storyBrandInternalProblem || undefined,
      philosophicalProblem: input.storyBrandPhilosophicalProblem || undefined,
      plan: input.storyBrandPlan || undefined,
      successOutcome: input.storyBrandSuccessOutcome || undefined,
      failureStakes: input.storyBrandFailureStakes || undefined,
    },
    customerGoals: {
      lifeGoals: input.personaLifeGoals || undefined,
      experienceGoals: input.personaExperienceGoals || undefined,
      endGoals: input.personaEndGoals || undefined,
    },
    audience: {
      targetAudience: input.targetAudience || undefined,
      usageContext: input.usageContext || undefined,
      competitorsToAvoid: input.competitorsToAvoid || undefined,
    },
    visual: {
      colors: {
        palette: input.preferredColorPalette || undefined,
        mood: input.colorPaletteMood || undefined,
        primary: input.primaryColors || undefined,
        secondary: input.secondaryColors || undefined,
        accent: input.accentColors || undefined,
      },
      typography: {
        headings: input.fontHeadings || undefined,
        body: input.fontBody || undefined,
        other: input.fontOther || undefined,
        logoFontStyle: input.fontStyle || undefined,
      },
      logoStyle: {
        preferredStyle: input.preferredLogoStyle || undefined,
        composition: input.composition || undefined,
        iconPlacement: input.iconPlacement || undefined,
        iconComplexity: input.iconComplexity || undefined,
        iconSpecifics: input.iconSpecifics || undefined,
      },
      keywords: {
        combined: input.keywords,
        negative: input.negativeKeywords || undefined,
      },
      inspirationReferences: input.inspirationReferences || undefined,
    },
  };

  // Only include web3 section if any web3 fields are populated
  if (input.web3BlockchainFocus || input.web3ProjectType || input.web3EnsDomainIdeas ||
      input.web3TokenSymbolIdea || input.web3CommunityValues || input.web3NftAesthetic) {
    brief.web3 = {
      blockchainFocus: input.web3BlockchainFocus || undefined,
      projectType: input.web3ProjectType || undefined,
      ensDomainIdeas: input.web3EnsDomainIdeas || undefined,
      tokenSymbolIdea: input.web3TokenSymbolIdea || undefined,
      communityValues: input.web3CommunityValues || undefined,
      nftAesthetic: input.web3NftAesthetic || undefined,
    };
  }

  return brief;
}

function buildLogoPrompts(input: ExtendedLogoGenerationInputs): LogoPromptEntry[] {
  // Build prompts using the existing logo prompt builder
  // We need to map ExtendedLogoGenerationInputs to GenerateLogoConceptsInput shape
  const genInput = {
    businessName: input.businessName,
    industry: input.industry,
    keywords: input.keywords,
    preferredColorPalette: input.preferredColorPalette,
    preferredLogoStyle: input.preferredLogoStyle,
    composition: input.composition,
    targetAudience: input.targetAudience,
    missionStatement: input.missionStatement,
    brandPillars: input.brandPillars,
    brandArchetype: input.brandArchetype,
    negativeKeywords: input.negativeKeywords,
    numberOfLogos: 4,
  };

  const prompts = buildAllLogoPrompts(genInput);

  return LOGO_TEMPLATES.map((template, index) => ({
    name: template.name,
    direction: template.name,
    prompt: prompts[index],
    provider: 'Midjourney, DALL-E 3, Ideogram, or Flux (via Replicate)',
    settings: '1024x1024, transparent background, vector style, flat design',
  }));
}

function buildMockupPrompts(brief: BrandBrief): MockupPromptEntry[] {
  const { businessName, industry } = brief.identity;
  const colors = brief.visual.colors.palette || brief.visual.colors.primary || 'brand colors';
  const style = brief.visual.logoStyle.preferredStyle || 'modern minimalist';

  return [
    {
      name: 'Business Card',
      prompt: `Professional business card mockup for "${businessName}", a ${industry} brand. The card should feature the ${businessName} logo prominently. Use ${colors} as the color scheme. Style: ${style}, premium card stock appearance. Show front and back of the card on a clean surface with subtle shadows. Photorealistic mockup, high quality, professional photography style. The card should include placeholder text for name, title, phone, email, and website.`,
      dimensions: '1600x1200',
      provider: 'Midjourney or DALL-E 3',
    },
    {
      name: 'Letterhead',
      prompt: `Professional letterhead mockup for "${businessName}", a ${industry} brand. A4 size document on a clean desk surface. The letterhead features the ${businessName} logo at the top, with ${colors} color scheme. Style: ${style}. Include subtle header/footer design elements. Photorealistic flat lay photography, professional office setting with minimal props. High quality, clean composition.`,
      dimensions: '1200x1600',
      provider: 'Midjourney or DALL-E 3',
    },
    {
      name: 'T-Shirt',
      prompt: `Premium t-shirt mockup featuring the "${businessName}" logo. Clean, professional product photography of a folded or hung t-shirt. The logo is printed on the front center/chest area. Use ${colors} for the design elements. Style: ${style}. Photorealistic, studio lighting, neutral background. Show the brand identity clearly on a high-quality cotton t-shirt.`,
      dimensions: '1200x1200',
      provider: 'Midjourney or DALL-E 3',
    },
    {
      name: 'Coffee Mug',
      prompt: `Professional coffee mug mockup featuring the "${businessName}" logo. Clean studio photography of a white ceramic mug with the logo and brand colors (${colors}). Style: ${style}. The mug sits on a clean surface with soft shadows. Photorealistic, commercial product photography style. High quality, minimal background.`,
      dimensions: '1200x1200',
      provider: 'Midjourney or DALL-E 3',
    },
    {
      name: 'Tote Bag',
      prompt: `Canvas tote bag mockup for "${businessName}". The tote bag features the brand logo printed on the front. Colors: ${colors}. Style: ${style}. Professional product photography, clean background, natural lighting. The bag should look premium and on-brand for a ${industry} company. Photorealistic, high quality.`,
      dimensions: '1200x1200',
      provider: 'Midjourney or DALL-E 3',
    },
  ];
}

function buildSocialMediaPrompts(brief: BrandBrief): SocialMediaPromptEntry[] {
  const { businessName, industry, tagline } = brief.identity;
  const colors = brief.visual.colors.palette || brief.visual.colors.primary || 'brand colors';
  const taglineText = tagline ? ` Tagline: "${tagline}".` : '';

  return SOCIAL_SPECS.map(spec => {
    const isVertical = spec.height > spec.width;
    const layoutHint = isVertical ? 'vertical/portrait layout' :
                       spec.width === spec.height ? 'square layout' : 'horizontal/landscape layout';

    return {
      platform: spec.platform,
      prompt: `${spec.platform} graphic for "${businessName}" (${industry}).${taglineText} Design a professional branded ${spec.platform.toLowerCase()} asset using ${colors}. ${layoutHint}, ${spec.width}x${spec.height} pixels. The design should prominently feature the ${businessName} logo, maintain brand consistency, and be optimized for ${spec.platform}. Clean, modern design with good visual hierarchy. Professional social media marketing style.`,
      dimensions: `${spec.width}x${spec.height}`,
      provider: 'Canva AI, Adobe Express, or DALL-E 3',
    };
  });
}

function buildBrandGuidelinesPrompt(brief: BrandBrief): string {
  const sections: string[] = [];

  sections.push(`You are a senior brand strategist at a world-class agency like Pentagram or Collins.`);
  sections.push(`Create a comprehensive brand guidelines document for "${brief.identity.businessName}" in the ${brief.identity.industry} industry.`);
  sections.push('');

  sections.push('=== BRAND INFORMATION ===');
  if (brief.identity.missionStatement) sections.push(`Mission: ${brief.identity.missionStatement}`);
  if (brief.identity.brandPillars) sections.push(`Brand Pillars: ${brief.identity.brandPillars}`);
  if (brief.identity.archetype) sections.push(`Brand Archetype: ${brief.identity.archetype}`);
  if (brief.identity.tagline) sections.push(`Tagline: ${brief.identity.tagline}`);
  sections.push(`Keywords: ${brief.visual.keywords.combined}`);
  if (brief.visual.keywords.negative) sections.push(`Avoid: ${brief.visual.keywords.negative}`);
  sections.push('');

  // StoryBrand context
  if (brief.storyBrand.customerProblem || brief.storyBrand.internalProblem) {
    sections.push('=== STORYBRAND NARRATIVE ===');
    if (brief.storyBrand.customerProblem) sections.push(`Customer's External Problem: ${brief.storyBrand.customerProblem}`);
    if (brief.storyBrand.internalProblem) sections.push(`Customer's Internal Problem: ${brief.storyBrand.internalProblem}`);
    if (brief.storyBrand.philosophicalProblem) sections.push(`Philosophical Problem: ${brief.storyBrand.philosophicalProblem}`);
    if (brief.storyBrand.plan) sections.push(`Brand's Plan: ${brief.storyBrand.plan}`);
    if (brief.storyBrand.successOutcome) sections.push(`Success Outcome: ${brief.storyBrand.successOutcome}`);
    if (brief.storyBrand.failureStakes) sections.push(`Failure Stakes: ${brief.storyBrand.failureStakes}`);
    sections.push('');
  }

  // Goal-Directed Personas
  if (brief.customerGoals.lifeGoals || brief.customerGoals.experienceGoals || brief.customerGoals.endGoals) {
    sections.push('=== CUSTOMER GOALS ===');
    if (brief.customerGoals.lifeGoals) sections.push(`Life Goals (aspirational): ${brief.customerGoals.lifeGoals}`);
    if (brief.customerGoals.experienceGoals) sections.push(`Experience Goals (feeling): ${brief.customerGoals.experienceGoals}`);
    if (brief.customerGoals.endGoals) sections.push(`End Goals (practical): ${brief.customerGoals.endGoals}`);
    sections.push('');
  }

  sections.push('=== AUDIENCE ===');
  if (brief.audience.targetAudience) sections.push(`Target Audience: ${brief.audience.targetAudience}`);
  if (brief.audience.competitorsToAvoid) sections.push(`Competitors to Differentiate From: ${brief.audience.competitorsToAvoid}`);
  sections.push('');

  sections.push('=== VISUAL IDENTITY ===');
  if (brief.visual.colors.primary) sections.push(`Primary Color: ${brief.visual.colors.primary}`);
  if (brief.visual.colors.secondary) sections.push(`Secondary Color: ${brief.visual.colors.secondary}`);
  if (brief.visual.colors.accent) sections.push(`Accent Color: ${brief.visual.colors.accent}`);
  if (brief.visual.colors.mood) sections.push(`Color Mood: ${brief.visual.colors.mood}`);
  if (brief.visual.typography.headings) sections.push(`Headings Font: ${brief.visual.typography.headings}`);
  if (brief.visual.typography.body) sections.push(`Body Font: ${brief.visual.typography.body}`);
  if (brief.visual.logoStyle.preferredStyle) sections.push(`Logo Style: ${brief.visual.logoStyle.preferredStyle}`);
  sections.push('');

  sections.push('=== OUTPUT REQUIREMENTS ===');
  sections.push('Generate a complete brand guidelines document with these sections:');
  sections.push('1. Brand Overview & Story');
  sections.push('2. Brand Voice & Tone (with examples of do/don\'t)');
  sections.push('3. Logo Usage Guidelines (clear space, minimum sizes, acceptable/unacceptable uses)');
  sections.push('4. Color Palette (primary, secondary, accent with hex codes, RGB, CMYK values)');
  sections.push('5. Color Accessibility & WCAG Compliance Notes');
  sections.push('6. Typography Guide (heading, body, accent fonts with sizing hierarchy)');
  sections.push('7. Imagery & Photography Style');
  sections.push('8. Graphic Elements & Patterns');
  sections.push('9. Brand Voice & Messaging Guidelines');
  sections.push('10. Visual Style Guide (layout principles, grid system)');
  sections.push('11. Usage Rules & Don\'ts');
  if (brief.web3) {
    sections.push('12. Web3/Blockchain Branding Section');
  }
  sections.push('');
  sections.push('WRITING RULES:');
  sections.push('- Use specific details: font names, hex codes, measurements');
  sections.push('- Vary sentence openings and lengths');
  sections.push('- Write as a seasoned strategist, not a template filler');
  sections.push('- Keep total length under 3000 words');
  sections.push('- Include actionable guidelines, not vague platitudes');

  return sections.join('\n');
}

function buildOperatorGuide(): OperatorGuide {
  return {
    overview: 'This prompt chain package contains everything needed to create a complete brand identity using AI tools. Work through the sections in order for best results.',
    workflow: [
      'Step 1: LOGO — Use the logo generation prompts in Midjourney, DALL-E 3, or Ideogram. Generate all 4 directions, then pick the strongest concept.',
      'Step 2: REFINE LOGO — Once you pick a direction, iterate on it. Ask the AI for variations, color adjustments, and refinements until you have a final logo.',
      'Step 3: BRAND GUIDELINES — Take the brand guidelines prompt to ChatGPT or Claude. Paste it and generate the full brand guide document. Review and edit as needed.',
      'Step 4: MOCKUPS — Use the mockup prompts in Midjourney or DALL-E 3. For best results, include your final logo in the prompt or use image-to-image with the logo as reference.',
      'Step 5: SOCIAL MEDIA — Use the social media prompts to generate branded assets for each platform. Maintain consistency using the brand brief colors and fonts.',
      'Step 6: PACKAGE — Compile everything into a ZIP: logos (SVG/PNG), brand guide (PDF), mockups, and social media assets.',
    ],
    toolRecommendations: {
      'Logo Generation': 'Midjourney v6 (best quality), DALL-E 3 (good adherence to prompts), Ideogram 2.0 (best for text in logos), Flux Pro (via Replicate)',
      'Logo Vectorization': 'Vectorizer.ai or Adobe Illustrator Image Trace to convert raster logos to SVG',
      'Brand Guidelines': 'ChatGPT-4 or Claude 3.5 Sonnet — paste the brand guidelines prompt for comprehensive output',
      'Mockups': 'Midjourney v6 (most photorealistic), DALL-E 3 (good for product shots)',
      'Social Media Assets': 'Canva (templates + AI), Adobe Express, or generate with DALL-E 3 then adjust in Figma',
      'PDF Assembly': 'Canva, Adobe InDesign, or Google Slides exported as PDF',
    },
    tips: [
      'Always generate the logo FIRST — all other assets depend on having a finalized logo.',
      'Use the Brand Brief JSON section as context when prompting any AI tool. Paste relevant sections to keep outputs consistent.',
      'For Midjourney: add "--v 6 --style raw" for cleaner logo outputs. Use "--ar 1:1" for square logos.',
      'For DALL-E 3: be very explicit about "transparent background" and "vector style flat design".',
      'When generating mockups, if possible use inpainting/image editing to place your actual logo onto the generated mockup.',
      'Save all assets at the highest resolution available, then downscale as needed.',
      'The StoryBrand narrative and Customer Goals sections are powerful context for generating marketing copy and social captions.',
    ],
  };
}

// ==================== Main Export ====================

export function buildPromptChainPackage(input: ExtendedLogoGenerationInputs): PromptChainPackage {
  const brief = buildBrandBrief(input);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      businessName: input.businessName,
      version: '1.0.0',
    },
    brandBrief: brief,
    prompts: {
      logoGeneration: buildLogoPrompts(input),
      mockups: buildMockupPrompts(brief),
      socialMedia: buildSocialMediaPrompts(brief),
      brandGuidelines: {
        prompt: buildBrandGuidelinesPrompt(brief),
        provider: 'ChatGPT-4, Claude 3.5 Sonnet, or Gemini Pro',
      },
    },
    operatorGuide: buildOperatorGuide(),
  };
}
