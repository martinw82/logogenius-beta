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
    
    // Recommended models that work well with the free inference API
    // Note: Many models require warmup or specific endpoints
    const models = [
      "stabilityai/stable-diffusion-xl-base-1.0",
      "runwayml/stable-diffusion-v1-5",
      "prompthero/openjourney-v4",
      "stabilityai/stable-diffusion-2-1",
    ];
    const model = body.model || models[0];
    
    console.log("[HuggingFace Test] Prompt:", prompt);
    console.log("[HuggingFace Test] Model:", model);

    // Hugging Face Inference API v2 format
    // Use the dedicated inference endpoint
    const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
    
    console.log("[HuggingFace Test] Calling API:", apiUrl);
    
    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Wait-For-Model": "true", // Wait if model is loading
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 25, // Reduced for speed
          guidance_scale: 7.5,
          width: 512,  // Smaller for faster generation
          height: 512,
        }
      }),
    });
    const duration = Date.now() - startTime;

    console.log("[HuggingFace Test] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[HuggingFace Test] API error:", response.status, errorText);
      
      // Handle specific error codes
      if (response.status === 410) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Model endpoint changed or deprecated (410)",
            details: "The Hugging Face model endpoint has changed. Try a different model.",
            suggestion: "Try using 'runwayml/stable-diffusion-v1-5' or check https://huggingface.co/models",
            triedModel: model
          },
          { status: 410 }
        );
      }
      
      if (response.status === 503) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Model is currently loading",
            details: "Hugging Face models go to sleep after inactivity. The model is warming up.",
            suggestion: "Wait 30-60 seconds and try again. The model needs to load on their servers.",
            retryAfter: 60
          },
          { status: 503 }
        );
      }
      
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid API key",
            details: "Your Hugging Face API key is invalid or expired.",
            suggestion: "Get a new token from https://huggingface.co/settings/tokens"
          },
          { status: 401 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Rate limit exceeded",
            details: "You've exceeded the free tier limit (1,000 requests/month).",
            suggestion: "Wait a moment and retry, or upgrade your Hugging Face account."
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: `API returned ${response.status}`,
          details: errorText,
          suggestion: "Try a different model or check Hugging Face status."
        },
        { status: 500 }
      );
    }

    // Get image blob
    const imageBlob = await response.blob();
    
    if (imageBlob.size === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Empty image received",
          details: "The API returned an empty response. The model may have failed to generate."
        },
        { status: 500 }
      );
    }
    
    // Convert to base64
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log("[HuggingFace Test] Success! Image generated in", duration, "ms");
    console.log("[HuggingFace Test] Image size:", imageBlob.size, "bytes");

    return NextResponse.json({
      success: true,
      message: "Image generated successfully (Hugging Face - Free tier)",
      imageUrl: dataUrl,
      prompt: prompt,
      model: model,
      duration: duration,
      imageSize: imageBlob.size,
      provider: "huggingface.co",
      note: "1,000 requests/month free. Model may need warmup if idle (30-60s)."
    });

  } catch (error) {
    console.error("[HuggingFace Test] ERROR:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Check your internet connection and try again."
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
      { 
        id: "stabilityai/stable-diffusion-xl-base-1.0", 
        name: "SDXL Base 1.0", 
        quality: "Best",
        note: "Highest quality, may need longer warmup"
      },
      { 
        id: "runwayml/stable-diffusion-v1-5", 
        name: "SD v1.5", 
        quality: "Good",
        note: "Faster, reliable"
      },
      { 
        id: "stabilityai/stable-diffusion-2-1", 
        name: "SD 2.1", 
        quality: "Good",
        note: "Stable, well-tested"
      },
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
      "⚠️ Model may need warmup after idle (30-60s)"
    ],
    errorCodes: {
      "410": "Model endpoint changed - try a different model",
      "503": "Model loading - wait 30-60s and retry",
      "401/403": "Invalid API key - get new token",
      "429": "Rate limit exceeded - wait and retry"
    }
  });
}
