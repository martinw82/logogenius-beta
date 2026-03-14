/**
 * Mockup Generator - Placeholder Implementation
 * 
 * NOTE: Full implementation requires Puppeteer which has native dependencies
 * that don't work on Vercel. For now, this returns placeholder mockups.
 * 
 * TODO: Implement using external API (Cloudinary, Bannerbear) or serverless function
 */

export type MockupTemplate = 'letterhead' | 'businesscard' | 'tshirt';

export interface MockupOptions {
  logoUrl: string;
  businessName: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate mockup - PLACEHOLDER
 * Returns a placeholder image URL
 */
export async function generateMockup(
  template: MockupTemplate,
  options: MockupOptions
): Promise<string> {
  console.log(`[Mockup] Placeholder generation for ${template}`);
  
  // Return a colored placeholder with text
  // In production, this would call an external API or serverless function
  const colors: Record<MockupTemplate, string> = {
    businesscard: '3b82f6', // blue
    letterhead: '10b981',   // green
    tshirt: '8b5cf6',       // purple
  };
  
  const labels: Record<MockupTemplate, string> = {
    businesscard: 'Business+Card',
    letterhead: 'Letterhead',
    tshirt: 'T-Shirt',
  };
  
  // Use placehold.co for placeholder images
  return `https://placehold.co/600x400/${colors[template]}/white?text=${labels[template]}: ${encodeURIComponent(options.businessName)}`;
}

/**
 * Generate all mockups - PLACEHOLDER
 */
export async function generateAllMockups(
  options: MockupOptions
): Promise<Record<MockupTemplate, string>> {
  const templates: MockupTemplate[] = ['businesscard', 'letterhead', 'tshirt'];
  const results: Partial<Record<MockupTemplate, string>> = {};

  for (const template of templates) {
    try {
      results[template] = await generateMockup(template, options);
    } catch (error) {
      console.error(`[Mockup] Failed to generate ${template}:`, error);
    }
  }

  return results as Record<MockupTemplate, string>;
}

/**
 * Test function
 */
export async function testMockupGeneration(): Promise<void> {
  const testOptions: MockupOptions = {
    logoUrl: 'https://via.placeholder.com/200',
    businessName: 'Test Company',
    tagline: 'Innovation First',
    primaryColor: '#0a192f',
    secondaryColor: '#f4a261',
  };

  console.log('[Mockup Test] Starting...');
  
  const businessCard = await generateMockup('businesscard', testOptions);
  console.log('[Mockup Test] Generated:', businessCard);
}
