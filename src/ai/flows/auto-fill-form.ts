'use server';

/**
 * Auto-fill form fields using AI
 * 
 * User provides minimal input, AI generates comprehensive brand details
 * Uses text-based AI (GPT/Gemini) - super cheap (~$0.002 per call)
 */

export interface AutoFillInput {
  businessName: string;
  industry?: string;
  description?: string; // Brief description of what they do
}

export interface AutoFillOutput {
  missionStatement: string;
  brandPillars: string;
  targetAudience: string;
  aestheticKeywords: string;
  emotionalKeywords: string;
  functionalKeywords: string;
  brandArchetype: string;
  colorPsychology: string;
  composition: string;
  preferredLogoStyle: string;
}

/**
 * Build prompt for form auto-fill
 */
function buildAutoFillPrompt(input: AutoFillInput): string {
  return `You are a brand strategist helping create a comprehensive brand identity.

BUSINESS INFORMATION:
- Name: ${input.businessName}
- Industry: ${input.industry || 'Unknown'}
- Description: ${input.description || 'A company named ' + input.businessName}

Generate the following brand elements. Be specific, professional, and creative.
Write as if you're a branding expert consulting for this business.

REQUIRED OUTPUT FORMAT (JSON):
{
  "missionStatement": "One compelling sentence about their purpose (15-20 words)",
  "brandPillars": "3 core values, comma-separated (e.g., Innovation, Transparency, Customer-First)",
  "targetAudience": "Primary audience description (e.g., Tech-savvy millennials aged 25-40, urban professionals)",
  "aestheticKeywords": "3 visual style descriptors (e.g., Minimalist, Geometric, Premium)",
  "emotionalKeywords": "3 emotional associations (e.g., Trustworthy, Exciting, Approachable)",
  "functionalKeywords": "3 practical benefits (e.g., Fast, Reliable, User-Friendly)",
  "brandArchetype": "One of: Creator, Sage, Explorer, Hero, Rebel, Magician, Lover, Jester, Caregiver, Ruler, Everyman, Innocent",
  "colorPsychology": "2-3 color suggestions with reasoning (e.g., Deep Blue for trust, Orange for energy)",
  "composition": "Logo layout: Horizontal, Vertical, Circular, or Icon-Only",
  "preferredLogoStyle": "One of: Minimalist, 3D/Isometric, Mascot/Character, Vintage/Retro, Abstract Geometric, Wordmark/Lettermark, Emblem"
}

Guidelines:
- Mission: Focus on the "why" not the "what"
- Keywords: Mix of trendy and timeless descriptors
- Archetype: Choose based on industry + emotional appeal
- Colors: Consider industry standards but suggest distinctive combinations
- Logo style: Match to archetype and industry norms

Respond ONLY with the JSON object, no markdown, no explanation.`;
}

/**
 * Auto-fill form using AI
 * 
 * Cost: ~$0.002 per call (using GPT-3.5 or Gemini)
 */
export async function autoFillForm(input: AutoFillInput): Promise<AutoFillOutput> {
  console.log('[AutoFill] Generating brand details for:', input.businessName);

  // Use Together AI for text generation (cheaper than OpenAI)
  // Or use Google Gemini (free tier available)
  const apiKey = process.env.TOGETHER_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error('No API key configured for form auto-fill');
  }

  const prompt = buildAutoFillPrompt(input);

  try {
    // Try Together AI first (cheaper)
    if (process.env.TOGETHER_API_KEY) {
      const result = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3-8b-chat-hf', // Fast, cheap model
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!result.ok) {
        throw new Error(`Together AI error: ${await result.text()}`);
      }

      const data = await result.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        return parseAutoFillResponse(content);
      }
    }

    // Fallback to Google Gemini
    if (process.env.GOOGLE_API_KEY) {
      const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!result.ok) {
        throw new Error(`Gemini error: ${await result.text()}`);
      }

      const data = await result.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content) {
        return parseAutoFillResponse(content);
      }
    }

    throw new Error('No AI response received');

  } catch (error) {
    console.error('[AutoFill] Error:', error);
    throw new Error('Failed to auto-fill form. Please try again or fill manually.');
  }
}

/**
 * Parse AI response into structured output
 */
function parseAutoFillResponse(content: string): AutoFillOutput {
  try {
    // Clean up response - remove markdown code blocks if present
    const cleanContent = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanContent);

    // Validate required fields
    const requiredFields: (keyof AutoFillOutput)[] = [
      'missionStatement',
      'brandPillars',
      'targetAudience',
      'aestheticKeywords',
      'emotionalKeywords',
      'functionalKeywords',
      'brandArchetype',
      'colorPsychology',
      'composition',
      'preferredLogoStyle',
    ];

    for (const field of requiredFields) {
      if (!parsed[field]) {
        throw new Error(`Missing field: ${field}`);
      }
    }

    return parsed as AutoFillOutput;

  } catch (error) {
    console.error('[AutoFill] Parse error:', error);
    console.error('[AutoFill] Raw content:', content);
    
    // Return fallback values if parsing fails
    return getFallbackValues();
  }
}

/**
 * Fallback values if AI fails
 */
function getFallbackValues(): AutoFillOutput {
  return {
    missionStatement: 'To provide exceptional products and services that solve real problems and delight our customers.',
    brandPillars: 'Quality, Innovation, Customer-First',
    targetAudience: 'Professionals and consumers seeking premium solutions',
    aestheticKeywords: 'Modern, Clean, Professional',
    emotionalKeywords: 'Trustworthy, Approachable, Confident',
    functionalKeywords: 'Efficient, Reliable, User-Friendly',
    brandArchetype: 'Creator',
    colorPsychology: 'Blue for trust and professionalism, Orange for energy and innovation',
    composition: 'Horizontal',
    preferredLogoStyle: 'Minimalist',
  };
}

/**
 * Quick validation helper
 */
export function validateAutoFillOutput(output: AutoFillOutput): string[] {
  const errors: string[] = [];

  if (output.missionStatement.length < 10) {
    errors.push('Mission statement too short');
  }

  if (output.missionStatement.length > 200) {
    errors.push('Mission statement too long (max 200 chars)');
  }

  const validArchetypes = [
    'Creator', 'Sage', 'Explorer', 'Hero', 'Rebel', 
    'Magician', 'Lover', 'Jester', 'Caregiver', 'Ruler', 'Everyman', 'Innocent'
  ];
  
  if (!validArchetypes.includes(output.brandArchetype)) {
    errors.push(`Invalid archetype: ${output.brandArchetype}`);
  }

  const validStyles = [
    'Minimalist', '3D/Isometric', 'Mascot/Character', 'Vintage/Retro',
    'Abstract Geometric', 'Wordmark/Lettermark', 'Emblem'
  ];

  if (!validStyles.includes(output.preferredLogoStyle)) {
    errors.push(`Invalid logo style: ${output.preferredLogoStyle}`);
  }

  return errors;
}
