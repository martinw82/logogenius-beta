import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/services/image-generation";
import { generateMockup, type MockupProductType } from "@/lib/services/mockup-generation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType, productType } = body;

    // Single logo generation (1 credit)
    if (testType === 'logo') {
      console.log('[Test API] Generating single logo...');
      const result = await generateImage({
        prompt: body.prompt || "Professional logo design for Test Company, modern minimalist style, clean vector, transparent background",
        width: 1024,
        height: 1024,
      });
      console.log('[Test API] Logo generated successfully');
      return NextResponse.json({ success: true, result });
    }

    // Single mockup generation (1 credit) - NEW!
    if (testType === 'single-mockup') {
      if (!body.logoUrl) {
        return NextResponse.json({ 
          success: false, 
          error: "logoUrl is required for mockup generation" 
        }, { status: 400 });
      }

      const selectedProduct: MockupProductType = productType || 'tshirt';
      console.log(`[Test API] Generating single mockup: ${selectedProduct}...`);
      
      const startTime = Date.now();
      const result = await generateMockup({
        logoUrl: body.logoUrl,
        productType: selectedProduct,
        businessName: body.businessName || "Test Company",
        productColor: body.productColor,
      });
      
      const duration = Date.now() - startTime;
      console.log(`[Test API] Mockup generated in ${duration}ms`);
      
      return NextResponse.json({ 
        success: true, 
        result: {
          [selectedProduct]: result.imageUrl,
          _provider: result.provider,
          _productType: result.productType,
          _cost: result.cost,
          _imageUrlEmpty: !result.imageUrl,
          _imageUrlLength: result.imageUrl?.length || 0,
          _rawMetadata: result.metadata,
        } 
      });
    }

    // All mockups generation (3 credits)
    if (testType === 'mockup') {
      if (!body.logoUrl) {
        return NextResponse.json({ 
          success: false, 
          error: "logoUrl is required for mockup generation" 
        }, { status: 400 });
      }

      console.log('[Test API] Generating all 3 mockups (3 credits)...');
      const { generateAIMockups } = await import("@/lib/services/ai-mockup-generator");
      const startTime = Date.now();
      
      const result = await generateAIMockups({
        businessName: body.businessName || "Test Company",
        brandColors: body.brandColors || ["#2563eb", "#1e40af", "#f59e0b"],
        industry: body.industry || "technology",
        logoUrl: body.logoUrl,
        logoStyle: body.logoStyle,
      });
      
      const duration = Date.now() - startTime;
      console.log(`[Test API] All mockups generated in ${duration}ms`);
      console.log('[Test API] Response keys:', Object.keys(result));
      
      return NextResponse.json({ 
        success: true, 
        result,
        _creditWarning: "This used 3 API credits (logo + mug + tote)"
      });
    }

    // Single social asset generation (1 credit per platform) - NEW!
    if (testType === 'single-social') {
      const platform = body.platform || 'instagramPost';
      console.log(`[Test API] Generating single social asset: ${platform}...`);
      
      const { generateImage } = await import("@/lib/services/image-generation");
      
      const prompts: Record<string, string> = {
        instagramPost: `Instagram post for ${body.businessName || "Test Company"}, ${body.industry || "technology"} brand, vibrant gradient background with brand colors, professional social media design, square format`,
        youtubeThumbnail: `YouTube thumbnail for ${body.businessName || "Test Company"}, eye-catching design, bold text, high contrast, 16:9 format, professional video thumbnail style`,
        websiteHero: `Website hero banner for ${body.businessName || "Test Company"}, modern web design, wide format, professional header image, business website hero section`,
      };
      
      const dimensions: Record<string, { width: number; height: number }> = {
        instagramPost: { width: 1024, height: 1024 },
        youtubeThumbnail: { width: 1280, height: 720 },
        websiteHero: { width: 1920, height: 1080 },
      };
      
      const result = await generateImage({
        prompt: prompts[platform] || prompts.instagramPost,
        ...dimensions[platform],
      });
      
      console.log('[Test API] Social asset generated successfully');
      
      return NextResponse.json({ 
        success: true, 
        result: {
          [platform]: result.imageUrl,
        }
      });
    }

    // All social assets generation (3 credits)
    if (testType === 'social') {
      console.log('[Test API] Generating all 3 social assets (3 credits)...');
      const { generateAISocialAssets } = await import("@/lib/services/ai-social-generator");
      
      const result = await generateAISocialAssets({
        businessName: body.businessName || "Test Company", 
        brandColors: body.brandColors || ["#2563eb", "#1e40af", "#f59e0b"],
        industry: body.industry || "technology",
        tagline: body.tagline,
        logoStyle: body.logoStyle,
      });
      
      console.log('[Test API] All social assets generated');
      console.log('[Test API] Response keys:', Object.keys(result));
      
      return NextResponse.json({ 
        success: true, 
        result,
        _creditWarning: "This used 3 API credits (instagram + youtube + hero)"
      });
    }

    return NextResponse.json({ 
      error: "Invalid testType. Use 'logo', 'single-mockup', 'mockup', 'single-social', or 'social'",
      validTypes: {
        'logo': 'Generate 1 logo (1 credit)',
        'single-mockup': 'Generate 1 mockup - specify productType: tshirt/mug/totebag (1 credit)',
        'mockup': 'Generate all 3 mockups (3 credits)',
        'single-social': 'Generate 1 social asset - specify platform: instagramPost/youtubeThumbnail/websiteHero (1 credit)',
        'social': 'Generate all 3 social assets (3 credits)',
      }
    }, { status: 400 });

  } catch (error) {
    console.error("[Test API] Error:", error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
