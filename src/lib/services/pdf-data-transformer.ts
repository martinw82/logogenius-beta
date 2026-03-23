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
  
  // Archetype Assets
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
  if (primary.length === 0) {
    primary = ['#2563eb'];
  }
  if (secondary.length === 0) {
    secondary = ['#1e40af'];
  }
  if (accent.length === 0) {
    accent = ['#f59e0b'];
  }
  
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
  
  // Build the complete PDF data object
  return {
    // Identity
    businessName: orderData.businessName || 'Brand',
    tagline: orderData.tagline,
    archetype: orderData.brandArchetype,
    
    // Form Data
    missionStatement: orderData.missionStatement,
    brandPillars: orderData.brandPillars,
    targetAudience: orderData.targetAudience,
    industry: orderData.industry,
    
    // AI Generated Content (mapped from orderData fields)
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
    
    // Colors
    primaryColor,
    secondaryColor,
    accentColor,
    primaryColors: colorPalette.primary,
    secondaryColors: colorPalette.secondary,
    accentColors: colorPalette.accent,
    
    // Typography
    fontHeadings,
    fontBody,
    fontOther,
    
    // Assets
    logoSvg: logoSvg || undefined,
    mockups,
    socialAssets,
    
    // Archetype Assets
    brandAssets,
    
    // Meta
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
    tagline: 'Strength Through Innovation',
    archetype,
    industry: 'Technology',
    
    projectOverview: `${businessName} is a forward-thinking technology company dedicated to creating powerful solutions that empower businesses to achieve more. Founded with a vision to democratize enterprise-grade tools, we have grown into a trusted partner for organizations seeking to transform their digital presence.`,
    
    brandIdentityVoice: `The ${businessName} brand embodies strength, innovation, and reliability. We speak with confidence and clarity, avoiding jargon while maintaining technical credibility. Our voice is bold but never arrogant, authoritative but approachable.`,
    
    logoPhilosophy: `The ${businessName} logo represents our core values of power and precision. The geometric forms suggest stability and forward momentum, while the color palette evokes trust and energy. The mark is designed to be memorable at any size, from app icons to billboards.`,
    
    colorPaletteText: `Our primary color palette centers on deep blues and vibrant accents. The primary blue (#2563eb) conveys trust and professionalism, while the energetic orange accent (#f59e0b) adds warmth and approachability. Secondary grays provide balance and sophistication.`,
    
    colorAccessibility: 'All color combinations meet WCAG AA standards for contrast. Primary text uses a 4.5:1 ratio against backgrounds, while large text achieves 3:1. Avoid using color alone to convey information.',
    
    typographyText: 'Our typography pairs a strong serif for headings with a clean sans-serif for body text. This combination conveys both authority and accessibility. Headings use Playfair Display for editorial gravitas, while Inter provides excellent readability for body content.',
    
    imageryStyle: 'Photography should feel authentic and aspirational. Use natural lighting, diverse subjects, and real-world contexts. Avoid generic stock imagery. Images should convey action, collaboration, and positive outcomes.',
    
    graphicElements: 'Geometric shapes derived from the logo can be used as background patterns or accent elements. Maintain consistent corner radii and line weights. Use these elements sparingly to avoid visual clutter.',
    
    brandVoiceTone: 'We are confident but not cocky. Technical but not cryptic. Professional but not stuffy. Our tone adapts to context—more formal in white papers, conversational in social media—but always maintains clarity and respect for the reader.',
    
    visualStyleGuide: 'Maintain consistent spacing using an 8px grid system. Use subtle shadows (0 2px 8px rgba) for depth. Border radius should be consistent—4px for UI elements, 8px for cards. Keep designs clean and purposeful.',
    
    usageRulesText: 'Protecting our brand integrity ensures consistent recognition and trust. Always use approved logo files, maintain clear space, and follow color guidelines. When in doubt, contact the brand team for guidance.',
    
    appendix: 'This brand guide is a living document. Version 1.0 reflects our current brand expression as of 2026. For questions, asset requests, or usage approvals, contact brand@thunderforge.com.',
    
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    accentColor: '#f59e0b',
    primaryColors: ['#2563eb', '#3b82f6', '#60a5fa'],
    secondaryColors: ['#1e40af', '#1e3a8a'],
    accentColors: ['#f59e0b', '#fbbf24'],
    
    fontHeadings: 'Playfair Display',
    fontBody: 'Inter',
    
    orderId: Date.now(),
    createdAt: new Date(),
  };
}
