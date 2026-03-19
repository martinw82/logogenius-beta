/**
 * Test PDF Render Script
 * 
 * Usage:
 *   npx tsx scripts/test-pdf-render.ts [archetype]
 * 
 * Examples:
 *   npx tsx scripts/test-pdf-render.ts "The Hero"
 *   npx tsx scripts/test-pdf-render.ts "The Creator"
 *   npx tsx scripts/test-pdf-render.ts "The Innocent"
 * 
 * This script generates a test PDF cover page using the Puppeteer PDF generator.
 * It's useful for testing the archetype-based asset selection and template rendering.
 */

import path from 'path';
import { promises as fs } from 'fs';
import { getRandomBrandAssets } from '../src/lib/services/brand-assets';
import { createMockPDFData, transformOrderDataToPDFData } from '../src/lib/services/pdf-data-transformer';
import { generateCoverPagePDF, saveHTMLPreview } from '../src/lib/services/pdf-generator-puppeteer';

// Ensure output directory exists
const OUTPUT_DIR = path.join(process.cwd(), 'test-output');

async function ensureOutputDir() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

async function testCover() {
  const archetype = process.argv[2] || 'The Hero';
  const orderId = Date.now();
  
  console.log(`🎨 Testing PDF generation for archetype: ${archetype}`);
  console.log(`📝 Order ID: ${orderId}`);
  
  try {
    await ensureOutputDir();
    
    // Get brand assets for the archetype
    const brandAssets = await getRandomBrandAssets(archetype, orderId);
    console.log('📦 Selected assets:', {
      pack: brandAssets.packName,
      texture: brandAssets.selectedTexture,
      accent: brandAssets.selectedAccent,
      opacity: brandAssets.accentOpacity + '%',
      rotation: brandAssets.accentRotation + '°',
      side: brandAssets.accentSide,
    });
    
    // Create mock data
    const mockData = createMockPDFData(archetype);
    
    // Transform to full PDF data
    const pdfData = transformOrderDataToPDFData(
      {
        ...mockData,
        brandArchetype: archetype,
      } as any,
      null, // No logo SVG for test
      {}, // No mockups
      {}, // No social assets
      brandAssets,
      orderId,
      'test@example.com'
    );
    
    // Generate HTML preview
    const htmlPath = path.join(OUTPUT_DIR, `test-cover-${brandAssets.packName}.html`);
    await saveHTMLPreview(pdfData, htmlPath);
    console.log(`💾 HTML preview saved: ${htmlPath}`);
    
    // Generate PDF
    console.log('⏳ Generating PDF...');
    const pdfBuffer = await generateCoverPagePDF(pdfData, {
      headless: true,
      assetsBaseUrl: `file://${path.join(process.cwd(), 'assets')}`,
    });
    
    // Save PDF
    const pdfPath = path.join(OUTPUT_DIR, `test-cover-${brandAssets.packName}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);
    console.log(`✅ Test PDF created: ${pdfPath}`);
    console.log(`📊 File size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
    
    console.log('\n🎉 Test complete! Open the PDF to see the results.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testCover();
