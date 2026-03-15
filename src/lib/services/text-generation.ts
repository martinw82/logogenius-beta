/**
 * Multi-Provider Text Generation Service
 * Supports free tiers: Together, DeepSeek, Mistral, Groq, Google
 * Auto-falls back to next provider if one fails
 */

export interface TextGenerationOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface TextGenerationResult {
  content: string;
  provider: string;
  cost: number;
}

// Provider configuration with fallback order
const PROVIDERS = [
  { name: 'google', key: 'GOOGLE_API_KEY', model: 'gemini-2.0-flash' },
  { name: 'together', key: 'TOGETHER_API_KEY', model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo' },
  { name: 'groq', key: 'GROQ_API_KEY', model: 'llama-3.1-70b-versatile' },
  { name: 'mistral', key: 'MISTRAL_API_KEY', model: 'mistral-tiny' },
];

/**
 * Generate text using multiple providers with auto-fallback
 */
export async function generateText(options: TextGenerationOptions): Promise<TextGenerationResult> {
  const errors: string[] = [];

  // Try each provider in order
  for (const provider of PROVIDERS) {
    const apiKey = process.env[provider.key];
    if (!apiKey) continue;

    try {
      const result = await generateWithProvider(provider.name, apiKey, provider.model, options);
      console.log(`[TextGen] Success with ${provider.name}`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`[TextGen] ${provider.name} failed:`, errorMsg);
      errors.push(`${provider.name}: ${errorMsg}`);
      // Continue to next provider
    }
  }

  // All providers failed
  throw new Error(`All text generation providers failed: ${errors.join('; ')}`);
}

async function generateWithProvider(
  provider: string,
  apiKey: string,
  model: string,
  options: TextGenerationOptions
): Promise<TextGenerationResult> {
  switch (provider) {
    case 'google':
      return generateWithGoogle(apiKey, model, options);
    case 'together':
      return generateWithTogether(apiKey, model, options);
    case 'groq':
      return generateWithGroq(apiKey, model, options);
    case 'mistral':
      return generateWithMistral(apiKey, model, options);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

async function generateWithGoogle(
  apiKey: string,
  model: string,
  options: TextGenerationOptions
): Promise<TextGenerationResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google API error: ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('No content from Google');
  }

  return { content, provider: 'google', cost: 0 };
}

async function generateWithTogether(
  apiKey: string,
  model: string,
  options: TextGenerationOptions
): Promise<TextGenerationResult> {
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: options.prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Together API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content from Together');
  }

  // Together text is ~$0.0001 per 1K tokens
  return { content, provider: 'together', cost: 0.0001 };
}

async function generateWithGroq(
  apiKey: string,
  model: string,
  options: TextGenerationOptions
): Promise<TextGenerationResult> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: options.prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content from Groq');
  }

  // Groq is free tier available
  return { content, provider: 'groq', cost: 0 };
}

async function generateWithMistral(
  apiKey: string,
  model: string,
  options: TextGenerationOptions
): Promise<TextGenerationResult> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: options.prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content from Mistral');
  }

  // Mistral tiny is ~$0.0001 per 1K tokens
  return { content, provider: 'mistral', cost: 0.0001 };
}
