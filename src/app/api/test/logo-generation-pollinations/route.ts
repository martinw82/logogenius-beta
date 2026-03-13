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
    const seed = body.seed || Math.floor(Math.random() * 1000000); // Random seed for variety
    
    console.log("[Pollinations Test] Prompt:", prompt);
    console.log("[Pollinations Test] Size:", width, "x", height);
    console.log("[Pollinations Test] Seed:", seed);

    // Build Pollinations.ai URL
    // Format: https://image.pollinations.ai/prompt/{encoded_prompt}?width={w}&height={h}&seed={seed}&nologo=true
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
    
    console.log("[Pollinations Test] Generated URL:", imageUrl.substring(0, 100) + "...");

    // Pollinations generates on-the-fly, so we just return the URL
    // The image will be generated when the browser requests it
    
    return NextResponse.json({
      success: true,
      message: "Image URL generated (Pollinations.ai - Free, no API key!)",
      imageUrl: imageUrl,
      prompt: prompt,
      width: width,
      height: height,
      seed: seed,
      provider: "pollinations.ai",
      note: "Image is generated on-the-fly when loaded. First load may take 5-10 seconds."
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
        width: "optional, default 1024 (max 2048)",
        height: "optional, default 1024 (max 2048)",
        seed: "optional, for reproducible results"
      }
    },
    features: [
      "✅ Completely free - no API key needed",
      "✅ No signup required",
      "✅ Unlimited generations",
      "✅ Good quality for logos",
      "⚠️ First load takes 5-10 seconds (on-the-fly generation)"
    ],
    documentation: "https://pollinations.ai/"
  });
}
