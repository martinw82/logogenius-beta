import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrder, prisma } from "@/lib/database";
import { verifyAdminToken, getTokenFromRequest } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// Import AI flows
import { generateLogoConcepts } from "@/ai/flows/generate-logo-concepts";
import { generateLogoMockups } from "@/ai/flows/generate-logo-mockups";
import { generateComprehensiveBrandGuide } from "@/ai/flows/generate-comprehensive-brand-guide";

// Import FREE mockup and social media generators
import { generateAllMockups, MockupTemplate } from "@/lib/services/mockup-generator";
import { generateAllSocialAssets, SocialPlatform } from "@/lib/services/social-media-generator";
import { processOrderAssets } from "@/lib/services/order-processor";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const admin = await verifyAdminToken(token);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Get API key from environment (Together AI)
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Together AI API key not configured. Please set TOGETHER_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    // Get order with form data from database
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Convert order details to form data object
    const formData: Record<string, string> = {};
    for (const detail of order.details) {
      formData[detail.fieldName] = detail.fieldValue;
    }

    // Check if required fields exist
    console.log("[Generate] Form data:", {
      businessName: formData.businessName,
      industry: formData.industry,
      hasKeywords: !!(formData.aestheticKeywords || formData.emotionalKeywords || formData.functionalKeywords),
    });
    
    if (!formData.businessName) {
      return NextResponse.json(
        { error: "Order form not completed - business name missing" },
        { status: 400 }
      );
    }

    // Update status to "generating"
    await updateOrder(orderId, { status: "generating" });

    try {
      // Step 1: Generate logo concepts using existing AI flow
      console.log(`[Generate] Starting logo generation for order ${orderId}`);
      
      const logoInput = {
        businessName: formData.businessName,
        industry: formData.industry || "Technology",
        keywords: [
          formData.aestheticKeywords,
          formData.emotionalKeywords,
          formData.functionalKeywords,
        ].filter(Boolean).join(", ") || "modern, professional",
        numberOfLogos: 4,
        userApiKey: apiKey,
        // Optional fields from form
        ...(formData.preferredLogoStyle && { preferredLogoStyle: formData.preferredLogoStyle }),
        ...(formData.composition && { composition: formData.composition }),
        ...(formData.targetAudience && { targetAudience: formData.targetAudience }),
        ...(formData.missionStatement && { missionStatement: formData.missionStatement }),
        ...(formData.brandPillars && { brandPillars: formData.brandPillars }),
        ...(formData.brandArchetype && { brandArchetype: formData.brandArchetype }),
        ...(formData.keyTagline && { keyTagline: formData.keyTagline }),
        ...(formData.web3BlockchainFocus === "true" && { 
          web3BlockchainFocus: true,
          web3ProjectType: formData.web3ProjectType,
        }),
      };
      
      console.log("[Generate] Calling generateLogoConcepts with Together AI...");

      let logoResult;
      try {
        logoResult = await generateLogoConcepts(logoInput);
        console.log(`[Generate] Generated ${logoResult.logoUrls?.length || 0} logos`);
      } catch (logoError) {
        console.error("[Generate] Logo generation failed:", logoError);
        throw new Error(`Logo generation failed: ${logoError instanceof Error ? logoError.message : String(logoError)}`);
      }

      if (!logoResult.logoUrls || logoResult.logoUrls.length === 0) {
        throw new Error("No logos were generated - API returned empty result");
      }

      // Store logo URLs in OrderDetail
      console.log("[Generate] Storing logos in OrderDetail...");
      try {
        for (let i = 0; i < logoResult.logoUrls.length; i++) {
          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: {
                orderId: orderId,
                fieldName: `logoUrl_${i}`,
              },
            },
            create: {
              orderId: orderId,
              fieldName: `logoUrl_${i}`,
              fieldValue: logoResult.logoUrls[i],
            },
            update: {
              fieldValue: logoResult.logoUrls[i],
            },
          });
        }
      } catch (dbError) {
        console.error("[Generate] Failed to store logos in OrderDetail:", dbError);
        throw new Error(`Database error (OrderDetail): ${dbError instanceof Error ? dbError.message : String(dbError)}`);
      }

      // Store logos in LogoVariant table (for admin display)
      console.log("[Generate] Storing logos in LogoVariant...");
      let logoVariantStored = false;
      try {
        for (let i = 0; i < logoResult.logoUrls.length; i++) {
          // Check if logo variant exists
          const existing = await prisma.logoVariant.findFirst({
            where: {
              orderId: orderId,
              variantNum: i + 1,
            },
          });
          
          // Truncate svgData if too large (MySQL TEXT limit is 65535)
          // Store full image in OrderDetail, truncated reference in LogoVariant
          const fullImageData = logoResult.logoUrls[i];
          const truncatedData = fullImageData.length > 65000 
            ? fullImageData.substring(0, 65000) + '...[truncated]'
            : fullImageData;
          
          if (existing) {
            // Update existing
            await prisma.logoVariant.update({
              where: { id: existing.id },
              data: { svgData: truncatedData },
            });
          } else {
            // Create new
            await prisma.logoVariant.create({
              data: {
                orderId: orderId,
                variantNum: i + 1,
                svgData: truncatedData,
              },
            });
          }
        }
        logoVariantStored = true;
      } catch (dbError) {
        console.warn("[Generate] Failed to store logos in LogoVariant (non-critical):", dbError);
        console.log("[Generate] Logos are still stored in OrderDetail and will be displayed from there");
        // Non-critical error - logos are still in OrderDetail
      }

      // Step 2: Generate mockups for the first logo
      const firstLogoUrl = logoResult.logoUrls[0];
      console.log(`[Generate] Starting mockup generation`);
      
      const mockupInput = {
        logoImageUrl: firstLogoUrl,
        businessName: formData.businessName,
        industry: formData.industry || "Technology",
        mockupTemplates: ["letterhead", "tshirt", "businesscard"] as const,
        userApiKey: apiKey,
      };
      
      console.log("[Generate] Calling generateLogoMockups with Together AI...");

      let mockupResult;
      try {
        mockupResult = await generateLogoMockups(mockupInput);
        console.log(`[Generate] Mockups generated:`, {
          letterhead: !!mockupResult.letterheadMockup,
          tshirt: !!mockupResult.tshirtMockup,
          businesscard: !!mockupResult.businesscardMockup,
        });
      } catch (mockupError) {
        console.error("[Generate] Mockup generation failed:", mockupError);
        throw new Error(`Mockup generation failed: ${mockupError instanceof Error ? mockupError.message : String(mockupError)}`);
      }

      // Store mockup URLs in OrderDetail
      const mockupFields = [
        { key: 'letterheadMockup', field: 'mockup_letterhead' },
        { key: 'tshirtMockup', field: 'mockup_tshirt' },
        { key: 'businesscardMockup', field: 'mockup_businesscard' },
      ];

      for (const { key, field } of mockupFields) {
        const value = (mockupResult as any)[key];
        if (value) {
          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: {
                orderId: orderId,
                fieldName: field,
              },
            },
            create: {
              orderId: orderId,
              fieldName: field,
              fieldValue: value,
            },
            update: {
              fieldValue: value,
            },
          });
        }
      }

      // Store mockups in LogoVariant table (for first logo variant)
      const mockupPaths: Record<string, string> = {};
      if (mockupResult.letterheadMockup) mockupPaths['letterhead'] = mockupResult.letterheadMockup;
      if (mockupResult.tshirtMockup) mockupPaths['tshirt'] = mockupResult.tshirtMockup;
      if (mockupResult.businesscardMockup) mockupPaths['businesscard'] = mockupResult.businesscardMockup;
      
      if (Object.keys(mockupPaths).length > 0) {
        await prisma.logoVariant.updateMany({
          where: {
            orderId: orderId,
            variantNum: 1,
          },
          data: {
            mockupPaths: JSON.stringify(mockupPaths),
          },
        });
      }

      // Step 3: Generate brand guide
      console.log(`[Generate] Starting brand guide generation`);
      
      const guideInput = {
        businessName: formData.businessName,
        industry: formData.industry || "Technology",
        keywords: [
          formData.aestheticKeywords,
          formData.emotionalKeywords,
          formData.functionalKeywords,
        ].filter(Boolean).join(", ") || "modern, professional",
        selectedLogoUrl: firstLogoUrl,
        missionStatement: formData.missionStatement || formData.mission,
        brandPillars: formData.brandPillars || formData.pillars,
        brandArchetype: formData.brandArchetype,
        keyTagline: formData.keyTagline,
        targetAudience: formData.targetAudience,
        preferredColorPalette: formData.preferredColorPalette,
        preferredLogoStyle: formData.preferredLogoStyle,
        web3BlockchainFocus: formData.web3 === "true" || formData.web3BlockchainFocus === "true",
        userApiKey: apiKey,
      };

      let guideResult;
      try {
        guideResult = await generateComprehensiveBrandGuide(guideInput);
        console.log(`[Generate] Brand guide generated`);
      } catch (guideError) {
        console.error("[Generate] Brand guide generation failed:", guideError);
        throw new Error(`Brand guide generation failed: ${guideError instanceof Error ? guideError.message : String(guideError)}`);
      }

      // Store brand guide sections
      const guideFields = [
        "projectOverview",
        "brandIdentityVoice",
        "logoPhilosophy",
        "colorPalette",
        "colorAccessibility",
        "typography",
        "imageryStyle",
        "graphicElements",
        "brandVoiceTone",
        "visualStyleGuide",
        "usageRulesAndDonts",
        "web3Section",
        "appendix",
      ];

      for (const field of guideFields) {
        const value = (guideResult as any)[field];
        if (value) {
          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: {
                orderId: orderId,
                fieldName: `guide_${field}`,
              },
            },
            create: {
              orderId: orderId,
              fieldName: `guide_${field}`,
              fieldValue: typeof value === 'string' ? value : JSON.stringify(value),
            },
            update: {
              fieldValue: typeof value === 'string' ? value : JSON.stringify(value),
            },
          });
        }
      }

      // Step 4: Generate FREE mockups using HTML/CSS templates
      console.log(`[Generate] Starting mockup generation (FREE templates)`);
      let mockupResults: Record<string, string> = {};
      
      try {
        // Get primary color from form data
        const primaryColor = formData.primaryColors?.includes('#') 
          ? formData.primaryColors.match(/#[0-9A-Fa-f]{6}/)?.[0] 
          : '#0a192f';
        const secondaryColor = formData.secondaryColors?.includes('#')
          ? formData.secondaryColors.match(/#[0-9A-Fa-f]{6}/)?.[0]
          : '#f4a261';
        
        // Generate mockups for variant 1 (all tiers)
        const variant1Logo = logoResult.logoUrls[0];
        mockupResults = await generateAllMockups({
          logoUrl: variant1Logo,
          businessName: formData.businessName,
          tagline: formData.keyTagline,
          primaryColor: primaryColor || '#0a192f',
          secondaryColor: secondaryColor || '#f4a261',
        });
        
        console.log(`[Generate] Mockups generated:`, Object.keys(mockupResults));
        
        // Store mockups in OrderDetail
        for (const [template, imageUrl] of Object.entries(mockupResults)) {
          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: {
                orderId: orderId,
                fieldName: `mockup_${template}`,
              },
            },
            create: {
              orderId: orderId,
              fieldName: `mockup_${template}`,
              fieldValue: imageUrl,
            },
            update: {
              fieldValue: imageUrl,
            },
          });
        }
        
        // Also update LogoVariant for display
        if (Object.keys(mockupResults).length > 0) {
          await prisma.logoVariant.updateMany({
            where: {
              orderId: orderId,
              variantNum: 1,
            },
            data: {
              mockupPaths: JSON.stringify(mockupResults),
            },
          });
        }
      } catch (mockupError) {
        console.error("[Generate] Mockup generation failed:", mockupError);
        // Non-critical - continue without mockups
      }

      // Note: Social media assets and PDF will be generated AFTER admin selects preferred logo
      // This ensures all assets use the correct logo variant

      // Update order status to "awaiting_selection" - waiting for admin to pick logo
      await updateOrder(orderId, { status: "awaiting_selection" });
      console.log(`[Generate] Phase 1 Complete! Order ${orderId} awaiting logo selection`);

      // Send logo ready email (fire-and-forget)
      if (order.customerEmail) {
        const { sendLogoSelectionEmail } = await import("@/lib/services/email-service");
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const dashboardLink = `${baseUrl}/dashboard/${orderId}`;
        sendLogoSelectionEmail(order.customerEmail, "Customer", orderId, dashboardLink).catch((err) => {
          console.error("[Generate] Failed to send logo ready email:", err);
        });
      }

      return NextResponse.json({
        success: true,
        orderId,
        status: "ready_for_review",
        generatedAssets: {
          logoCount: logoResult.logoUrls.length,
          mockupsGenerated: Object.keys(mockupResults).reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {} as Record<string, boolean>),
          awaitingSelection: true,
          message: "Please select a preferred logo variant to generate social assets and PDF",
        },
      });

    } catch (generationError) {
      console.error("[Generate] Generation error:", generationError);
      
      // Update status to failed
      await updateOrder(orderId, { status: "generation_failed" });

      return NextResponse.json(
        {
          error: "Logo generation failed",
          details: generationError instanceof Error ? generationError.message : String(generationError),
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("[Generate] API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
