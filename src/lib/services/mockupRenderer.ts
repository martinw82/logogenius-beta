'use client';

/**
 * Logo Mockup Renderer Service
 * Handles overlaying logos onto mockup templates (letterhead, t-shirt, business card)
 * Converts SVG templates with logo overlays to Canvas or image data
 */

export type MockupTemplate = 'letterhead' | 'tshirt' | 'businesscard';

interface LogoPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MockupConfig {
  template: MockupTemplate;
  logoSvgData: string; // SVG data URI or SVG string
  logoWidth?: number;
  logoHeight?: number;
}

/**
 * Position configurations for each template type
 * Defines where and how large the logo should be on each mockup
 */
const MOCKUP_POSITIONS: Record<MockupTemplate, LogoPosition> = {
  letterhead: {
    x: 50,
    y: 150,
    width: 100,
    height: 100,
  },
  tshirt: {
    x: 125,
    y: 180,
    width: 150,
    height: 150,
  },
  businesscard: {
    x: 75,
    y: 80,
    width: 150,
    height: 150,
  },
};

/**
 * Get the SVG template path for a given template type
 */
export function getTemplateUrl(template: MockupTemplate): string {
  const templateMap: Record<MockupTemplate, string> = {
    letterhead: '/mockups/letterhead-template.svg',
    tshirt: '/mockups/tshirt-template.svg',
    businesscard: '/mockups/businesscard-template.svg',
  };
  return templateMap[template];
}

/**
 * Convert SVG data URI or SVG string to an image element
 * Used for overlaying logos onto mockups
 */
export function createImageFromSvg(svgData: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Handle both SVG strings and data URIs
    if (svgData.startsWith('data:')) {
      img.src = svgData;
    } else if (svgData.startsWith('<svg')) {
      // Convert SVG string to data URI
      const encoded = encodeURIComponent(svgData);
      img.src = `data:image/svg+xml,${encoded}`;
    } else {
      reject(new Error('Invalid SVG format'));
      return;
    }

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load SVG image'));
  });
}

/**
 * Render a logo mockup to canvas
 * @param canvasElement - Canvas element to render to
 * @param config - Mockup configuration with template and logo
 */
export async function renderMockupToCanvas(
  canvasElement: HTMLCanvasElement,
  config: MockupConfig
): Promise<void> {
  const ctx = canvasElement.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Load template SVG
  const templateUrl = getTemplateUrl(config.template);
  const templateResponse = await fetch(templateUrl);
  const templateSvg = await templateResponse.text();

  // Create temporary SVG image for rendering
  const templateImg = await createImageFromSvg(templateSvg);

  // Adjust canvas size based on template
  const templateViewBox = getTemplateViewBox(config.template);
  const scale = 2; // 2x scale for better quality
  canvasElement.width = templateViewBox.width * scale;
  canvasElement.height = templateViewBox.height * scale;

  // Draw template
  ctx.scale(scale, scale);
  ctx.drawImage(
    templateImg,
    0,
    0,
    templateViewBox.width,
    templateViewBox.height
  );

  // Load and draw logo
  const logoImg = await createImageFromSvg(config.logoSvgData);
  const position = MOCKUP_POSITIONS[config.template];

  ctx.drawImage(
    logoImg,
    position.x,
    position.y,
    position.width,
    position.height
  );
}

/**
 * Render mockup and export as data URL (PNG)
 */
export async function renderMockupToDataUrl(
  config: MockupConfig
): Promise<string> {
  const canvas = document.createElement('canvas');
  await renderMockupToCanvas(canvas, config);
  return canvas.toDataURL('image/png');
}

/**
 * Get template viewBox dimensions
 */
function getTemplateViewBox(template: MockupTemplate): { width: number; height: number } {
  const viewBoxMap: Record<MockupTemplate, { width: number; height: number }> = {
    letterhead: { width: 800, height: 1100 },
    tshirt: { width: 400, height: 500 },
    businesscard: { width: 800, height: 400 },
  };
  return viewBoxMap[template];
}

/**
 * Create an SVG overlay of logo on template
 * More direct approach than canvas - returns SVG string
 */
export async function createMockupSvgOverlay(
  config: MockupConfig
): Promise<string> {
  const templateUrl = getTemplateUrl(config.template);
  const templateResponse = await fetch(templateUrl);
  const templateSvg = await templateResponse.text();

  // Parse the template SVG to inject the logo
  const parser = new DOMParser();
  const templateDoc = parser.parseFromString(templateSvg, 'image/svg+xml');

  // Remove the placeholder rect and text in logo-container
  const logoContainer = templateDoc.getElementById('logo-container');
  if (logoContainer) {
    // Clear existing placeholder content
    while (logoContainer.firstChild) {
      logoContainer.removeChild(logoContainer.firstChild);
    }

    // Create an image element with the logo
    const position = MOCKUP_POSITIONS[config.template];
    const ns = 'http://www.w3.org/2000/svg';
    const imageElement = document.createElementNS(ns, 'image');

    imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      config.logoSvgData.startsWith('data:') ? config.logoSvgData :
      `data:image/svg+xml,${encodeURIComponent(config.logoSvgData)}`
    );
    imageElement.setAttribute('x', String(position.x));
    imageElement.setAttribute('y', String(position.y));
    imageElement.setAttribute('width', String(position.width));
    imageElement.setAttribute('height', String(position.height));
    imageElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    logoContainer.appendChild(imageElement);
  }

  // Convert back to string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(templateDoc);
}

/**
 * Batch render all mockups for a logo
 * Returns array of data URLs for all templates
 */
export async function renderAllMockups(logoSvgData: string): Promise<{
  letterhead: string;
  tshirt: string;
  businesscard: string;
}> {
  const templates: MockupTemplate[] = ['letterhead', 'tshirt', 'businesscard'];

  const results = await Promise.all(
    templates.map(template =>
      renderMockupToDataUrl({
        template,
        logoSvgData,
      })
    )
  );

  return {
    letterhead: results[0],
    tshirt: results[1],
    businesscard: results[2],
  };
}
