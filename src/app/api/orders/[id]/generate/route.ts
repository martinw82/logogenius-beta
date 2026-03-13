import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrder, prisma } from "@/lib/database";
import { verifyAdminToken, getTokenFromRequest } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// Import AI flows
import { generateLogoConcepts } from "@/ai/flows/generate-logo-concepts";
import { generateLogoMockups } from "@/ai/flows/generate-logo-mockups";
import { generateComprehensiveBrandGuide } from "@/ai/flows/generate-comprehensive-brand-guide";

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

      const logoResult = await generateLogoConcepts(logoInput);
      console.log(`[Generate] Generated ${logoResult.logoUrls?.length || 0} logos`);

      if (!logoResult.logoUrls || logoResult.logoUrls.length === 0) {
        throw new Error("No logos were generated");
      }

      // Store logo URLs in OrderDetail
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

      const mockupResult = await generateLogoMockups(mockupInput);
      console.log(`[Generate] Mockups generated`);

      // Store mockup URLs
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

      const guideResult = await generateComprehensiveBrandGuide(guideInput);
      console.log(`[Generate] Brand guide generated`);

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

      // Update order status to "ready_for_review"
      await updateOrder(orderId, { status: "ready_for_review" });
      console.log(`[Generate] Complete! Order ${orderId} ready for review`);

      return NextResponse.json({
        success: true,
        orderId,
        status: "ready_for_review",
        generatedAssets: {
          logoCount: logoResult.logoUrls.length,
          mockupsGenerated: {
            letterhead: !!mockupResult.letterheadMockup,
            tshirt: !!mockupResult.tshirtMockup,
            businesscard: !!mockupResult.businesscardMockup,
          },
          brandGuideGenerated: true,
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
