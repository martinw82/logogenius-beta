import { NextRequest, NextResponse } from "next/server";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const dynamic = "force-dynamic";

/**
 * Simple test endpoint for image generation
 * POST /api/test/logo-generation
 * Body: { prompt?: string }
 */
export async function POST(request: NextRequest) {
  console.log("[Test Generation] Starting simple image generation test");

  try {
    // 1. Check API Key
    const apiKey = process.env.GENKIT_API_KEY || process.env.TEST_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
    
    console.log("[Test Generation] Environment check:");
    console.log("  - GENKIT_API_KEY exists:", !!process.env.GENKIT_API_KEY);
    console.log("  - TEST_GOOGLE_API_KEY exists:", !!process.env.TEST_GOOGLE_API_KEY);
    console.log("  - GOOGLE_API_KEY exists:", !!process.env.GOOGLE_API_KEY);
    console.log("  - Using API Key (first 10 chars):", apiKey ? apiKey.substring(0, 10) + "..." : "NOT FOUND");

    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No API key found",
          details: "Please set GENKIT_API_KEY, TEST_GOOGLE_API_KEY, or GOOGLE_API_KEY in your .env.local file"
        },
        { status: 500 }
      );
    }

    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const prompt = body.prompt || "A simple minimalist logo for a coffee shop called 'Bean There', flat design, warm brown colors, transparent background";
    
    console.log("[Test Generation] Prompt:", prompt);

    // 3. Initialize Genkit with the API key
    console.log("[Test Generation] Initializing Genkit...");
    const ai = genkit({
      plugins: [googleAI({ apiKey })],
    });
    console.log("[Test Generation] Genkit initialized successfully");

    // 4. Attempt image generation
    console.log("[Test Generation] Calling generate with model: googleai/gemini-2.0-flash-exp");
    
    const startTime = Date.now();
    const result = await ai.generate({
      model: "googleai/gemini-2.0-flash-exp",
      prompt: prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });
    const duration = Date.now() - startTime;

    console.log("[Test Generation] Generation completed in", duration, "ms");
    console.log("[Test Generation] Result keys:", Object.keys(result));
    console.log("[Test Generation] Result media:", result.media);
    console.log("[Test Generation] Result text:", result.text ? result.text.substring(0, 100) + "..." : "none");

    // 5. Check if we got an image
    const imageUrl = result.media?.url;
    
    if (!imageUrl) {
      console.error("[Test Generation] No image URL in response");
      return NextResponse.json(
        { 
          success: false, 
          error: "No image generated",
          details: "The API returned a response but no image URL was found",
          debug: {
            resultKeys: Object.keys(result),
            hasMedia: !!result.media,
            mediaKeys: result.media ? Object.keys(result.media) : null,
            text: result.text,
          }
        },
        { status: 500 }
      );
    }

    // 6. Success!
    console.log("[Test Generation] SUCCESS! Image URL received (first 50 chars):", imageUrl.substring(0, 50));

    return NextResponse.json({
      success: true,
      message: "Image generated successfully",
      imageUrl: imageUrl,
      duration: duration,
      prompt: prompt,
    });

  } catch (error) {
    console.error("[Test Generation] ERROR:", error);
    
    // Capture full error details
    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : "Unknown",
    };

    return NextResponse.json(
      { 
        success: false, 
        error: "Generation failed",
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for simple health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Test logo generation endpoint is ready. Send a POST request with an optional 'prompt' field.",
    usage: {
      method: "POST",
      body: { prompt: "optional custom prompt string" }
    }
  });
}
