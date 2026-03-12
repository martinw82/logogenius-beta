import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrder, prisma } from "@/lib/database";
import { verifyAdminToken, getTokenFromRequest } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export const handler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // Verify authentication
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

    const { generateLogoConcepts } = await import(
      "@/ai/flows/generate-logo-concepts"
    );
    const { generateLogoMockups } = await import(
      "@/ai/flows/generate-logo-mockups"
    );
    const { generateComprehensiveBrandGuide } = await import(
      "@/ai/flows/generate-comprehensive-brand-guide"
    );

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await request.json();
    // Use provided API key or fall back to environment variable
    const userApiKey = body.userApiKey || process.env.GENKIT_API_KEY;

    if (!userApiKey) {
      return NextResponse.json(
        { error: "API key is required. Provide userApiKey or set GENKIT_API_KEY" },
        { status: 400 }
      );
    }

    // Get the order and its details
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Convert details array to object for easier access
    const formData: Record<string, string> = {};
    for (const detail of order.details) {
      formData[detail.fieldName] = detail.fieldValue;
    }

    // Update order status to "generating"
    await updateOrder(orderId, { status: "generating" });

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
        missionStatement: formData.mission,
        brandPillars: formData.pillars,
        brandArchetype: formData.brandArchetype,
        keyTagline: formData.keyTagline,
        targetAudience: formData.targetAudience,
        companyValues: formData.companyValues,
        preferredColorPalette: formData.preferredColorPalette,
        preferredLogoStyle: formData.preferredLogoStyle,
        web3BlockchainFocus: formData.web3 === "true",
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
      await updateOrder(orderId, { status: "generation_failed" });

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
};

export const POST = handler;
