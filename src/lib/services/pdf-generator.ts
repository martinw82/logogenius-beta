import jsPDF from 'jspdf';

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
    coffeeMug?: string;
    toteBag?: string;
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

// ─── Utility Helpers ────────────────────────────────────────────────

function dataUrlToBase64(dataUrl: string): string | null {
  try {
    const base64 = dataUrl.split(',')[1];
    return base64 || null;
  } catch {
    return null;
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rr - k) / (1 - k)) * 100),
    m: Math.round(((1 - gg - k) / (1 - k)) * 100),
    y: Math.round(((1 - bb - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function darkenColor(rgb: { r: number; g: number; b: number }, amount: number) {
  return {
    r: Math.max(0, Math.round(rgb.r * (1 - amount))),
    g: Math.max(0, Math.round(rgb.g * (1 - amount))),
    b: Math.max(0, Math.round(rgb.b * (1 - amount))),
  };
}

function lightenColor(rgb: { r: number; g: number; b: number }, amount: number) {
  return {
    r: Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount)),
    g: Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount)),
    b: Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount)),
  };
}

// Determine if a color is light or dark for text contrast
function isLightColor(r: number, g: number, b: number): boolean {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// ─── PDF Generation ─────────────────────────────────────────────────

export async function generateBrandGuidePDF(data: BrandGuideData): Promise<Buffer> {
  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const PW = pdf.internal.pageSize.getWidth(); // 210
    const PH = pdf.internal.pageSize.getHeight(); // 297
    const M = 20; // margin
    const CW = PW - M * 2; // content width

    const primaryHex = data.logo?.colors?.[0] || '#2563eb';
    const P = hexToRgb(primaryHex) || { r: 37, g: 99, b: 235 };
    const Pdark = darkenColor(P, 0.3);
    const Plight = lightenColor(P, 0.85);

    let pageNum = 0;

    // ─── Page footer helper ──────────────────────────────────
    function addFooter() {
      pageNum++;
      // Thin accent line
      pdf.setDrawColor(P.r, P.g, P.b);
      pdf.setLineWidth(0.5);
      pdf.line(M, PH - 12, PW - M, PH - 12);
      // Page number
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text(`${data.businessName} Brand Guidelines`, M, PH - 7);
      pdf.text(`${pageNum}`, PW - M, PH - 7, { align: 'right' });
    }

    // ─── New page helper ─────────────────────────────────────
    function newPage(): number {
      pdf.addPage();
      addFooter();
      return M;
    }

    // ─── Section header helper ───────────────────────────────
    function sectionHeader(title: string, subtitle: string, y: number): number {
      // Accent bar
      pdf.setFillColor(P.r, P.g, P.b);
      pdf.rect(M, y, 4, 12, 'F');
      // Title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(33, 33, 33);
      pdf.text(title, M + 10, y + 9);
      y += 14;
      // Subtitle
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(120, 120, 120);
      pdf.text(subtitle, M + 10, y);
      y += 10;
      // Divider
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.3);
      pdf.line(M, y, PW - M, y);
      return y + 6;
    }

    // ─── Wrapped text helper ─────────────────────────────────
    function addBody(text: string, y: number, maxY?: number): number {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const lines: string[] = pdf.splitTextToSize(text, CW);
      const lineH = 5;
      const limit = maxY || PH - 20;

      for (const line of lines) {
        if (y > limit) {
          y = newPage();
        }
        pdf.text(line, M, y);
        y += lineH;
      }
      return y + 2;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PAGE 1: COVER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Full-page brand color background
    pdf.setFillColor(P.r, P.g, P.b);
    pdf.rect(0, 0, PW, PH, 'F');

    // Darker overlay strip at bottom
    pdf.setFillColor(Pdark.r, Pdark.g, Pdark.b);
    pdf.rect(0, PH - 60, PW, 60, 'F');

    // Geometric accent — two angled rectangles
    pdf.setFillColor(255, 255, 255);
    pdf.setGState(new (pdf as any).GState({ opacity: 0.06 }));
    pdf.rect(-20, 40, PW + 40, 120, 'F');
    pdf.rect(-20, 180, PW + 40, 60, 'F');
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));

    // Logo image (centered)
    if (data.logo?.url) {
      try {
        const logoBase64 = dataUrlToBase64(data.logo.url);
        if (logoBase64) {
          pdf.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', PW / 2 - 35, 55, 70, 55);
        }
      } catch (e) {
        console.warn('Could not embed logo on cover:', e);
      }
    }

    // Brand name
    const textColor = isLightColor(P.r, P.g, P.b) ? [33, 33, 33] : [255, 255, 255];
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.setFontSize(36);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.businessName, PW / 2, 140, { align: 'center' });

    // Tagline
    if (data.tagline) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.tagline, PW / 2, 152, { align: 'center' });
    }

    // "Brand Guidelines" label
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Brand Guidelines', PW / 2, 170, { align: 'center' });

    // Decorative line separator
    pdf.setDrawColor(textColor[0], textColor[1], textColor[2]);
    pdf.setLineWidth(0.5);
    pdf.line(PW / 2 - 30, 175, PW / 2 + 30, 175);

    // Metadata at bottom
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const dateStr = (data.createdAt || new Date()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    pdf.text(dateStr, PW / 2, PH - 35, { align: 'center' });
    if (data.authorEmail) {
      pdf.setFontSize(9);
      pdf.text(`Prepared for ${data.authorEmail}`, PW / 2, PH - 28, { align: 'center' });
    }
    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    pdf.text('Confidential — For Internal Use Only', PW / 2, PH - 18, { align: 'center' });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PAGE 2: TABLE OF CONTENTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    let y = newPage();

    // Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(33, 33, 33);
    pdf.text('Contents', M, y + 8);
    y += 16;

    // Accent underline
    pdf.setFillColor(P.r, P.g, P.b);
    pdf.rect(M, y, 40, 2, 'F');
    y += 12;

    const tocItems = [
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
      'Usage Rules & Guidelines',
    ];

    tocItems.forEach((title, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      // Number
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(P.r, P.g, P.b);
      pdf.text(num, M, y);
      // Title
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(title, M + 12, y);
      // Dotted line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineDashPattern([1, 1], 0);
      pdf.line(M + 80, y, PW - M - 10, y);
      pdf.setLineDashPattern([], 0);
      y += 9;
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CONTENT SECTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // 1. Project Overview
    if (data.sections.projectOverview) {
      y = newPage();
      y = sectionHeader('Project Overview', 'Company introduction, mission, and vision', y);
      y = addBody(data.sections.projectOverview, y);
    }

    // 2. Brand Identity
    if (data.sections.brandIdentity) {
      y = newPage();
      y = sectionHeader('Brand Identity & Voice', 'Personality, archetype, and brand attributes', y);
      y = addBody(data.sections.brandIdentity, y);
    }

    // 3. Logo Philosophy
    if (data.sections.logoPhilosophy) {
      y = newPage();
      y = sectionHeader('Logo Philosophy', 'Design thinking and core message', y);
      y = addBody(data.sections.logoPhilosophy, y);

      // Logo display
      if (data.logo?.url) {
        try {
          const logoBase64 = dataUrlToBase64(data.logo.url);
          if (logoBase64 && y < PH - 80) {
            y += 5;
            // Logo on white background box
            pdf.setFillColor(248, 248, 248);
            pdf.setDrawColor(230, 230, 230);
            pdf.roundedRect(M, y, CW, 60, 3, 3, 'FD');
            pdf.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', PW / 2 - 30, y + 5, 60, 50);
            y += 68;
          }
        } catch (e) {
          console.warn('Could not embed logo in philosophy section:', e);
        }
      }

      // Logo guidelines box
      if (y < PH - 60) {
        y += 4;
        pdf.setFillColor(Plight.r, Plight.g, Plight.b);
        pdf.roundedRect(M, y, CW, 40, 3, 3, 'F');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(P.r, P.g, P.b);
        pdf.text('Logo Clear Space', M + 8, y + 10);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text('Always maintain a minimum clear space around the logo equal to the height', M + 8, y + 18);
        pdf.text('of the letter "O" in the brand name. Never crowd the logo with other elements.', M + 8, y + 24);
        pdf.text('Minimum reproduction size: 25mm wide for print, 80px wide for digital.', M + 8, y + 30);
        y += 48;
      }
    }

    // 4. Logo Mockups
    if (data.mockups && (data.mockups.letterhead || data.mockups.businesscard || data.mockups.tshirt)) {
      y = newPage();
      y = sectionHeader('Logo Mockups', 'Real-world applications of your brand', y);

      const mockupEntries: Array<{ key: string; label: string; description: string }> = [
        { key: 'businesscard', label: 'Business Card', description: 'Professional networking and first impressions' },
        { key: 'letterhead', label: 'Letterhead', description: 'Official correspondence and documentation' },
        { key: 'tshirt', label: 'T-Shirt', description: 'Branded merchandise and team apparel' },
      ];

      for (const entry of mockupEntries) {
        const mockupUrl = data.mockups[entry.key as keyof typeof data.mockups];
        if (!mockupUrl) continue;

        const mockupBase64 = dataUrlToBase64(mockupUrl);
        if (!mockupBase64) continue;

        if (y > PH - 90) {
          y = newPage();
        }

        // Label
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(33, 33, 33);
        pdf.text(entry.label, M, y);
        y += 1;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 120, 120);
        pdf.text(entry.description, M, y + 4);
        y += 8;

        // Image with border
        const imgH = entry.key === 'letterhead' ? 65 : entry.key === 'tshirt' ? 60 : 45;
        try {
          pdf.setDrawColor(230, 230, 230);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(M, y, CW, imgH, 2, 2, 'S');
          pdf.addImage(`data:image/png;base64,${mockupBase64}`, 'PNG', M + 2, y + 2, CW - 4, imgH - 4);
          y += imgH + 10;
        } catch (e) {
          console.warn(`Could not embed ${entry.key} mockup:`, e);
          y += 10;
        }
      }
    }

    // 5. Color Palette
    {
      y = newPage();
      y = sectionHeader('Color Palette', 'Brand colors with usage specifications', y);

      let primaryColors: string[] = [];
      let secondaryColors: string[] = [];
      let accentColors: string[] = [];

      if (data.sections.colorPalette) {
        if (Array.isArray(data.sections.colorPalette.primary)) primaryColors = data.sections.colorPalette.primary;
        if (Array.isArray(data.sections.colorPalette.secondary)) secondaryColors = data.sections.colorPalette.secondary;
        if (Array.isArray(data.sections.colorPalette.accent)) accentColors = data.sections.colorPalette.accent;
      }
      if (primaryColors.length === 0 && data.logo?.colors?.length) {
        primaryColors = data.logo.colors.slice(0, 3);
      }

      // Render color group
      function renderColorGroup(title: string, description: string, colors: string[], startY: number): number {
        if (colors.length === 0) return startY;

        if (startY > PH - 80) {
          startY = newPage();
        }

        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(33, 33, 33);
        pdf.text(title, M, startY);
        startY += 5;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 120, 120);
        pdf.text(description, M, startY);
        startY += 8;

        const swatchW = Math.min(38, (CW - (colors.length - 1) * 4) / colors.length);
        const swatchH = 30;
        let xPos = M;

        colors.forEach((color) => {
          const rgb = hexToRgb(color);
          if (!rgb) return;
          const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

          // Swatch
          pdf.setFillColor(rgb.r, rgb.g, rgb.b);
          pdf.roundedRect(xPos, startY, swatchW, swatchH, 2, 2, 'F');

          // Border
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.2);
          pdf.roundedRect(xPos, startY, swatchW, swatchH, 2, 2, 'S');

          // Color info below swatch
          const infoY = startY + swatchH + 4;
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(33, 33, 33);
          pdf.text(color.toUpperCase(), xPos, infoY);

          pdf.setFontSize(6.5);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);
          pdf.text(`R${rgb.r} G${rgb.g} B${rgb.b}`, xPos, infoY + 4);
          pdf.text(`C${cmyk.c} M${cmyk.m} Y${cmyk.y} K${cmyk.k}`, xPos, infoY + 8);

          xPos += swatchW + 4;
        });

        return startY + swatchH + 20;
      }

      y = renderColorGroup('Primary Colors', 'Core colors that define your brand. Use for key elements and dominant visual areas.', primaryColors, y);
      y = renderColorGroup('Secondary Colors', 'Supporting colors that complement your primary palette.', secondaryColors, y);
      y = renderColorGroup('Accent Colors', 'Use sparingly for highlights, calls-to-action, and emphasis.', accentColors, y);

      // Color usage proportions guide
      if (primaryColors.length > 0 && y < PH - 50) {
        y += 4;
        pdf.setFillColor(248, 248, 248);
        pdf.roundedRect(M, y, CW, 30, 3, 3, 'F');

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(33, 33, 33);
        pdf.text('Recommended Usage Proportions', M + 8, y + 10);

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text('Primary: 60%  |  Secondary: 30%  |  Accent: 10%', M + 8, y + 18);
        pdf.text('Use primary colors for backgrounds and major UI elements. Reserve accents for interactive elements.', M + 8, y + 24);
        y += 38;
      }
    }

    // 6. Color Accessibility
    if (data.sections.colorAccessibility) {
      y = newPage();
      y = sectionHeader('Color Accessibility', 'WCAG compliance and contrast guidelines', y);
      y = addBody(data.sections.colorAccessibility, y);
    }

    // 7. Typography
    if (data.sections.typography || data.fonts) {
      y = newPage();
      y = sectionHeader('Typography Guide', 'Font families, hierarchy, and usage rules', y);

      // Font specifications card
      if (data.fonts) {
        pdf.setFillColor(248, 248, 248);
        const cardH = 12 + (data.fonts.headings ? 14 : 0) + (data.fonts.body ? 14 : 0) + (data.fonts.other ? 14 : 0);
        pdf.roundedRect(M, y, CW, cardH, 3, 3, 'F');

        let fy = y + 10;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(P.r, P.g, P.b);
        pdf.text('Selected Fonts', M + 8, fy);
        fy += 8;

        if (data.fonts.headings) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(33, 33, 33);
          pdf.text('Headings:', M + 8, fy);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(80, 80, 80);
          pdf.text(data.fonts.headings.name, M + 35, fy);
          // Show sample
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(33, 33, 33);
          pdf.text('Aa Bb Cc 123', M + 100, fy);
          fy += 14;
        }

        if (data.fonts.body) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(33, 33, 33);
          pdf.text('Body:', M + 8, fy);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(80, 80, 80);
          pdf.text(data.fonts.body.name, M + 35, fy);
          // Show sample
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text('The quick brown fox jumps over the lazy dog', M + 100, fy);
          fy += 14;
        }

        if (data.fonts.other) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(33, 33, 33);
          pdf.text('Accent:', M + 8, fy);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(80, 80, 80);
          pdf.text(data.fonts.other.name, M + 35, fy);
          fy += 14;
        }

        y += cardH + 8;
      }

      // Heading hierarchy demo
      if (y < PH - 60) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(33, 33, 33);
        pdf.text('Type Hierarchy', M, y);
        y += 6;

        const hierarchy = [
          { label: 'H1 — Display', size: 28, weight: 'bold' as const },
          { label: 'H2 — Section Title', size: 20, weight: 'bold' as const },
          { label: 'H3 — Subsection', size: 14, weight: 'bold' as const },
          { label: 'Body — Paragraph text', size: 10, weight: 'normal' as const },
          { label: 'Caption — Small details', size: 8, weight: 'normal' as const },
        ];

        for (const h of hierarchy) {
          pdf.setFontSize(h.size);
          pdf.setFont('helvetica', h.weight);
          pdf.setTextColor(33, 33, 33);
          pdf.text(h.label, M, y + h.size * 0.35);
          y += h.size * 0.5 + 4;
        }
        y += 6;
      }

      // Typography content
      if (data.sections.typography) {
        if (data.sections.typography.headings) {
          y = addBody(data.sections.typography.headings, y);
        }
        if (data.sections.typography.body) {
          y = addBody(data.sections.typography.body, y);
        }
        if (data.sections.typography.usage) {
          y = addBody(data.sections.typography.usage, y);
        }
      }
    }

    // 8. Imagery Style
    if (data.sections.imageryStyle) {
      y = newPage();
      y = sectionHeader('Imagery & Photography Style', 'Visual direction for photography and illustration', y);
      y = addBody(data.sections.imageryStyle, y);
    }

    // 9. Graphic Elements
    if (data.sections.graphicElements) {
      if (y > PH - 60) y = newPage();
      y = sectionHeader('Graphic Elements', 'Icons, patterns, and decorative components', y);
      y = addBody(data.sections.graphicElements, y);
    }

    // 10. Brand Voice
    if (data.sections.brandVoice) {
      y = newPage();
      y = sectionHeader('Brand Voice & Tone', 'Communication style and messaging guidelines', y);
      y = addBody(data.sections.brandVoice, y);
    }

    // 11. Visual Style Guide
    if (data.sections.visualStyleGuide) {
      if (y > PH - 60) y = newPage();
      y = sectionHeader('Visual Style Guide', 'Spacing, grids, shadows, and visual standards', y);
      y = addBody(data.sections.visualStyleGuide, y);
    }

    // 12. Usage Rules
    if (data.sections.usageRulesAndDonts) {
      y = newPage();
      y = sectionHeader('Usage Rules & Guidelines', 'Do\'s, don\'ts, and brand protection', y);
      y = addBody(data.sections.usageRulesAndDonts, y);

      // Do / Don't visual cards
      if (y < PH - 55) {
        y += 4;
        const colW = (CW - 6) / 2;

        // DO card
        pdf.setFillColor(236, 253, 245); // green-50
        pdf.roundedRect(M, y, colW, 40, 3, 3, 'F');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(22, 163, 74); // green-600
        pdf.text('DO', M + 8, y + 10);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text('Use approved brand colors', M + 8, y + 18);
        pdf.text('Maintain minimum clear space', M + 8, y + 24);
        pdf.text('Use on solid backgrounds', M + 8, y + 30);

        // DON'T card
        const dontX = M + colW + 6;
        pdf.setFillColor(254, 242, 242); // red-50
        pdf.roundedRect(dontX, y, colW, 40, 3, 3, 'F');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(220, 38, 38); // red-600
        pdf.text('DON\'T', dontX + 8, y + 10);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text('Stretch or distort the logo', dontX + 8, y + 18);
        pdf.text('Change logo colors arbitrarily', dontX + 8, y + 24);
        pdf.text('Place on busy backgrounds', dontX + 8, y + 30);

        y += 48;
      }
    }

    // 13. Web3 Section
    if (data.sections.web3Section) {
      if (y > PH - 60) y = newPage();
      y = sectionHeader('Web3 & Blockchain', 'Token, governance, and community guidelines', y);
      y = addBody(data.sections.web3Section, y);
    }

    // 14. Appendix
    if (data.sections.appendix) {
      y = newPage();
      y = sectionHeader('Appendix', 'Resources, references, and version history', y);
      y = addBody(data.sections.appendix, y);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BACK COVER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    pdf.addPage();
    // Full brand color background
    pdf.setFillColor(P.r, P.g, P.b);
    pdf.rect(0, 0, PW, PH, 'F');

    // Center text
    const bcTextColor = isLightColor(P.r, P.g, P.b) ? [33, 33, 33] : [255, 255, 255];
    pdf.setTextColor(bcTextColor[0], bcTextColor[1], bcTextColor[2]);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.businessName, PW / 2, PH / 2 - 10, { align: 'center' });

    if (data.tagline) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.tagline, PW / 2, PH / 2 + 5, { align: 'center' });
    }

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Brand Guidelines v1.0  |  ${dateStr}`, PW / 2, PH / 2 + 20, { align: 'center' });

    if (data.authorEmail) {
      pdf.setFontSize(8);
      pdf.text(data.authorEmail, PW / 2, PH / 2 + 28, { align: 'center' });
    }

    // Return as buffer
    const pdfArrayBuffer = pdf.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}
