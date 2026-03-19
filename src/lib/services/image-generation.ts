/**
 * Image Generation Service - Provider Agnostic
 * 
 * Supports multiple providers:
 * - together (current) - SD/Flux via Together AI
 * - replicate - Various models via Replicate
 * - fal - Imagen 3 via Fal.ai
 * - google - Imagen 3 direct
 * - laozhang - OpenAI-compatible API
 * - recraft - RECOMMENDED for logos (SVG output!)
 * 
 * Switch providers by setting IMAGE_GEN_PROVIDER env var
 * 
 * NOTE: For logo generation, Recraft is recommended because it outputs
 * native SVG vectors that are editable and scalable. See generateWithRecraft()
 * below and docs/ENVIRONMENT_VARIABLES.md for setup instructions.
 * 
 * TODO: When testing is complete, consider making Recraft the default provider
 * for logo generation instead of Together AI (SD/Flux).
 */

export type ImageGenProvider = 'together' | 'replicate' | 'fal' | 'google' | 'laozhang' | 'recraft';

export interface ImageGenOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  model?: string;
}

export interface ImageGenResult {
  imageUrl: string;  // base64 data URL or public URL
  provider: ImageGenProvider;
  model: string;
  cost?: number;
}

/**
 * Generate image using configured provider
 */
export async function generateImage(
  options: ImageGenOptions
): Promise<ImageGenResult> {
  const provider = (process.env.IMAGE_GEN_PROVIDER as ImageGenProvider) || 'together';
  
  switch (provider) {
    case 'replicate':
      return generateWithReplicate(options);
    case 'fal':
      return generateWithFal(options);
    case 'google':
      return generateWithGoogle(options);
    case 'laozhang':
      return generateWithLaozhang(options);
    case 'recraft':
      return generateWithRecraft(options);
    case 'together':
    default:
      return generateWithTogether(options);
  }
}

/**
 * Generate multiple images (for logo variants)
 */
export async function generateMultipleImages(
  options: ImageGenOptions,
  count: number
): Promise<ImageGenResult[]> {
  const results: ImageGenResult[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const result = await generateImage({
        ...options,
        // Add variation seed or style modifiers
        prompt: `${options.prompt} Variation ${i + 1}.`,
      });
      results.push(result);
    } catch (error) {
      console.error(`Failed to generate image ${i + 1}:`, error);
      // Continue with other images
    }
  }
  
  return results;
}

// ==================== Provider Implementations ====================

async function generateWithTogether(options: ImageGenOptions): Promise<ImageGenResult> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) throw new Error('TOGETHER_API_KEY not set');

  const response = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'stabilityai/stable-diffusion-xl-base-1.0',
      prompt: options.prompt,
      width: options.width || 1024,
      height: options.height || 1024,
      steps: options.steps || 30,
      n: 1,
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Together AI error: ${error}`);
  }

  const data = await response.json();
  const imageData = data.data?.[0]?.b64_json;
  
  if (!imageData) {
    throw new Error('No image data returned');
  }

  return {
    imageUrl: `data:image/png;base64,${imageData}`,
    provider: 'together',
    model: options.model || 'stabilityai/stable-diffusion-xl-base-1.0',
    cost: 0.001, // ~$0.001 per image
  };
}

async function generateWithReplicate(options: ImageGenOptions): Promise<ImageGenResult> {
  const apiKey = process.env.REPLICATE_API_KEY;
  if (!apiKey) throw new Error('REPLICATE_API_KEY not set');

  // Replicate uses a different pattern - run prediction
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: options.model || 'google/imagen-3', // or another model
      input: {
        prompt: options.prompt,
        width: options.width || 1024,
        height: options.height || 1024,
        negative_prompt: options.negativePrompt,
        num_inference_steps: options.steps || 30,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate error: ${error}`);
  }

  const prediction = await response.json();
  
  // Poll for completion
  const imageUrl = await pollReplicatePrediction(prediction.id, apiKey);
  
  // Fetch and convert to base64 for consistency
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString('base64');

  return {
    imageUrl: `data:image/png;base64,${base64}`,
    provider: 'replicate',
    model: options.model || 'google/imagen-3',
    cost: 0.05, // ~$0.05 per image for Imagen 3
  };
}

async function pollReplicatePrediction(predictionId: string, apiKey: string): Promise<string> {
  const maxAttempts = 60;
  const delayMs = 1000;

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    const prediction = await response.json();

    if (prediction.status === 'succeeded') {
      return prediction.output[0];
    }

    if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error}`);
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('Prediction timed out');
}

async function generateWithFal(options: ImageGenOptions): Promise<ImageGenResult> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) throw new Error('FAL_API_KEY not set');

  const response = await fetch('https://queue.fal.run/fal-ai/imagen3', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: options.prompt,
      width: options.width || 1024,
      height: options.height || 1024,
      negative_prompt: options.negativePrompt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Fal.ai error: ${error}`);
  }

  const result = await response.json();
  
  // Fal.ai returns URL directly
  const imageResponse = await fetch(result.images[0].url);
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString('base64');

  return {
    imageUrl: `data:image/png;base64,${base64}`,
    provider: 'fal',
    model: 'imagen-3',
    cost: 0.15, // ~$0.15 per image
  };
}

async function generateWithGoogle(options: ImageGenOptions): Promise<ImageGenResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY not set');

  // Google Imagen API via Vertex AI or direct API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3-generate-002:predict?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [{ prompt: options.prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: options.width === options.height ? '1:1' : '3:4',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Imagen error: ${error}`);
  }

  const data = await response.json();
  const imageData = data.predictions?.[0]?.bytesBase64Encoded;

  if (!imageData) {
    throw new Error('No image data returned');
  }

  return {
    imageUrl: `data:image/png;base64,${imageData}`,
    provider: 'google',
    model: 'imagen-3',
    cost: 0.04, // ~$0.04 per image
  };
}


async function generateWithLaozhang(options: ImageGenOptions): Promise<ImageGenResult> {
  const apiKey = process.env.LAOZHANG_API_KEY;
  if (!apiKey) throw new Error('LAOZHANG_API_KEY not set');

  // Laozhang.ai uses OpenAI-compatible API
  const response = await fetch('https://api.laozhang.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'imagen-3',
      prompt: options.prompt,
      n: 1,
      size: `${options.width || 1024}x${options.height || 1024}`,
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Laozhang.ai error: ${error}`);
  }

  const data = await response.json();
  const imageData = data.data?.[0]?.b64_json;

  if (!imageData) {
    throw new Error('No image data returned');
  }

  return {
    imageUrl: `data:image/png;base64,${imageData}`,
    provider: 'laozhang',
    model: options.model || 'imagen-3',
    cost: 0.05, // ~$0.05 per image (similar to Replicate)
  };
}

// ==================== Recraft Provider ====================

/**
 * Recraft AI Logo Generation
 * 
 * RECOMMENDED for logo generation because it outputs native SVG vectors!
 * 
 * Cost: $0.044/image (V2 Vector) | $0.04/image (V3 Raster)
 * Signup: https://www.recraft.ai
 * 
 * Setup:
 * 1. Get API key from Recraft dashboard
 * 2. Set RECRAFT_API_KEY in .env.local
 * 3. Set RECRAFT_VECTOR_MODE=true for SVG output
 * 4. Set IMAGE_GEN_PROVIDER=recraft
 * 
 * TODO: After testing confirms quality improvement:
 * - Consider making Recraft the default provider for logos
 * - Update storage logic to handle SVG files
 * - Update customer download package to include SVG files
 * - Document SVG editing workflow for customers
 * 
 * NOTE: This function returns SVG data when VECTOR_MODE=true. The imageUrl
 * will be an SVG URL or base64-encoded SVG content. Make sure your storage
 * and display logic can handle SVG files!
 */
async function generateWithRecraft(options: ImageGenOptions): Promise<ImageGenResult> {
  const apiKey = process.env.RECRAFT_API_KEY;
  if (!apiKey) throw new Error('RECRAFT_API_KEY not set');

  // Determine if we want vector or raster output
  const useVector = process.env.RECRAFT_VECTOR_MODE === 'true';
  const recraftStyle = process.env.RECRAFT_STYLE || 'vector_illustration';
  
  // Recraft V2 for vector (cheaper), V3 for raster
  const model = useVector ? 'recraftv2' : 'recraftv3';
  
  try {
    const response = await fetch('https://external.api.recraft.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: options.prompt,
        model: model,
        size: `${options.width || 1024}x${options.height || 1024}`,
        // For vector generation, specify response format
        ...(useVector && { response_format: 'svg' }),
        // Style control
        style: recraftStyle,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Recraft API error: ${errorText}`);
    }

    const data = await response.json();
    
    // Recraft returns data in different formats depending on vector/raster
    if (useVector) {
      // Vector: Returns SVG URL or content
      const svgUrl = data.data?.[0]?.url;
      const svgContent = data.data?.[0]?.content;
      
      if (!svgUrl && !svgContent) {
        throw new Error('No SVG data returned from Recraft');
      }
      
      return {
        imageUrl: svgUrl || `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`,
        provider: 'recraft',
        model: 'recraft-v2-vector',
        cost: 0.044, // V2 vector pricing
      };
    } else {
      // Raster: Returns base64 or URL
      const imageUrl = data.data?.[0]?.url;
      const b64Data = data.data?.[0]?.b64_json;
      
      if (!imageUrl && !b64Data) {
        throw new Error('No image data returned from Recraft');
      }
      
      return {
        imageUrl: imageUrl || `data:image/png;base64,${b64Data}`,
        provider: 'recraft',
        model: 'recraft-v3-raster',
        cost: 0.04, // V3 raster pricing
      };
    }
  } catch (error) {
    console.error('[Recraft] Generation failed:', error);
    throw error;
  }
}
