/**
 * PDF Data Transformer
 *
 * Transforms raw order data into the format expected by the Puppeteer PDF generator.
 * Parses JSON fields, extracts colors, and prepares all content sections.
 */

import type { BrandAssets } from './brand-assets';

export interface PuppeteerPDFData {
  // Identity
  businessName: string;
  tagline?: string;
  archetype?: string;

  // Form Data
  missionStatement?: string;
  brandPillars?: string;
  targetAudience?: string;
  industry?: string;

  // AI Generated Content
  projectOverview: string;
  brandIdentityVoice: string;
  logoPhilosophy: string;
  colorPaletteText: string;
  colorAccessibility: string;
  typographyText: string;
  imageryStyle: string;
  graphicElements: string;
  brandVoiceTone: string;
  visualStyleGuide: string;
  usageRulesText: string;
  web3Section?: string;
  appendix: string;

  // Colors (parsed from colorPalette JSON)
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryColors: string[];
  secondaryColors: string[];
  accentColors: string[];

  // Typography
  fontHeadings: string;
  fontBody: string;
  fontOther?: string;

  // Assets
  logoSvg?: string;
  mockups: Record<string, string>;
  socialAssets?: Record<string, string>;

  // Archetype Assets (includes design tokens, chrome, pattern data)
  brandAssets: BrandAssets;

  // Meta
  orderId: number;
  createdAt: Date;
  authorEmail?: string;
}

/**
 * Extract hex colors from text using regex
 */
function extractColorsFromText(text: string): string[] {
  if (!text) return [];
  const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
  const matches = text.match(hexRegex);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Parse color palette from various sources
 */
function parseColorPalette(
  colorPaletteJson: string | null,
  logoColors: string[],
  primaryColorsInput?: string,
  secondaryColorsInput?: string,
  accentColorsInput?: string
): {
  primary: string[];
  secondary: string[];
  accent: string[];
} {
  let primary: string[] = [];
  let secondary: string[] = [];
  let accent: string[] = [];

  // Try parsing JSON color palette first
  if (colorPaletteJson) {
    try {
      const parsed = JSON.parse(colorPaletteJson);
      if (Array.isArray(parsed.primary)) primary = parsed.primary;
      if (Array.isArray(parsed.secondary)) secondary = parsed.secondary;
      if (Array.isArray(parsed.accent)) accent = parsed.accent;
    } catch {
      // Invalid JSON, continue with fallbacks
    }
  }

  // Fall back to extracting from input strings
  if (primary.length === 0 && primaryColorsInput) {
    primary = extractColorsFromText(primaryColorsInput);
  }
  if (secondary.length === 0 && secondaryColorsInput) {
    secondary = extractColorsFromText(secondaryColorsInput);
  }
  if (accent.length === 0 && accentColorsInput) {
    accent = extractColorsFromText(accentColorsInput);
  }

  // Final fallback to logo colors
  if (primary.length === 0 && logoColors.length > 0) {
    primary = logoColors.slice(0, 3);
  }

  // Ensure we have at least one color
  if (primary.length === 0) primary = ['#2563eb'];
  if (secondary.length === 0) secondary = ['#1e40af'];
  if (accent.length === 0) accent = ['#f59e0b'];

  return { primary, secondary, accent };
}

/**
 * Transform order data to Puppeteer PDF data format
 */
export function transformOrderDataToPDFData(
  orderData: Record<string, any>,
  logoSvg: string | null,
  mockups: Record<string, string>,
  socialAssets: Record<string, string>,
  brandAssets: BrandAssets,
  orderId: number,
  authorEmail?: string
): PuppeteerPDFData {
  // Parse color palette — handle both string (from DB) and array (from mock data)
  const toColorStr = (v: unknown): string | undefined => {
    if (!v) return undefined;
    if (Array.isArray(v)) return (v as string[]).join(' ');
    return v as string;
  };

  const colorPalette = parseColorPalette(
    orderData.colorPalette,
    logoSvg ? extractColorsFromText(logoSvg) : [],
    toColorStr(orderData.primaryColors),
    toColorStr(orderData.secondaryColors),
    toColorStr(orderData.accentColors)
  );

  // Get first color from each category as the main color
  const primaryColor = colorPalette.primary[0] || '#2563eb';
  const secondaryColor = colorPalette.secondary[0] || '#1e40af';
  const accentColor = colorPalette.accent[0] || '#f59e0b';

  // Extract typography fonts
  const fontHeadings = orderData.fontHeadings || 'Inter';
  const fontBody = orderData.fontBody || 'Inter';
  const fontOther = orderData.fontOther;

  return {
    businessName: orderData.businessName || 'Brand',
    tagline: orderData.tagline,
    archetype: orderData.brandArchetype,
    missionStatement: orderData.missionStatement,
    brandPillars: orderData.brandPillars,
    targetAudience: orderData.targetAudience,
    industry: orderData.industry,
    projectOverview: orderData.guide_projectOverview || orderData.projectOverview || '',
    brandIdentityVoice: orderData.guide_brandIdentity || orderData.brandIdentity || '',
    logoPhilosophy: orderData.guide_logoPhilosophy || orderData.logoPhilosophy || '',
    colorPaletteText: orderData.guide_colorPalette || orderData.colorPaletteText || '',
    colorAccessibility: orderData.guide_colorAccessibility || orderData.colorAccessibility || '',
    typographyText: orderData.guide_typography || orderData.typography || '',
    imageryStyle: orderData.guide_imageryStyle || orderData.imageryStyle || '',
    graphicElements: orderData.guide_graphicElements || orderData.graphicElements || '',
    brandVoiceTone: orderData.guide_brandVoice || orderData.brandVoice || '',
    visualStyleGuide: orderData.guide_visualStyleGuide || orderData.visualStyleGuide || '',
    usageRulesText: orderData.guide_usageRulesAndDonts || orderData.usageRulesAndDonts || '',
    web3Section: orderData.guide_web3Section || orderData.web3Section,
    appendix: orderData.guide_appendix || orderData.appendix || '',
    primaryColor,
    secondaryColor,
    accentColor,
    primaryColors: colorPalette.primary,
    secondaryColors: colorPalette.secondary,
    accentColors: colorPalette.accent,
    fontHeadings,
    fontBody,
    fontOther,
    logoSvg: logoSvg || undefined,
    mockups,
    socialAssets,
    brandAssets,
    orderId,
    createdAt: new Date(),
    authorEmail,
  };
}

/**
 * Create mock PDF data for testing
 */
export function createMockPDFData(
  archetype: string = 'The Hero',
  businessName: string = 'THUNDERFORGE'
): Partial<PuppeteerPDFData> {
  return {
    businessName,
    tagline: 'Built to last.',
    archetype,
    industry: 'fitness',
    missionStatement: 'We exist to equip people with the tools and mindset to push beyond their limits.',

    projectOverview: `${businessName} is a premium athletic performance brand built for those who refuse to settle. Every product is engineered to withstand the demands of elite training while projecting the confidence of a champion.`,

    brandIdentityVoice: `Bold, relentless, triumphant. The ${businessName} brand speaks directly to high performers who see their gear as an extension of their mindset.`,

    logoPhilosophy: `The ${businessName} mark is derived from a downward-pointing triangle — a symbol of focused power channelled into the ground. It is never tilted, never softened.`,

    colorPaletteText: `Our primary palette is built around competition red (#C8102E) — a colour that demands attention and signals peak performance. Black grounds it with authority, while gold provides an aspirational accent.`,

    colorAccessibility: 'All color combinations meet WCAG AA standards for contrast. Primary text uses a 4.5:1 ratio against backgrounds.',

    typographyText: 'Anton provides maximum impact for headlines with its compressed, all-caps character. Roboto Condensed delivers excellent readability for body content while maintaining the brand\'s efficient, no-waste personality.',

    imageryStyle: 'Photography should feel raw and powerful. Use high-contrast lighting, dynamic angles, and genuine athletic moments. No posed studio shots.',

    graphicElements: 'Angular geometric shapes derived from the logo triangle. Sharp edges, no rounded corners. Use diagonal lines and chevron patterns to reinforce the brand\'s forward momentum.',

    brandVoiceTone: 'Direct. Motivating. No fluff. We speak in active voice, short sentences, and never apologise for our confidence.',

    visualStyleGuide: 'All layouts follow an 8px grid. No gradients. High contrast only. Text should be large and bold — if it doesn\'t command attention, make it bigger.',

    usageRulesText: 'Always use the logo on approved backgrounds. Never stretch, rotate, or recolour the mark. Never place it on busy photographic backgrounds without a solid colour backing.',

    appendix: 'This brand guide is a living document. Version 1.0 reflects our current brand expression. For questions or asset requests, contact brand@thunderforge.com.',

    primaryColor: '#C8102E',
    secondaryColor: '#000000',
    accentColor: '#FFD700',
    primaryColors: ['#C8102E'],
    secondaryColors: ['#000000'],
    accentColors: ['#FFD700'],

    fontHeadings: 'Anton',
    fontBody: 'Roboto Condensed',

    logoSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,90 10,90" fill="#C8102E"/></svg>`,

    orderId: 12345,
    createdAt: new Date(),
  };
}
