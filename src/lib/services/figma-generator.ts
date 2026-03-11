import fetch from 'node-fetch';

export interface FigmaGeneratorInput {
  businessName: string;
  brandColors: Array<{
    name: string;
    hex: string;
    rgb: { r: number; g: number; b: number };
  }>;
  typography: Array<{
    name: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
  }>;
  logoUrl: string;
}

export interface FigmaFile {
  fileId: string;
  fileUrl: string;
  fileKey: string;
}

export async function generateFigmaTemplates(input: FigmaGeneratorInput): Promise<FigmaFile> {
  const figmaToken = process.env.FIGMA_API_TOKEN;

  if (!figmaToken) {
    throw new Error('FIGMA_API_TOKEN environment variable not set');
  }

  const fileData = buildFigmaFileStructure(input);

  const response = await fetch('https://api.figma.com/v1/files', {
    method: 'POST',
    headers: {
      'X-Figma-Token': figmaToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fileData),
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.statusText}`);
  }

  const result = await response.json() as any;

  return {
    fileId: result.file.id,
    fileUrl: `https://figma.com/file/${result.file.key}`,
    fileKey: result.file.key,
  };
}

interface Vector2 {
  x: number;
  y: number;
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Node {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}

interface Page {
  id: string;
  name: string;
  type: 'CANVAS';
  children: Node[];
}

interface FileStructure {
  name: string;
  pages: Page[];
  styles?: Record<string, unknown>;
}

function buildFigmaFileStructure(input: FigmaGeneratorInput): FileStructure {
  const pages: Page[] = [];

  // Create color styles page
  pages.push(buildColorStylesPage(input.brandColors, input.businessName));

  // Create typography page
  pages.push(buildTypographyPage(input.typography, input.businessName));

  // Create social media templates page
  pages.push(buildSocialMediaPage(input));

  // Create print templates page
  pages.push(buildPrintTemplatesPage(input));

  // Create presentation templates page
  pages.push(buildPresentationPage(input));

  return {
    name: `${input.businessName} Brand System`,
    pages,
  };
}

function buildColorStylesPage(
  colors: FigmaGeneratorInput['brandColors'],
  businessName: string
): Page {
  const children: Node[] = [];
  let yOffset = 0;

  // Title
  children.push({
    id: 'color-title',
    name: 'Color Palette Title',
    type: 'TEXT',
    x: 0,
    y: yOffset,
    width: 500,
    height: 40,
    content: `${businessName} Brand Colors`,
  });

  yOffset += 60;

  // Color swatches
  colors.forEach((color, idx) => {
    const xPos = (idx % 4) * 140;
    const yPos = yOffset + Math.floor(idx / 4) * 120;

    children.push({
      id: `color-swatch-${idx}`,
      name: color.name,
      type: 'RECTANGLE',
      x: xPos,
      y: yPos,
      width: 120,
      height: 100,
      fills: [
        {
          type: 'SOLID',
          color: {
            r: color.rgb.r / 255,
            g: color.rgb.g / 255,
            b: color.rgb.b / 255,
            a: 1,
          },
        },
      ],
    });

    children.push({
      id: `color-label-${idx}`,
      name: `${color.name} Label`,
      type: 'TEXT',
      x: xPos,
      y: yPos + 110,
      width: 120,
      height: 30,
      content: `${color.name}\n${color.hex}`,
    });
  });

  return {
    id: 'colors-page',
    name: 'Colors',
    type: 'CANVAS',
    children,
  };
}

function buildTypographyPage(
  typography: FigmaGeneratorInput['typography'],
  businessName: string
): Page {
  const children: Node[] = [];
  let yOffset = 0;

  // Title
  children.push({
    id: 'typo-title',
    name: 'Typography Title',
    type: 'TEXT',
    x: 0,
    y: yOffset,
    width: 500,
    height: 40,
    content: `${businessName} Typography System`,
  });

  yOffset += 60;

  // Typography samples
  typography.forEach((style, idx) => {
    children.push({
      id: `typo-sample-${idx}`,
      name: style.name,
      type: 'TEXT',
      x: 0,
      y: yOffset,
      width: 600,
      height: 50,
      content: `${style.name} - The quick brown fox jumps over the lazy dog`,
      style: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeightPx: style.lineHeight,
      },
    });

    yOffset += 70;
  });

  return {
    id: 'typography-page',
    name: 'Typography',
    type: 'CANVAS',
    children,
  };
}

function buildSocialMediaPage(input: FigmaGeneratorInput): Page {
  const children: Node[] = [];
  let yOffset = 0;

  const templates = [
    { name: 'Instagram Post (1080×1080)', width: 1080, height: 1080 },
    { name: 'Instagram Story (1080×1920)', width: 1080, height: 1920 },
    { name: 'Twitter Header (1500×500)', width: 1500, height: 500 },
    { name: 'LinkedIn Banner (1200×627)', width: 1200, height: 627 },
  ];

  templates.forEach((template, idx) => {
    const xPos = (idx % 2) * 1200;
    const yPos = yOffset + Math.floor(idx / 2) * 2100;

    children.push({
      id: `social-template-${idx}`,
      name: template.name,
      type: 'FRAME',
      x: xPos,
      y: yPos,
      width: template.width,
      height: template.height,
      children: [
        {
          id: `social-bg-${idx}`,
          name: 'Background',
          type: 'RECTANGLE',
          x: 0,
          y: 0,
          width: template.width,
          height: template.height,
          fills: [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95, a: 1 } }],
        },
        {
          id: `social-title-${idx}`,
          name: 'Title',
          type: 'TEXT',
          x: 40,
          y: 40,
          width: template.width - 80,
          height: 60,
          content: `${input.businessName}`,
        },
      ],
    });
  });

  return {
    id: 'social-page',
    name: 'Social Media Templates',
    type: 'CANVAS',
    children,
  };
}

function buildPrintTemplatesPage(input: FigmaGeneratorInput): Page {
  const children: Node[] = [];
  let yOffset = 0;

  const printTemplates = [
    { name: 'Business Card (3.5×2 in)', width: 1050, height: 600 },
    { name: 'Letterhead (8.5×11 in)', width: 2550, height: 3300 },
    { name: 'Envelope (9.5×4.125 in)', width: 2850, height: 1237 },
  ];

  printTemplates.forEach((template, idx) => {
    const xPos = (idx % 1) * 1200;
    const yPos = yOffset + idx * 1000;

    children.push({
      id: `print-template-${idx}`,
      name: template.name,
      type: 'FRAME',
      x: xPos,
      y: yPos,
      width: template.width,
      height: template.height,
      children: [
        {
          id: `print-bg-${idx}`,
          name: 'Background',
          type: 'RECTANGLE',
          x: 0,
          y: 0,
          width: template.width,
          height: template.height,
          fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
        },
      ],
    });
  });

  return {
    id: 'print-page',
    name: 'Print Templates',
    type: 'CANVAS',
    children,
  };
}

function buildPresentationPage(input: FigmaGeneratorInput): Page {
  const children: Node[] = [];

  // Standard presentation frame (1920×1080)
  children.push({
    id: 'presentation-frame',
    name: 'Title Slide',
    type: 'FRAME',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    children: [
      {
        id: 'presentation-bg',
        name: 'Background',
        type: 'RECTANGLE',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        fills: [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98, a: 1 } }],
      },
      {
        id: 'presentation-title',
        name: 'Title',
        type: 'TEXT',
        x: 100,
        y: 400,
        width: 1720,
        height: 300,
        content: input.businessName,
      },
    ],
  });

  // Content slide
  children.push({
    id: 'presentation-content',
    name: 'Content Slide',
    type: 'FRAME',
    x: 2100,
    y: 0,
    width: 1920,
    height: 1080,
    children: [
      {
        id: 'content-bg',
        name: 'Background',
        type: 'RECTANGLE',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        fills: [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98, a: 1 } }],
      },
    ],
  });

  return {
    id: 'presentation-page',
    name: 'Presentation Templates',
    type: 'CANVAS',
    children,
  };
}
