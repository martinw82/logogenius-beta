import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface BrandGuideData {
  businessName: string;
  tagline?: string;
  logo?: {
    url: string;
    colors: string[];
  };
  sections: {
    projectOverview?: string;
    brandIdentity?: string;
    logoPhilosophy?: string;
    colorPalette?: {
      primary: string[];
      secondary: string[];
      accent: string[];
    };
    colorAccessibility?: string;
    typography?: {
      headings: string;
      body: string;
      usage: string;
    };
    imageryStyle?: string;
    graphicElements?: string;
    brandVoice?: string;
    visualStyleGuide?: string;
    usageRulesAndDonts?: string;
    web3Section?: string;
    appendix?: string;
  };
  createdAt?: Date;
  authorEmail?: string;
}

export async function generateBrandGuidePDF(data: BrandGuideData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: 50,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cover Page
      doc.fontSize(48).font('Helvetica-Bold').text(data.businessName, { align: 'center' });
      doc.moveDown(0.5);
      if (data.tagline) {
        doc.fontSize(20).font('Helvetica').text(data.tagline, { align: 'center', color: '#666666' });
      }
      doc.moveDown(2);

      // Metadata
      doc.fontSize(11).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      if (data.authorEmail) {
        doc.fontSize(10).text(`For: ${data.authorEmail}`, { align: 'center', color: '#999999' });
      }

      // Add page break
      doc.addPage();

      // Table of Contents
      doc.fontSize(24).font('Helvetica-Bold').text('Table of Contents', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      const sections = [
        'Project Overview',
        'Brand Identity',
        'Logo Philosophy',
        'Color Palette',
        'Color Accessibility',
        'Typography',
        'Imagery Style',
        'Graphic Elements',
        'Brand Voice & Tone',
        'Visual Style Guide',
        'Usage Rules & Don\'ts',
        data.sections.web3Section ? 'Web3 Specifications' : null,
        'Appendix',
      ].filter(Boolean);

      sections.forEach((section, i) => {
        doc.text(`${i + 1}. ${section}`);
      });

      doc.addPage();

      // Project Overview Section
      if (data.sections.projectOverview) {
        addSection(doc, 'Project Overview', data.sections.projectOverview);
      }

      // Brand Identity Section
      if (data.sections.brandIdentity) {
        addSection(doc, 'Brand Identity & Voice', data.sections.brandIdentity);
      }

      // Logo Philosophy Section
      if (data.sections.logoPhilosophy) {
        addSection(doc, 'Logo Philosophy', data.sections.logoPhilosophy);
      }

      // Color Palette Section
      if (data.sections.colorPalette) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').text('Color Palette', { underline: true });
        doc.moveDown(0.5);

        // Primary Colors
        doc.fontSize(14).font('Helvetica-Bold').text('Primary Colors');
        doc.moveDown(0.3);
        (data.sections.colorPalette.primary || []).forEach((color) => {
          doc.fontSize(11).text(`${color}`, { color: color });
        });
        doc.moveDown(0.5);

        // Secondary Colors
        doc.fontSize(14).font('Helvetica-Bold').text('Secondary Colors');
        doc.moveDown(0.3);
        (data.sections.colorPalette.secondary || []).forEach((color) => {
          doc.fontSize(11).text(`${color}`, { color: color });
        });
        doc.moveDown(0.5);

        // Accent Colors
        doc.fontSize(14).font('Helvetica-Bold').text('Accent Colors');
        doc.moveDown(0.3);
        (data.sections.colorPalette.accent || []).forEach((color) => {
          doc.fontSize(11).text(`${color}`, { color: color });
        });
      }

      // Color Accessibility Section
      if (data.sections.colorAccessibility) {
        addSection(doc, 'Color Accessibility', data.sections.colorAccessibility);
      }

      // Typography Section
      if (data.sections.typography) {
        addSection(doc, 'Typography Guide', data.sections.typography);
      }

      // Imagery Style Section
      if (data.sections.imageryStyle) {
        addSection(doc, 'Imagery & Photography Style', data.sections.imageryStyle);
      }

      // Graphic Elements Section
      if (data.sections.graphicElements) {
        addSection(doc, 'Graphic Elements', data.sections.graphicElements);
      }

      // Brand Voice Section
      if (data.sections.brandVoice) {
        addSection(doc, 'Brand Voice & Tone', data.sections.brandVoice);
      }

      // Visual Style Guide Section
      if (data.sections.visualStyleGuide) {
        addSection(doc, 'Visual Style Guide', data.sections.visualStyleGuide);
      }

      // Usage Rules Section
      if (data.sections.usageRulesAndDonts) {
        addSection(doc, 'Usage Rules & Don\'ts', data.sections.usageRulesAndDonts);
      }

      // Web3 Section (if applicable)
      if (data.sections.web3Section) {
        addSection(doc, 'Web3 Specifications', data.sections.web3Section);
      }

      // Appendix
      if (data.sections.appendix) {
        addSection(doc, 'Appendix', data.sections.appendix);
      }

      // Footer page numbers
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(10).text(`Page ${i + 1} of ${pageCount}`, {
          align: 'center',
          y: doc.page.height - 30,
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function addSection(doc: PDFKit.PDFDocument, title: string, content: string): void {
  doc.addPage();
  doc.fontSize(18).font('Helvetica-Bold').text(title, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica').text(content, {
    align: 'left',
    lineGap: 5,
  });
  doc.moveDown(1);
}
