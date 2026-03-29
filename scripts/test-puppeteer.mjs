/**
 * Full Puppeteer PDF Test - Brand Guide Template
 * 
 * Tests Chrome launch + branded PDF generation without needing Next.js.
 */

import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'fs';

const CHROME_PATH = process.env.CHROMIUM_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testPdfGeneration() {
  console.log('[test] Starting Puppeteer PDF test...');
  console.log(`[test] Chrome path: ${CHROME_PATH}`);
  
  const start = Date.now();
  
  // Launch Chrome
  console.log('[test] Launching Chrome...');
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
  
  const launchMs = Date.now() - start;
  console.log(`[test] Chrome launched in ${launchMs}ms`);
  
  const page = await browser.newPage();
  
  // Sample HTML for brand guide (no external font imports to avoid timeout)
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #1a1a2e;
    }
    
    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #2563EB 0%, #1e40af 100%);
      color: white;
      text-align: center;
    }
    
    .cover h1 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 72px;
      letter-spacing: 8px;
      margin-bottom: 16px;
    }
    
    .cover .tagline {
      font-size: 24px;
      font-weight: 300;
      letter-spacing: 4px;
      text-transform: uppercase;
      opacity: 0.9;
    }
    
    .cover .archetype {
      margin-top: 40px;
      font-size: 14px;
      letter-spacing: 3px;
      text-transform: uppercase;
      border-top: 1px solid rgba(255,255,255,0.3);
      border-bottom: 1px solid rgba(255,255,255,0.3);
      padding: 12px 24px;
    }
    
    .colors-page {
      padding: 60px;
      page-break-before: always;
    }
    
    .colors-page h2 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 36px;
      margin-bottom: 40px;
      color: #2563EB;
    }
    
    .swatch-row {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .swatch {
      width: 120px;
      height: 120px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .swatch-info {
      margin-top: 8px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .typography-page {
      padding: 60px;
      page-break-before: always;
    }
    
    .typography-page h2 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 36px;
      margin-bottom: 40px;
      color: #2563EB;
    }
    
    .font-specimen {
      margin-bottom: 32px;
    }
    
    .font-specimen .label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .font-specimen .sample-heading {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 48px;
      color: #1a1a2e;
    }
    
    .font-specimen .sample-body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #4a4a6a;
      max-width: 600px;
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>TEST BRAND CO</h1>
    <div class="tagline">Testing Puppeteer PDF</div>
    <div class="archetype">The Hero</div>
  </div>
  
  <div class="colors-page">
    <h2>Color Palette</h2>
    <div class="swatch-row">
      <div>
        <div class="swatch" style="background: #2563EB;"></div>
        <div class="swatch-info">Primary<br>#2563EB</div>
      </div>
      <div>
        <div class="swatch" style="background: #10B981;"></div>
        <div class="swatch-info">Secondary<br>#10B981</div>
      </div>
      <div>
        <div class="swatch" style="background: #F59E0B;"></div>
        <div class="swatch-info">Accent<br>#F59E0B</div>
      </div>
    </div>
  </div>
  
  <div class="typography-page">
    <h2>Typography</h2>
    <div class="font-specimen">
      <div class="label">Heading Font — Playfair Display</div>
      <div class="sample-heading">The Quick Brown Fox</div>
    </div>
    <div class="font-specimen">
      <div class="label">Body Font — Inter</div>
      <div class="sample-body">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
      </div>
    </div>
  </div>
</body>
</html>`;

  // Set HTML content (using domcontentloaded instead of networkidle0 to avoid font timeout)
  console.log('[test] Setting HTML content...');
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  
  const htmlMs = Date.now() - start - launchMs;
  console.log(`[test] HTML rendered in ${htmlMs}ms`);
  
  // Generate PDF
  console.log('[test] Generating PDF...');
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  
  const totalMs = Date.now() - start;
  const pdfSizeKb = Math.round(pdfBuffer.length / 1024);
  
  console.log(`[test] PDF size: ${pdfSizeKb}KB`);
  console.log(`[test] Total time: ${totalMs}ms`);
  
  // Save PDF
  const outputPath = 'test-output-phase4.pdf';
  writeFileSync(outputPath, pdfBuffer);
  console.log(`[test] PDF saved to: ${outputPath}`);
  
  // Verify
  if (pdfSizeKb > 10) {
    console.log('[test] ✓ PASS: PDF is > 10KB');
  } else {
    console.log(`[test] ✗ FAIL: PDF is only ${pdfSizeKb}KB (expected > 10KB)`);
  }
  
  await browser.close();
  console.log('[test] Browser closed');
  
  return { pdfSizeKb, totalMs, launchMs };
}

testPdfGeneration()
  .then(result => {
    console.log('\n=== TEST RESULTS ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('[test] ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
