import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface BrandGuideData {
  businessName: string;
  tagline?: string;
  logo?: {
    url: string;
    colors: string[];
  };
  mockups?: {
    letterhead?: string; // base64 data URL
    businesscard?: string;
    tshirt?: string;
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

/**
 * Convert a base64 data URL to a Buffer
 */
function dataUrlToBuffer(dataUrl: string): Buffer | null {
  try {
    const base64 = dataUrl.split(',')[1];
    if (!base64) return null;
    return Buffer.from(base64, 'base64');
  } catch {
    return null;
  }
}

/**
 * Draw a color swatch in the PDF
 */
function drawColorSwatch(doc: PDFKit.PDFDocument, color: string, x: number, y: number): void {
  // Remove # if present and validate hex
  const hex = color.replace('#', '');
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return;
  
  // Draw color box
  doc.save();
  doc.fillColor(`#${hex}`);
  doc.rect(x, y, 40, 30).fill();
  doc.restore();
  
  // Draw border
  doc.strokeColor('#cccccc');
  doc.lineWidth(0.5);
  doc.rect(x, y, 40, 30).stroke();
  
  // Draw color code
  doc.fillColor('#333333');
  doc.fontSize(8);
  doc.text(`#${hex.toUpperCase()}`, x, y + 35);
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

      // Get brand colors for design
      const primaryColor = data.logo?.colors?.[0] || '#2563eb';
      
      // Cover Page with professional design
      // Background accent bar at top
      doc.save();
      doc.fillColor(primaryColor);
      doc.rect(0, 0, doc.page.width, 120).fill();
      doc.restore();
      
      // Brand name on colored background
      doc.fillColor('#ffffff');
      doc.fontSize(42).font('Helvetica-Bold').text(data.businessName, 50, 45, { align: 'center', width: doc.page.width - 100 });
      
      if (data.tagline) {
        doc.fontSize(16).font('Helvetica').text(data.tagline, 50, 90, { align: 'center', width: doc.page.width - 100 });
      }
      
      // Reset color
      doc.fillColor('#000000');
      
      // Spacer
      doc.moveDown(4);
      
      // Add logo if provided - centered below header
      if (data.logo?.url) {
        try {
          const logoBuffer = dataUrlToBuffer(data.logo.url);
          if (logoBuffer) {
            // Center the logo, larger display
            const pageWidth = doc.page.width - 100;
            const logoY = doc.y;
            doc.image(logoBuffer, 50 + (pageWidth - 250) / 2, logoY, { 
              fit: [250, 200],
              align: 'center'
            });
            doc.moveDown(12);
          }
        } catch (e) {
          console.warn('Could not embed logo:', e);
          doc.moveDown(8);
        }
      } else {
        doc.moveDown(8);
      }

      // Document title
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#333333').text('Brand Guidelines', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica').fillColor('#666666').text('Complete brand identity standards and usage guidelines', { align: 'center' });
      doc.moveDown(2);

      // Metadata in a nice box
      doc.save();
      doc.fillColor('#f5f5f5');
      doc.roundedRect(doc.page.width / 2 - 150, doc.y, 300, 60, 5, 5).fill();
      doc.restore();
      
      doc.fontSize(11).font('Helvetica').fillColor('#333333');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 0, doc.y + 15, { align: 'center' });
      if (data.authorEmail) {
        doc.fontSize(10).fillColor('#666666').text(`Prepared for: ${data.authorEmail}`, { align: 'center' });
      }

      // Add page break
      doc.addPage();

      // Table of Contents with styled header
      doc.save();
      doc.fillColor(primaryColor);
      doc.rect(0, 0, doc.page.width, 80).fill();
      doc.restore();
      
      doc.fillColor('#ffffff');
      doc.fontSize(28).font('Helvetica-Bold').text('Table of Contents', 50, 25);
      doc.fillColor('#000000');
      doc.moveDown(3);
      
      doc.fontSize(12);
      const sections = [
        'Project Overview',
        'Brand Identity & Voice',
        'Logo Philosophy',
        'Logo Mockups',
        'Color Palette',
        'Color Accessibility',
        'Typography Guide',
        'Imagery & Photography Style',
        'Graphic Elements',
        'Brand Voice & Tone',
        'Visual Style Guide',
        'Usage Rules & Don\'ts',
        data.sections.web3Section ? 'Web3 Specifications' : null,
        'Appendix & Resources',
      ].filter(Boolean);

      sections.forEach((section, i) => {
        // Draw section number in colored circle
        const circleX = 70;
        const circleY = doc.y + 3;
        
        doc.save();
        doc.fillColor(primaryColor);
        doc.circle(circleX, circleY, 12).fill();
        doc.restore();
        
        doc.fillColor('#ffffff');
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(String(i + 1), circleX - 3, circleY - 4);
        
        doc.fillColor('#333333');
        doc.fontSize(12).font('Helvetica');
        doc.text(section, 100, doc.y - 12);
        doc.moveDown(0.8);
      });

      // Project Overview Section
      if (data.sections.projectOverview) {
        doc.addPage();
        addSection(doc, 'Project Overview', data.sections.projectOverview, primaryColor);
      }

      // Brand Identity Section
      if (data.sections.brandIdentity) {
        doc.addPage();
        addSection(doc, 'Brand Identity & Voice', data.sections.brandIdentity, primaryColor);
      }

      // Logo Philosophy Section
      if (data.sections.logoPhilosophy) {
        doc.addPage();
        addSection(doc, 'Logo Philosophy', data.sections.logoPhilosophy, primaryColor);
      }

      // Logo Mockups Section
      if (data.mockups && (data.mockups.letterhead || data.mockups.businesscard || data.mockups.tshirt)) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').text('Logo Mockups', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(
          'See how your logo looks in real-world applications across different mediums.',
          { align: 'left' }
        );
        doc.moveDown(1);

        const mockupLabels: Record<string, string> = {
          letterhead: 'Letterhead',
          businesscard: 'Business Card',
          tshirt: 'T-Shirt'
        };

        const mockupOrder: (keyof typeof mockupLabels)[] = ['businesscard', 'letterhead', 'tshirt'];

        for (const key of mockupOrder) {
          const mockupUrl = data.mockups[key];
          if (mockupUrl) {
            const buffer = dataUrlToBuffer(mockupUrl);
            if (buffer) {
              // Check remaining space on page
              if (doc.y > 650) {
                doc.addPage();
              }
              
              doc.fontSize(14).font('Helvetica-Bold').text(mockupLabels[key]);
              doc.moveDown(0.3);
              
              // Embed image - fit to page width with margins
              const pageWidth = doc.page.width - 100;
              const imageHeight = key === 'tshirt' ? 250 : 180;
              
              doc.image(buffer, 50, doc.y, { 
                fit: [pageWidth, imageHeight],
                align: 'center'
              });
              
              doc.moveDown(imageHeight / 12 + 1);
            }
          }
        }
      }

      // Color Palette Section
      if (data.sections.colorPalette) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').text('Color Palette', { underline: true });
        doc.moveDown(0.5);

        // Primary Colors
        if (data.sections.colorPalette.primary?.length) {
          doc.fontSize(14).font('Helvetica-Bold').text('Primary Colors');
          doc.moveDown(0.3);
          
          let x = 50;
          data.sections.colorPalette.primary.forEach((color) => {
            drawColorSwatch(doc, color, x, doc.y);
            x += 60;
          });
          doc.moveDown(3);
        }

        // Secondary Colors
        if (data.sections.colorPalette.secondary?.length) {
          doc.fontSize(14).font('Helvetica-Bold').text('Secondary Colors');
          doc.moveDown(0.3);
          
          let x = 50;
          data.sections.colorPalette.secondary.forEach((color) => {
            drawColorSwatch(doc, color, x, doc.y);
            x += 60;
          });
          doc.moveDown(3);
        }

        // Accent Colors
        if (data.sections.colorPalette.accent?.length) {
          doc.fontSize(14).font('Helvetica-Bold').text('Accent Colors');
          doc.moveDown(0.3);
          
          let x = 50;
          data.sections.colorPalette.accent.forEach((color) => {
            drawColorSwatch(doc, color, x, doc.y);
            x += 60;
          });
          doc.moveDown(1);
        }
      }

      // Color Accessibility Section
      if (data.sections.colorAccessibility) {
        doc.addPage();
        addSection(doc, 'Color Accessibility', data.sections.colorAccessibility, primaryColor);
      }

      // Typography Section
      if (data.sections.typography) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').text('Typography Guide', { underline: true });
        doc.moveDown(0.5);
        
        if (data.sections.typography.headings) {
          doc.fontSize(14).font('Helvetica-Bold').text('Headings');
          doc.fontSize(11).font('Helvetica').text(data.sections.typography.headings);
          doc.moveDown(0.5);
        }
        
        if (data.sections.typography.body) {
          doc.fontSize(14).font('Helvetica-Bold').text('Body Text');
          doc.fontSize(11).font('Helvetica').text(data.sections.typography.body);
          doc.moveDown(0.5);
        }
        
        if (data.sections.typography.usage) {
          doc.fontSize(14).font('Helvetica-Bold').text('Usage Guidelines');
          doc.fontSize(11).font('Helvetica').text(data.sections.typography.usage);
        }
      }

      // Imagery Style Section
      if (data.sections.imageryStyle) {
        doc.addPage();
        addSection(doc, 'Imagery & Photography Style', data.sections.imageryStyle, primaryColor);
      }

      // Graphic Elements Section
      if (data.sections.graphicElements) {
        doc.addPage();
        addSection(doc, 'Graphic Elements', data.sections.graphicElements, primaryColor);
      }

      // Brand Voice Section
      if (data.sections.brandVoice) {
        doc.addPage();
        addSection(doc, 'Brand Voice & Tone', data.sections.brandVoice, primaryColor);
      }

      // Visual Style Guide Section
      if (data.sections.visualStyleGuide) {
        doc.addPage();
        addSection(doc, 'Visual Style Guide', data.sections.visualStyleGuide, primaryColor);
      }

      // Usage Rules Section
      if (data.sections.usageRulesAndDonts) {
        doc.addPage();
        addSection(doc, 'Usage Rules & Don\'ts', data.sections.usageRulesAndDonts, primaryColor);
      }

      // Web3 Section (if applicable)
      if (data.sections.web3Section) {
        doc.addPage();
        addSection(doc, 'Web3 Specifications', data.sections.web3Section, primaryColor);
      }

      // Appendix
      if (data.sections.appendix) {
        doc.addPage();
        addSection(doc, 'Appendix & Resources', data.sections.appendix, primaryColor);
      }

      // Footer page numbers
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(10).fillColor('#999999').text(`Page ${i + 1} of ${pageCount}`, {
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

function addSection(doc: PDFKit.PDFDocument, title: string, content: string | undefined, accentColor: string): void {
  if (!content) return;
  // Section header with colored accent
  doc.save();
  doc.fillColor(accentColor);
  doc.rect(0, 0, doc.page.width, 60).fill();
  doc.restore();
  
  doc.fillColor('#ffffff');
  doc.fontSize(22).font('Helvetica-Bold').text(title, 50, 20);
  doc.fillColor('#000000');
  doc.moveDown(3);
  
  // Content with better formatting
  doc.fontSize(11).font('Helvetica').text(content, {
    align: 'left',
    lineGap: 6,
    paragraphGap: 10,
  });
  doc.moveDown(1);
}
