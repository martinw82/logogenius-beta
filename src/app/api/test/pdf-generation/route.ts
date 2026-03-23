import { NextResponse } from 'next/server';
import type { PuppeteerPDFData } from '@/lib/services/pdf-data-transformer';
import {
  getHTMLPreview,
  generateBrandGuidePDFPuppeteer,
  generateCoverPagePDF,
  type PDFGenerationOptions,
} from '@/lib/services/pdf-generator-puppeteer';
import { getRandomBrandAssets } from '@/lib/services/brand-assets';
import path from 'path';

export const dynamic = 'force-dynamic';

const THUNDERFORGE_TEST_DATA = {
  businessName: 'THUNDERFORGE',
  tagline: 'Built to last.',
  brandArchetype: 'The Hero',
  industry: 'fitness',
  missionStatement: 'We exist to equip people with the tools and mindset to push beyond their limits.',
  
  primaryColor: '#C8102E',
  secondaryColor: '#000000',
  accentColor: '#FFD700',
  
  primaryColors: ['#C8102E', '#8B0000', '#FF4500'],
  secondaryColors: ['#000000', '#1a1a1a'],
  accentColors: ['#FFD700', '#FFA500'],
  
  fontHeadings: 'Anton',
  fontBody: 'Roboto Condensed',
  
  logoSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,10 90,90 10,90" fill="#C8102E"/>
  </svg>`,
  
  projectOverview: 'Thunderforge is a premium athletic performance brand built for those who refuse to settle. Every product is engineered to withstand the demands of elite training while projecting the confidence of a champion.',
  
  brandIdentityVoice: 'Bold, relentless, triumphant. The Thunderforge brand speaks directly to high performers who see their gear as an extension of their mindset. We are unapologetically fierce and uncompromising in our pursuit of excellence.',
  
  logoPhilosophy: 'The Thunderforge mark is derived from a downward-pointing triangle — a symbol of focused power channelled into the ground. It is never tilted, never softened. The sharp angles represent precision and the courage to act.',
  
  colorPaletteText: 'The Thunderforge palette centers on power red as the primary color, representing energy and determination. Black provides the foundation of authority and strength, while gold adds the finishing touch of victory and achievement.',
  
  colorAccessibility: 'All color combinations meet WCAG AA standards. The primary red provides sufficient contrast against white and black backgrounds. Use white text on red backgrounds for maximum impact.',
  
  typographyText: 'Anton is our primary heading font — bold, geometric, and unapologetically aggressive. Roboto Condensed provides clean, readable body text that complements without competing. Together they convey strength through simplicity.',
  
  imageryStyle: 'Photography should feel bold and dynamic. Use high contrast, dramatic lighting, and action-oriented subjects. Avoid soft, muted tones — everything should feel powerful and intentional.',
  
  graphicElements: 'Sharp geometric shapes and angular lines reinforce our core values. Use the downward triangle motif sparingly as accent elements. Keep compositions clean and purposeful.',
  
  brandVoiceTone: 'We speak with confidence and clarity. No jargon, no fluff. Short sentences, active voice, and strong verbs. We motivate without patronizing.',
  
  visualStyleGuide: 'Maintain consistent spacing using an 8px grid. Use sharp corners (0px radius) consistently. Bold typography weights — never light or thin.',
  
  usageRulesText: 'Always use the logo on approved backgrounds. Never stretch, rotate, or recolor the mark. Never place it on busy photographic backgrounds without a solid color backing.',
  
  mockups: {},
  socialAssets: {},
};

export async function POST(request: Request) {
  const start = Date.now();

  try {
    const body = await request.json();

    const {
      useTestData = false,
      businessName,
      tagline,
      archetype = 'The Hero',
      industry,
      missionStatement,
      brandPillars,
      targetAudience,
      projectOverview = '',
      brandIdentityVoice = '',
      logoPhilosophy = '',
      colorPaletteText = '',
      colorAccessibility = '',
      typographyText = '',
      imageryStyle = '',
      graphicElements = '',
      brandVoiceTone = '',
      visualStyleGuide = '',
      usageRulesText = '',
      appendix = '',
      primaryColor = '#2563eb',
      secondaryColor = '#1e40af',
      accentColor = '#f59e0b',
      primaryColors,
      secondaryColors,
      accentColors,
      fontHeadings = 'Playfair Display',
      fontBody = 'Inter',
      fontOther,
      logoSvg,
      generatePdf = false,
      coverOnly = false,
      orderId = Date.now(),
    } = body;

    // Use THUNDERFORGE test data if requested
    const inputData = useTestData ? THUNDERFORGE_TEST_DATA : {
      businessName,
      tagline,
      archetype,
      industry,
      missionStatement,
      brandPillars,
      targetAudience,
      projectOverview,
      brandIdentityVoice,
      logoPhilosophy,
      colorPaletteText,
      colorAccessibility,
      typographyText,
      imageryStyle,
      graphicElements,
      brandVoiceTone,
      visualStyleGuide,
      usageRulesText,
      appendix,
      primaryColor,
      secondaryColor,
      accentColor,
      primaryColors,
      secondaryColors,
      accentColors,
      fontHeadings,
      fontBody,
      fontOther,
      logoSvg,
    };

    // Get archetype brand assets (seeded by orderId for reproducibility)
    const brandAssets = await getRandomBrandAssets(
      inputData.brandArchetype || archetype,
      orderId
    );

    const pdfData: PuppeteerPDFData = {
      ...inputData,
      archetype: inputData.brandArchetype || archetype,
      primaryColors: primaryColors ?? [inputData.primaryColor],
      secondaryColors: secondaryColors ?? [inputData.secondaryColor],
      accentColors: accentColors ?? [inputData.accentColor],
      mockups: {},
      socialAssets: {},
      brandAssets,
      orderId,
      createdAt: new Date(),
    };

    const options: PDFGenerationOptions = {
      assetsBaseUrl: `file://${path.join(process.cwd(), 'public', 'assets')}`,
    };

    // Always generate HTML preview
    const html = await getHTMLPreview(pdfData, options);
    const htmlMs = Date.now() - start;

    let pdfBase64: string | null = null;
    let pdfSizeKb: number | null = null;

    if (generatePdf) {
      const pdfBuffer = coverOnly
        ? await generateCoverPagePDF(pdfData, options)
        : await generateBrandGuidePDFPuppeteer(pdfData, options);
      pdfBase64 = pdfBuffer.toString('base64');
      pdfSizeKb = Math.round(pdfBuffer.length / 1024);
    }

    const totalMs = Date.now() - start;

    return NextResponse.json({
      success: true,
      html,
      pdfBase64,
      pdfSizeKb,
      assetsUsed: brandAssets,
      htmlMs,
      totalMs,
      testDataUsed: useTestData,
    });
  } catch (error) {
    console.error('[pdf-generation] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        totalMs: Date.now() - start,
      },
      { status: 500 }
    );
  }
}