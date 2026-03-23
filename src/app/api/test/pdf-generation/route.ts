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

export async function POST(request: Request) {
  const start = Date.now();

  try {
    const body = await request.json();

    const {
      businessName = 'THUNDERFORGE',
      tagline = 'Built to last.',
      archetype = 'The Hero',
      industry = 'fitness',
      missionStatement = 'We exist to equip people with the tools and mindset to push beyond their limits.',
      brandPillars,
      targetAudience,
      projectOverview = 'Thunderforge is a premium athletic performance brand built for those who refuse to settle. Every product is engineered to withstand the demands of elite training while projecting the confidence of a champion.',
      brandIdentityVoice = 'Bold, relentless, triumphant. The Thunderforge brand speaks directly to high performers who see their gear as an extension of their mindset.',
      logoPhilosophy = 'The Thunderforge mark is derived from a downward-pointing triangle — a symbol of focused power channelled into the ground. It is never tilted, never softened.',
      colorPaletteText = 'Our primary palette is built around competition red (#C8102E) — a colour that demands attention and signals peak performance.',
      colorAccessibility = 'All color combinations meet WCAG AA standards for contrast.',
      typographyText = 'Anton provides maximum impact for headlines with its compressed, all-caps character. Roboto Condensed delivers excellent readability for body content.',
      imageryStyle = 'Photography should feel raw and powerful. Use high-contrast lighting, dynamic angles, and genuine athletic moments.',
      graphicElements = 'Angular geometric shapes derived from the logo triangle. Sharp edges, no rounded corners. Use diagonal lines and chevron patterns.',
      brandVoiceTone = 'Direct. Motivating. No fluff. We speak in active voice, short sentences, and never apologise for our confidence.',
      visualStyleGuide = 'All layouts follow an 8px grid. No gradients. High contrast only.',
      usageRulesText = 'Always use the logo on approved backgrounds. Never stretch, rotate, or recolour the mark.',
      appendix = '',
      primaryColor = '#C8102E',
      secondaryColor = '#000000',
      accentColor = '#FFD700',
      primaryColors,
      secondaryColors,
      accentColors,
      fontHeadings = 'Anton',
      fontBody = 'Roboto Condensed',
      fontOther,
      logoSvg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 90,90 10,90" fill="#C8102E"/></svg>',
      generatePdf = false,
      coverOnly = false,
      orderId = 12345,
    } = body;

    // Get archetype brand assets (seeded by orderId for reproducibility)
    const brandAssets = await getRandomBrandAssets(archetype, orderId);

    const pdfData: PuppeteerPDFData = {
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
      primaryColors: primaryColors ?? [primaryColor],
      secondaryColors: secondaryColors ?? [secondaryColor],
      accentColors: accentColors ?? [accentColor],
      fontHeadings,
      fontBody,
      fontOther,
      logoSvg,
      mockups: {},
      socialAssets: {},
      brandAssets,
      orderId,
      createdAt: new Date(),
    };

    const options: PDFGenerationOptions = {
      assetsBaseUrl: `file://${path.join(process.cwd(), 'assets')}`,
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
