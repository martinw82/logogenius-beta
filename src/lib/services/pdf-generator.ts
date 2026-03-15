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
  fonts?: {
    headings?: {
      name: string;
      filePath?: string; // Path to uploaded font file
    };
    body?: {
      name: string;
      filePath?: string;
    };
    other?: {
      name: string;
      filePath?: string;
    };
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
 * Get the appropriate font name for a given font type
 */
function getFontName(data: BrandGuideData, fontType: 'headings' | 'body' | 'other'): string {
  const customFontKey = `custom-${fontType}` as const;

  // Check if custom font is registered
  if (data.fonts?.[fontType]?.filePath) {
    // In PDFKit, we can check if font is registered by trying to use it
    return customFontKey;
  }

  // Fallback to system fonts
  switch (fontType) {
    case 'headings':
      return data.fonts?.headings?.name || 'Helvetica-Bold';
    case 'body':
      return data.fonts?.body?.name || 'Helvetica';
    case 'other':
      return data.fonts?.other?.name || 'Helvetica';
    default:
      return 'Helvetica';
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

      // Register custom fonts if provided
      if (data.fonts) {
        const fontDir = process.cwd();

        if (data.fonts.headings?.filePath) {
          try {
            doc.registerFont(`custom-headings`, `${fontDir}${data.fonts.headings.filePath}`);
          } catch (error) {
            console.warn('Failed to register headings font:', error);
          }
        }

        if (data.fonts.body?.filePath) {
          try {
            doc.registerFont(`custom-body`, `${fontDir}${data.fonts.body.filePath}`);
          } catch (error) {
            console.warn('Failed to register body font:', error);
          }
        }

        if (data.fonts.other?.filePath) {
          try {
            doc.registerFont(`custom-other`, `${fontDir}${data.fonts.other.filePath}`);
          } catch (error) {
            console.warn('Failed to register other font:', error);
          }
        }
      }

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
      doc.addPage();
      doc.save();
      doc.fillColor(primaryColor);
      doc.rect(0, 0, doc.page.width, 60).fill();
      doc.restore();
      
      doc.fillColor('#ffffff');
      doc.fontSize(22).font('Helvetica-Bold').text('Color Palette', 50, 20);
      doc.fillColor('#000000');
      doc.moveDown(3);
      
      // Extract colors from various possible sources
      let primaryColors: string[] = [];
      let secondaryColors: string[] = [];
      let accentColors: string[] = [];
      
      // Try to parse from colorPalette object
      if (data.sections.colorPalette) {
        if (Array.isArray(data.sections.colorPalette.primary)) {
          primaryColors = data.sections.colorPalette.primary;
        }
        if (Array.isArray(data.sections.colorPalette.secondary)) {
          secondaryColors = data.sections.colorPalette.secondary;
        }
        if (Array.isArray(data.sections.colorPalette.accent)) {
          accentColors = data.sections.colorPalette.accent;
        }
      }
      
      // Fallback: extract from logo colors
      if (primaryColors.length === 0 && data.logo?.colors?.length) {
        primaryColors = data.logo.colors.slice(0, 2);
      }
      
      // Primary Colors
      if (primaryColors.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Primary Colors', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#666666').text('These are the main colors that define your brand identity.');
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        
        let x = 50;
        let y = doc.y;
        primaryColors.forEach((color, i) => {
          if (x > 450) {
            x = 50;
            y += 60;
          }
          drawColorSwatch(doc, color, x, y);
          x += 60;
        });
        doc.moveDown(4);
      }

      // Secondary Colors
      if (secondaryColors.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Secondary Colors', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#666666').text('Supporting colors that complement your primary palette.');
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        
        let x = 50;
        let y = doc.y;
        secondaryColors.forEach((color, i) => {
          if (x > 450) {
            x = 50;
            y += 60;
          }
          drawColorSwatch(doc, color, x, y);
          x += 60;
        });
        doc.moveDown(4);
      }

      // Accent Colors
      if (accentColors.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Accent Colors', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#666666').text('Use these for calls-to-action and highlights.');
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        
        let x = 50;
        let y = doc.y;
        accentColors.forEach((color, i) => {
          if (x > 450) {
            x = 50;
            y += 60;
          }
          drawColorSwatch(doc, color, x, y);
          x += 60;
        });
        doc.moveDown(2);
      }
      
      // Color usage description if available
      if (typeof data.sections.colorPalette === 'string') {
        doc.moveDown(1);
        doc.fontSize(11).font('Helvetica').text(data.sections.colorPalette, {
          align: 'left',
          lineGap: 5,
        });
      }

      // Color Accessibility Section
      if (data.sections.colorAccessibility) {
        doc.addPage();
        addSection(doc, 'Color Accessibility', data.sections.colorAccessibility, primaryColor);
      }

      // Typography Section
      if (data.sections.typography || data.fonts) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').text('Typography Guide', { underline: true });
        doc.moveDown(0.5);

        // Font specifications
        if (data.fonts) {
          doc.fontSize(14).font('Helvetica-Bold').text('Font Specifications', { underline: true });
          doc.moveDown(0.5);

          if (data.fonts.headings) {
            doc.fontSize(12).font('Helvetica-Bold').text('Headings:');
            doc.fontSize(11).font('Helvetica').text(`${data.fonts.headings.name} - Primary font for all headings and titles`);
            doc.moveDown(0.3);
          }

          if (data.fonts.body) {
            doc.fontSize(12).font('Helvetica-Bold').text('Body Text:');
            doc.fontSize(11).font('Helvetica').text(`${data.fonts.body.name} - Primary font for paragraphs and body content`);
            doc.moveDown(0.3);
          }

          if (data.fonts.other) {
            doc.fontSize(12).font('Helvetica-Bold').text('Accent/Other:');
            doc.fontSize(11).font('Helvetica').text(`${data.fonts.other.name} - For captions, highlights, or special text elements`);
            doc.moveDown(0.5);
          }
        }

        // Typography content
        if (data.sections.typography) {
          if (data.sections.typography.headings) {
            doc.fontSize(14).font('Helvetica-Bold').text('Headings Usage');
            doc.fontSize(11).font('Helvetica').text(data.sections.typography.headings);
            doc.moveDown(0.5);
          }

          if (data.sections.typography.body) {
            doc.fontSize(14).font('Helvetica-Bold').text('Body Text Usage');
            doc.fontSize(11).font('Helvetica').text(data.sections.typography.body);
            doc.moveDown(0.5);
          }

          if (data.sections.typography.usage) {
            doc.fontSize(14).font('Helvetica-Bold').text('Usage Guidelines');
            doc.fontSize(11).font('Helvetica').text(data.sections.typography.usage);
          }
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
