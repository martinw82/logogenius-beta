/**
 * FREE Social Media Asset Generator
 * 
 * Uses HTML5 Canvas (Node.js) to generate social media images
 * NO AI COST! Just compute.
 * 
 * Templates for: Instagram, Facebook, Twitter, LinkedIn, YouTube, Pinterest, TikTok
 */

import { createCanvas, loadImage, Canvas } from 'canvas';

export type SocialPlatform = 
  | 'instagram-post'      // 1080×1080
  | 'instagram-story'     // 1080×1920
  | 'facebook-cover'      // 820×312
  | 'twitter-header'      // 1500×500
  | 'linkedin-banner'     // 1584×396
  | 'youtube-thumbnail'   // 1280×720
  | 'pinterest-pin'       // 1000×1500
  | 'tiktok-cover'        // 1080×1920
  | 'email-header'        // 600×200
  | 'website-hero';       // 1920×1080

export interface SocialAssetOptions {
  logoUrl: string;
  businessName: string;
  tagline?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
}

interface PlatformSpec {
  width: number;
  height: number;
  name: string;
}

const PLATFORM_SPECS: Record<SocialPlatform, PlatformSpec> = {
  'instagram-post': { width: 1080, height: 1080, name: 'Instagram Post' },
  'instagram-story': { width: 1080, height: 1920, name: 'Instagram Story' },
  'facebook-cover': { width: 820, height: 312, name: 'Facebook Cover' },
  'twitter-header': { width: 1500, height: 500, name: 'Twitter Header' },
  'linkedin-banner': { width: 1584, height: 396, name: 'LinkedIn Banner' },
  'youtube-thumbnail': { width: 1280, height: 720, name: 'YouTube Thumbnail' },
  'pinterest-pin': { width: 1000, height: 1500, name: 'Pinterest Pin' },
  'tiktok-cover': { width: 1080, height: 1920, name: 'TikTok Cover' },
  'email-header': { width: 600, height: 200, name: 'Email Header' },
  'website-hero': { width: 1920, height: 1080, name: 'Website Hero' },
};

/**
 * Draw gradient background
 */
function drawGradient(
  ctx: any,
  width: number,
  height: number,
  color1: string,
  color2: string
): void {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw decorative pattern
 */
function drawPattern(ctx: any, width: number, height: number, color: string): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.1;
  
  // Draw diagonal lines
  for (let i = -height; i < width + height; i += 60) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
}

/**
 * Generate Instagram Post (Square)
 * Style: Centered logo with brand colors
 */
async function generateInstagramPost(options: SocialAssetOptions): Promise<string> {
  const { width, height } = PLATFORM_SPECS['instagram-post'];
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  drawGradient(ctx, width, height, options.primaryColor, options.secondaryColor);
  
  // Pattern overlay
  drawPattern(ctx, width, height, '#ffffff');
  
  // Load and draw logo
  const logo = await loadImage(options.logoUrl);
  const logoSize = 400;
  ctx.drawImage(logo, (width - logoSize) / 2, 200, logoSize, logoSize);
  
  // Business name
  ctx.font = 'bold 72px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(options.businessName, width / 2, 750);
  
  // Tagline
  if (options.tagline) {
    ctx.font = '36px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(options.tagline, width / 2, 820);
  }
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate Instagram Story (Vertical)
 * Style: Full-height with logo at top
 */
async function generateInstagramStory(options: SocialAssetOptions): Promise<string> {
  const { width, height } = PLATFORM_SPECS['instagram-story'];
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  drawGradient(ctx, width, height, options.primaryColor, options.secondaryColor);
  drawPattern(ctx, width, height, '#ffffff');
  
  const logo = await loadImage(options.logoUrl);
  const logoSize = 500;
  ctx.drawImage(logo, (width - logoSize) / 2, 500, logoSize, logoSize);
  
  ctx.font = 'bold 80px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(options.businessName, width / 2, 1200);
  
  if (options.tagline) {
    ctx.font = '40px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(options.tagline, width / 2, 1280);
  }
  
  // Swipe up indicator
  ctx.font = '32px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('👆 Swipe up to learn more', width / 2, 1750);
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate Facebook Cover (Wide)
 * Style: Logo left, text right
 */
async function generateFacebookCover(options: SocialAssetOptions): Promise<string> {
  const { width, height } = PLATFORM_SPECS['facebook-cover'];
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  drawGradient(ctx, width, height, options.primaryColor, options.secondaryColor);
  
  const logo = await loadImage(options.logoUrl);
  const logoSize = 200;
  ctx.drawImage(logo, 60, (height - logoSize) / 2, logoSize, logoSize);
  
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(options.businessName, 300, height / 2 - 10);
  
  if (options.tagline) {
    ctx.font = '24px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(options.tagline, 300, height / 2 + 30);
  }
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate Twitter Header
 */
async function generateTwitterHeader(options: SocialAssetOptions): Promise<string> {
  const { width, height } = PLATFORM_SPECS['twitter-header'];
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  drawGradient(ctx, width, height, options.primaryColor, options.secondaryColor);
  drawPattern(ctx, width, height, '#ffffff');
  
  const logo = await loadImage(options.logoUrl);
  const logoSize = 250;
  ctx.drawImage(logo, 100, (height - logoSize) / 2, logoSize, logoSize);
  
  ctx.font = 'bold 64px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(options.businessName, 400, height / 2 + 10);
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate LinkedIn Banner
 */
async function generateLinkedInBanner(options: SocialAssetOptions): Promise<string> {
  const { width, height } = PLATFORM_SPECS['linkedin-banner'];
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  drawGradient(ctx, width, height, options.primaryColor, options.secondaryColor);
  
  const logo = await loadImage(options.logoUrl);
  const logoSize = 200;
  ctx.drawImage(logo, 80, (height - logoSize) / 2, logoSize, logoSize);
  
  ctx.font = 'bold 56px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(options.businessName, 320, height / 2 + 15);
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate YouTube Thumbnail
 */
async function generateYouTubeThumbnail(options: SocialAssetOptions): Promise<string> {
  const { width, height } = PLATFORM_SPECS['youtube-thumbnail'];
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  drawGradient(ctx, width, height, options.primaryColor, options.secondaryColor);
  
  // Draw border
  ctx.strokeStyle = options.accentColor || '#ffffff';
  ctx.lineWidth = 20;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  const logo = await loadImage(options.logoUrl);
  const logoSize = 350;
  ctx.drawImage(logo, (width - logoSize) / 2, 150, logoSize, logoSize);
  
  ctx.font = 'bold 72px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(options.businessName, width / 2, 600);
  
  if (options.tagline) {
    ctx.font = '32px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(options.tagline, width / 2, 650);
  }
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate Pinterest Pin (Tall)
 */
async function generatePinterestPin(options: SocialAssetOptions): Promise<string> {
  const { width, height } = PLATFORM_SPECS['pinterest-pin'];
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  drawGradient(ctx, width, height, options.primaryColor, options.secondaryColor);
  drawPattern(ctx, width, height, '#ffffff');
  
  const logo = await loadImage(options.logoUrl);
  const logoSize = 400;
  ctx.drawImage(logo, (width - logoSize) / 2, 250, logoSize, logoSize);
  
  ctx.font = 'bold 72px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(options.businessName, width / 2, 850);
  
  if (options.tagline) {
    ctx.font = '36px Arial';
    ctx.fillText(options.tagline, width / 2, 920);
  }
  
  // Website
  ctx.font = '28px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const website = `www.${options.businessName.toLowerCase().replace(/\s+/g, '')}.com`;
  ctx.fillText(website, width / 2, 1050);
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate Email Header
 */
async function generateEmailHeader(options: SocialAssetOptions): Promise<string> {
  const { width, height } = PLATFORM_SPECS['email-header'];
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  drawGradient(ctx, width, height, options.primaryColor, options.secondaryColor);
  
  const logo = await loadImage(options.logoUrl);
  const logoHeight = 120;
  const aspectRatio = logo.width / logo.height;
  const logoWidth = logoHeight * aspectRatio;
  
  ctx.drawImage(logo, (width - logoWidth) / 2, (height - logoHeight) / 2, logoWidth, logoHeight);
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate Website Hero (Full HD)
 */
async function generateWebsiteHero(options: SocialAssetOptions): Promise<string> {
  const { width, height } = PLATFORM_SPECS['website-hero'];
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  drawGradient(ctx, width, height, options.primaryColor, options.secondaryColor);
  drawPattern(ctx, width, height, '#ffffff');
  
  const logo = await loadImage(options.logoUrl);
  const logoSize = 400;
  ctx.drawImage(logo, (width - logoSize) / 2, 250, logoSize, logoSize);
  
  ctx.font = 'bold 120px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(options.businessName, width / 2, 800);
  
  if (options.tagline) {
    ctx.font = '48px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(options.tagline, width / 2, 900);
  }
  
  // CTA Button
  const buttonWidth = 300;
  const buttonHeight = 70;
  const buttonX = (width - buttonWidth) / 2;
  const buttonY = 1000;
  
  ctx.fillStyle = options.accentColor || '#ffffff';
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
  
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = options.primaryColor;
  ctx.fillText('Get Started →', width / 2, buttonY + 45);
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate social media asset for any platform
 */
export async function generateSocialAsset(
  platform: SocialPlatform,
  options: SocialAssetOptions
): Promise<string> {
  console.log(`[Social] Generating ${platform} for ${options.businessName}`);

  switch (platform) {
    case 'instagram-post':
      return generateInstagramPost(options);
    case 'instagram-story':
      return generateInstagramStory(options);
    case 'facebook-cover':
      return generateFacebookCover(options);
    case 'twitter-header':
      return generateTwitterHeader(options);
    case 'linkedin-banner':
      return generateLinkedInBanner(options);
    case 'youtube-thumbnail':
      return generateYouTubeThumbnail(options);
    case 'pinterest-pin':
      return generatePinterestPin(options);
    case 'tiktok-cover':
      return generateInstagramStory(options); // Same dimensions
    case 'email-header':
      return generateEmailHeader(options);
    case 'website-hero':
      return generateWebsiteHero(options);
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

/**
 * Generate all social assets for Tier 3
 */
export async function generateAllSocialAssets(
  options: SocialAssetOptions
): Promise<Record<SocialPlatform, string>> {
  const platforms: SocialPlatform[] = [
    'instagram-post',
    'instagram-story',
    'facebook-cover',
    'twitter-header',
    'linkedin-banner',
    'youtube-thumbnail',
    'pinterest-pin',
    'tiktok-cover',
    'email-header',
    'website-hero',
  ];

  const results: Partial<Record<SocialPlatform, string>> = {};

  for (const platform of platforms) {
    try {
      results[platform] = await generateSocialAsset(platform, options);
      console.log(`[Social] ✓ ${platform} generated`);
    } catch (error) {
      console.error(`[Social] ✗ ${platform} failed:`, error);
    }
  }

  return results as Record<SocialPlatform, string>;
}

/**
 * Cost summary for documentation
 */
export function getCostSummary(): string {
  return `
Social Media Generation Cost Summary:
- Instagram Post: $0.00 (Canvas)
- Instagram Story: $0.00 (Canvas)
- Facebook Cover: $0.00 (Canvas)
- Twitter Header: $0.00 (Canvas)
- LinkedIn Banner: $0.00 (Canvas)
- YouTube Thumbnail: $0.00 (Canvas)
- Pinterest Pin: $0.00 (Canvas)
- TikTok Cover: $0.00 (Canvas)
- Email Header: $0.00 (Canvas)
- Website Hero: $0.00 (Canvas)

Total for 10 assets: $0.00
  `;
}
