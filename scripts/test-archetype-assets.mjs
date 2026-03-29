/**
 * Test Puppeteer PDF with archetype brand assets
 * 
 * Tests that SVG brand assets (textures, accents, patterns) render in the PDF.
 */

import puppeteer from 'puppeteer-core';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';

const CHROME_PATH = process.env.CHROMIUM_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function svgToDataUri(filePath) {
  const svg = readFileSync(filePath, 'utf8');
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

async function testArchetypeAssets() {
  console.log('[test] Loading Creator archetype assets...');
  
  const packPath = path.join(process.cwd(), 'assets', 'visionary-innovation');
  
  const [texture1, texture2, accent1, pattern1] = await Promise.all([
    svgToDataUri(path.join(packPath, 'textures', 'hex-grid.svg')),
    svgToDataUri(path.join(packPath, 'textures', 'circuit-dots.svg')),
    svgToDataUri(path.join(packPath, 'accents', 'crystal-shard.svg')),
    svgToDataUri(path.join(packPath, 'patterns', 'pat-hex-visionary.svg')),
  ]);
  
  console.log('[test] Assets loaded:');
  console.log('  - texture1 (hex-grid):', texture1.length, 'chars');
  console.log('  - texture2 (circuit-dots):', texture2.length, 'chars');
  console.log('  - accent1 (crystal-shard):', accent1.length, 'chars');
  console.log('  - pattern1 (pat-hex):', pattern1.length, 'chars');
  
  const start = Date.now();
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--single-process',
    ],
    timeout: 15000,
  });
  
  const page = await browser.newPage();
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #1a1a2e; }
    
    .cover {
      height: 100vh;
      position: relative;
      background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    
    .cover .texture-bg {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: url('${texture1}');
      background-size: 200px;
      opacity: 0.15;
    }
    
    .cover .accent {
      position: absolute;
      bottom: -20px;
      right: -20px;
      width: 300px;
      height: 300px;
      background-image: url('${accent1}');
      background-size: contain;
      background-repeat: no-repeat;
      opacity: 0.2;
      transform: rotate(-15deg);
    }
    
    .cover h1 {
      font-family: Georgia, serif;
      font-size: 64px;
      letter-spacing: 6px;
      z-index: 1;
      margin-bottom: 16px;
    }
    
    .cover .archetype-badge {
      z-index: 1;
      font-size: 14px;
      letter-spacing: 3px;
      text-transform: uppercase;
      border: 1px solid rgba(255,255,255,0.4);
      padding: 10px 24px;
      margin-top: 24px;
    }
    
    .assets-showcase {
      padding: 60px;
      page-break-before: always;
    }
    
    .assets-showcase h2 {
      font-family: Georgia, serif;
      font-size: 36px;
      color: #8B5CF6;
      margin-bottom: 40px;
    }
    
    .asset-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    
    .asset-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .asset-card .preview {
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9fafb;
    }
    
    .asset-card .preview img {
      max-width: 100%;
      max-height: 100%;
    }
    
    .asset-card .label {
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .pattern-page {
      padding: 60px;
      page-break-before: always;
    }
    
    .pattern-page h2 {
      font-family: Georgia, serif;
      font-size: 36px;
      color: #8B5CF6;
      margin-bottom: 40px;
    }
    
    .pattern-strip {
      height: 200px;
      background-image: url('${pattern1}');
      background-size: 150px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    
    .texture-strip {
      height: 150px;
      background-image: url('${texture2}');
      background-size: 100px;
      background-color: #8B5CF6;
      border-radius: 12px;
      opacity: 0.3;
    }
  </style>
</head>
<body>
  <div class="cover">
    <div class="texture-bg"></div>
    <div class="accent"></div>
    <h1>MOCKUP TEST</h1>
    <div class="archetype-badge">The Creator</div>
  </div>
  
  <div class="assets-showcase">
    <h2>Brand Assets</h2>
    <div class="asset-grid">
      <div class="asset-card">
        <div class="preview"><img src="${texture1}" /></div>
        <div class="label">Texture — Hex Grid</div>
      </div>
      <div class="asset-card">
        <div class="preview"><img src="${texture2}" /></div>
        <div class="label">Texture — Circuit Dots</div>
      </div>
      <div class="asset-card">
        <div class="preview"><img src="${accent1}" /></div>
        <div class="label">Accent — Crystal Shard</div>
      </div>
      <div class="asset-card">
        <div class="preview"><img src="${pattern1}" /></div>
        <div class="label">Pattern — Hex Visionary</div>
      </div>
    </div>
  </div>
  
  <div class="pattern-page">
    <h2>Pattern Application</h2>
    <div class="pattern-strip"></div>
    <div class="texture-strip"></div>
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  
  const totalMs = Date.now() - start;
  const pdfSizeKb = Math.round(pdfBuffer.length / 1024);
  
  writeFileSync('test-output-creator-assets.pdf', pdfBuffer);
  
  console.log(`[test] PDF generated: ${pdfSizeKb}KB in ${totalMs}ms`);
  console.log(`[test] Saved to: test-output-creator-assets.pdf`);
  
  // Verify SVGs rendered (check PDF contains image data)
  const pdfStr = pdfBuffer.toString('latin1');
  const imageCount = (pdfStr.match(/\/Subtype\s*\/Image/g) || []).length;
  console.log(`[test] Images in PDF: ${imageCount}`);
  
  if (imageCount >= 4) {
    console.log('[test] ✓ PASS: All brand assets appear in PDF');
  } else {
    console.log(`[test] ⚠ WARNING: Expected >= 4 images, found ${imageCount}`);
  }
  
  await browser.close();
  
  return { pdfSizeKb, totalMs, imageCount };
}

testArchetypeAssets()
  .then(result => {
    console.log('\n=== RESULTS ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('[test] ERROR:', err.message);
    process.exit(1);
  });
