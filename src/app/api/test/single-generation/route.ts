import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/services/image-generation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType } = body;

    // Single logo generation
    if (testType === 'logo') {
      const result = await generateImage({
        prompt: "Professional logo design for Test Company, modern minimalist style, clean vector, transparent background",
        width: 1024,
        height: 1024,
      });
      return NextResponse.json({ success: true, result });
    }

    // Single mockup generation  
    if (testType === 'mockup') {
      const { generateAIMockups } = await import("@/lib/services/ai-mockup-generator");
      const result = await generateAIMockups({
        businessName: "Test Company",
        brandColors: ["#2563eb", "#1e40af", "#f59e0b"],
        industry: "technology",
        logoUrl: body.logoUrl,
      });
      return NextResponse.json({ success: true, result });
    }

    // Single social asset generation
    if (testType === 'social') {
      const { generateAISocialAssets } = await import("@/lib/services/ai-social-generator");
      const result = await generateAISocialAssets({
        businessName: "Test Company", 
        brandColors: ["#2563eb", "#1e40af", "#f59e0b"],
        industry: "technology",
      });
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: "Invalid testType. Use 'logo', 'mockup', or 'social'" }, { status: 400 });

  } catch (error) {
    console.error("Test generation error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
