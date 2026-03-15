/**
 * Client-Side Mockup Generator Hook
 *
 * Renders mockups using HTML5 Canvas in the browser.
 * Generates business card and letterhead mockups for all logo variants.
 * T-shirt/mug/tote are generated server-side via AI after logo selection.
 */

import { useState, useCallback, useRef } from 'react';

export type MockupTemplate = 'letterhead' | 'businesscard';

interface MockupOptions {
  logoUrl: string;
  businessName: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface LogoVariant {
  variantNum: number;
  svgData: string;
}

interface UseClientMockupGeneratorReturn {
  isGenerating: boolean;
  progress: {
    current: number;
    total: number;
    step: string;
  };
  generateAndUploadMockups: (
    orderId: number,
    logos: LogoVariant[],
    brandData: {
      businessName: string;
      tagline?: string;
      primaryColor?: string;
      secondaryColor?: string;
    }
  ) => Promise<{
    success: boolean;
    mockups?: Record<string, Record<string, string>>;
    error?: string;
  }>;
}

// Template configurations
const TEMPLATE_CONFIGS: Record<MockupTemplate, {
  width: number;
  height: number;
}> = {
  businesscard: { width: 900, height: 500 },
  letterhead: { width: 800, height: 1100 },
};

/**
 * Parse hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 10, g: 25, b: 47 };
}

/**
 * Darken a hex color by a factor (0-1)
 */
function darkenHex(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const dr = Math.round(r * (1 - factor));
  const dg = Math.round(g * (1 - factor));
  const db = Math.round(b * (1 - factor));
  return `rgb(${dr}, ${dg}, ${db})`;
}

/**
 * Check if a color is light (for choosing text color)
 */
function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

/**
 * Draw a rounded rectangle path
 */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Add subtle paper noise texture overlay
 */
function addPaperTexture(ctx: CanvasRenderingContext2D, w: number, h: number, opacity: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 20;
    data[i] = Math.min(255, Math.max(0, data[i] + noise * opacity));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * opacity));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * opacity));
  }
  ctx.putImageData(imageData, 0, 0);
}

export function useClientMockupGenerator(): UseClientMockupGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 2,
    step: '',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }, []);

  /**
   * Draw business card mockup — front and back on light gray background
   */
  const drawBusinessCard = async (
    ctx: CanvasRenderingContext2D,
    options: MockupOptions,
    logoImg: HTMLImageElement | null
  ) => {
    const W = 900;
    const H = 500;
    const primary = options.primaryColor || '#0a192f';
    const secondary = options.secondaryColor || '#f4a261';
    const textOnPrimary = isLightColor(primary) ? '#111111' : '#ffffff';

    // Gray scene background
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(0, 0, W, H);

    // === FRONT CARD (left side) ===
    const cardW = 380;
    const cardH = 220;
    const frontX = 30;
    const frontY = 140;

    // Drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;
    roundedRect(ctx, frontX, frontY, cardW, cardH, 10);
    ctx.fillStyle = primary;
    ctx.fill();
    ctx.restore();

    // Card fill (re-draw without shadow for clean edges)
    roundedRect(ctx, frontX, frontY, cardW, cardH, 10);
    ctx.fillStyle = primary;
    ctx.fill();

    // Accent stripe at bottom
    ctx.save();
    roundedRect(ctx, frontX, frontY, cardW, cardH, 10);
    ctx.clip();
    ctx.fillStyle = secondary;
    ctx.fillRect(frontX, frontY + cardH - 12, cardW, 12);
    ctx.restore();

    // Logo on front card
    if (logoImg) {
      const logoMaxW = 70;
      const logoMaxH = 50;
      const scale = Math.min(logoMaxW / logoImg.width, logoMaxH / logoImg.height);
      const lw = logoImg.width * scale;
      const lh = logoImg.height * scale;
      ctx.drawImage(logoImg, frontX + 24, frontY + 18, lw, lh);
    }

    // Front card text
    ctx.fillStyle = textOnPrimary;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(options.businessName, frontX + 24, frontY + 100);

    if (options.tagline) {
      ctx.font = '13px sans-serif';
      ctx.fillStyle = isLightColor(primary) ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
      ctx.fillText(options.tagline, frontX + 24, frontY + 122);
    }

    // Contact info
    ctx.font = '11px sans-serif';
    ctx.fillStyle = isLightColor(primary) ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)';
    ctx.fillText('hello@' + options.businessName.toLowerCase().replace(/\s+/g, '') + '.com', frontX + 24, frontY + 160);
    ctx.fillText('+1 (555) 123-4567', frontX + 24, frontY + 178);
    ctx.fillText('www.' + options.businessName.toLowerCase().replace(/\s+/g, '') + '.com', frontX + 24, frontY + 196);

    // === BACK CARD (right side) ===
    const backX = 490;
    const backY = 140;

    // Drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 5;
    roundedRect(ctx, backX, backY, cardW, cardH, 10);
    ctx.fillStyle = '#f8f8f8';
    ctx.fill();
    ctx.restore();

    // Back card fill
    roundedRect(ctx, backX, backY, cardW, cardH, 10);
    ctx.fillStyle = '#f8f8f8';
    ctx.fill();

    // Subtle brand pattern on back
    ctx.save();
    roundedRect(ctx, backX, backY, cardW, cardH, 10);
    ctx.clip();

    // Dot pattern using primary color
    const { r, g, b } = hexToRgb(primary);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.06)`;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 12; col++) {
        ctx.beginPath();
        ctx.arc(backX + 25 + col * 30, backY + 25 + row * 28, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Centered logo on back
    if (logoImg) {
      const logoBackW = 100;
      const logoBackH = 70;
      const scale = Math.min(logoBackW / logoImg.width, logoBackH / logoImg.height);
      const lw = logoImg.width * scale;
      const lh = logoImg.height * scale;
      ctx.drawImage(
        logoImg,
        backX + (cardW - lw) / 2,
        backY + (cardH - lh) / 2 - 10,
        lw, lh
      );
    }

    // Brand name centered below logo on back
    ctx.fillStyle = primary;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.businessName, backX + cardW / 2, backY + cardH - 30);
    ctx.textAlign = 'left';

    // Accent stripe top of back card
    ctx.fillStyle = secondary;
    roundedRect(ctx, backX, backY, cardW, cardH, 10);
    ctx.clip();
    ctx.fillRect(backX, backY, cardW, 6);

    ctx.restore();

    // Paper texture overlay
    addPaperTexture(ctx, W, H, 0.3);
  };

  /**
   * Draw letterhead mockup — professional A4 style on desk-like background
   */
  const drawLetterhead = async (
    ctx: CanvasRenderingContext2D,
    options: MockupOptions,
    logoImg: HTMLImageElement | null
  ) => {
    const W = 800;
    const H = 1100;
    const primary = options.primaryColor || '#0a192f';
    const secondary = options.secondaryColor || '#f4a261';

    // Desk-like background
    ctx.fillStyle = '#d4cfc4';
    ctx.fillRect(0, 0, W, H);

    // Paper sheet with shadow
    const paperX = 60;
    const paperY = 40;
    const paperW = 680;
    const paperH = 1020;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(paperX, paperY, paperW, paperH);
    ctx.restore();

    // Re-draw paper clean
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(paperX, paperY, paperW, paperH);

    // === HEADER: Gradient bar ===
    const headerH = 70;
    const headerGrad = ctx.createLinearGradient(paperX, paperY, paperX + paperW, paperY);
    headerGrad.addColorStop(0, primary);
    headerGrad.addColorStop(1, darkenHex(primary, 0.3));
    ctx.fillStyle = headerGrad;
    ctx.fillRect(paperX, paperY, paperW, headerH);

    // Logo in header (left)
    if (logoImg) {
      const logoMaxH = 40;
      const scale = Math.min(60 / logoImg.width, logoMaxH / logoImg.height);
      const lw = logoImg.width * scale;
      const lh = logoImg.height * scale;
      ctx.drawImage(logoImg, paperX + 24, paperY + (headerH - lh) / 2, lw, lh);
    }

    // Company name in header (right-aligned)
    ctx.fillStyle = isLightColor(primary) ? '#111111' : '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(options.businessName, paperX + paperW - 24, paperY + 35);

    if (options.tagline) {
      ctx.font = '11px sans-serif';
      ctx.fillStyle = isLightColor(primary) ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
      ctx.fillText(options.tagline, paperX + paperW - 24, paperY + 52);
    }
    ctx.textAlign = 'left';

    // === LETTER CONTENT ===
    const contentX = paperX + 50;
    const contentStartY = paperY + headerH + 60;

    // Date
    ctx.fillStyle = '#666666';
    ctx.font = '12px sans-serif';
    const today = new Date();
    ctx.fillText(today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), contentX, contentStartY);

    // Recipient block
    let y = contentStartY + 40;
    ctx.fillStyle = '#333333';
    ctx.font = '13px sans-serif';
    const recipientLines = [
      'John Anderson',
      'Creative Director',
      '123 Innovation Drive',
      'San Francisco, CA 94102',
    ];
    for (const line of recipientLines) {
      ctx.fillText(line, contentX, y);
      y += 20;
    }

    // Salutation
    y += 20;
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#222222';
    ctx.fillText('Dear Mr. Anderson,', contentX, y);

    // Body paragraphs (simulated gray lines with some real text)
    y += 30;
    ctx.fillStyle = '#444444';
    ctx.font = '12px sans-serif';
    const bodyLines = [
      'Thank you for your continued partnership and support. We are thrilled to share our',
      'latest brand developments and look forward to collaborating on upcoming projects.',
      '',
      'Our team has been working diligently to refine and elevate the brand experience',
      'across all touchpoints. The enclosed materials reflect our commitment to excellence',
      'and innovation in everything we do.',
      '',
      'We believe this partnership will continue to yield exceptional results for both of',
      'our organizations. Please do not hesitate to reach out with any questions.',
    ];
    for (const line of bodyLines) {
      if (line === '') {
        y += 10;
      } else {
        ctx.fillText(line, contentX, y);
        y += 20;
      }
    }

    // Closing
    y += 30;
    ctx.fillText('Warm regards,', contentX, y);
    y += 40;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = primary;
    ctx.fillText(options.businessName, contentX, y);
    y += 18;
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText('Brand & Identity Team', contentX, y);

    // === FAINT WATERMARK LOGO (center of page) ===
    if (logoImg) {
      ctx.save();
      ctx.globalAlpha = 0.04;
      const wmSize = 200;
      const scale = Math.min(wmSize / logoImg.width, wmSize / logoImg.height);
      const wmW = logoImg.width * scale;
      const wmH = logoImg.height * scale;
      ctx.drawImage(
        logoImg,
        paperX + (paperW - wmW) / 2,
        paperY + (paperH - wmH) / 2,
        wmW, wmH
      );
      ctx.restore();
    }

    // === FOOTER ===
    const footerY = paperY + paperH - 40;

    // Accent line
    ctx.fillStyle = secondary;
    ctx.fillRect(contentX, footerY, paperW - 100, 2);

    // Footer text
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#999999';
    const domain = options.businessName.toLowerCase().replace(/\s+/g, '');
    ctx.fillText(
      `${options.businessName}  |  hello@${domain}.com  |  www.${domain}.com  |  +1 (555) 123-4567`,
      contentX, footerY + 16
    );

    // Paper texture
    addPaperTexture(ctx, W, H, 0.2);
  };

  /**
   * Render a single mockup to canvas
   */
  const renderMockup = useCallback(async (
    template: MockupTemplate,
    options: MockupOptions
  ): Promise<string> => {
    const config = TEMPLATE_CONFIGS[template];

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    canvas.width = config.width;
    canvas.height = config.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.clearRect(0, 0, config.width, config.height);

    // Load logo
    let logoImg: HTMLImageElement | null = null;
    try {
      logoImg = await loadImage(options.logoUrl);
    } catch (error) {
      console.warn(`[Mockup] Could not load logo for ${template}:`, error);
    }

    // Draw template
    switch (template) {
      case 'businesscard':
        await drawBusinessCard(ctx, options, logoImg);
        break;
      case 'letterhead':
        await drawLetterhead(ctx, options, logoImg);
        break;
    }

    return canvas.toDataURL('image/png', 0.9);
  }, [loadImage]);

  /**
   * Generate all mockups for all variants and upload to server
   */
  const generateAndUploadMockups = useCallback(async (
    orderId: number,
    logos: LogoVariant[],
    brandData: {
      businessName: string;
      tagline?: string;
      primaryColor?: string;
      secondaryColor?: string;
    }
  ): Promise<{
    success: boolean;
    mockups?: Record<string, Record<string, string>>;
    error?: string;
  }> => {
    setIsGenerating(true);
    const templates: MockupTemplate[] = ['businesscard', 'letterhead'];
    const allMockups: Record<string, Record<string, string>> = {};

    try {
      for (let v = 0; v < logos.length; v++) {
        const logo = logos[v];
        const variantNum = logo.variantNum;
        const mockups: Record<string, string> = {};

        const options: MockupOptions = {
          logoUrl: logo.svgData,
          businessName: brandData.businessName,
          tagline: brandData.tagline,
          primaryColor: brandData.primaryColor,
          secondaryColor: brandData.secondaryColor,
        };

        for (let i = 0; i < templates.length; i++) {
          const template = templates[i];
          setProgress({
            current: v * templates.length + i + 1,
            total: logos.length * templates.length,
            step: `Generating ${template} for Variant ${variantNum}...`,
          });

          const imageData = await renderMockup(template, options);
          mockups[template] = imageData;
        }

        setProgress({
          current: v * templates.length + templates.length,
          total: logos.length * templates.length,
          step: `Uploading Variant ${variantNum}...`,
        });

        const response = await fetch(`/api/orders/${orderId}/upload-mockups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
          body: JSON.stringify({
            mockups,
            variantNum: variantNum,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to upload mockups for variant ${variantNum}`);
        }

        allMockups[`variant${variantNum}`] = mockups;
      }

      setProgress({
        current: logos.length * templates.length,
        total: logos.length * templates.length,
        step: 'Complete!',
      });

      return {
        success: true,
        mockups: allMockups,
      };

    } catch (error) {
      console.error('[Mockup Generator] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      setIsGenerating(false);
    }
  }, [renderMockup]);

  return {
    isGenerating,
    progress,
    generateAndUploadMockups,
  };
}
