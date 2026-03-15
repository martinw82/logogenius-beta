import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_API_KEY not set' }, { status: 500 });
  }

  try {
    // Try v1beta first
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ 
        error: 'Failed to list models',
        status: response.status,
        details: error
      }, { status: 500 });
    }

    const data = await response.json();
    
    // Filter for Gemini models only
    const geminiModels = data.models?.filter((m: any) => 
      m.name?.includes('gemini')
    ) || [];

    return NextResponse.json({
      totalModels: data.models?.length || 0,
      geminiModels: geminiModels.map((m: any) => ({
        name: m.name,
        displayName: m.displayName,
        supportedGenerationMethods: m.supportedGenerationMethods,
      })),
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Exception occurred',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
