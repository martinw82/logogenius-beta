import fetch from 'node-fetch';

export interface CanvaGeneratorInput {
  businessName: string;
  brandColors: Array<{
    name: string;
    hex: string;
    rgb: { r: number; g: number; b: number };
  }>;
  logoUrl: string;
}

export interface CanvaDesign {
  designId: string;
  designUrl: string;
  editUrl: string;
}

export interface CanvaTemplates {
  socialMedia: CanvaDesign[];
  printMaterials: CanvaDesign[];
  presentations: CanvaDesign[];
}

export async function generateCanvaTemplates(input: CanvaGeneratorInput): Promise<CanvaTemplates> {
  const canvaApiKey = process.env.CANVA_API_KEY;
  const canvaTeamId = process.env.CANVA_TEAM_ID;

  if (!canvaApiKey || !canvaTeamId) {
    throw new Error('CANVA_API_KEY or CANVA_TEAM_ID environment variables not set');
  }

  const templates: CanvaTemplates = {
    socialMedia: [],
    printMaterials: [],
    presentations: [],
  };

  // Create brand library with colors
  const brandLibraryId = await createBrandLibrary(input, canvaApiKey, canvaTeamId);

  // Create social media templates
  templates.socialMedia = await createSocialMediaTemplates(
    input,
    canvaApiKey,
    canvaTeamId,
    brandLibraryId
  );

  // Create print templates
  templates.printMaterials = await createPrintTemplates(
    input,
    canvaApiKey,
    canvaTeamId,
    brandLibraryId
  );

  // Create presentation templates
  templates.presentations = await createPresentationTemplates(
    input,
    canvaApiKey,
    canvaTeamId,
    brandLibraryId
  );

  return templates;
}

async function createBrandLibrary(
  input: CanvaGeneratorInput,
  apiKey: string,
  teamId: string
): Promise<string> {
  const response = await fetch('https://api.canva.com/v1/brand-libraries', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      team_id: teamId,
      name: `${input.businessName} Brand Library`,
      description: `Official brand colors and guidelines for ${input.businessName}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Canva API error creating brand library: ${response.statusText}`);
  }

  const result = await response.json() as any;
  return result.id;
}

async function createSocialMediaTemplates(
  input: CanvaGeneratorInput,
  apiKey: string,
  teamId: string,
  brandLibraryId: string
): Promise<CanvaDesign[]> {
  const templates = [
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Twitter Post', width: 1024, height: 576 },
    { name: 'LinkedIn Post', width: 1200, height: 627 },
  ];

  const designs: CanvaDesign[] = [];

  for (const template of templates) {
    const design = await createCanvaDesign(
      {
        name: `${input.businessName} - ${template.name}`,
        width: template.width,
        height: template.height,
        businessName: input.businessName,
      },
      apiKey,
      teamId,
      brandLibraryId
    );
    designs.push(design);
  }

  return designs;
}

async function createPrintTemplates(
  input: CanvaGeneratorInput,
  apiKey: string,
  teamId: string,
  brandLibraryId: string
): Promise<CanvaDesign[]> {
  const templates = [
    { name: 'Business Card', width: 1050, height: 600 },
    { name: 'Letterhead', width: 2550, height: 3300 },
    { name: 'Envelope', width: 2850, height: 1237 },
    { name: 'Postcard', width: 1800, height: 1200 },
  ];

  const designs: CanvaDesign[] = [];

  for (const template of templates) {
    const design = await createCanvaDesign(
      {
        name: `${input.businessName} - ${template.name}`,
        width: template.width,
        height: template.height,
        businessName: input.businessName,
      },
      apiKey,
      teamId,
      brandLibraryId
    );
    designs.push(design);
  }

  return designs;
}

async function createPresentationTemplates(
  input: CanvaGeneratorInput,
  apiKey: string,
  teamId: string,
  brandLibraryId: string
): Promise<CanvaDesign[]> {
  const templates = [
    { name: 'Presentation - Title Slide', width: 1920, height: 1080 },
    { name: 'Presentation - Content Slide', width: 1920, height: 1080 },
    { name: 'Presentation - Section Divider', width: 1920, height: 1080 },
  ];

  const designs: CanvaDesign[] = [];

  for (const template of templates) {
    const design = await createCanvaDesign(
      {
        name: `${input.businessName} - ${template.name}`,
        width: template.width,
        height: template.height,
        businessName: input.businessName,
      },
      apiKey,
      teamId,
      brandLibraryId
    );
    designs.push(design);
  }

  return designs;
}

interface DesignParams {
  name: string;
  width: number;
  height: number;
  businessName: string;
}

async function createCanvaDesign(
  params: DesignParams,
  apiKey: string,
  teamId: string,
  brandLibraryId: string
): Promise<CanvaDesign> {
  const response = await fetch('https://api.canva.com/v1/designs', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      team_id: teamId,
      design_type: 'custom',
      width: params.width,
      height: params.height,
      title: params.name,
      description: `Customizable ${params.name} template for ${params.businessName}`,
      brand_library_id: brandLibraryId,
      elements: [
        {
          type: 'text',
          x: params.width * 0.05,
          y: params.height * 0.1,
          width: params.width * 0.9,
          height: params.height * 0.2,
          content: params.businessName,
          fontSize: Math.min(params.width, params.height) / 10,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Canva API error creating design: ${response.statusText}`);
  }

  const result = await response.json() as any;

  return {
    designId: result.id,
    designUrl: result.url,
    editUrl: result.edit_url,
  };
}
