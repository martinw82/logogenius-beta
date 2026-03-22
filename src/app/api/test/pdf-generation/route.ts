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
      businessName = 'Test Brand',
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
