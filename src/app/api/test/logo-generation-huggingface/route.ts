import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Free image generation using Hugging Face Inference API
 * Get free API key at: https://huggingface.co/settings/tokens
 * 1,000 requests/month free
 * POST /api/test/logo-generation-huggingface
 * Body: { prompt?: string, model?: string }
 */
export async function POST(request: NextRequest) {
  console.log("[HuggingFace Test] Starting image generation");

  try {
    // Check for Hugging Face API key
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Hugging Face API key not found",
          details: "Please add HUGGINGFACE_API_KEY to your .env.local file",
          setup: {
            instructions: "1. Go to https://huggingface.co/settings/tokens",
            step2: "2. Create a new token (read access is enough)",
            step3: "3. Add to .env.local: HUGGINGFACE_API_KEY=your_token"
          }
        },
        { status: 500 }
      );
    }

    // Parse request
    const body = await request.json().catch(() => ({}));
    const prompt = body.prompt || "A simple minimalist logo for a coffee shop called 'Bean There', flat design, warm brown colors, professional, vector style, white background";
    
    // Good models for logo generation on Hugging Face
    const models = [
      "stabilityai/stable-diffusion-xl-base-1.0",
      "runwayml/stable-diffusion-v1-5",
      "prompthero/openjourney",
      "dreamlike-art/dreamlike-diffusion-1.0"
    ];
    const model = body.model || models[0];
    
    console.log("[HuggingFace Test] Prompt:", prompt);
    console.log("[HuggingFace Test] Model:", model);

    // Call Hugging Face Inference API
    const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
    
    console.log("[HuggingFace Test] Calling API...");
    
    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 50,
          guidance_scale: 7.5,
          width: 1024,
          height: 1024,
        }
      }),
    });
    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[HuggingFace Test] API error:", response.status, errorText);
      
      // Check if model is loading
      if (errorText.includes("currently loading")) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Model is currently loading",
            details: "Hugging Face models go to sleep after inactivity. Please wait 20-30 seconds and try again.",
            retryAfter: 30
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: `API returned ${response.status}`,
          details: errorText,
        },
        { status: 500 }
      );
    }

    // Get image blob
    const imageBlob = await response.blob();
    
    // Convert to base64
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log("[HuggingFace Test] Success! Image generated in", duration, "ms");

    return NextResponse.json({
      success: true,
      message: "Image generated successfully (Hugging Face - Free tier)",
      imageUrl: dataUrl,
      prompt: prompt,
      model: model,
      duration: duration,
      provider: "huggingface.co",
      note: "1,000 requests/month free. Model may need warmup if idle."
    });

  } catch (error) {
    console.error("[HuggingFace Test] ERROR:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Generation failed",
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
    message: "Image generation using Hugging Face Inference API",
    provider: "huggingface.co",
    setup: {
      required: "HUGGINGFACE_API_KEY in .env.local",
      getKey: "https://huggingface.co/settings/tokens",
      freeTier: "1,000 requests/month"
    },
    recommendedModels: [
      "stabilityai/stable-diffusion-xl-base-1.0 (best quality)",
      "runwayml/stable-diffusion-v1-5 (faster)",
      "prompthero/openjourney (artistic style)",
      "dreamlike-art/dreamlike-diffusion-1.0 (dreamlike)"
    ],
    usage: {
      method: "POST",
      body: { 
        prompt: "description of image to generate",
        model: "optional, default is stabilityai/stable-diffusion-xl-base-1.0"
      }
    },
    features: [
      "✅ High quality images",
      "✅ Many models to choose from",
      "✅ 1,000 requests/month free",
      "⚠️ Requires free API key",
      "⚠️ Model may need warmup after idle"
    ]
  });
}
