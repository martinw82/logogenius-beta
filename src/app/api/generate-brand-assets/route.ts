import { NextRequest, NextResponse } from "next/server";
import { generateAIMockups } from "@/lib/services/ai-mockup-generator";
import { generateAISocialAssets } from "@/lib/services/ai-social-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, brandColors, industry, logoUrl, logoStyle, tagline } = body;

    if (!businessName || !brandColors || !industry || !logoUrl) {
      return NextResponse.json(
        { error: "Missing required fields: businessName, brandColors, industry, logoUrl" },
        { status: 400 }
      );
    }

    // Generate mockups and social assets in parallel
    const [mockups, socialAssets] = await Promise.all([
      generateAIMockups({
        businessName,
        brandColors,
        industry,
        logoStyle: logoStyle || "modern minimalist",
        logoUrl,
      }),
      generateAISocialAssets({
        businessName,
        brandColors,
        industry,
        logoStyle: logoStyle || "modern minimalist",
        tagline: tagline || "",
      }),
    ]);

    return NextResponse.json({
      success: true,
      mockups,
      socialAssets,
    });
  } catch (error) {
    console.error("Error generating brand assets:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
