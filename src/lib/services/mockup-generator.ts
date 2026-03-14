/**
 * FREE Mockup Generator - HTML/CSS Templates
 * 
 * NO AI COST! Uses Puppeteer to render HTML templates and overlay logos.
 * Cost: $0 per mockup (just compute time)
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export type MockupTemplate = 'letterhead' | 'businesscard' | 'tshirt';

export interface MockupOptions {
  logoUrl: string;
  businessName: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * HTML Template: Business Card
 */
function getBusinessCardTemplate(options: MockupOptions): string {
  const { businessName, tagline, primaryColor = '#0a192f', secondaryColor = '#f4a261' } = options;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      width: 600px; 
      height: 350px; 
      background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    .card {
      width: 500px;
      height: 280px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      display: flex;
      overflow: hidden;
    }
    .left {
      width: 40%;
      background: ${primaryColor};
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px;
    }
    .logo {
      max-width: 100%;
      max-height: 150px;
      filter: brightness(0) invert(1);
    }
    .right {
      width: 60%;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .company {
      font-size: 28px;
      font-weight: 700;
      color: ${primaryColor};
      margin-bottom: 8px;
    }
    .tagline {
      font-size: 14px;
      color: #666;
      margin-bottom: 20px;
    }
    .contact {
      font-size: 12px;
      color: #999;
      line-height: 1.8;
    }
    .accent {
      color: ${secondaryColor};
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="left">
      <img class="logo" src="${options.logoUrl}" alt="Logo" />
    </div>
    <div class="right">
      <div class="company">${businessName}</div>
      <div class="tagline">${tagline || 'Your tagline here'}</div>
      <div class="contact">
        <span class="accent">www.</span>${businessName.toLowerCase().replace(/\s+/g, '')}.com<br>
        <span class="accent">hello@</span>${businessName.toLowerCase().replace(/\s+/g, '')}.com
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * HTML Template: Letterhead
 */
function getLetterheadTemplate(options: MockupOptions): string {
  const { businessName, primaryColor = '#0a192f' } = options;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      width: 800px; 
      height: 1100px; 
      background: white;
      font-family: 'Georgia', serif;
    }
    .header {
      padding: 60px 80px;
      border-bottom: 3px solid ${primaryColor};
      display: flex;
      align-items: center;
      gap: 30px;
    }
    .logo {
      height: 80px;
      max-width: 200px;
    }
    .company {
      font-size: 32px;
      font-weight: 700;
      color: ${primaryColor};
    }
    .content {
      padding: 60px 80px;
    }
    .date {
      color: #666;
      margin-bottom: 30px;
    }
    .salutation {
      font-weight: 600;
      margin-bottom: 20px;
    }
    .body {
      line-height: 1.8;
      color: #333;
      margin-bottom: 20px;
    }
    .signature {
      margin-top: 60px;
    }
    .footer {
      position: absolute;
      bottom: 40px;
      left: 80px;
      right: 80px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <img class="logo" src="${options.logoUrl}" alt="Logo" />
    <div class="company">${businessName}</div>
  </div>
  <div class="content">
    <div class="date">March 14, 2026</div>
    <div class="salutation">Dear Valued Partner,</div>
    <div class="body">
      Thank you for your interest in ${businessName}. We are excited to 
      collaborate with you on this project. Our team is dedicated to delivering 
      exceptional results that exceed your expectations.
    </div>
    <div class="body">
      Please find attached our proposal and timeline. We look forward to 
      discussing this further.
    </div>
    <div class="signature">
      Best regards,<br>
      <strong>The ${businessName} Team</strong>
    </div>
  </div>
  <div class="footer">
    ${businessName} | www.${businessName.toLowerCase().replace(/\s+/g, '')}.com | hello@${businessName.toLowerCase().replace(/\s+/g, '')}.com
  </div>
</body>
</html>
  `;
}

/**
 * HTML Template: T-Shirt
 */
function getTShirtTemplate(options: MockupOptions): string {
  const { businessName, primaryColor = '#333' } = options;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      width: 600px; 
      height: 700px; 
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
    }
    .scene {
      position: relative;
      width: 400px;
      height: 500px;
    }
    .shirt {
      width: 100%;
      height: 100%;
      background: ${primaryColor};
      border-radius: 20px 20px 10px 10px;
      box-shadow: 
        0 40px 80px rgba(0,0,0,0.2),
        inset 0 -20px 40px rgba(0,0,0,0.1);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 80px;
    }
    .collar {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 60px;
      background: ${primaryColor};
      border-radius: 0 0 60px 60px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    .logo-container {
      width: 200px;
      height: 200px;
      background: rgba(255,255,255,0.95);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .logo {
      max-width: 160px;
      max-height: 160px;
    }
    .brand-text {
      margin-top: 30px;
      color: white;
      font-size: 24px;
      font-weight: 600;
      text-align: center;
    }
    .shadow {
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      height: 40px;
      background: rgba(0,0,0,0.15);
      border-radius: 50%;
      filter: blur(10px);
    }
  </style>
</head>
<body>
  <div class="scene">
    <div class="shirt">
      <div class="collar"></div>
      <div class="logo-container">
        <img class="logo" src="${options.logoUrl}" alt="Logo" />
      </div>
      <div class="brand-text">${businessName}</div>
    </div>
    <div class="shadow"></div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate mockup from template
 * COST: $0 (just Puppeteer/Chrome compute)
 */
export async function generateMockup(
  template: MockupTemplate,
  options: MockupOptions
): Promise<string> {
  console.log(`[Mockup] Generating ${template} for ${options.businessName}`);

  // Get HTML template
  let html: string;
  switch (template) {
    case 'businesscard':
      html = getBusinessCardTemplate(options);
      break;
    case 'letterhead':
      html = getLetterheadTemplate(options);
      break;
    case 'tshirt':
      html = getTShirtTemplate(options);
      break;
    default:
      throw new Error(`Unknown template: ${template}`);
  }

  // Launch headless browser
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      encoding: 'base64',
    });

    return `data:image/png;base64,${screenshot}`;
  } finally {
    await browser.close();
  }
}

/**
 * Generate all mockups for a logo variant
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
 * Quick test function
 */
export async function testMockupGeneration(): Promise<void> {
  const testOptions: MockupOptions = {
    logoUrl: 'https://via.placeholder.com/200x200/0a192f/fff?text=LOGO',
    businessName: 'Test Company',
    tagline: 'Innovation First',
    primaryColor: '#0a192f',
    secondaryColor: '#f4a261',
  };

  console.log('[Mockup Test] Starting...');
  
  const businessCard = await generateMockup('businesscard', testOptions);
  console.log('[Mockup Test] Business card generated:', businessCard.substring(0, 50) + '...');
}
