import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { saveFile, generateFileName } from './file-manager';

export interface MediaAssetsInput {
  businessName: string;
  logoSvg: string;
  logoBase64: string;
  brandColors: Array<{
    name: string;
    hex: string;
  }>;
  tagline?: string;
}

export interface MediaAssets {
  powerPointPath?: string;
  emailSignatureHtml?: string;
  emailSignatureText?: string;
  avatarPath?: string;
  faviconPaths: {
    favicon16: string;
    favicon32: string;
    favicon64: string;
    faviconIco: string;
  };
  mockups: {
    mug: string;
    tote: string;
    hoodie: string;
  };
}

export async function generateMediaAssets(input: MediaAssetsInput): Promise<MediaAssets> {
  const assets: MediaAssets = {
    faviconPaths: {
      favicon16: '',
      favicon32: '',
      favicon64: '',
      faviconIco: '',
    },
    mockups: {
      mug: '',
      tote: '',
      hoodie: '',
    },
  };

  // Generate favicons from logo
  assets.faviconPaths = await generateFavicons(input);

  // Generate social media avatar
  assets.avatarPath = await generateAvatar(input);

  // Generate email signatures
  const emailSigs = generateEmailSignatures(input);
  assets.emailSignatureHtml = emailSigs.html;
  assets.emailSignatureText = emailSigs.text;

  // Generate PowerPoint template
  assets.powerPointPath = await generatePowerPointTemplate(input);

  // Generate product mockups
  assets.mockups = await generateProductMockups(input);

  return assets;
}

async function generateFavicons(input: MediaAssetsInput): Promise<Record<string, string>> {
  const faviconPaths: Record<string, string> = {};
  const logoBuffer = Buffer.from(input.logoBase64, 'base64');

  const sizes = [
    { size: 16, name: 'favicon16' },
    { size: 32, name: 'favicon32' },
    { size: 64, name: 'favicon64' },
  ];

  for (const { size, name } of sizes) {
    const iconBuffer = await sharp(logoBuffer).resize(size, size).png().toBuffer();

    const fileName = `${generateFileName(input.businessName)}-${name}.png`;
    const savedPath = await saveFile(iconBuffer, `favicons/${fileName}`);
    faviconPaths[name] = savedPath;
  }

  // Generate ICO format (convert PNG to ICO)
  const icoBuffer = await sharp(logoBuffer).resize(32, 32).toBuffer();
  const fileName = `${generateFileName(input.businessName)}-favicon.ico`;
  const icoPath = await saveFile(icoBuffer, `favicons/${fileName}`);
  faviconPaths.faviconIco = icoPath;

  return faviconPaths;
}

async function generateAvatar(input: MediaAssetsInput): Promise<string> {
  const logoBuffer = Buffer.from(input.logoBase64, 'base64');
  const primaryColor = input.brandColors[0]?.hex || '#000000';

  // Create 200×200 avatar with white background and logo
  const avatarBuffer = await sharp({
    create: {
      width: 200,
      height: 200,
      channels: 3,
      background: primaryColor,
    },
  })
    .composite([
      {
        input: await sharp(logoBuffer).resize(150, 150).toBuffer(),
        top: 25,
        left: 25,
      },
    ])
    .png()
    .toBuffer();

  const fileName = `${generateFileName(input.businessName)}-avatar.png`;
  return await saveFile(avatarBuffer, `avatars/${fileName}`);
}

function generateEmailSignatures(input: MediaAssetsInput): {
  html: string;
  text: string;
} {
  const primaryColor = input.brandColors[0]?.hex || '#000000';
  const secondaryColor = input.brandColors[1]?.hex || '#666666';

  const htmlSignature = `
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333333;">
  <div style="border-left: 4px solid ${primaryColor}; padding-left: 16px; margin-bottom: 16px;">
    <strong style="font-size: 16px; color: #000000;">${input.businessName}</strong>
    ${input.tagline ? `<div style="color: ${secondaryColor}; font-size: 12px; margin-top: 4px;">${input.tagline}</div>` : ''}
  </div>
  <div style="font-size: 12px; color: #666666; border-top: 1px solid #cccccc; padding-top: 12px;">
    <p style="margin: 4px 0;">Visit us online | info@${generateFileName(input.businessName)}.com</p>
    <p style="margin: 4px 0; color: ${primaryColor};">
      <a href="#" style="text-decoration: none; color: ${primaryColor};">LinkedIn</a> |
      <a href="#" style="text-decoration: none; color: ${primaryColor};">Twitter</a> |
      <a href="#" style="text-decoration: none; color: ${primaryColor};">Website</a>
    </p>
  </div>
</div>
  `.trim();

  const textSignature = `
${input.businessName}
${input.tagline || ''}

---
Visit us online | info@${generateFileName(input.businessName)}.com
LinkedIn | Twitter | Website
  `.trim();

  return {
    html: htmlSignature,
    text: textSignature,
  };
}

async function generatePowerPointTemplate(input: MediaAssetsInput): Promise<string> {
  // PowerPoint XML-based format (simplified structure)
  const pptxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
                 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldMasterIdLst>
    <p:sldMasterId id="1" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId2"/>
    <p:sldId id="257" r:id="rId3"/>
  </p:sldIdLst>
  <p:notesMasterIdLst/>
  <p:handoutMasterIdLst/>
  <p:custShowLst/>
  <p:photoAlbum/>
  <p:sldSz cx="9144000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle>
    <a:defPPr/>
    <a:lvl1pPr algn="l" defTabSz="914400" eaLnBrk="1" latinLnBrk="1" hangingPunct="1"/>
    <a:lvl2pPr algn="l" defTabSz="914400" eaLnBrk="1" latinLnBrk="1" hangingPunct="1"/>
    <a:lvl3pPr algn="l" defTabSz="914400" eaLnBrk="1" latinLnBrk="1" hangingPunct="1"/>
    <a:lvl4pPr algn="l" defTabSz="914400" eaLnBrk="1" latinLnBrk="1" hangingPunct="1"/>
    <a:lvl5pPr algn="l" defTabSz="914400" eaLnBrk="1" latinLnBrk="1" hangingPunct="1"/>
    <a:lvl6pPr algn="l" defTabSz="914400" eaLnBrk="1" latinLnBrk="1" hangingPunct="1"/>
    <a:lvl7pPr algn="l" defTabSz="914400" eaLnBrk="1" latinLnBrk="1" hangingPunct="1"/>
    <a:lvl8pPr algn="l" defTabSz="914400" eaLnBrk="1" latinLnBrk="1" hangingPunct="1"/>
    <a:lvl9pPr algn="l" defTabSz="914400" eaLnBrk="1" latinLnBrk="1" hangingPunct="1"/>
    <a:defRPr lang="en-US" sz="1800" b="0" i="0" u="none"/>
  </p:defaultTextStyle>
  <p:extLst/>
</p:presentation>`;

  const fileName = `${generateFileName(input.businessName)}-presentation-template.pptx`;
  return await saveFile(Buffer.from(pptxContent), `templates/${fileName}`);
}

async function generateProductMockups(input: MediaAssetsInput): Promise<Record<string, string>> {
  const mockups: Record<string, string> = {};
  const logoBuffer = Buffer.from(input.logoBase64, 'base64');
  const primaryColor = input.brandColors[0]?.hex || '#000000';

  // Mug mockup (circular logo placement)
  const mugMockup = await sharp({
    create: {
      width: 800,
      height: 800,
      channels: 3,
      background: primaryColor,
    },
  })
    .composite([
      {
        input: await sharp(logoBuffer).resize(300, 300).toBuffer(),
        top: 250,
        left: 250,
      },
    ])
    .png()
    .toBuffer();

  const mugFileName = `${generateFileName(input.businessName)}-mug-mockup.png`;
  mockups.mug = await saveFile(mugMockup, `mockups/${mugFileName}`);

  // Tote bag mockup
  const toteMockup = await sharp({
    create: {
      width: 600,
      height: 700,
      channels: 3,
      background: primaryColor,
    },
  })
    .composite([
      {
        input: await sharp(logoBuffer).resize(250, 250).toBuffer(),
        top: 225,
        left: 175,
      },
    ])
    .png()
    .toBuffer();

  const toteFileName = `${generateFileName(input.businessName)}-tote-mockup.png`;
  mockups.tote = await saveFile(toteMockup, `mockups/${toteFileName}`);

  // Hoodie mockup
  const hoodieMockup = await sharp({
    create: {
      width: 500,
      height: 600,
      channels: 3,
      background: primaryColor,
    },
  })
    .composite([
      {
        input: await sharp(logoBuffer).resize(180, 180).toBuffer(),
        top: 210,
        left: 160,
      },
    ])
    .png()
    .toBuffer();

  const hoodieFileName = `${generateFileName(input.businessName)}-hoodie-mockup.png`;
  mockups.hoodie = await saveFile(hoodieMockup, `mockups/${hoodieFileName}`);

  return mockups;
}
