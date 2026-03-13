import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Free image generation using Hugging Face Inference API
 * Note: Many models return 410 - endpoint changed. This tries multiple models.
 * Get free API key at: https://huggingface.co/settings/tokens
 * POST /api/test/logo-generation-huggingface
 * Body: { prompt?: string }
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
            step2: "2. Create a new token (read access)",
            step3: "3. Add to Vercel env: HUGGINGFACE_API_KEY=your_token"
          }
        },
        { status: 500 }
      );
    }

    // Parse request
    const body = await request.json().catch(() => ({}));
    const prompt = body.prompt || "A simple minimalist logo for a coffee shop called 'Bean There', flat design, warm brown colors";
    
    console.log("[HuggingFace Test] Prompt:", prompt);

    // Try multiple models - many return 410 (endpoint changed)
    // These are models that might work with the free inference API
    const modelsToTry = [
      // Community-hosted models more likely to work
      "black-forest-labs/FLUX.1-schnell",
      "stabilityai/stable-diffusion-2-1",
      "CompVis/stable-diffusion-v1-4",
      "runwayml/stable-diffusion-v1-5",
      // Fallback to ANY working model
      "segmind/SSD-1B",
      "playgroundai/playground-v2-256px-base",
    ];

    const errors: Record<string, { status: number; message: string }> = {};

    for (const model of modelsToTry) {
      console.log(`[HuggingFace Test] Trying model: ${model}`);
      
      try {
        // Use the inference API with proper headers
        const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            // Don't wait for model - return 503 if loading
          },
          body: JSON.stringify({
            inputs: prompt,
          }),
        });

        console.log(`[HuggingFace Test] Model ${model} response:`, response.status);

        // Handle 503 - model is loading, try next
        if (response.status === 503) {
          const errorData = await response.json().catch(() => ({}));
          errors[model] = { 
            status: 503, 
            message: errorData.error || "Model is loading" 
          };
          console.log(`[HuggingFace Test] Model ${model} is loading, trying next...`);
          continue;
        }

        // Handle 410 - endpoint gone, try next
        if (response.status === 410) {
          errors[model] = { 
            status: 410, 
            message: "Model endpoint deprecated" 
          };
          console.log(`[HuggingFace Test] Model ${model} endpoint deprecated, trying next...`);
          continue;
        }

        // Handle other errors
        if (!response.ok) {
          const errorText = await response.text();
          errors[model] = { 
            status: response.status, 
            message: errorText.substring(0, 200) 
          };
          console.log(`[HuggingFace Test] Model ${model} failed:`, response.status);
          continue;
        }

        // Success! Get the image
        const imageBlob = await response.blob();
        
        if (imageBlob.size === 0) {
          errors[model] = { status: 0, message: "Empty response" };
          continue;
        }

        // Convert to base64
        const arrayBuffer = await imageBlob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;
        
        console.log(`[HuggingFace Test] SUCCESS with model: ${model}`);

        return NextResponse.json({
          success: true,
          message: "Image generated successfully",
          imageUrl: dataUrl,
          prompt: prompt,
          model: model,
          provider: "huggingface.co",
          note: "1,000 requests/month free. This model worked!"
        });

      } catch (modelError) {
        const errorMsg = modelError instanceof Error ? modelError.message : String(modelError);
        errors[model] = { status: 0, message: errorMsg };
        console.error(`[HuggingFace Test] Model ${model} error:`, errorMsg);
        // Continue to next model
      }
    }

    // All models failed
    console.error("[HuggingFace Test] All models failed");
    
    // Check if we got mostly 410 errors
    const is410Issue = Object.values(errors).every(e => e.status === 410);
    
    return NextResponse.json(
      { 
        success: false, 
        error: is410Issue 
          ? "All Hugging Face model endpoints have changed (410 errors)"
          : "All Hugging Face models failed",
        details: "Hugging Face has deprecated many free inference endpoints",
        errors: errors,
        recommendation: "⚠️ Hugging Face free inference API is unreliable. STRONGLY recommend using Together AI instead:",
        alternatives: [
          "1. Together AI ($5 free credit, most reliable) - /test → Together AI tab",
          "2. Pollinations.ai (completely free) - may have loading issues",
        ]
      },
      { status: 500 }
    );

  } catch (error) {
    console.error("[HuggingFace Test] ERROR:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
        recommendation: "Use Together AI instead - it's much more reliable"
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
    status: "warning",
    message: "Hugging Face free inference API has reliability issues",
    warning: "Many models return 410 (endpoint deprecated). Try Together AI instead.",
    provider: "huggingface.co",
    status_note: "⚠️ NOT RECOMMENDED - Use Together AI instead",
    models_attempted: [
      "black-forest-labs/FLUX.1-schnell",
      "stabilityai/stable-diffusion-2-1", 
      "CompVis/stable-diffusion-v1-4",
      "runwayml/stable-diffusion-v1-5",
      "segmind/SSD-1B",
      "playgroundai/playground-v2-256px-base",
    ],
    recommendation: "Use Together AI ($5 free credit) - most reliable option",
    together_ai: {
      url: "https://api.together.xyz",
      free_credit: "$5",
      endpoint: "/api/test/logo-generation-together"
    }
  });
}
