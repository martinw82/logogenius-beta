/**
 * Prompt Adapter Service
 * 
 * Converts logo form data into provider-optimized prompts.
 * Different AI providers interpret prompts very differently:
 * - SD/Flux: Needs anti-pattern, comma-separated, explicit constraints
 * - Imagen 3: Natural language, descriptive
 * - Recraft: Design brief style, professional
 */

export type ProviderPromptStyle = 'sd-flux' | 'imagen3' | 'recraft';

export interface LogoFormData {
  // Basic Info
  businessName: string;
  industry: string;
  industrySubcategory?: string;
  
  // Brand Identity
  aestheticKeywords?: string;
  emotionalKeywords?: string;
  functionalKeywords?: string;
  missionStatement?: string;
  brandPillars?: string;
  keyTagline?: string;
  
  // Colors
  primaryColors?: string;
  secondaryColors?: string;
  accentColors?: string;
  colorPaletteMood?: string;
  
  // Logo Style
  preferredLogoStyle?: string;
  composition?: string;
  iconPlacement?: string;
  iconComplexity?: string;
  iconSpecifics?: string;
  
  // Typography
  fontStyle?: string;
  fontHeadings?: string;
  fontBody?: string;
  
  // Brand Details
  targetAudience?: string;
  inspirationReferences?: string;
  usageContext?: string;
  negativeKeywords?: string;
  
  // Web3 (optional)
  web3?: boolean;
  web3BlockchainFocus?: string;
  web3ProjectType?: string;
  
  // Anti-pattern control (new fields)
  elementCount?: string;
  arrangement?: string;
  graphicMotif?: string;
  backgroundType?: string;
  styleReference?: string;
  textTreatment?: string;
}

/**
 * Main adapter function - converts form data to provider-specific prompt
 */
export function adaptPromptForProvider(
  formData: LogoFormData,
  style: ProviderPromptStyle
): string {
  switch (style) {
    case 'sd-flux':
      return formatForSDFlux(formData);
    case 'imagen3':
      return formatForImagen3(formData);
    case 'recraft':
      return formatForRecraft(formData);
    default:
      return formatForSDFlux(formData);
  }
}

/**
 * Auto-detect prompt style from provider name
 */
export function getPromptStyleForProvider(provider: string): ProviderPromptStyle {
  switch (provider) {
    case 'together':
    case 'replicate': // When using SD models via Replicate
      return 'sd-flux';
    case 'google':
    case 'fal': // Fal.ai typically runs Imagen 3
    case 'laozhang':
      return 'imagen3';
    case 'recraft':
      return 'recraft';
    default:
      return 'sd-flux';
  }
}

/**
 * Format for SD/Flux (Together AI, Replicate with SD)
 * Needs: Anti-pattern language, comma-separated, quantity-locked
 */
function formatForSDFlux(data: LogoFormData): string {
  const style = data.preferredLogoStyle || 'minimalist';
  const industry = data.industry || 'technology';
  const colors = data.primaryColors || data.colorPaletteMood || 'blue and white';
  const keywords = [
    data.aestheticKeywords,
    data.emotionalKeywords,
    data.functionalKeywords,
  ].filter(Boolean).join(', ') || 'professional, modern';
  
  // Anti-pattern controls
  const elementCount = data.elementCount || 'single central icon';
  const arrangement = data.arrangement || 'centered';
  const graphicMotif = data.graphicMotif || 'abstract geometric';
  const backgroundType = data.backgroundType || 'pure white';
  const styleReference = data.styleReference || 'Swiss International';
  
  return `Single isolated ${style} logomark for ${industry} company, 
${elementCount} ${graphicMotif} arranged in ${arrangement}, 
centered composition with generous white space on all sides, 
isolated on ${backgroundType} background, 
not a pattern, not repeating, not tessellated, not scattered, one cohesive symbol only, 
${colors} solid flat colors, no gradients, no shadows, 
2D vector graphic style, crisp clean edges, perfect symmetry, 
${styleReference} aesthetic, 
${industry} sector, ${keywords}, 
app icon design, favicon style, centered logomark, 
corporate identity symbol, timeless emblem`;
}

/**
 * Format for Google Imagen 3
 * Needs: Natural language, descriptive, clear instructions
 */
function formatForImagen3(data: LogoFormData): string {
  const style = data.preferredLogoStyle || 'minimalist';
  const industry = data.industry || 'technology';
  const businessName = data.businessName || 'the company';
  const colors = data.primaryColors || data.colorPaletteMood || 'professional colors';
  
  const keywords = [
    data.aestheticKeywords,
    data.emotionalKeywords,
    data.functionalKeywords,
  ].filter(Boolean).join(', ');
  
  const styleReference = data.styleReference || 'clean modern';
  
  let prompt = `A professional ${style} logo design for ${businessName}, a ${industry} company. `;
  
  prompt += `The logo features a single cohesive symbol with ${styleReference} design aesthetic. `;
  
  if (data.graphicMotif) {
    prompt += `It incorporates ${data.graphicMotif} elements. `;
  }
  
  prompt += `The color palette uses ${colors}. `;
  
  if (keywords) {
    prompt += `The design conveys ${keywords}. `;
  }
  
  if (data.missionStatement) {
    prompt += `The brand mission is: ${data.missionStatement}. `;
  }
  
  prompt += `Clean vector style with crisp edges, centered composition, isolated on a plain background. `;
  prompt += `Suitable for app icons and brand identity use.`;
  
  return prompt;
}

/**
 * Format for Recraft AI
 * Needs: Design brief style, professional terminology, clear use case
 */
function formatForRecraft(data: LogoFormData): string {
  const style = data.preferredLogoStyle || 'minimalist';
  const industry = data.industry || 'technology';
  const businessName = data.businessName || 'the company';
  const colors = data.primaryColors || data.colorPaletteMood || 'professional colors';
  
  const keywords = [
    data.aestheticKeywords,
    data.emotionalKeywords,
    data.functionalKeywords,
  ].filter(Boolean).join(', ') || 'professional, modern';
  
  const styleReference = data.styleReference || 'Swiss International';
  const graphicMotif = data.graphicMotif || 'abstract geometric';
  
  let prompt = `Vector logo design for ${businessName}. `;
  prompt += `${styleReference} ${style} style. `;
  prompt += `${industry} company. `;
  prompt += `Single ${graphicMotif} icon. `;
  prompt += `${colors} color palette. `;
  prompt += `Clean vector lines, professional finish. `;
  prompt += `Style: ${keywords}. `;
  
  if (data.missionStatement) {
    prompt += `Brand essence: ${data.missionStatement}. `;
  }
  
  prompt += `Use cases: app icon, brand mark, corporate identity. `;
  prompt += `Output: centered composition, solid flat colors, scalable vector.`;
  
  return prompt;
}

/**
 * Get default negative prompt for SD/Flux
 */
export function getDefaultNegativePrompt(): string {
  return `text, words, letters, typography, font, watermark, signature, 
mockup, 3d render, drop shadow, gradient, 
multiple logos, collage, business cards, letterhead, scattered objects, 
pattern, repeating, tessellation, wallpaper, textile, all-over print,
photography, photorealistic texture, blurry, busy composition,
many shapes, scattered elements, random placement`;
}

/**
 * Check if provider needs negative prompt
 */
export function needsNegativePrompt(style: ProviderPromptStyle): boolean {
  return style === 'sd-flux';
}

/**
 * Build complete generation options for a provider
 */
export function buildGenerationOptions(
  formData: LogoFormData,
  provider: string
): {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  model?: string;
} {
  const style = getPromptStyleForProvider(provider);
  const prompt = adaptPromptForProvider(formData, style);
  
  const options: {
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    model?: string;
  } = {
    prompt,
    width: 1024,
    height: 1024,
  };
  
  // Add negative prompt only for SD/Flux
  if (needsNegativePrompt(style)) {
    options.negativePrompt = getDefaultNegativePrompt();
  }
  
  // Provider-specific model selection
  if (provider === 'recraft') {
    // Recraft uses style parameter instead of model
    // This is handled in the Recraft implementation
  } else if (provider === 'google' || provider === 'fal' || provider === 'laozhang') {
    options.model = 'imagen-3';
  }
  
  return options;
}
