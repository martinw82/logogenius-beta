import { NextRequest, NextResponse } from "next/server";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const dynamic = "force-dynamic";

/**
 * Simple test endpoint for image generation
 * POST /api/test/logo-generation
 * Body: { prompt?: string, model?: string }
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
    const requestedModel = body.model; // Allow user to specify a model
    
    console.log("[Test Generation] Prompt:", prompt);

    // 3. Initialize Genkit with the API key
    console.log("[Test Generation] Initializing Genkit...");
    const ai = genkit({
      plugins: [googleAI({ apiKey })],
    });
    console.log("[Test Generation] Genkit initialized successfully");

    // 4. Try different models for image generation
    // Based on research, these are the models that might support image generation
    const modelsToTry = requestedModel 
      ? [`googleai/${requestedModel}`]
      : [
          "googleai/gemini-2.0-flash-exp-image-generation",
          "googleai/gemini-2.0-flash-preview-image-generation", 
          "googleai/gemini-2.0-flash-exp",
          "googleai/gemini-2.0-flash",
          "googleai/imagen-3.0-generate-001",
        ];

    const errors: Record<string, string> = {};
    
    for (const modelName of modelsToTry) {
      console.log(`[Test Generation] Trying model: ${modelName}`);
      
      try {
        const startTime = Date.now();
        const result = await ai.generate({
          model: modelName,
          prompt: prompt,
          config: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        });
        const duration = Date.now() - startTime;

        console.log(`[Test Generation] Model ${modelName} responded in ${duration}ms`);
        console.log("[Test Generation] Result keys:", Object.keys(result));
        console.log("[Test Generation] Result media:", result.media);

        // Check if we got an image
        const imageUrl = result.media?.url;
        
        if (imageUrl) {
          console.log(`[Test Generation] SUCCESS with model ${modelName}!`);
          
          return NextResponse.json({
            success: true,
            message: "Image generated successfully",
            imageUrl: imageUrl,
            duration: duration,
            prompt: prompt,
            modelUsed: modelName,
            modelsTried: Object.keys(errors),
          });
        } else {
          console.log(`[Test Generation] Model ${modelName} returned no image URL`);
          errors[modelName] = "No image URL in response";
        }
      } catch (modelError) {
        const errorMsg = modelError instanceof Error ? modelError.message : String(modelError);
        console.error(`[Test Generation] Model ${modelName} failed:`, errorMsg);
        errors[modelName] = errorMsg;
      }
    }

    // All models failed
    console.error("[Test Generation] All models failed");
    return NextResponse.json(
      { 
        success: false, 
        error: "All image generation models failed",
        details: "Tried multiple models, none worked",
        errors: errors,
        suggestion: "Check your API key permissions at https://aistudio.google.com/app/apikey"
      },
      { status: 500 }
    );

  } catch (error) {
    console.error("[Test Generation] ERROR:", error);
    
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
      body: { 
        prompt: "optional custom prompt string",
        model: "optional specific model name (e.g., gemini-2.0-flash-exp)"
      }
    },
    models: [
      "gemini-2.0-flash-exp-image-generation",
      "gemini-2.0-flash-preview-image-generation",
      "gemini-2.0-flash-exp",
      "gemini-2.0-flash",
      "imagen-3.0-generate-001"
    ]
  });
}
