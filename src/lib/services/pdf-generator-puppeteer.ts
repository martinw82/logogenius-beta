/**
 * Puppeteer PDF Generator
 *
 * Generates professional brand guideline PDFs using Puppeteer and Handlebars templates.
 * Features the 4-layer page stack system:
 *   Layer 1: Background texture (TX) — full-bleed, 8-15% opacity
 *   Layer 2: Geometric accent (GEO) — corner/edge shapes, 8-15% opacity
 *   Layer 3: Chrome strips (CHR) — header rules, footer bars, section numbers
 *   Layer 4: Content — text, swatches, logos, specimens
 * Plus CSS noise overlay (feTurbulence) on every page.
 */

import puppeteer from 'puppeteer-core';
import Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import path from 'path';
import type { PuppeteerPDFData } from './pdf-data-transformer';
import { registerHelpers } from './pdf-helpers';
import { loadFontsForPDF } from './font-loader';

// Register Handlebars helpers
registerHelpers(Handlebars);

export interface PDFGenerationOptions {
  outputPath?: string;
  headless?: boolean;
  assetsBaseUrl?: string;
}

/**
 * Load and compile Handlebars templates
 */
async function loadTemplates() {
  const templatesDir = path.join(process.cwd(), 'templates', 'pdf');

  const [
    mainLayout,
    cover,
    toc,
    sectionDivider,
    section,
    logoShowcase,
    colors,
    typography,
    dosDonts,
    brandVoice,
    mockups,
    backCover,
  ] = await Promise.all([
    fs.readFile(path.join(templatesDir, 'layouts', 'main.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'cover.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'toc.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'section-divider.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'section.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'logo-showcase.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'colors.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'typography.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'dos-donts.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'brand-voice.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'mockups.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'back-cover.hbs'), 'utf8'),
  ]);

  return {
    mainLayout: Handlebars.compile(mainLayout),
    cover: Handlebars.compile(cover),
    toc: Handlebars.compile(toc),
    sectionDivider: Handlebars.compile(sectionDivider),
    section: Handlebars.compile(section),
    logoShowcase: Handlebars.compile(logoShowcase),
    colors: Handlebars.compile(colors),
    typography: Handlebars.compile(typography),
    dosDonts: Handlebars.compile(dosDonts),
    brandVoice: Handlebars.compile(brandVoice),
    mockups: Handlebars.compile(mockups),
    backCover: Handlebars.compile(backCover),
  };
}

/**
 * Generate full HTML document for PDF
 */
async function generateHTML(data: PuppeteerPDFData, options: PDFGenerationOptions = {}): Promise<string> {
  const templates = await loadTemplates();

  // Load fonts
  const fontConfig = await loadFontsForPDF(
    data.fontHeadings,
    data.fontBody,
    data.fontOther
  );

  // Build assets base URL
  const assetsBaseUrl = options.assetsBaseUrl || `file://${path.join(process.cwd(), 'assets')}`;

  // Prepare template data with computed fields
  const templateData = {
    ...data,
    ...fontConfig,
    assetsBaseUrl,
    primaryColorRgb: data.primaryColor.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') || '37, 99, 235',
    currentYear: new Date().getFullYear(),
    currentDate: new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }),
  };

  // Generate pages in order
  const pages: string[] = [];
  let pageNum = 1;

  // 1. Cover Page
  pages.push(templates.cover(templateData));
  pageNum++;

  // 2. Table of Contents
  pages.push(templates.toc({ ...templateData, pageNumber: pageNum }));
  pageNum++;

  // 3. Section divider: Brand Story
  pages.push(templates.sectionDivider({
    ...templateData,
    sectionNumber: 1,
    sectionTitle: 'Brand Story',
    sectionSubtitle: 'Company introduction, mission, and vision',
  }));
  pageNum++;

  // 4. Brand Story / Project Overview
  if (data.projectOverview) {
    pages.push(templates.section({
      ...templateData,
      title: 'Brand Story',
      subtitle: 'Company introduction, mission, and vision',
      content: formatContent(data.projectOverview),
      pullQuote: data.missionStatement || null,
      sectionNumber: 1,
      pageNumber: pageNum,
    }));
    pageNum++;
  }

  // 5. Brand Identity
  if (data.brandIdentityVoice) {
    pages.push(templates.section({
      ...templateData,
      title: 'Brand Identity',
      subtitle: 'Personality, archetype, and brand attributes',
      content: formatContent(data.brandIdentityVoice),
      sectionNumber: 1,
      pageNumber: pageNum,
    }));
    pageNum++;
  }

  // 6. Section divider: Logo
  pages.push(templates.sectionDivider({
    ...templateData,
    sectionNumber: 2,
    sectionTitle: 'Logo',
    sectionSubtitle: 'Primary mark and usage specifications',
  }));
  pageNum++;

  // 7. Logo Showcase
  pages.push(templates.logoShowcase({
    ...templateData,
    sectionNumber: 2,
    pageNumber: pageNum,
  }));
  pageNum++;

  // 8. Section divider: Usage Rules
  pages.push(templates.sectionDivider({
    ...templateData,
    sectionNumber: 3,
    sectionTitle: 'Usage Rules',
    sectionSubtitle: 'Protecting your brand integrity',
  }));
  pageNum++;

  // 9. Usage Rules / Do+Don't
  pages.push(templates.dosDonts({
    ...templateData,
    sectionNumber: 3,
    pageNumber: pageNum,
  }));
  pageNum++;

  // 10. Section divider: Color Palette
  pages.push(templates.sectionDivider({
    ...templateData,
    sectionNumber: 4,
    sectionTitle: 'Color Palette',
    sectionSubtitle: 'Brand colors with full specifications',
  }));
  pageNum++;

  // 11. Color Palette
  if (data.primaryColors.length > 0) {
    pages.push(templates.colors({
      ...templateData,
      sectionNumber: 4,
      pageNumber: pageNum,
    }));
    pageNum++;
  }

  // 12. Section divider: Typography
  pages.push(templates.sectionDivider({
    ...templateData,
    sectionNumber: 5,
    sectionTitle: 'Typography',
    sectionSubtitle: 'Font families, hierarchy, and usage',
  }));
  pageNum++;

  // 13. Typography
  pages.push(templates.typography({
    ...templateData,
    sectionNumber: 5,
    pageNumber: pageNum,
  }));
  pageNum++;

  // 14. Section divider: Brand Voice
  pages.push(templates.sectionDivider({
    ...templateData,
    sectionNumber: 6,
    sectionTitle: 'Brand Voice',
    sectionSubtitle: 'Communication style and messaging',
  }));
  pageNum++;

  // 15. Brand Voice
  if (data.brandVoiceTone) {
    pages.push(templates.brandVoice({
      ...templateData,
      sectionNumber: 6,
      pageNumber: pageNum,
    }));
    pageNum++;
  }

  // 16. Imagery & Photography (if content exists)
  if (data.imageryStyle) {
    pages.push(templates.sectionDivider({
      ...templateData,
      sectionNumber: 7,
      sectionTitle: 'Imagery',
      sectionSubtitle: 'Visual direction for photography and illustration',
    }));
    pageNum++;

    pages.push(templates.section({
      ...templateData,
      title: 'Imagery & Photography',
      subtitle: 'Visual direction for photography and illustration',
      content: formatContent(data.imageryStyle),
      sectionNumber: 7,
      pageNumber: pageNum,
    }));
    pageNum++;
  }

  // 17. Mockups (if any exist)
  const hasMockups = Object.values(data.mockups).some(m => m);
  if (hasMockups) {
    pages.push(templates.sectionDivider({
      ...templateData,
      sectionNumber: 8,
      sectionTitle: 'Applications',
      sectionSubtitle: 'Real-world brand applications',
    }));
    pageNum++;

    pages.push(templates.mockups({
      ...templateData,
      sectionNumber: 8,
      pageNumber: pageNum,
    }));
    pageNum++;
  }

  // 18. Graphic Elements (optional)
  if (data.graphicElements) {
    pages.push(templates.section({
      ...templateData,
      title: 'Graphic Elements',
      subtitle: 'Icons, patterns, and decorative components',
      content: formatContent(data.graphicElements),
      pageNumber: pageNum,
    }));
    pageNum++;
  }

  // 19. Web3 Section (optional)
  if (data.web3Section) {
    pages.push(templates.section({
      ...templateData,
      title: 'Web3 & Blockchain',
      subtitle: 'Token, governance, and community guidelines',
      content: formatContent(data.web3Section),
      pageNumber: pageNum,
    }));
    pageNum++;
  }

  // 20. Back Cover
  pages.push(templates.backCover(templateData));

  // Combine all pages into main layout
  const body = pages.join('\n');
  return templates.mainLayout({ ...templateData, body });
}

/**
 * Format plain text content to HTML
 */
function formatContent(text: string): string {
  if (!text) return '';
  return text
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.trim()}</p>`)
    .join('\n');
}

/**
 * Launch Puppeteer browser
 *
 * Two paths:
 *  - Local dev: CHROMIUM_PATH env var points to a local Chromium binary.
 *  - Vercel / serverless: @sparticuz/chromium downloads + caches a compatible
 *    binary in /tmp (no env var needed on the host).
 */
async function launchBrowser(headless: boolean = true) {
  const localPath = process.env.CHROMIUM_PATH;

  if (localPath) {
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--no-zygote',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ];
    if (headless) args.push('--headless=new');

    return puppeteer.launch({
      headless: false,
      executablePath: localPath,
      args,
    } as Parameters<typeof puppeteer.launch>[0]);
  }

  // Vercel / serverless
  const chromium = (await import('@sparticuz/chromium')).default;
  const executablePath = await chromium.executablePath();
  const args = [
    ...chromium.args.filter((a: string) => a !== '--disable-gpu'),
    '--font-render-hinting=none',
  ];

  const existingLdPath = process.env.LD_LIBRARY_PATH ?? '';
  if (!existingLdPath.includes('/usr/lib64')) {
    process.env.LD_LIBRARY_PATH = `/usr/lib64:/lib64${existingLdPath ? `:${existingLdPath}` : ''}`;
  }

  return puppeteer.launch({
    headless: true,
    executablePath,
    args,
  } as Parameters<typeof puppeteer.launch>[0]);
}

/**
 * Generate brand guide PDF using Puppeteer
 */
export async function generateBrandGuidePDFPuppeteer(
  data: PuppeteerPDFData,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const browser = await launchBrowser(options.headless !== false);

  try {
    const page = await browser.newPage();
    const html = await generateHTML(data, options);

    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(500);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

/**
 * Generate cover page only (for testing)
 */
export async function generateCoverPagePDF(
  data: PuppeteerPDFData,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const browser = await launchBrowser(options.headless !== false);

  try {
    const page = await browser.newPage();

    const templatesDir = path.join(process.cwd(), 'templates', 'pdf');
    const [mainLayout, cover] = await Promise.all([
      fs.readFile(path.join(templatesDir, 'layouts', 'main.hbs'), 'utf8'),
      fs.readFile(path.join(templatesDir, 'pages', 'cover.hbs'), 'utf8'),
    ]);

    const mainTemplate = Handlebars.compile(mainLayout);
    const coverTemplate = Handlebars.compile(cover);

    const fontConfig = await loadFontsForPDF(
      data.fontHeadings,
      data.fontBody,
      data.fontOther
    );

    const assetsBaseUrl = options.assetsBaseUrl || `file://${path.join(process.cwd(), 'assets')}`;

    const templateData = {
      ...data,
      ...fontConfig,
      assetsBaseUrl,
      primaryColorRgb: data.primaryColor.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') || '37, 99, 235',
    };

    const html = mainTemplate({
      ...templateData,
      body: coverTemplate(templateData),
    });

    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(500);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

/**
 * Get HTML preview string (for API use without writing to disk)
 */
export async function getHTMLPreview(
  data: PuppeteerPDFData,
  options: PDFGenerationOptions = {}
): Promise<string> {
  return generateHTML(data, options);
}

/**
 * Save HTML preview for debugging
 */
export async function saveHTMLPreview(
  data: PuppeteerPDFData,
  outputPath: string,
  options: PDFGenerationOptions = {}
): Promise<void> {
  const html = await generateHTML(data, options);
  await fs.writeFile(outputPath, html, 'utf8');
}
