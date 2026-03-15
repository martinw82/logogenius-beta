import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth';
import { generateText } from '@/lib/services/text-generation';

export const dynamic = 'force-dynamic';

/**
 * API route for form auto-fill using Google Gemini
 * POST /api/admin/auto-fill-form
 * Body: { businessName, industry, existingFields: {...} }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const admin = await verifyAdminToken(token);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { businessName, industry, subcategory, existingFields = {} } = body;

    if (!businessName || !industry) {
      return NextResponse.json(
        { error: 'Business name and industry are required' },
        { status: 400 }
      );
    }

    // Text generation will use multi-provider (Google, Together, Groq, Mistral)
    // At least one provider must be configured

    console.log(`[AutoFill] Generating brand details for: ${businessName} (${industry})`);
    console.log(`[AutoFill] Existing fields:`, Object.keys(existingFields).filter(k => existingFields[k]));

    // Call multi-provider text generation
    const prompt = buildPrompt(businessName, industry, subcategory, existingFields);
    
    let result;
    try {
      result = await generateText({
        prompt,
        temperature: 0.7,
        maxTokens: 1024,
      });
      console.log(`[AutoFill] Generated with ${result.provider} (cost: $${result.cost})`);
    } catch (error) {
      console.error('[AutoFill] All providers failed:', error);
      return NextResponse.json(
        { error: 'Failed to generate brand details - all providers unavailable' },
        { status: 500 }
      );
    }

    const content = result.content;

    // Parse the JSON response
    const parsedResult = parseResponse(content);
    
    // Merge with existing fields - don't overwrite
    const mergedResult = { ...parsedResult };
    for (const [key, value] of Object.entries(existingFields)) {
      if (value && value.trim() !== '') {
        // Keep existing value, don't overwrite
        mergedResult[key] = value;
      }
    }
    
    console.log('[AutoFill] Generated successfully');
    console.log('[AutoFill] Fields preserved:', Object.keys(existingFields).filter(k => existingFields[k]));
    
    return NextResponse.json(mergedResult);

  } catch (error) {
    console.error('[AutoFill] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function buildPrompt(
  businessName: string, 
  industry: string, 
  subcategory: string | undefined,
  existingFields: Record<string, string>
): string {
  
  // Build context from existing fields
  const existingContext = Object.entries(existingFields)
    .filter(([_, value]) => value && value.trim() !== '')
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  const fullIndustry = subcategory ? `${subcategory} (${industry})` : industry;

  return `You are an expert brand strategist. Create comprehensive brand details for a business.

BUSINESS INFORMATION:
- Name: ${businessName}
- Industry: ${fullIndustry}

${existingContext ? `ALREADY DEFINED (use these as inspiration for other fields):\n${existingContext}\n` : ''}

AVAILABLE OPTIONS:
Logo Styles: Modern Minimalist, Vintage/Retro, Hand-drawn/Organic, Geometric, Typography-focused, Mascot/Character, Abstract, Emblem/Badge
Brand Archetypes: The Innovator, The Caregiver, The Hero, The Explorer, The Creator, The Ruler, The Magician, The Lover, The Jester, The Sage, The Outlaw, The Innocent
Compositions: Icon left text right, Icon above text below, Icon only, Text only, Icon right text left, Integrated icon in text

INSTRUCTIONS:
1. Generate ONLY the fields that are NOT already defined above
2. Make new suggestions consistent with existing defined fields
3. Be creative but practical

REQUIRED OUTPUT - Return ONLY this JSON structure:
{
  "aestheticKeywords": "3 visual descriptors",
  "emotionalKeywords": "3 emotional descriptors", 
  "functionalKeywords": "3 functional descriptors",
  "primaryColors": "1-2 primary colors with hex codes",
  "secondaryColors": "1-2 secondary colors with hex codes",
  "accentColors": "1 accent color with hex code",
  "preferredLogoStyle": "ONE from logo styles list",
  "brandArchetype": "ONE from archetypes list",
  "composition": "ONE from compositions list",
  "targetAudience": "Brief target audience description",
  "keyTagline": "Catchy tagline (5-8 words)",
  "missionStatement": "Mission statement (1-2 sentences)",
  "brandPillars": "3-5 comma-separated values"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations.`;
}

function parseResponse(content: string): Record<string, string> {
  try {
    // Clean up response
    const cleanContent = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanContent);

    // Validate required fields and provide defaults if missing
    return {
      aestheticKeywords: parsed.aestheticKeywords || 'Modern, Professional, Clean',
      emotionalKeywords: parsed.emotionalKeywords || 'Trustworthy, Innovative, Approachable',
      functionalKeywords: parsed.functionalKeywords || 'Efficient, Reliable, User-Friendly',
      primaryColors: parsed.primaryColors || 'Deep Blue #1a365d',
      secondaryColors: parsed.secondaryColors || 'Light Gray #e2e8f0',
      accentColors: parsed.accentColors || 'Bright Orange #ed8936',
      preferredLogoStyle: parsed.preferredLogoStyle || 'Modern Minimalist',
      brandArchetype: parsed.brandArchetype || 'The Creator',
      composition: parsed.composition || 'Icon left, text right',
      targetAudience: parsed.targetAudience || 'Professionals and businesses seeking quality solutions',
      keyTagline: parsed.keyTagline || `Innovative solutions by ${parsed.businessName || 'us'}`,
      missionStatement: parsed.missionStatement || `To provide exceptional products and services that solve real problems for our customers.`,
      brandPillars: parsed.brandPillars || 'Quality, Innovation, Customer-First',
    };
  } catch (error) {
    console.error('[AutoFill] Parse error:', error);
    console.error('[AutoFill] Raw content:', content);
    
    // Return fallback values
    return {
      aestheticKeywords: 'Modern, Professional, Clean',
      emotionalKeywords: 'Trustworthy, Innovative, Approachable',
      functionalKeywords: 'Efficient, Reliable, User-Friendly',
      primaryColors: 'Deep Blue #1a365d',
      secondaryColors: 'Light Gray #e2e8f0',
      accentColors: 'Bright Orange #ed8936',
      preferredLogoStyle: 'Modern Minimalist',
      brandArchetype: 'The Creator',
      composition: 'Icon left, text right',
      targetAudience: 'Professionals and businesses seeking quality solutions',
      keyTagline: 'Innovative solutions that drive results',
      missionStatement: 'To provide exceptional products and services that solve real problems for our customers.',
      brandPillars: 'Quality, Innovation, Customer-First',
    };
  }
}
