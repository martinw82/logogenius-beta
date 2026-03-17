import { getPrisma, getOrderById } from '../database';
import { generateBrandGuidePDF } from './pdf-generator';
import { generateReadmeContent } from './readme-generator';
import { createBrandAssetZip } from './zip-packager';
import { saveFile, saveTextFile, generateFileName } from './file-manager';
import { generateAIMockups } from './ai-mockup-generator';
import { generateAISocialAssets } from './ai-social-generator';

function hexToRgbSafe(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 37, g: 99, b: 235 };
}

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
    const order = await getOrderById(input.orderId);

    if (!order) {
      throw new Error(`Order ${input.orderId} not found`);
    }

    // Extract data from OrderDetail records
    const orderData = extractOrderData(order.details);

    // Get the SELECTED logo for PDF cover (or default to variant 1)
    // Check if order has a selected logo
    const orderRecord = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: { selectedLogoId: true },
    });
    
    const selectedVariantNum = orderRecord?.selectedLogoId || 1;

    // Get mockups for PDF - try OrderDetail first, then LogoVariant
    const mockupData: Record<string, string> = {};
    
    // First try OrderDetail (client-side mockups)
    const mockupDetails = order.details.filter(d => 
      d.fieldName === 'mockup_letterhead' || 
      d.fieldName === 'mockup_businesscard' || 
      d.fieldName === 'mockup_tshirt'
    );
    for (const detail of mockupDetails) {
      const key = detail.fieldName.replace('mockup_', '');
      mockupData[key] = detail.fieldValue;
    }
    
    // If no mockups in OrderDetail, try LogoVariant (server-side mockups)
    if (Object.keys(mockupData).length === 0) {
      const logoVariantsWithMockups = await prisma.logoVariant.findMany({
        where: { 
          orderId: input.orderId,
          mockupPaths: { not: null }
        },
      });
      
      for (const variant of logoVariantsWithMockups) {
        if (variant.mockupPaths) {
          try {
            const paths = JSON.parse(variant.mockupPaths);
            // Use variant 1 mockups as default, or selected variant if available
            if (variant.variantNum === 1 || variant.variantNum === selectedVariantNum) {
              Object.assign(mockupData, paths);
            }
          } catch {
            // Invalid JSON, skip
          }
        }
      }
    }
    
    console.log(`[${input.orderId}] Mockup sources: OrderDetail=${mockupDetails.length}, LogoVariant lookup performed`);
    
    const logoVariant = await prisma.logoVariant.findFirst({
      where: { orderId: input.orderId, variantNum: selectedVariantNum },
    });

    // === AI Photorealistic Mockups (t-shirt, coffee mug, tote bag) ===
    // Check if mockups already exist (generated during Step 2) to avoid regenerating
    const existingAiMockups = await prisma.orderDetail.findMany({
      where: {
        orderId: input.orderId,
        fieldName: { in: ['ai_mockup_tshirt', 'ai_mockup_mug', 'ai_mockup_tote'] },
      },
    });

    const existingMockupMap: Record<string, string> = {};
    for (const m of existingAiMockups) {
      existingMockupMap[m.fieldName] = m.fieldValue;
    }

    if (existingMockupMap['ai_mockup_tshirt']) {
      console.log(`[${input.orderId}] Using cached AI mockups from Step 2 (zero credits)`);
      // Use cached mockups
      mockupData['ai_tshirt'] = existingMockupMap['ai_mockup_tshirt'];
      mockupData['ai_mug'] = existingMockupMap['ai_mockup_mug'];
      mockupData['ai_tote'] = existingMockupMap['ai_mockup_tote'];
    } else {
      // Generate new mockups (fallback for orders created before this fix)
      console.log(`[${input.orderId}] Generating AI photorealistic mockups...`);
      try {
        const aiMockupColors = [
          ...(orderData.colorPalette?.primary || []),
          ...(orderData.colorPalette?.secondary || []),
          ...(orderData.colorPalette?.accent || []),
        ].filter(Boolean);

        // Pass the selected logo so real mockup APIs can be tried first
        const selectedLogoData = logoVariant?.svgData || '';
        const aiMockups = await generateAIMockups({
          businessName: input.businessName,
          brandColors: aiMockupColors.length > 0 ? aiMockupColors : ['#2563eb', '#1e40af', '#f59e0b'],
          industry: orderData.industry || 'business',
          logoStyle: orderData.logoStyle,
          keywords: orderData.keywords,
          logoUrl: selectedLogoData || undefined,
        });

        // Save AI mockups to OrderDetail
        const aiMockupEntries = [
          { fieldName: 'ai_mockup_tshirt', fieldValue: aiMockups.tshirt },
          { fieldName: 'ai_mockup_mug', fieldValue: aiMockups.coffeeMug },
          { fieldName: 'ai_mockup_tote', fieldValue: aiMockups.toteBag },
        ];

        for (const entry of aiMockupEntries) {
          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: { orderId: input.orderId, fieldName: entry.fieldName },
            },
            update: { fieldValue: entry.fieldValue },
            create: { orderId: input.orderId, ...entry },
          });
        }

        // Add AI mockups to mockupData for PDF inclusion
        mockupData['ai_tshirt'] = aiMockups.tshirt;
        mockupData['ai_mug'] = aiMockups.coffeeMug;
        mockupData['ai_tote'] = aiMockups.toteBag;

        console.log(`[${input.orderId}] AI mockups generated and saved`);
      } catch (aiMockupError) {
        console.warn(`[${input.orderId}] AI mockup generation failed (non-fatal):`, aiMockupError instanceof Error ? aiMockupError.message : aiMockupError);
      }
    }

    // === AI Social Media Assets (Instagram Post, YouTube Thumbnail, Website Hero) ===
    console.log(`[${input.orderId}] Generating AI social media assets...`);
    try {
      const aiSocialColors = [
        ...(orderData.colorPalette?.primary || []),
        ...(orderData.colorPalette?.secondary || []),
        ...(orderData.colorPalette?.accent || []),
      ].filter(Boolean);

      // Check if social assets already exist (generated during Step 2) - check ALL 10 types
      const allSocialFields = [
        'social_instagram_post', 'social_instagram_story', 'social_facebook_cover',
        'social_twitter_header', 'social_linkedin_banner', 'social_youtube_thumbnail',
        'social_pinterest_pin', 'social_tiktok_cover', 'social_email_header', 'social_website_hero'
      ];
      const existingSocialAssets = await prisma.orderDetail.findMany({
        where: {
          orderId: input.orderId,
          fieldName: { in: allSocialFields },
        },
      });

      if (existingSocialAssets.length > 0) {
        console.log(`[${input.orderId}] Using cached social assets from Step 2 (zero credits)`);
        // Store in orderData for later use
        for (const s of existingSocialAssets) {
          orderData[s.fieldName] = s.fieldValue;
        }
      } else {
        const aiSocial = await generateAISocialAssets({
          businessName: input.businessName,
          brandColors: aiSocialColors.length > 0 ? aiSocialColors : ['#2563eb', '#1e40af', '#f59e0b'],
          industry: orderData.industry || 'business',
          tagline: orderData.tagline,
          logoStyle: orderData.logoStyle,
        });

        // Save AI social assets to OrderDetail
        const aiSocialEntries = [
          { fieldName: 'social_instagram_post', fieldValue: aiSocial.instagramPost },
          { fieldName: 'social_youtube_thumbnail', fieldValue: aiSocial.youtubeThumbnail },
          { fieldName: 'social_website_hero', fieldValue: aiSocial.websiteHero },
        ];

        for (const entry of aiSocialEntries) {
          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: { orderId: input.orderId, fieldName: entry.fieldName },
            },
            update: { fieldValue: entry.fieldValue },
            create: { orderId: input.orderId, ...entry },
          });
        }

        // Store in orderData for PDF
        for (const entry of aiSocialEntries) {
          orderData[entry.fieldName] = entry.fieldValue;
        }

        console.log(`[${input.orderId}] AI social assets generated and saved`);
      }
    } catch (aiSocialError) {
      console.warn(`[${input.orderId}] AI social generation failed (non-fatal):`, aiSocialError instanceof Error ? aiSocialError.message : aiSocialError);
    }

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
        tshirt: mockupData['ai_tshirt'] || mockupData['tshirt'],
        coffeeMug: mockupData['ai_mug'],
        toteBag: mockupData['ai_tote'],
      },
      fonts: orderData.fonts,
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
    let readmeContent;
    try {
      readmeContent = generateReadmeContent({
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
    } catch (readmeError) {
      console.error(`[${input.orderId}] README generation failed:`, readmeError);
      readmeContent = `# ${input.businessName} Brand Guide\n\nBrand guidelines for ${input.businessName}.`;
    }

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

    // Tier 3 templates: Figma, Canva, Media Assets
    if (order.tier === 'premium') {
      console.log(`[${input.orderId}] Processing Tier 3 premium templates...`);

      // Build brandColors array from colorPalette with safe defaults
      const allColors = [
        ...(orderData.colorPalette?.primary || []),
        ...(orderData.colorPalette?.secondary || []),
        ...(orderData.colorPalette?.accent || []),
      ].filter(Boolean);

      // Use logo colors as fallback if no palette colors exist
      const colorHexes = allColors.length > 0 ? allColors : ['#2563eb', '#1e40af', '#f59e0b'];

      const brandColorsForGenerators = colorHexes.map((hex: string, idx: number) => {
        const rgb = hexToRgbSafe(hex);
        return {
          name: idx === 0 ? 'Primary' : idx === 1 ? 'Secondary' : `Accent ${idx - 1}`,
          hex,
          rgb,
        };
      });

      const selectedLogo = logoVariant?.svgData || '';
      const selectedLogoBase64 = selectedLogo.startsWith('data:')
        ? selectedLogo.split(',')[1] || ''
        : '';

      // Generate Figma templates (requires FIGMA_API_TOKEN)
      if (process.env.FIGMA_API_TOKEN) {
        try {
          const { generateFigmaTemplates } = await import('./figma-generator');
          const figmaResult = await generateFigmaTemplates({
            businessName: input.businessName,
            brandColors: brandColorsForGenerators,
            typography: [
              {
                name: 'Heading',
                fontFamily: orderData.fonts?.headings?.name || 'Inter',
                fontSize: 32,
                fontWeight: 700,
                lineHeight: 40,
              },
              {
                name: 'Body',
                fontFamily: orderData.fonts?.body?.name || 'Inter',
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 24,
              },
            ],
            logoUrl: selectedLogo,
          });
          figmaUrl = figmaResult.fileUrl;
          console.log(`[${input.orderId}] Figma templates generated: ${figmaUrl}`);
        } catch (figmaError) {
          console.warn(`[${input.orderId}] Figma generation skipped:`, figmaError instanceof Error ? figmaError.message : figmaError);
        }
      } else {
        console.log(`[${input.orderId}] Figma templates skipped (FIGMA_API_TOKEN not set)`);
      }

      // Generate Canva templates (requires CANVA_API_KEY)
      if (process.env.CANVA_API_KEY) {
        try {
          const { generateCanvaTemplates } = await import('./canva-generator');
          const canvaResult = await generateCanvaTemplates({
            businessName: input.businessName,
            brandColors: brandColorsForGenerators,
            logoUrl: selectedLogo,
          });
          canvaDesigns = canvaResult as unknown as Record<string, any>;
          console.log(`[${input.orderId}] Canva templates generated`);
        } catch (canvaError) {
          console.warn(`[${input.orderId}] Canva generation skipped:`, canvaError instanceof Error ? canvaError.message : canvaError);
        }
      } else {
        console.log(`[${input.orderId}] Canva templates skipped (CANVA_API_KEY not set)`);
      }

      // Generate media assets (favicons, avatars, email signatures)
      if (selectedLogoBase64) {
        try {
          const { generateMediaAssets } = await import('./media-assets-generator');
          const mediaResult = await generateMediaAssets({
            businessName: input.businessName,
            logoSvg: selectedLogo,
            logoBase64: selectedLogoBase64,
            brandColors: brandColorsForGenerators.map((c: { name: string; hex: string }) => ({ name: c.name, hex: c.hex })),
            tagline: orderData.tagline,
          });
          mediaAssets = mediaResult as unknown as Record<string, any>;
          console.log(`[${input.orderId}] Media assets generated`);
        } catch (mediaError) {
          console.warn(`[${input.orderId}] Media assets generation skipped:`, mediaError instanceof Error ? mediaError.message : mediaError);
        }
      } else {
        console.log(`[${input.orderId}] Media assets skipped (no logo base64 available)`);
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
  let fonts = null;

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

  // Extract font information
  try {
    fonts = {};
    if (data['fontHeadings']) {
      fonts.headings = { name: data['fontHeadings'] };
      if (data['fontHeadingsFile']) {
        fonts.headings.filePath = data['fontHeadingsFile'];
      }
    }
    if (data['fontBody']) {
      fonts.body = { name: data['fontBody'] };
      if (data['fontBodyFile']) {
        fonts.body.filePath = data['fontBodyFile'];
      }
    }
    if (data['fontOther']) {
      fonts.other = { name: data['fontOther'] };
      if (data['fontOtherFile']) {
        fonts.other.filePath = data['fontOtherFile'];
      }
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
    fonts: fonts,
    imageryStyle: data['guide_imageryStyle'] || data['imageryStyle'],
    graphicElements: data['guide_graphicElements'] || data['graphicElements'],
    brandVoice: data['guide_brandVoice'] || data['brandVoice'],
    visualStyleGuide: data['guide_visualStyleGuide'] || data['visualStyleGuide'],
    usageRulesAndDonts: data['guide_usageRulesAndDonts'] || data['usageRulesAndDonts'],
    web3Section: data['guide_web3Section'] || data['web3Section'],
    appendix: data['guide_appendix'] || data['appendix'],
    logoUsageRules: data['logoUsageRules'],
    industry: data['industry'],
    keywords: data['keywords'],
    logoStyle: data['preferredLogoStyle'] || data['logoStyle'],
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
