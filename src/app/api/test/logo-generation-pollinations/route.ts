import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Free image generation using Pollinations.ai
 * No API key required! Completely free.
 * POST /api/test/logo-generation-pollinations
 * Body: { prompt?: string, width?: number, height?: number, seed?: number }
 */
export async function POST(request: NextRequest) {
  console.log("[Pollinations Test] Starting free image generation");

  try {
    // Parse request
    const body = await request.json().catch(() => ({}));
    const prompt = body.prompt || "A simple minimalist logo for a coffee shop called 'Bean There', flat design, warm brown colors, professional, vector style";
    const width = body.width || 1024;
    const height = body.height || 1024;
    const seed = body.seed || Math.floor(Math.random() * 1000000);
    
    console.log("[Pollinations Test] Prompt:", prompt);
    console.log("[Pollinations Test] Size:", width, "x", height);

    // Build Pollinations.ai URL with additional parameters for better results
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true&negative_prompt=blurry,low+quality,text,words,letters`;
    
    console.log("[Pollinations Test] Generated URL:", imageUrl.substring(0, 100) + "...");

    // Try to fetch the image server-side to check if it works
    console.log("[Pollinations Test] Testing image availability...");
    
    try {
      const testResponse = await fetch(imageUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
      
      if (!testResponse.ok) {
        console.error("[Pollinations Test] Image not available:", testResponse.status);
        return NextResponse.json(
          { 
            success: false, 
            error: "Pollinations service unavailable",
            details: `HTTP ${testResponse.status} - The image generation service may be down or rate limited`,
            suggestion: "Try Hugging Face option instead, or wait a few minutes and retry"
          },
          { status: 503 }
        );
      }
      
      console.log("[Pollinations Test] Image is available!");
    } catch (fetchError) {
      console.error("[Pollinations Test] Fetch test failed:", fetchError);
      // Continue anyway - the image might still work when loaded in browser
    }

    // Return the URL - we'll let the browser load it directly
    return NextResponse.json({
      success: true,
      message: "Image URL generated (Pollinations.ai - Free, no API key!)",
      imageUrl: imageUrl,
      prompt: prompt,
      width: width,
      height: height,
      seed: seed,
      provider: "pollinations.ai",
      note: "Image generates on-the-fly when loaded. If it doesn't appear, wait 10-15 seconds and refresh."
    });

  } catch (error) {
    console.error("[Pollinations Test] ERROR:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate image URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for info
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Free image generation using Pollinations.ai (no API key required!)",
    provider: "pollinations.ai",
    usage: {
      method: "POST",
      body: { 
        prompt: "description of image to generate",
        width: "optional, default 1024",
        height: "optional, default 1024",
        seed: "optional, for reproducible results"
      }
    },
    features: [
      "✅ Completely free - no API key needed",
      "✅ No signup required",
      "✅ Unlimited generations",
      "✅ Good quality for logos",
      "⚠️ First load takes 10-15 seconds (on-the-fly generation)",
      "⚠️ May occasionally be rate limited"
    ],
    documentation: "https://pollinations.ai/",
    troubleshooting: [
      "If image doesn't load: Wait 15 seconds, then refresh",
      "If still doesn't work: Try Hugging Face option",
      "Error 429: Rate limited, wait 1 minute and retry"
    ]
  });
}
