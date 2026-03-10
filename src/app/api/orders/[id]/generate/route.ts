import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateLogoConcepts } from "@/ai/flows/generate-logo-concepts";
import { generateLogoMockups } from "@/ai/flows/generate-logo-mockups";
import { generateComprehensiveBrandGuide } from "@/ai/flows/generate-comprehensive-brand-guide";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await request.json();
    const { userApiKey } = body;

    if (!userApiKey) {
      return NextResponse.json(
        { error: "User API key is required" },
        { status: 400 }
      );
    }

    // Get the order and its details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { OrderDetail: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Convert OrderDetail array to object for easier access
    const formData: Record<string, string> = {};
    for (const detail of order.OrderDetail) {
      formData[detail.fieldName] = detail.fieldValue;
    }

    // Update order status to "generating"
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "generating" },
    });

    try {
      // Step 1: Generate logos
      const logoInput = {
        businessName: formData.businessName || "Unknown Business",
        industry: formData.industry || "Technology",
        keywords: [
          formData.aestheticKeywords,
          formData.emotionalKeywords,
          formData.functionalKeywords,
        ]
          .filter(Boolean)
          .join(", "),
        numberOfLogos: 4,
        userApiKey,
        ...(formData.preferredLogoStyle && {
          preferredLogoStyle: formData.preferredLogoStyle,
        }),
        ...(formData.composition && { composition: formData.composition }),
        ...(formData.iconPlacement && { iconPlacement: formData.iconPlacement }),
        ...(formData.targetAudience && { targetAudience: formData.targetAudience }),
      };

      const logoResult = await generateLogoConcepts(logoInput);

      if (!logoResult.logoUrls || logoResult.logoUrls.length === 0) {
        throw new Error("Failed to generate logos");
      }

      // Store logo URLs in OrderDetail
      for (let i = 0; i < logoResult.logoUrls.length; i++) {
        await prisma.orderDetail.upsert({
          where: {
            orderId_fieldName: {
              orderId,
              fieldName: `logoUrl_${i}`,
            },
          },
          create: {
            orderId,
            fieldName: `logoUrl_${i}`,
            fieldValue: logoResult.logoUrls[i],
          },
          update: {
            fieldValue: logoResult.logoUrls[i],
          },
        });
      }

      // Step 2: Generate mockups for first logo (primary variant)
      const firstLogoUrl = logoResult.logoUrls[0];
      const mockupInput = {
        logoImageUrl: firstLogoUrl,
        businessName: formData.businessName || "Unknown Business",
        industry: formData.industry || "Technology",
        mockupTemplates: ["letterhead", "tshirt", "businesscard"] as const,
        colorPalette: formData.preferredColorPalette,
        userApiKey,
      };

      const mockupResult = await generateLogoMockups(mockupInput);

      // Store mockup URLs
      if (mockupResult.letterheadMockup) {
        await prisma.orderDetail.upsert({
          where: {
            orderId_fieldName: {
              orderId,
              fieldName: "mockup_letterhead",
            },
          },
          create: {
            orderId,
            fieldName: "mockup_letterhead",
            fieldValue: mockupResult.letterheadMockup,
          },
          update: {
            fieldValue: mockupResult.letterheadMockup,
          },
        });
      }

      if (mockupResult.tshirtMockup) {
        await prisma.orderDetail.upsert({
          where: {
            orderId_fieldName: {
              orderId,
              fieldName: "mockup_tshirt",
            },
          },
          create: {
            orderId,
            fieldName: "mockup_tshirt",
            fieldValue: mockupResult.tshirtMockup,
          },
          update: {
            fieldValue: mockupResult.tshirtMockup,
          },
        });
      }

      if (mockupResult.businesscardMockup) {
        await prisma.orderDetail.upsert({
          where: {
            orderId_fieldName: {
              orderId,
              fieldName: "mockup_businesscard",
            },
          },
          create: {
            orderId,
            fieldName: "mockup_businesscard",
            fieldValue: mockupResult.businesscardMockup,
          },
          update: {
            fieldValue: mockupResult.businesscardMockup,
          },
        });
      }

      // Step 3: Generate comprehensive brand guide
      const guideInput = {
        businessName: formData.businessName || "Unknown Business",
        industry: formData.industry || "Technology",
        keywords: [
          formData.aestheticKeywords,
          formData.emotionalKeywords,
          formData.functionalKeywords,
        ]
          .filter(Boolean)
          .join(", "),
        selectedLogoUrl: firstLogoUrl,
        missionStatement: formData.missionStatement,
        brandPillars: formData.brandPillars,
        brandArchetype: formData.brandArchetype,
        keyTagline: formData.keyTagline,
        targetAudience: formData.targetAudience,
        companyValues: formData.companyValues,
        preferredColorPalette: formData.preferredColorPalette,
        preferredLogoStyle: formData.preferredLogoStyle,
        web3BlockchainFocus: formData.web3BlockchainFocus === "true",
        web3ProjectType: formData.web3ProjectType,
        web3TokenSymbol: formData.web3TokenSymbol,
        web3CommunityValues: formData.web3CommunityValues,
        userApiKey,
      };

      const guideResult = await generateComprehensiveBrandGuide(guideInput);

      // Store brand guide sections in OrderDetail
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
                orderId,
                fieldName: `guide_${field}`,
              },
            },
            create: {
              orderId,
              fieldName: `guide_${field}`,
              fieldValue: value,
            },
            update: {
              fieldValue: value,
            },
          });
        }
      }

      // Update order status to "ready_for_review"
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "ready_for_review" },
      });

      return NextResponse.json(
        {
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
        },
        { status: 200 }
      );
    } catch (generationError) {
      console.error("Generation error:", generationError);

      // Update order status to "generation_failed"
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "generation_failed" },
      });

      return NextResponse.json(
        {
          error: "Generation failed",
          details: generationError instanceof Error ? generationError.message : String(generationError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Orchestration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
