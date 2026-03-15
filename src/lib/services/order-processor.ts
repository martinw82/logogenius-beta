import { getPrisma } from '../database';
import { generateBrandGuidePDF } from './pdf-generator';
import { generateReadmeContent } from './readme-generator';
import { createBrandAssetZip } from './zip-packager';
import { saveFile, saveTextFile, generateFileName } from './file-manager';
import { generateFigmaTemplates } from './figma-generator';
import { generateCanvaTemplates } from './canva-generator';
import { generateMediaAssets } from './media-assets-generator';

export interface OrderProcessingInput {
  orderId: number;
  businessName: string;
  userApiKey: string;
}

export interface ProcessingResult {
  success: boolean;
  status: string;
  pdfPath?: string;
  zipPath?: string;
  readmePath?: string;
  figmaUrl?: string;
  canvaDesigns?: Record<string, any>;
  mediaAssets?: Record<string, any>;
  error?: string;
}

export async function processOrderAssets(input: OrderProcessingInput): Promise<ProcessingResult> {
  const prisma = getPrisma();

  try {
    // Update status to processing
    await prisma.order.update({
      where: { id: input.orderId },
      data: { status: 'processing' },
    });

    // Fetch order data
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: { details: true },
    });

    if (!order) {
      throw new Error(`Order ${input.orderId} not found`);
    }

    // Extract data from OrderDetail records
    const orderData = extractOrderData(order.details);

    // Get mockups for PDF
    const mockupData: Record<string, string> = {};
    const mockupDetails = order.details.filter(d => 
      d.fieldName === 'mockup_letterhead' || 
      d.fieldName === 'mockup_businesscard' || 
      d.fieldName === 'mockup_tshirt'
    );
    for (const detail of mockupDetails) {
      const key = detail.fieldName.replace('mockup_', '');
      mockupData[key] = detail.fieldValue;
    }

    // Get the SELECTED logo for PDF cover (or default to variant 1)
    // Check if order has a selected logo
    const orderRecord = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: { selectedLogoId: true },
    });
    
    const selectedVariantNum = orderRecord?.selectedLogoId || 1;
    
    const logoVariant = await prisma.logoVariant.findFirst({
      where: { orderId: input.orderId, variantNum: selectedVariantNum },
    });

    // Generate PDF
    console.log(`[${input.orderId}] Generating PDF with logo variant ${selectedVariantNum}...`);
    console.log(`[${input.orderId}] Logo data present: ${!!logoVariant?.svgData}`);
    console.log(`[${input.orderId}] Mockups present:`, Object.keys(mockupData).filter(k => !!mockupData[k]));
    
    let pdfBuffer;
    try {
      pdfBuffer = await generateBrandGuidePDF({
      businessName: input.businessName,
      tagline: orderData.tagline,
      logo: logoVariant?.svgData ? {
        url: logoVariant.svgData,
        colors: orderData.colorPalette?.primary || []
      } : undefined,
      mockups: {
        letterhead: mockupData['letterhead'],
        businesscard: mockupData['businesscard'],
        tshirt: mockupData['tshirt'],
      },
      sections: {
        projectOverview: orderData.projectOverview,
        brandIdentity: orderData.brandIdentity,
        logoPhilosophy: orderData.logoPhilosophy,
        colorPalette: orderData.colorPalette,
        colorAccessibility: orderData.colorAccessibility,
        typography: orderData.typography,
        imageryStyle: orderData.imageryStyle,
        graphicElements: orderData.graphicElements,
        brandVoice: orderData.brandVoice,
        visualStyleGuide: orderData.visualStyleGuide,
        usageRulesAndDonts: orderData.usageRulesAndDonts,
        web3Section: orderData.web3Section,
        appendix: orderData.appendix,
      },
      createdAt: new Date(),
      authorEmail: order.customerEmail,
    });
    } catch (pdfGenError) {
      console.error(`[${input.orderId}] PDF generation error:`, pdfGenError);
      throw pdfGenError;
    }

    console.log(`[${input.orderId}] PDF buffer generated, size: ${pdfBuffer?.length || 0} bytes`);

    const pdfFileName = generateFileName('pdf', input.orderId, input.businessName);
    console.log(`[${input.orderId}] Saving PDF as: ${pdfFileName}`);
    
    let pdfPath;
    try {
      pdfPath = await saveFile(pdfFileName, pdfBuffer);
      console.log(`[${input.orderId}] PDF saved to: ${pdfPath}`);
    } catch (saveError) {
      console.error(`[${input.orderId}] Failed to save PDF:`, saveError);
      throw saveError;
    }

    // Save PDF path to database
    await prisma.orderDetail.upsert({
      where: {
        orderId_fieldName: {
          orderId: input.orderId,
          fieldName: 'pdf_path',
        },
      },
      update: { fieldValue: pdfPath },
      create: {
        orderId: input.orderId,
        fieldName: 'pdf_path',
        fieldValue: pdfPath,
      },
    });

    // Generate README
    console.log(`[${input.orderId}] Generating README...`);
    const readmeContent = generateReadmeContent({
      businessName: input.businessName,
      tagline: orderData.tagline,
      missionStatement: orderData.missionStatement,
      brandStory: orderData.projectOverview,
      colorPalette: orderData.colorPalette,
      typography: orderData.typography,
      logoUsageRules: orderData.logoUsageRules,
      usageRulesAndDonts: orderData.usageRulesAndDonts,
      brandVoice: orderData.brandVoice,
      imageryStyle: orderData.imageryStyle,
      web3Section: orderData.web3Section,
      contactEmail: order.customerEmail,
      version: '1.0',
    });

    const readmeFileName = generateFileName('readme', input.orderId, input.businessName);
    const readmePath = await saveTextFile(readmeFileName, readmeContent);

    // Save README path to database
    await prisma.orderDetail.upsert({
      where: {
        orderId_fieldName: {
          orderId: input.orderId,
          fieldName: 'readme_path',
        },
      },
      update: { fieldValue: readmePath },
      create: {
        orderId: input.orderId,
        fieldName: 'readme_path',
        fieldValue: readmePath,
      },
    });

    // Get logo and mockup paths from database
    const logoVariants = await prisma.logoVariant.findMany({
      where: { orderId: input.orderId },
      orderBy: { variantNum: 'asc' },
    });

    // Create ZIP package
    console.log(`[${input.orderId}] Creating ZIP package...`);
    const zipOutputFileName = generateFileName('zip', input.orderId, input.businessName);
    const zipOutputPath = `/tmp/${zipOutputFileName}`;

    await createBrandAssetZip({
      businessName: input.businessName,
      logoFiles: {
        variant1: logoVariants[0]?.svgPath || undefined,
        variant2: logoVariants[1]?.svgPath || undefined,
        variant3: logoVariants[2]?.svgPath || undefined,
        variant4: logoVariants[3]?.svgPath || undefined,
      },
      mockupFiles: {
        letterhead1: logoVariants[0]?.mockupPaths ? getMockupPath(logoVariants[0].mockupPaths, 'letterhead') : undefined,
        letterhead2: logoVariants[1]?.mockupPaths ? getMockupPath(logoVariants[1].mockupPaths, 'letterhead') : undefined,
        letterhead3: logoVariants[2]?.mockupPaths ? getMockupPath(logoVariants[2].mockupPaths, 'letterhead') : undefined,
        letterhead4: logoVariants[3]?.mockupPaths ? getMockupPath(logoVariants[3].mockupPaths, 'letterhead') : undefined,
        tshirt1: logoVariants[0]?.mockupPaths ? getMockupPath(logoVariants[0].mockupPaths, 'tshirt') : undefined,
        tshirt2: logoVariants[1]?.mockupPaths ? getMockupPath(logoVariants[1].mockupPaths, 'tshirt') : undefined,
        tshirt3: logoVariants[2]?.mockupPaths ? getMockupPath(logoVariants[2].mockupPaths, 'tshirt') : undefined,
        tshirt4: logoVariants[3]?.mockupPaths ? getMockupPath(logoVariants[3].mockupPaths, 'tshirt') : undefined,
        businesscard1: logoVariants[0]?.mockupPaths ? getMockupPath(logoVariants[0].mockupPaths, 'businesscard') : undefined,
        businesscard2: logoVariants[1]?.mockupPaths ? getMockupPath(logoVariants[1].mockupPaths, 'businesscard') : undefined,
        businesscard3: logoVariants[2]?.mockupPaths ? getMockupPath(logoVariants[2].mockupPaths, 'businesscard') : undefined,
        businesscard4: logoVariants[3]?.mockupPaths ? getMockupPath(logoVariants[3].mockupPaths, 'businesscard') : undefined,
      },
      pdfPath: pdfPath ? pdfPath.replace(/^\//, process.cwd() + '/public/') : undefined,
      readmeContent: readmeContent,
      outputPath: zipOutputPath,
    });

    // Save ZIP to downloads and get path
    const zipFileBuffer = require('fs').readFileSync(zipOutputPath);
    const zipFileName = generateFileName('zip', input.orderId, input.businessName);
    const zipPath = await saveFile(zipFileName, zipFileBuffer);

    // Clean up temp ZIP
    try {
      require('fs').unlinkSync(zipOutputPath);
    } catch {
      /* ignore */
    }

    // Save ZIP path to database
    await prisma.orderDetail.upsert({
      where: {
        orderId_fieldName: {
          orderId: input.orderId,
          fieldName: 'zip_path',
        },
      },
      update: { fieldValue: zipPath },
      create: {
        orderId: input.orderId,
        fieldName: 'zip_path',
        fieldValue: zipPath,
      },
    });

    // Check if Tier 3 for advanced templates
    let figmaUrl: string | undefined;
    let canvaDesigns: Record<string, any> | undefined;
    let mediaAssets: Record<string, any> | undefined;

    if (order.tier === 'premium') {
      console.log(`[${input.orderId}] Generating Tier 3 templates...`);

      try {
        // Extract logo and color data
        const logoVariant = logoVariants[0]; // Use first variant for templates
        const logoBase64 = logoVariant?.svgPath ? Buffer.from(logoVariant.svgPath).toString('base64') : '';
        const colorPalette = orderData.colorPalette?.primary || [];

        // Generate Figma templates
        try {
          console.log(`[${input.orderId}] Generating Figma templates...`);
          const figmaFile = await generateFigmaTemplates({
            businessName: input.businessName,
            brandColors: colorPalette,
            typography: orderData.typography || [],
            logoUrl: logoVariant?.svgPath || '',
          });

          figmaUrl = figmaFile.fileUrl;

          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: {
                orderId: input.orderId,
                fieldName: 'figma_url',
              },
            },
            update: { fieldValue: figmaUrl },
            create: {
              orderId: input.orderId,
              fieldName: 'figma_url',
              fieldValue: figmaUrl,
            },
          });
        } catch (figmaError) {
          console.warn(`[${input.orderId}] Figma generation skipped:`, figmaError);
        }

        // Generate Canva templates
        try {
          console.log(`[${input.orderId}] Generating Canva templates...`);
          canvaDesigns = await generateCanvaTemplates({
            businessName: input.businessName,
            brandColors: colorPalette,
            logoUrl: logoVariant?.svgPath || '',
          });

          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: {
                orderId: input.orderId,
                fieldName: 'canva_designs',
              },
            },
            update: { fieldValue: JSON.stringify(canvaDesigns) },
            create: {
              orderId: input.orderId,
              fieldName: 'canva_designs',
              fieldValue: JSON.stringify(canvaDesigns),
            },
          });
        } catch (canvaError) {
          console.warn(`[${input.orderId}] Canva generation skipped:`, canvaError);
        }

        // Generate media assets
        try {
          console.log(`[${input.orderId}] Generating media assets...`);
          mediaAssets = await generateMediaAssets({
            businessName: input.businessName,
            logoSvg: logoVariant?.svgPath || '',
            logoBase64,
            brandColors: colorPalette,
            tagline: orderData.tagline,
          });

          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: {
                orderId: input.orderId,
                fieldName: 'media_assets',
              },
            },
            update: { fieldValue: JSON.stringify(mediaAssets) },
            create: {
              orderId: input.orderId,
              fieldName: 'media_assets',
              fieldValue: JSON.stringify(mediaAssets),
            },
          });
        } catch (mediaError) {
          console.warn(`[${input.orderId}] Media assets generation skipped:`, mediaError);
        }
      } catch (tier3Error) {
        console.warn(`[${input.orderId}] Tier 3 template generation had issues:`, tier3Error);
      }
    }

    // Update status to ready for review
    await prisma.order.update({
      where: { id: input.orderId },
      data: { status: 'ready_for_review' },
    });

    return {
      success: true,
      status: 'ready_for_review',
      pdfPath,
      zipPath,
      readmePath,
      figmaUrl,
      canvaDesigns,
      mediaAssets,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${input.orderId}] Processing failed:`, errorMessage);

    // Update status to failed
    try {
      await prisma.order.update({
        where: { id: input.orderId },
        data: { status: 'generation_failed' },
      });
    } catch {
      /* ignore */
    }

    return {
      success: false,
      status: 'generation_failed',
      error: errorMessage,
    };
  }
}

function extractOrderData(details: any[]) {
  const data: Record<string, any> = {};

  details.forEach((detail) => {
    data[detail.fieldName] = detail.fieldValue;
  });

  // Parse complex fields
  let colorPalette = null;
  let typography = null;

  try {
    if (data['colorPalette']) {
      colorPalette = JSON.parse(data['colorPalette']);
    }
  } catch {
    /* ignore */
  }

  try {
    if (data['typography']) {
      typography = JSON.parse(data['typography']);
    }
  } catch {
    /* ignore */
  }

  return {
    businessName: data['businessName'] || 'Brand',
    tagline: data['tagline'],
    missionStatement: data['missionStatement'],
    projectOverview: data['guide_projectOverview'] || data['projectOverview'],
    brandIdentity: data['guide_brandIdentity'] || data['brandIdentity'],
    logoPhilosophy: data['guide_logoPhilosophy'] || data['logoPhilosophy'],
    colorPalette: colorPalette || {
      primary: [],
      secondary: [],
      accent: [],
    },
    colorAccessibility: data['guide_colorAccessibility'] || data['colorAccessibility'],
    typography: typography || {
      headings: 'Modern Sans-serif',
      body: 'Clean Sans-serif',
      usage: 'Consistent sizing',
    },
    imageryStyle: data['guide_imageryStyle'] || data['imageryStyle'],
    graphicElements: data['guide_graphicElements'] || data['graphicElements'],
    brandVoice: data['guide_brandVoice'] || data['brandVoice'],
    visualStyleGuide: data['guide_visualStyleGuide'] || data['visualStyleGuide'],
    usageRulesAndDonts: data['guide_usageRulesAndDonts'] || data['usageRulesAndDonts'],
    web3Section: data['guide_web3Section'] || data['web3Section'],
    appendix: data['guide_appendix'] || data['appendix'],
    logoUsageRules: data['logoUsageRules'],
  };
}

function getMockupPath(mockupPathsJson: string, template: string): string | undefined {
  try {
    const mockups = JSON.parse(mockupPathsJson);
    return mockups[template] || undefined;
  } catch {
    return undefined;
  }
}
