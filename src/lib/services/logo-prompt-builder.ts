/**
 * Logo Prompt Builder - Template Based
 * 
 * Converts form data into optimized prompts for image generation
 * No AI prompt engineering needed - deterministic, debuggable, fast
 */

import { GenerateLogoConceptsInput } from '@/ai/flows/generate-logo-concepts-v2';

export interface PromptVariables {
  businessName: string;
  industry: string;
  style: string;
  keywords: string;
  colors: string;
  composition: string;
  target: string;
  archetype: string;
  mission: string;
}

/**
 * Style mapping: form values → descriptive text
 */
export const STYLE_MAP: Record<string, string> = {
  'minimalist': 'Minimalist, clean geometric shapes, simple lines, modern aesthetic',
  '3d-isometric': '3D isometric geometric, modern tech aesthetic, soft lighting, glassmorphism',
  'mascot': 'Character mascot, friendly illustration, approachable cartoon style',
  'vintage': 'Vintage retro style, classic typography, nostalgic aesthetic, aged texture',
  'abstract': 'Abstract geometric, artistic composition, non-representational shapes',
  'wordmark': 'Wordmark text logo, typographic focus, custom lettering',
  'lettermark': 'Lettermark monogram, single letter focus, elegant typography',
  'emblem': 'Emblem badge style, enclosed design, traditional crest format',
};

/**
 * Archetype mapping → visual direction
 */
export const ARCHETYPE_MAP: Record<string, string> = {
  'Creator': 'innovative, artistic, visionary',
  'Sage': 'wise, knowledgeable, trustworthy',
  'Explorer': 'adventurous, pioneering, free-spirited',
  'Hero': 'courageous, determined, inspiring',
  'Rebel': 'disruptive, bold, revolutionary',
  'Magician': 'transformative, charismatic, mystical',
  'Lover': 'passionate, sensual, intimate',
  'Jester': 'playful, humorous, light-hearted',
  'Caregiver': 'nurturing, protective, compassionate',
  'Ruler': 'authoritative, luxurious, commanding',
  'Everyman': 'approachable, relatable, down-to-earth',
  'Innocent': 'pure, optimistic, simple',
};

/**
 * Composition mapping
 */
export const COMPOSITION_MAP: Record<string, string> = {
  'horizontal': 'horizontal layout with icon left of text',
  'vertical': 'vertical layout with icon above text',
  'circular': 'circular enclosed composition',
  'icon-only': 'icon only, no text',
  'wordmark-only': 'text only, no icon',
};

/**
 * Extract and format colors from form data
 */
function extractColors(colorPalette?: string): string {
  if (!colorPalette) return 'professional color palette';

  try {
    // Try parsing as JSON array of hex codes
    const colors = JSON.parse(colorPalette);
    if (Array.isArray(colors)) {
      return colors.map(hexToColorName).join(' and ');
    }
  } catch {
    // Not JSON, treat as string
  }

  // Return as-is if it's already descriptive
  return colorPalette;
}

/**
 * Convert hex code to color name (simplified)
 */
function hexToColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    '#000000': 'black',
    '#ffffff': 'white',
    '#ff0000': 'red',
    '#00ff00': 'green',
    '#0000ff': 'blue',
    '#ffff00': 'yellow',
    '#ff00ff': 'magenta',
    '#00ffff': 'cyan',
    '#ffa500': 'orange',
    '#800080': 'purple',
    '#ffc0cb': 'pink',
    '#a52a2a': 'brown',
    '#808080': 'gray',
    '#0a192f': 'deep navy blue',
    '#f4a261': 'warm orange',
    '#e63946': 'bold red',
    '#2a9d8f': 'teal',
    '#e9c46a': 'golden yellow',
    '#264653': 'dark slate',
  };

  const normalized = hex.toLowerCase().trim();
  return colorMap[normalized] || 'professional color';
}

/**
 * Extract keywords from form data
 */
function extractKeywords(input: GenerateLogoConceptsInput): string {
  const keywords: string[] = [];

  if (input.keywords) {
    keywords.push(input.keywords);
  }

  if (input.aestheticKeywords) {
    keywords.push(input.aestheticKeywords);
  }

  if (input.emotionalKeywords) {
    keywords.push(input.emotionalKeywords);
  }

  if (input.functionalKeywords) {
    keywords.push(input.functionalKeywords);
  }

  if (keywords.length === 0) {
    return 'modern, professional';
  }

  return keywords.join(', ');
}

/**
 * Build prompt variables from form input
 */
export function buildPromptVariables(input: GenerateLogoConceptsInput): PromptVariables {
  return {
    businessName: input.businessName,
    industry: input.industry,
    style: STYLE_MAP[input.preferredLogoStyle || 'minimalist'] || STYLE_MAP.minimalist,
    keywords: extractKeywords(input),
    colors: extractColors(input.preferredColorPalette),
    composition: COMPOSITION_MAP[input.composition || 'horizontal'] || COMPOSITION_MAP.horizontal,
    target: input.targetAudience || 'professional audience',
    archetype: ARCHETYPE_MAP[input.brandArchetype || 'Creator'] || ARCHETYPE_MAP.Creator,
    mission: input.missionStatement 
      ? input.missionStatement.slice(0, 100) // Truncate to 100 chars
      : 'Providing excellent products and services',
  };
}

/**
 * Logo prompt templates - 4 design directions
 */
export const LOGO_TEMPLATES = [
  {
    name: "Modern Minimalist",
    prompt: `Professional logo design for "{businessName}" in the {industry} industry.

VISUAL DIRECTION: Modern Minimalist - Clean geometric shapes, simple lines, refined elegance.

KEY ATTRIBUTES: {keywords}

COLOR PALETTE: {colors}

COMPOSITION: {composition}

TARGET AUDIENCE: {target}

BRAND ESSENCE: {archetype} archetype. {mission}.

TECHNICAL SPECIFICATIONS:
- Vector-art style, flat design, crisp clean lines
- Transparent or white background
- Centered, balanced composition
- Suitable for 1024×1024 output
- Professional, scalable, print-ready
- No photorealistic textures, no shadows, no gradients

Create a sophisticated, timeless logo that embodies {businessName}'s commitment to excellence.`,
  },
  {
    name: "Bold & Iconic",
    prompt: `Bold logo design for "{businessName}" in the {industry} industry.

VISUAL DIRECTION: Bold & Iconic - Strong visual impact, memorable mark, distinctive presence.

KEY ATTRIBUTES: {keywords}

COLOR PALETTE: {colors}

COMPOSITION: {composition}

TARGET AUDIENCE: {target}

BRAND ESSENCE: {archetype} archetype. {mission}.

TECHNICAL SPECIFICATIONS:
- Strong geometric forms, bold shapes
- High contrast, immediately recognizable
- Icon that works at small sizes (favicon)
- Transparent or white background
- 1024×1024 resolution
- Flat design, no 3D effects
- Vector style, clean edges

Create an iconic logo that commands attention and builds instant brand recognition.`,
  },
  {
    name: "Elegant & Refined",
    prompt: `Elegant logo design for "{businessName}" in the {industry} industry.

VISUAL DIRECTION: Elegant & Refined - Sophisticated, premium feel, luxurious details.

KEY ATTRIBUTES: {keywords}

COLOR PALETTE: {colors}

COMPOSITION: {composition}

TARGET AUDIENCE: {target}

BRAND ESSENCE: {archetype} archetype. {mission}.

TECHNICAL SPECIFICATIONS:
- Refined typography, sophisticated letterforms
- Subtle details, premium aesthetic
- Balanced negative space
- Transparent or white background
- 1024×1024 resolution
- Clean lines, no clutter
- Luxury brand aesthetic

Create an elegant logo that conveys premium quality and refined taste.`,
  },
  {
    name: "Creative & Unique",
    prompt: `Creative logo design for "{businessName}" in the {industry} industry.

VISUAL DIRECTION: Creative & Unique - Distinctive, artistic, memorable concept.

KEY ATTRIBUTES: {keywords}

COLOR PALETTE: {colors}

COMPOSITION: {composition}

TARGET AUDIENCE: {target}

BRAND ESSENCE: {archetype} archetype. {mission}.

TECHNICAL SPECIFICATIONS:
- Unique visual concept, creative interpretation
- Artistic but professional
- Memorable and distinctive
- Transparent or white background
- 1024×1024 resolution
- Balanced composition
- Vector style for scalability

Create a unique, creative logo that stands out from competitors and captures {businessName}'s distinctive personality.`,
  },
];

/**
 * Build logo prompt from template
 */
export function buildLogoPrompt(
  input: GenerateLogoConceptsInput, 
  variantIndex: number
): string {
  const vars = buildPromptVariables(input);
  const template = LOGO_TEMPLATES[variantIndex % LOGO_TEMPLATES.length];

  let prompt = template.prompt;

  // Replace all variables
  prompt = prompt.replace(/{businessName}/g, vars.businessName);
  prompt = prompt.replace(/{industry}/g, vars.industry);
  prompt = prompt.replace(/{keywords}/g, vars.keywords);
  prompt = prompt.replace(/{colors}/g, vars.colors);
  prompt = prompt.replace(/{composition}/g, vars.composition);
  prompt = prompt.replace(/{target}/g, vars.target);
  prompt = prompt.replace(/{archetype}/g, vars.archetype);
  prompt = prompt.replace(/{mission}/g, vars.mission);

  return prompt;
}

/**
 * Get all 4 prompts for logo generation
 */
export function buildAllLogoPrompts(input: GenerateLogoConceptsInput): string[] {
  return LOGO_TEMPLATES.map((_, index) => buildLogoPrompt(input, index));
}

/**
 * Debug helper - see what prompt will be generated
 */
export function debugPrompt(input: GenerateLogoConceptsInput): {
  variables: PromptVariables;
  prompts: { name: string; prompt: string }[];
} {
  return {
    variables: buildPromptVariables(input),
    prompts: LOGO_TEMPLATES.map((template, index) => ({
      name: template.name,
      prompt: buildLogoPrompt(input, index),
    })),
  };
}
