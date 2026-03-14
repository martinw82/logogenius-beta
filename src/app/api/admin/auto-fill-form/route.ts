import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * API route for form auto-fill using Google Gemini
 * POST /api/admin/auto-fill-form
 * Body: { businessName: string, industry: string }
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
    const { businessName, industry } = body;

    if (!businessName || !industry) {
      return NextResponse.json(
        { error: 'Business name and industry are required' },
        { status: 400 }
      );
    }

    // Get Google API key from environment
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    console.log(`[AutoFill] Generating brand details for: ${businessName} (${industry})`);

    // Call Google Gemini API directly
    const prompt = buildPrompt(businessName, industry);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AutoFill] Gemini API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate brand details' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    const result = parseResponse(content);
    
    console.log('[AutoFill] Generated successfully');
    
    return NextResponse.json(result);

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

function buildPrompt(businessName: string, industry: string): string {
  return `You are an expert brand strategist. Create comprehensive brand details for a business.

BUSINESS INFORMATION:
- Name: ${businessName}
- Industry: ${industry}

Generate the following brand elements. Be specific, professional, and creative.

AVAILABLE OPTIONS:
Logo Styles: Modern Minimalist, Vintage/Retro, Hand-drawn/Organic, Geometric, Typography-focused, Mascot/Character, Abstract, Emblem/Badge

Brand Archetypes: The Innovator, The Caregiver, The Hero, The Explorer, The Creator, The Ruler, The Magician, The Lover, The Jester, The Sage, The Outlaw, The Innocent

Compositions: Icon left text right, Icon above text below, Icon only, Text only, Icon right text left, Integrated icon in text

REQUIRED OUTPUT - Return ONLY this JSON structure:
{
  "aestheticKeywords": "3 visual descriptors (e.g., Modern, Minimalist, Premium)",
  "emotionalKeywords": "3 emotional descriptors (e.g., Trustworthy, Innovative, Friendly)",
  "functionalKeywords": "3 functional descriptors (e.g., Fast, Reliable, Efficient)",
  "primaryColors": "1-2 primary colors with hex codes (e.g., Deep Blue #1a365d)",
  "secondaryColors": "1-2 secondary colors with hex codes (e.g., Light Gray #e2e8f0)",
  "accentColors": "1 accent color with hex code (e.g., Bright Orange #ed8936)",
  "preferredLogoStyle": "ONE from the available logo styles list",
  "brandArchetype": "ONE from the available brand archetypes list",
  "composition": "ONE from the available compositions list",
  "targetAudience": "Brief target audience description",
  "keyTagline": "Catchy tagline (5-8 words)",
  "missionStatement": "Mission statement (1-2 sentences, 20-30 words)",
  "brandPillars": "3-5 comma-separated values (e.g., Innovation, Integrity, Excellence)"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations, no code blocks.`;
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
