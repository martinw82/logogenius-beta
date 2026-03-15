import { jsPDF } from 'jspdf';

export interface BrandGuideData {
  businessName: string;
  tagline?: string;
  logo?: {
    url: string;
    colors: string[];
  };
  mockups?: {
    letterhead?: string;
    businesscard?: string;
    tshirt?: string;
  };
  fonts?: {
    headings?: {
      name: string;
      filePath?: string;
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

function dataUrlToBase64(dataUrl: string): string | null {
  try {
    const base64 = dataUrl.split(',')[1];
    if (!base64) return null;
    return base64;
  } catch {
    return null;
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getFontFamily(data: BrandGuideData, fontType: 'headings' | 'body' | 'other'): string {
  const fontName = data.fonts?.[fontType]?.name;
  if (!fontName) {
    return fontType === 'headings' ? 'helvetica' : 'helvetica';
  }
  
  const fontMap: Record<string, string> = {
    'Arial': 'helvetica',
    'Helvetica': 'helvetica',
    'Verdana': 'helvetica',
    'Tahoma': 'helvetica',
    'Trebuchet MS': 'helvetica',
    'Times New Roman': 'times',
    'Georgia': 'times',
    'Garamond': 'times',
    'Courier New': 'courier',
    'Courier': 'courier',
    'Inter': 'helvetica',
    'Roboto': 'helvetica',
    'Open Sans': 'helvetica',
    'Lato': 'helvetica',
    'Montserrat': 'helvetica',
    'Oswald': 'helvetica',
    'Raleway': 'helvetica',
    'Poppins': 'helvetica',
    'Noto Sans': 'helvetica',
    'Playfair Display': 'times',
    'Merriweather': 'times',
    'Source Sans Pro': 'helvetica',
    'Ubuntu': 'helvetica',
  };
  
  return fontMap[fontName] || 'helvetica';
}

function getFontStyle(fontType: 'headings' | 'body' | 'other'): string {
  if (fontType === 'headings') return 'bold';
  return 'normal';
}

export async function generateBrandGuidePDF(data: BrandGuideData): Promise<Buffer> {
  try {
    // Enable filesystem access for Vercel serverless
    const jsPDF = require('jspdf');
    jsPDF.allowFsRead = true;
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 0;

    const primaryColor = data.logo?.colors?.[0] || '#2563eb';
    const primaryRgb = hexToRgb(primaryColor) || { r: 37, g: 99, b: 235 };

    // Cover Page
    // Background accent bar
    pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.rect(0, 0, pageWidth, 40, 'F');

    // Brand name on colored background
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(36);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.businessName, pageWidth / 2, 25, { align: 'center' });

    if (data.tagline) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.tagline, pageWidth / 2, 35, { align: 'center' });
    }

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    // Add logo if provided
    if (data.logo?.url) {
      try {
        const logoBase64 = dataUrlToBase64(data.logo.url);
        if (logoBase64) {
          const logoY = 55;
          pdf.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', pageWidth / 2 - 40, logoY, 80, 60);
          yPos = logoY + 70;
        }
      } catch (e) {
        console.warn('Could not embed logo:', e);
        yPos = 100;
      }
    } else {
      yPos = 100;
    }

    // Document title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(51, 51, 51);
    pdf.text('Brand Guidelines', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(102, 102, 102);
    pdf.text('Complete brand identity standards and usage guidelines', pageWidth / 2, yPos, { align: 'center' });

    yPos += 20;
    // Metadata
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(51, 51, 51);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos + 10, { align: 'center' });
    if (data.authorEmail) {
      pdf.setTextColor(102, 102, 102);
      pdf.text(`Prepared for: ${data.authorEmail}`, pageWidth / 2, yPos + 18, { align: 'center' });
    }

    // Add new page for content
    pdf.addPage();
    yPos = margin;

    // Table of Contents header
    pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Table of Contents', margin, 17);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    yPos = 40;

    const sections = [
      { num: 1, title: 'Project Overview', page: 2 },
      { num: 2, title: 'Brand Identity & Voice', page: 2 },
      { num: 3, title: 'Logo Philosophy', page: 2 },
      { num: 4, title: 'Logo Mockups', page: 2 },
      { num: 5, title: 'Color Palette', page: 3 },
      { num: 6, title: 'Color Accessibility', page: 3 },
      { num: 7, title: 'Typography Guide', page: 4 },
      { num: 8, title: 'Imagery & Photography Style', page: 4 },
      { num: 9, title: 'Graphic Elements', page: 4 },
      { num: 10, title: 'Brand Voice & Tone', page: 4 },
      { num: 11, title: 'Usage Rules & Don\'ts', page: 5 },
    ];

    sections.forEach((section) => {
      // Draw section number
      pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.circle(margin + 3, yPos - 2, 4, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(section.num), margin + 3, yPos - 1, { align: 'center' });

      pdf.setTextColor(51, 51, 51);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(section.title, margin + 15, yPos);
      yPos += 8;
    });

    // Project Overview Section
    if (data.sections.projectOverview) {
      pdf.addPage();
      yPos = addSectionHeader(pdf, 'Project Overview', primaryRgb, margin);
      yPos = addSectionContent(pdf, data.sections.projectOverview, yPos, margin, contentWidth, data);
    }

    // Brand Identity Section
    if (data.sections.brandIdentity) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = margin;
      }
      yPos = addSectionHeader(pdf, 'Brand Identity & Voice', primaryRgb, margin);
      yPos = addSectionContent(pdf, data.sections.brandIdentity, yPos, margin, contentWidth, data);
    }

    // Logo Philosophy Section
    if (data.sections.logoPhilosophy) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = margin;
      }
      yPos = addSectionHeader(pdf, 'Logo Philosophy', primaryRgb, margin);
      yPos = addSectionContent(pdf, data.sections.logoPhilosophy, yPos, margin, contentWidth, data);
    }

    // Logo Mockups Section
    if (data.mockups && (data.mockups.letterhead || data.mockups.businesscard || data.mockups.tshirt)) {
      pdf.addPage();
      yPos = margin;
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 51, 51);
      pdf.text('Logo Mockups', margin, yPos);
      yPos += 5;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 102, 102);
      pdf.text('See how your logo looks in real-world applications.', margin, yPos);
      yPos += 10;

      const mockupLabels: Record<string, string> = {
        businesscard: 'Business Card',
        letterhead: 'Letterhead',
        tshirt: 'T-Shirt'
      };

      const mockupOrder = ['businesscard', 'letterhead', 'tshirt'];

      for (const key of mockupOrder) {
        const mockupUrl = data.mockups[key as keyof typeof data.mockups];
        if (mockupUrl) {
          const mockupBase64 = dataUrlToBase64(mockupUrl);
          if (mockupBase64) {
            if (yPos > pageHeight - 80) {
              pdf.addPage();
              yPos = margin;
            }

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(51, 51, 51);
            pdf.text(mockupLabels[key], margin, yPos);
            yPos += 3;

            const imgHeight = key === 'tshirt' ? 70 : 50;
            try {
              pdf.addImage(`data:image/png;base64,${mockupBase64}`, 'PNG', margin, yPos, contentWidth, imgHeight);
              yPos += imgHeight + 15;
            } catch (e) {
              console.warn(`Could not embed ${key} mockup:`, e);
              yPos += 10;
            }
          }
        }
      }
    }

    // Color Palette Section
    pdf.addPage();
    yPos = margin;
    pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Color Palette', margin, 14);
    yPos = 35;

    let primaryColors: string[] = [];
    let secondaryColors: string[] = [];
    let accentColors: string[] = [];

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

    if (primaryColors.length === 0 && data.logo?.colors?.length) {
      primaryColors = data.logo.colors.slice(0, 2);
    }

    // Primary Colors
    if (primaryColors.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 51, 51);
      pdf.text('Primary Colors', margin, yPos);
      yPos += 5;
      pdf.setFontSize(9);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Main colors that define your brand identity.', margin, yPos);
      yPos += 8;

      let xPos = margin;
      primaryColors.forEach((color) => {
        const rgb = hexToRgb(color);
        if (rgb) {
          pdf.setFillColor(rgb.r, rgb.g, rgb.b);
          pdf.rect(xPos, yPos, 25, 18, 'F');
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(xPos, yPos, 25, 18, 'S');
          pdf.setTextColor(51, 51, 51);
          pdf.setFontSize(7);
          pdf.text(color.toUpperCase(), xPos, yPos + 24);
          xPos += 32;
        }
      });
      yPos += 35;
    }

    // Secondary Colors
    if (secondaryColors.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 51, 51);
      pdf.text('Secondary Colors', margin, yPos);
      yPos += 5;
      pdf.setFontSize(9);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Supporting colors that complement your primary palette.', margin, yPos);
      yPos += 8;

      let xPos = margin;
      secondaryColors.forEach((color) => {
        const rgb = hexToRgb(color);
        if (rgb) {
          pdf.setFillColor(rgb.r, rgb.g, rgb.b);
          pdf.rect(xPos, yPos, 25, 18, 'F');
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(xPos, yPos, 25, 18, 'S');
          pdf.setTextColor(51, 51, 51);
          pdf.setFontSize(7);
          pdf.text(color.toUpperCase(), xPos, yPos + 24);
          xPos += 32;
        }
      });
      yPos += 35;
    }

    // Accent Colors
    if (accentColors.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 51, 51);
      pdf.text('Accent Colors', margin, yPos);
      yPos += 5;
      pdf.setFontSize(9);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Use these for calls-to-action and highlights.', margin, yPos);
      yPos += 8;

      let xPos = margin;
      accentColors.forEach((color) => {
        const rgb = hexToRgb(color);
        if (rgb) {
          pdf.setFillColor(rgb.r, rgb.g, rgb.b);
          pdf.rect(xPos, yPos, 25, 18, 'F');
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(xPos, yPos, 25, 18, 'S');
          pdf.setTextColor(51, 51, 51);
          pdf.setFontSize(7);
          pdf.text(color.toUpperCase(), xPos, yPos + 24);
          xPos += 32;
        }
      });
      yPos += 35;
    }

    // Color Accessibility Section
    if (data.sections.colorAccessibility) {
      pdf.addPage();
      yPos = addSectionHeader(pdf, 'Color Accessibility', primaryRgb, margin);
      yPos = addSectionContent(pdf, data.sections.colorAccessibility, yPos, margin, contentWidth, data);
    }

    // Typography Section
    if (data.sections.typography || data.fonts) {
      pdf.addPage();
      yPos = margin;
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 51, 51);
      pdf.text('Typography Guide', margin, yPos);
      pdf.line(margin, yPos + 2, margin + contentWidth, yPos + 2);
      yPos += 15;

      // Font specifications
      if (data.fonts) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Font Specifications', margin, yPos);
        yPos += 8;

        if (data.fonts.headings) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Headings:', margin, yPos);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${data.fonts.headings.name} - Primary font for all headings and titles`, margin + 25, yPos);
          yPos += 7;
        }

        if (data.fonts.body) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Body Text:', margin, yPos);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${data.fonts.body.name} - Primary font for paragraphs and body content`, margin + 25, yPos);
          yPos += 7;
        }

        if (data.fonts.other) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Accent/Other:', margin, yPos);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${data.fonts.other.name} - For captions, highlights, or special text`, margin + 25, yPos);
          yPos += 10;
        }
      }

      // Typography content
      if (data.sections.typography) {
        if (data.sections.typography.headings) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Headings Usage', margin, yPos);
          yPos += 6;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          yPos = addWrappedText(pdf, data.sections.typography.headings, margin, yPos, contentWidth, 5);
          yPos += 5;
        }

        if (data.sections.typography.body) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Body Text Usage', margin, yPos);
          yPos += 6;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          yPos = addWrappedText(pdf, data.sections.typography.body, margin, yPos, contentWidth, 5);
          yPos += 5;
        }

        if (data.sections.typography.usage) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Usage Guidelines', margin, yPos);
          yPos += 6;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          yPos = addWrappedText(pdf, data.sections.typography.usage, margin, yPos, contentWidth, 5);
        }
      }
    }

    // Imagery Style Section
    if (data.sections.imageryStyle) {
      pdf.addPage();
      yPos = addSectionHeader(pdf, 'Imagery & Photography Style', primaryRgb, margin);
      yPos = addSectionContent(pdf, data.sections.imageryStyle, yPos, margin, contentWidth, data);
    }

    // Graphic Elements Section
    if (data.sections.graphicElements) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = margin;
      }
      yPos = addSectionHeader(pdf, 'Graphic Elements', primaryRgb, margin);
      yPos = addSectionContent(pdf, data.sections.graphicElements, yPos, margin, contentWidth, data);
    }

    // Brand Voice Section
    if (data.sections.brandVoice) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = margin;
      }
      yPos = addSectionHeader(pdf, 'Brand Voice & Tone', primaryRgb, margin);
      yPos = addSectionContent(pdf, data.sections.brandVoice, yPos, margin, contentWidth, data);
    }

    // Usage Rules Section
    if (data.sections.usageRulesAndDonts) {
      pdf.addPage();
      yPos = addSectionHeader(pdf, 'Usage Rules & Don\'ts', primaryRgb, margin);
      yPos = addSectionContent(pdf, data.sections.usageRulesAndDonts, yPos, margin, contentWidth, data);
    }

    // Return PDF as buffer - use output('arraybuffer') then convert to Buffer
    const pdfArrayBuffer = pdf.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

function addSectionHeader(pdf: jsPDF, title: string, primaryRgb: { r: number; g: number; b: number }, margin: number): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, 14);
  
  pdf.setTextColor(0, 0, 0);
  return 35;
}

function addSectionContent(pdf: jsPDF, content: string, yPos: number, margin: number, contentWidth: number, data: BrandGuideData): number {
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(51, 51, 51);
  
  return addWrappedText(pdf, content, margin, yPos, contentWidth, 6);
}

function addWrappedText(pdf: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = pdf.splitTextToSize(text, maxWidth);
  let currentY = y;
  
  lines.forEach((line: string) => {
    pdf.text(line, x, currentY);
    currentY += lineHeight;
  });
  
  return currentY;
}