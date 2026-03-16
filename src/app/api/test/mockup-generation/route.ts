import { NextRequest, NextResponse } from "next/server";
import {
  generateMockup,
  generateMultipleMockups,
  getProviderInfo,
  type MockupProductType,
} from "@/lib/services/mockup-generation";

export const dynamic = "force-dynamic";

/**
 * Test mockup generation with the configured provider
 *
 * POST /api/test/mockup-generation
 * Body: {
 *   logoUrl: string (required - public URL of logo image),
 *   productType?: "tshirt" | "mug" | "totebag" | ... (default: "tshirt"),
 *   productColor?: string (hex, e.g. "#ffffff"),
 *   format?: "png" | "jpg" | "webp",
 *   all?: boolean (generate tshirt + mug + totebag at once)
 * }
 */
export async function POST(request: NextRequest) {
  const info = getProviderInfo();
  console.log(`[Mockup Test] Provider: ${info.provider}, configured: ${info.configured}`);

  try {
    if (!info.configured) {
      return NextResponse.json(
        {
          success: false,
          error: `${info.keyName} not set`,
          details: `The mockup provider "${info.provider}" requires an API key.`,
          setup: {
            step1: `Sign up at ${info.docsUrl}`,
            step2: `Get your API key`,
            step3: `Add to .env.local: ${info.keyName}=your_key`,
            freeQuota: info.freeQuota,
          },
          switchProvider:
            "To use a different provider, set MOCKUP_PROVIDER in .env.local to: dynamicmockups | mockupsjar | mockcity",
        },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const logoUrl = body.logoUrl;

    if (!logoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "logoUrl is required",
          details: "Provide a public URL to a logo PNG/JPG image.",
          example: {
            logoUrl: "https://example.com/logo.png",
            productType: "tshirt",
          },
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    if (body.all) {
      // Generate all 3 product mockups
      const products: MockupProductType[] = ["tshirt", "mug", "totebag"];
      const results = await generateMultipleMockups(logoUrl, products, {
        productColor: body.productColor,
        format: body.format,
        businessName: body.businessName,
      });

      const duration = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        message: `Generated ${results.length}/${products.length} mockups via ${info.provider}`,
        provider: info.provider,
        duration,
        results: results.map((r) => ({
          productType: r.productType,
          imageUrl: r.imageUrl,
          cost: r.cost,
        })),
      });
    } else {
      // Generate single mockup
      const productType = (body.productType as MockupProductType) || "tshirt";

      const result = await generateMockup({
        logoUrl,
        productType,
        productColor: body.productColor,
        format: body.format,
        businessName: body.businessName,
      });

      const duration = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        message: `Mockup generated via ${info.provider}`,
        provider: info.provider,
        productType: result.productType,
        imageUrl: result.imageUrl,
        cost: result.cost,
        duration,
        metadata: result.metadata,
      });
    }
  } catch (error) {
    console.error("[Mockup Test] ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Mockup generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
        provider: info.provider,
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - show provider info and usage instructions
 */
export async function GET() {
  const info = getProviderInfo();

  return NextResponse.json({
    status: "ok",
    message: "Mockup Generation - Provider Agnostic",
    currentProvider: info.provider,
    configured: info.configured,
    freeQuota: info.freeQuota,
    docs: info.docsUrl,
    providers: {
      dynamicmockups: {
        envKey: "DYNAMIC_MOCKUPS_API_KEY",
        signup: "https://dynamicmockups.com",
        freeQuota: "1,000 renders free forever (with watermark)",
        speed: "0.6-2.8s per render",
        features: [
          "Best free tier (1,000 renders)",
          "Fastest renders (sub-3s)",
          "JS/Python/Rails SDKs",
          "300 req/min rate limit",
          "Batch render support",
        ],
      },
      mockupsjar: {
        envKey: "MOCKUPSJAR_API_KEY",
        signup: "https://mockupsjar.com/api",
        freeQuota: "100 renders/month free",
        speed: "~3-5s per render",
        features: [
          "Simple REST API",
          "700+ templates",
          "No worker management",
          "Good for low volume",
        ],
      },
      mockcity: {
        envKey: "MOCKCITY_API_KEY",
        signup: "https://mockcity.com",
        freeQuota: "Credit-based (pay as you go)",
        speed: "15-20s spawn + 5-10s per render",
        features: [
          "Works with ANY PSD from CreativeMarket",
          "Cloud worker architecture",
          "Most flexible (your own templates)",
          "Best for SudoMock-like workflows",
        ],
      },
    },
    usage: {
      method: "POST",
      body: {
        logoUrl: "https://example.com/logo.png (required)",
        productType: "tshirt | mug | totebag | hoodie | phone-case (default: tshirt)",
        productColor: "#ffffff (optional)",
        format: "png | jpg | webp (optional)",
        all: "true to generate tshirt + mug + totebag (optional)",
      },
    },
    switchProvider:
      "Set MOCKUP_PROVIDER in .env.local to: dynamicmockups | mockupsjar | mockcity",
  });
}
