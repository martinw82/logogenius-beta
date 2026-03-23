/**
 * Puppeteer PDF Generator
 * 
 * Generates professional brand guideline PDFs using Puppeteer and Handlebars templates.
 * Features archetype-based visual assets, custom fonts, and agency-quality layouts.
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
  
  const [mainLayout, cover, toc, section, colors, typography, mockups, dosDonts, backCover, sectionDivider] = await Promise.all([
    fs.readFile(path.join(templatesDir, 'layouts', 'main.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'cover.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'toc.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'section.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'colors.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'typography.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'mockups.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'dos-donts.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'back-cover.hbs'), 'utf8'),
    fs.readFile(path.join(templatesDir, 'pages', 'section-divider.hbs'), 'utf8').catch(() => ''),
  ]);
  
  return {
    mainLayout: Handlebars.compile(mainLayout),
    cover: Handlebars.compile(cover),
    toc: Handlebars.compile(toc),
    section: Handlebars.compile(section),
    colors: Handlebars.compile(colors),
    typography: Handlebars.compile(typography),
    mockups: Handlebars.compile(mockups),
    dosDonts: Handlebars.compile(dosDonts),
    backCover: Handlebars.compile(backCover),
    sectionDivider: sectionDivider ? Handlebars.compile(sectionDivider) : null,
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
  
  // Prepare template data
  const templateData = {
    ...data,
    ...fontConfig,
    assetsBaseUrl,
    primaryColorRgb: data.primaryColor.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') || '37, 99, 235',
  };
  
  // Generate individual pages
  const pages: string[] = [];
  
  // 1. Cover Page
  pages.push(templates.cover(templateData));
  
  // 2. Table of Contents
  pages.push(templates.toc({ ...templateData, pageNumber: 2 }));
  
  // 3. Project Overview
  if (data.projectOverview) {
    pages.push(templates.section({
      ...templateData,
      title: 'Project Overview',
      subtitle: 'Company introduction, mission, and vision',
      content: formatContent(data.projectOverview),
      pageNumber: 3,
    }));
  }
  
  // 4. Brand Identity & Voice
  if (data.brandIdentityVoice) {
    pages.push(templates.section({
      ...templateData,
      title: 'Brand Identity & Voice',
      subtitle: 'Personality, archetype, and brand attributes',
      content: formatContent(data.brandIdentityVoice),
      pageNumber: 4,
    }));
  }
  
  // 5. Logo Philosophy
  if (data.logoPhilosophy) {
    pages.push(templates.section({
      ...templateData,
      title: 'Logo Philosophy',
      subtitle: 'Design thinking and core message',
      content: formatContent(data.logoPhilosophy),
      pageNumber: 5,
    }));
  }
  
  // 6. Logo Mockups
  const hasMockups = Object.values(data.mockups).some(m => m);
  if (hasMockups) {
    pages.push(templates.mockups({
      ...templateData,
      pageNumber: 6,
    }));
  }
  
  // 7. Color Palette
  if (data.primaryColors.length > 0) {
    pages.push(templates.colors({
      ...templateData,
      pageNumber: 7,
    }));
  }
  
  // 8. Color Accessibility
  if (data.colorAccessibility) {
    pages.push(templates.section({
      ...templateData,
      title: 'Color Accessibility',
      subtitle: 'WCAG compliance and contrast guidelines',
      content: formatContent(data.colorAccessibility),
      pageNumber: 8,
    }));
  }
  
  // 9. Typography
  pages.push(templates.typography({
    ...templateData,
    pageNumber: 9,
  }));
  
  // 10. Imagery Style
  if (data.imageryStyle) {
    pages.push(templates.section({
      ...templateData,
      title: 'Imagery & Photography',
      subtitle: 'Visual direction for photography and illustration',
      content: formatContent(data.imageryStyle),
      pageNumber: 10,
    }));
  }
  
  // 11. Graphic Elements
  if (data.graphicElements) {
    pages.push(templates.section({
      ...templateData,
      title: 'Graphic Elements',
      subtitle: 'Icons, patterns, and decorative components',
      content: formatContent(data.graphicElements),
      pageNumber: 11,
    }));
  }
  
  // 12. Brand Voice & Tone
  if (data.brandVoiceTone) {
    pages.push(templates.section({
      ...templateData,
      title: 'Brand Voice & Tone',
      subtitle: 'Communication style and messaging guidelines',
      content: formatContent(data.brandVoiceTone),
      pageNumber: 12,
    }));
  }
  
  // 13. Visual Style Guide
  if (data.visualStyleGuide) {
    pages.push(templates.section({
      ...templateData,
      title: 'Visual Style Guide',
      subtitle: 'Spacing, grids, shadows, and visual standards',
      content: formatContent(data.visualStyleGuide),
      pageNumber: 13,
    }));
  }
  
  // 14. Usage Rules
  pages.push(templates.dosDonts({
    ...templateData,
    pageNumber: 14,
  }));
  
  // 15. Web3 Section (if applicable)
  if (data.web3Section) {
    pages.push(templates.section({
      ...templateData,
      title: 'Web3 & Blockchain',
      subtitle: 'Token, governance, and community guidelines',
      content: formatContent(data.web3Section),
      pageNumber: 15,
    }));
  }
  
  // 16. Back Cover
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
  
  // Split into paragraphs and wrap in <p> tags
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
    // ── Local development ──────────────────────────────────────────────────
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--no-zygote',
      '--disable-dev-shm-usage',
      // Note: --disable-gpu omitted intentionally — it prevents Page.printToPDF in headless mode
      '--font-render-hinting=none',
    ];
    if (headless) args.push('--headless=new');

    return puppeteer.launch({
      headless: false, // Managed via --headless=new in args above
      executablePath: localPath,
      args,
    } as Parameters<typeof puppeteer.launch>[0]);
  }

  // ── Vercel / serverless ──────────────────────────────────────────────────
  // @sparticuz/chromium handles binary download + /tmp caching automatically.
  // --disable-gpu is filtered out because it blocks Page.printToPDF.
  const chromium = (await import('@sparticuz/chromium')).default;
  const executablePath = await chromium.executablePath();
  const args = [
    ...chromium.args.filter((a: string) => a !== '--disable-gpu'),
    '--font-render-hinting=none',
  ];

  // Vercel/Lambda runs on Amazon Linux 2 where NSS libs (libnss3, etc.) live in
  // /usr/lib64. Chrome's dynamic linker won't find them unless we add that path.
  // Setting LD_LIBRARY_PATH here is inherited by the spawned Chrome child process.
  const existingLdPath = process.env.LD_LIBRARY_PATH ?? '';
  if (!existingLdPath.includes('/usr/lib64')) {
    process.env.LD_LIBRARY_PATH = `/usr/lib64:/lib64${existingLdPath ? `:${existingLdPath}` : ''}`;
  }

  return puppeteer.launch({
    headless: true, // chromium.headless causes type issues; true = new headless in puppeteer-core v21
    executablePath,
    args,
  } as Parameters<typeof puppeteer.launch>[0]);
}

/**
 * Generate brand guide PDF using Puppeteer
 * 
 * @param data - PDF data including brand info, content, and assets
 * @param options - PDF generation options
 * @returns PDF as Buffer
 */
export async function generateBrandGuidePDFPuppeteer(
  data: PuppeteerPDFData,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const browser = await launchBrowser(options.headless !== false);
  
  try {
    const page = await browser.newPage();
    
    // Generate HTML
    const html = await generateHTML(data, options);
    
    // Set content and wait for DOM to be ready.
    // 'domcontentloaded' fires before external stylesheets/fonts resolve, avoiding
    // timeouts in environments without internet access. Fallback fonts in CSS ensure
    // the PDF renders correctly even without Google Fonts.
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Brief wait for any synchronous rendering to complete
    await page.waitForTimeout(500);
    
    // Generate PDF
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
    
    // Load only cover template
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

    // Must await here — returning a pending Promise inside try/finally causes
    // browser.close() to run before PDF generation completes, killing the browser
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
