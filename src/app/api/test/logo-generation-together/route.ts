import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Image generation using Together AI
 * $5 free credit on signup, then pay-as-you-go
 * Get API key at: https://api.together.xyz/settings/api-keys
 * POST /api/test/logo-generation-together
 * Body: { prompt?: string, model?: string, width?: number, height?: number }
 */
export async function POST(request: NextRequest) {
  console.log("[Together AI Test] Starting image generation");

  try {
    // Check for Together AI API key
    const apiKey = process.env.TOGETHER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Together AI API key not found",
          details: "Please add TOGETHER_API_KEY to your .env.local file",
          setup: {
            instructions: "1. Go to https://api.together.xyz/settings/api-keys",
            step2: "2. Sign up (free $5 credit)",
            step3: "3. Create an API key",
            step4: "4. Add to .env.local: TOGETHER_API_KEY=your_key"
          }
        },
        { status: 500 }
      );
    }

    // Parse request
    const body = await request.json().catch(() => ({}));
    const prompt = body.prompt || "A simple minimalist logo for a coffee shop called 'Bean There', flat design, warm brown colors, professional, vector style";
    const width = body.width || 1024;
    const height = body.height || 1024;
    
    // Together AI models for image generation
    const models = [
      "stabilityai/stable-diffusion-xl-base-1.0",
      "runwayml/stable-diffusion-v1-5",
      "stabilityai/stable-diffusion-2-1",
    ];
    const model = body.model || models[0];
    
    console.log("[Together AI Test] Prompt:", prompt);
    console.log("[Together AI Test] Model:", model);

    // Together AI API endpoint
    const apiUrl = "https://api.together.xyz/v1/images/generations";
    
    console.log("[Together AI Test] Calling API...");
    
    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        width: width,
        height: height,
        steps: 20,
        n: 1,
        response_format: "b64_json"
      }),
    });
    const duration = Date.now() - startTime;

    console.log("[Together AI Test] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Together AI Test] API error:", response.status, errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { raw: errorText };
      }
      
      if (response.status === 400) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Bad Request (400)",
            details: errorData.error?.message || errorData.raw || "Invalid request parameters",
            suggestion: "Check the error details and API documentation",
            debug: errorData
          },
          { status: 400 }
        );
      }
      
      if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid API key",
            details: "Your Together AI API key is invalid.",
            suggestion: "Get a new key from https://api.together.xyz/settings/api-keys"
          },
          { status: 401 }
        );
      }
      
      if (response.status === 402) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Payment Required (402) - Credits not available yet",
            details: "Your credits may be processing or not yet activated.",
            solutions: [
              "1. WAIT 10-30 minutes after adding credit - there's often a delay",
              "2. Check your balance at https://api.together.xyz/settings/billing",
              "3. Try refreshing the page and testing again",
              "4. If still failing after 30 mins, contact Together AI support",
            ],
            note: "Credit card payments can take 10-30 minutes to activate. Crypto payments are instant.",
            costs: "Together AI is cheap: ~$0.002 per image = 500 images for $1"
          },
          { status: 402 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Rate limit exceeded",
            details: "Too many requests in a short time.",
            suggestion: "Wait a minute and try again."
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: `API returned ${response.status}`,
          details: errorData.error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("[Together AI Test] Response data:", data);

    // Together AI returns b64_json format
    const imageData = data.data?.[0]?.b64_json;
    
    if (!imageData) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No image in response",
          details: "The API returned a response but no image data was found.",
          response: data
        },
        { status: 500 }
      );
    }

    const dataUrl = `data:image/png;base64,${imageData}`;
    
    console.log("[Together AI Test] Success! Image generated in", duration, "ms");

    return NextResponse.json({
      success: true,
      message: "Image generated successfully (Together AI - $5 free credit)",
      imageUrl: dataUrl,
      prompt: prompt,
      model: model,
      duration: duration,
      provider: "together.ai",
      note: "$5 free credit on signup, then pay-as-you-go. Very reliable."
    });

  } catch (error) {
    console.error("[Together AI Test] ERROR:", error);
    
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
    message: "Image generation using Together AI",
    provider: "together.ai",
    setup: {
      required: "TOGETHER_API_KEY in .env.local",
      getKey: "https://api.together.xyz/settings/api-keys",
      pricing: "$5 free credit on signup, then ~$0.002 per image"
    },
    models: [
      "stabilityai/stable-diffusion-xl-base-1.0",
      "runwayml/stable-diffusion-v1-5",
      "stabilityai/stable-diffusion-2-1",
    ],
    usage: {
      method: "POST",
      body: { 
        prompt: "description of image to generate",
        model: "optional, default is stabilityai/stable-diffusion-xl-base-1.0",
        width: "optional, default 1024",
        height: "optional, default 1024"
      }
    },
    features: [
      "✅ Very reliable",
      "✅ $5 free credit (good for ~2,500 images)",
      "✅ Fast generation",
      "✅ No warmup time",
      "⚠️ Requires signup",
      "⚠️ Pay-as-you-go after free credit"
    ]
  });
}
