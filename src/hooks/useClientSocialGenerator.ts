/**
 * Client-Side Social Media Generator Hook
 *
 * Renders social media assets using HTML5 Canvas in the browser.
 * Generates 7 Canvas-rendered templates + uploads them to the server.
 * 3 additional platforms (Instagram Post, YouTube Thumbnail, Website Hero)
 * are generated server-side via AI after logo selection.
 */

import { useState, useCallback, useRef } from 'react';

export type SocialPlatform =
  | 'instagram-post'      // 1080×1080 — AI generated
  | 'instagram-story'     // 1080×1920 — Canvas
  | 'facebook-cover'      // 820×312  — Canvas
  | 'twitter-header'      // 1500×500 — Canvas
  | 'linkedin-banner'     // 1584×396 — Canvas
  | 'youtube-thumbnail'   // 1280×720 — AI generated
  | 'pinterest-pin'       // 1000×1500 — Canvas
  | 'tiktok-cover'        // 1080×1920 — Canvas
  | 'email-header'        // 600×200  — Canvas
  | 'website-hero';       // 1920×1080 — AI generated

interface SocialAssetOptions {
  logoUrl: string;
  businessName: string;
  tagline?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
}

interface UseClientSocialGeneratorReturn {
  isGenerating: boolean;
  progress: {
    current: number;
    total: number;
    step: string;
  };
  generateAndUploadSocialAssets: (
    orderId: number,
    options: SocialAssetOptions
  ) => Promise<{
    success: boolean;
    assets?: Record<string, string>;
    error?: string;
  }>;
}

// Platform specifications
const PLATFORM_SPECS: Record<SocialPlatform, {
  width: number;
  height: number;
  name: string;
}> = {
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

// Platform key mapping for storage (UI uses underscores)
const PLATFORM_KEY_MAP: Record<SocialPlatform, string> = {
  'instagram-post': 'social_instagram_post',
  'instagram-story': 'social_instagram_story',
  'facebook-cover': 'social_facebook_cover',
  'twitter-header': 'social_twitter_header',
  'linkedin-banner': 'social_linkedin_banner',
  'youtube-thumbnail': 'social_youtube_thumbnail',
  'pinterest-pin': 'social_pinterest_pin',
  'tiktok-cover': 'social_tiktok_cover',
  'email-header': 'social_email_header',
  'website-hero': 'social_website_hero',
};

// Only Canvas-rendered platforms (AI platforms handled server-side)
const CANVAS_PLATFORMS: SocialPlatform[] = [
  'instagram-story',
  'facebook-cover',
  'twitter-header',
  'linkedin-banner',
  'pinterest-pin',
  'tiktok-cover',
  'email-header',
];

/**
 * Parse hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 10, g: 25, b: 47 };
}

/**
 * Lighten a hex color
 */
function lightenHex(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.round(r + (255 - r) * factor);
  const lg = Math.round(g + (255 - g) * factor);
  const lb = Math.round(b + (255 - b) * factor);
  return `rgb(${lr}, ${lg}, ${lb})`;
}

/**
 * Check if color is light
 */
function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

/**
 * Draw a subtle dot grid pattern
 */
function drawDotPattern(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  color: string, opacity: number,
  spacing: number, radius: number
) {
  const { r, g, b } = hexToRgb(color);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  for (let x = spacing; x < w; x += spacing) {
    for (let y = spacing; y < h; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Draw a diagonal line pattern
 */
function drawDiagonalLines(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  color: string, opacity: number,
  spacing: number, lineWidth: number
) {
  const { r, g, b } = hexToRgb(color);
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  ctx.lineWidth = lineWidth;
  for (let i = -h; i < w + h; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
    ctx.stroke();
  }
}

/**
 * Draw rounded rectangle
 */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function useClientSocialGenerator(): UseClientSocialGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: CANVAS_PLATFORMS.length,
    step: '',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }, []);

  /**
   * Draw logo at a position, maintaining aspect ratio
   */
  const drawLogo = async (
    ctx: CanvasRenderingContext2D,
    logoUrl: string,
    x: number, y: number, maxW: number, maxH: number,
    fallbackName: string, fallbackColor: string
  ) => {
    try {
      const logo = await loadImage(logoUrl);
      const scale = Math.min(maxW / logo.width, maxH / logo.height);
      const lw = logo.width * scale;
      const lh = logo.height * scale;
      ctx.drawImage(logo, x + (maxW - lw) / 2, y + (maxH - lh) / 2, lw, lh);
    } catch {
      ctx.fillStyle = fallbackColor;
      ctx.font = `bold ${Math.min(maxW, maxH) * 0.4}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(fallbackName.substring(0, 2).toUpperCase(), x + maxW / 2, y + maxH / 2 + 10);
      ctx.textAlign = 'left';
    }
  };

  // ==================== TEMPLATE RENDERERS ====================

  const drawInstagramStory = async (
    ctx: CanvasRenderingContext2D,
    spec: { width: number; height: number },
    options: SocialAssetOptions,
    primary: string, secondary: string, accent: string
  ) => {
    const { width: W, height: H } = spec;

    // Multi-stop vertical gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, primary);
    grad.addColorStop(0.4, secondary);
    grad.addColorStop(0.7, primary);
    grad.addColorStop(1, lightenHex(primary, 0.2));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle diagonal lines
    drawDiagonalLines(ctx, W, H, '#ffffff', 0.04, 60, 1);

    // Logo in upper third
    await drawLogo(ctx, options.logoUrl, (W - 360) / 2, 280, 360, 360, options.businessName, accent);

    // Business name
    ctx.fillStyle = accent;
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.businessName, W / 2, 760);

    // Tagline in a branded pill
    if (options.tagline) {
      const tagWidth = ctx.measureText(options.tagline).width + 60;
      const pillX = (W - tagWidth) / 2;

      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      roundedRect(ctx, pillX, 790, tagWidth, 50, 25);
      ctx.fill();

      ctx.font = '26px sans-serif';
      ctx.fillStyle = accent;
      ctx.fillText(options.tagline, W / 2, 823);
    }

    // Swipe-up CTA pill at bottom
    const ctaWidth = 260;
    const ctaX = (W - ctaWidth) / 2;
    ctx.fillStyle = secondary;
    roundedRect(ctx, ctaX, H - 200, ctaWidth, 60, 30);
    ctx.fill();
    ctx.fillStyle = isLightColor(secondary) ? '#111' : '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Learn More', W / 2, H - 162);

    // Swipe indicator arrow
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 15, H - 110);
    ctx.lineTo(W / 2, H - 125);
    ctx.lineTo(W / 2 + 15, H - 110);
    ctx.stroke();

    ctx.textAlign = 'left';
  };

  const drawFacebookCover = async (
    ctx: CanvasRenderingContext2D,
    spec: { width: number; height: number },
    options: SocialAssetOptions,
    primary: string, secondary: string, accent: string
  ) => {
    const { width: W, height: H } = spec;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, primary);
    grad.addColorStop(0.7, primary);
    grad.addColorStop(1, secondary);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Dot pattern overlay
    drawDotPattern(ctx, W, H, '#ffffff', 0.04, 30, 2);

    // Profile photo safe zone indicator (left 170px) — leave space
    // Logo positioned after safe zone
    await drawLogo(ctx, options.logoUrl, 190, (H - 140) / 2, 140, 140, options.businessName, accent);

    // Text right of logo
    ctx.fillStyle = accent;
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(options.businessName, 360, H / 2 - 10);

    if (options.tagline) {
      ctx.font = '18px sans-serif';
      ctx.fillStyle = isLightColor(primary) ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
      ctx.fillText(options.tagline, 360, H / 2 + 20);
    }

    // Accent bar at bottom
    ctx.fillStyle = secondary;
    ctx.fillRect(0, H - 5, W, 5);
  };

  const drawTwitterHeader = async (
    ctx: CanvasRenderingContext2D,
    spec: { width: number; height: number },
    options: SocialAssetOptions,
    primary: string, secondary: string, accent: string
  ) => {
    const { width: W, height: H } = spec;

    // Clean gradient
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, primary);
    grad.addColorStop(0.6, primary);
    grad.addColorStop(1, lightenHex(primary, 0.15));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Geometric accent shapes (right side)
    const { r, g, b } = hexToRgb(secondary);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
    ctx.beginPath();
    ctx.moveTo(W - 400, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H);
    ctx.lineTo(W - 250, H);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.1)`;
    ctx.beginPath();
    ctx.moveTo(W - 500, 0);
    ctx.lineTo(W - 350, 0);
    ctx.lineTo(W - 200, H);
    ctx.lineTo(W - 350, H);
    ctx.closePath();
    ctx.fill();

    // Logo (left-center)
    await drawLogo(ctx, options.logoUrl, 120, (H - 200) / 2, 200, 200, options.businessName, accent);

    // Business name
    ctx.fillStyle = accent;
    ctx.font = 'bold 46px sans-serif';
    ctx.fillText(options.businessName, 370, H / 2 - 5);

    if (options.tagline) {
      ctx.font = '22px sans-serif';
      ctx.fillStyle = isLightColor(primary) ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
      ctx.fillText(options.tagline, 370, H / 2 + 30);
    }
  };

  const drawLinkedInBanner = async (
    ctx: CanvasRenderingContext2D,
    spec: { width: number; height: number },
    options: SocialAssetOptions,
    primary: string, secondary: string, accent: string
  ) => {
    const { width: W, height: H } = spec;

    // Solid professional background
    ctx.fillStyle = primary;
    ctx.fillRect(0, 0, W, H);

    // Subtle dot grid
    drawDotPattern(ctx, W, H, '#ffffff', 0.03, 40, 2);

    // Logo left
    await drawLogo(ctx, options.logoUrl, 80, (H - 180) / 2, 180, 180, options.businessName, accent);

    // Name left-aligned next to logo
    ctx.fillStyle = accent;
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(options.businessName, 290, H / 2 - 5);

    // Tagline right-aligned
    if (options.tagline) {
      ctx.font = '20px sans-serif';
      ctx.fillStyle = isLightColor(primary) ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)';
      ctx.textAlign = 'right';
      ctx.fillText(options.tagline, W - 80, H / 2 + 5);
      ctx.textAlign = 'left';
    }

    // Bottom accent line
    ctx.fillStyle = secondary;
    ctx.fillRect(0, H - 6, W, 6);
  };

  const drawPinterestPin = async (
    ctx: CanvasRenderingContext2D,
    spec: { width: number; height: number },
    options: SocialAssetOptions,
    primary: string, secondary: string, accent: string
  ) => {
    const { width: W, height: H } = spec;

    // Upper section — light gradient
    const upperGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    upperGrad.addColorStop(0, lightenHex(primary, 0.85));
    upperGrad.addColorStop(1, lightenHex(primary, 0.7));
    ctx.fillStyle = upperGrad;
    ctx.fillRect(0, 0, W, H * 0.65);

    // Subtle pattern on upper
    drawDotPattern(ctx, W, Math.round(H * 0.65), primary, 0.04, 35, 3);

    // Large logo centered in upper half
    await drawLogo(ctx, options.logoUrl, (W - 450) / 2, 180, 450, 450, options.businessName, primary);

    // Bottom card with brand color
    const cardY = Math.round(H * 0.65);
    ctx.fillStyle = primary;
    ctx.fillRect(0, cardY, W, H - cardY);

    // Business name on card
    const textColor = isLightColor(primary) ? '#111' : '#fff';
    ctx.fillStyle = textColor;
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.businessName, W / 2, cardY + 100);

    // Tagline
    if (options.tagline) {
      ctx.font = '28px sans-serif';
      ctx.fillStyle = isLightColor(primary) ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
      ctx.fillText(options.tagline, W / 2, cardY + 150);
    }

    // CTA pill
    const ctaText = 'Visit Us';
    ctx.font = 'bold 24px sans-serif';
    const ctaW = ctx.measureText(ctaText).width + 60;
    ctx.fillStyle = secondary;
    roundedRect(ctx, (W - ctaW) / 2, cardY + 190, ctaW, 55, 28);
    ctx.fill();
    ctx.fillStyle = isLightColor(secondary) ? '#111' : '#fff';
    ctx.fillText(ctaText, W / 2, cardY + 225);

    ctx.textAlign = 'left';
  };

  const drawTikTokCover = async (
    ctx: CanvasRenderingContext2D,
    spec: { width: number; height: number },
    options: SocialAssetOptions,
    primary: string, secondary: string, accent: string
  ) => {
    const { width: W, height: H } = spec;

    // Dark base
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Neon glow effect — radial gradient behind logo area
    const { r, g, b } = hexToRgb(secondary);
    const glow = ctx.createRadialGradient(W / 2, H * 0.38, 50, W / 2, H * 0.38, 400);
    glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
    glow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.1)`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Corner accents (TikTok style)
    ctx.fillStyle = secondary;
    ctx.fillRect(50, 50, 80, 4);
    ctx.fillRect(50, 50, 4, 80);
    ctx.fillRect(W - 130, H - 134, 80, 4);
    ctx.fillRect(W - 54, H - 134, 4, 80);

    // Logo with glow
    await drawLogo(ctx, options.logoUrl, (W - 400) / 2, 350, 400, 400, options.businessName, accent);

    // Business name — bold creator style
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 68px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.businessName, W / 2, 880);

    // Tagline with neon tint
    if (options.tagline) {
      ctx.fillStyle = secondary;
      ctx.font = '30px sans-serif';
      ctx.fillText(options.tagline, W / 2, 930);
    }

    // Bottom handles/hashtags style text
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '22px sans-serif';
    ctx.fillText(`@${options.businessName.toLowerCase().replace(/\s+/g, '')}`, W / 2, H - 200);

    ctx.textAlign = 'left';
  };

  const drawEmailHeader = async (
    ctx: CanvasRenderingContext2D,
    spec: { width: number; height: number },
    options: SocialAssetOptions,
    primary: string, secondary: string, accent: string
  ) => {
    const { width: W, height: H } = spec;

    // Clean white/light background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Logo left
    await drawLogo(ctx, options.logoUrl, 20, (H - 80) / 2, 80, 80, options.businessName, primary);

    // Company name
    ctx.fillStyle = primary;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(options.businessName, 120, H / 2 - 5);

    // Tagline below name
    if (options.tagline) {
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#888888';
      ctx.fillText(options.tagline, 120, H / 2 + 16);
    }

    // Bottom border in brand color
    ctx.fillStyle = primary;
    ctx.fillRect(0, H - 4, W, 4);

    // Thin secondary accent stripe
    ctx.fillStyle = secondary;
    ctx.fillRect(0, H - 4, W * 0.3, 4);
  };

  /**
   * Render a single Canvas social asset
   */
  const renderSocialAsset = useCallback(async (
    platform: SocialPlatform,
    options: SocialAssetOptions
  ): Promise<string> => {
    const spec = PLATFORM_SPECS[platform];

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    canvas.width = spec.width;
    canvas.height = spec.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    const primary = options.primaryColor || '#0a192f';
    const secondary = options.secondaryColor || '#f4a261';
    const accent = options.accentColor || '#ffffff';

    ctx.clearRect(0, 0, spec.width, spec.height);

    switch (platform) {
      case 'instagram-story':
        await drawInstagramStory(ctx, spec, options, primary, secondary, accent);
        break;
      case 'facebook-cover':
        await drawFacebookCover(ctx, spec, options, primary, secondary, accent);
        break;
      case 'twitter-header':
        await drawTwitterHeader(ctx, spec, options, primary, secondary, accent);
        break;
      case 'linkedin-banner':
        await drawLinkedInBanner(ctx, spec, options, primary, secondary, accent);
        break;
      case 'pinterest-pin':
        await drawPinterestPin(ctx, spec, options, primary, secondary, accent);
        break;
      case 'tiktok-cover':
        await drawTikTokCover(ctx, spec, options, primary, secondary, accent);
        break;
      case 'email-header':
        await drawEmailHeader(ctx, spec, options, primary, secondary, accent);
        break;
      default:
        // AI platforms won't be rendered here but just in case
        ctx.fillStyle = primary;
        ctx.fillRect(0, 0, spec.width, spec.height);
        break;
    }

    return canvas.toDataURL('image/png', 0.9);
  }, [loadImage]);

  /**
   * Generate Canvas social assets and upload in batches
   */
  const generateAndUploadSocialAssets = useCallback(async (
    orderId: number,
    options: SocialAssetOptions
  ): Promise<{
    success: boolean;
    assets?: Record<string, string>;
    error?: string;
  }> => {
    setIsGenerating(true);
    const allAssets: Record<string, string> = {};

    try {
      const BATCH_SIZE = 3;
      const batches: SocialPlatform[][] = [];
      for (let i = 0; i < CANVAS_PLATFORMS.length; i += BATCH_SIZE) {
        batches.push(CANVAS_PLATFORMS.slice(i, i + BATCH_SIZE));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchAssets: Record<string, string> = {};

        for (let i = 0; i < batch.length; i++) {
          const platform = batch[i];
          const overallIndex = batchIndex * BATCH_SIZE + i;

          setProgress({
            current: overallIndex + 1,
            total: CANVAS_PLATFORMS.length,
            step: `Generating ${PLATFORM_SPECS[platform].name} (${overallIndex + 1}/${CANVAS_PLATFORMS.length})...`,
          });

          const imageData = await renderSocialAsset(platform, options);
          const storageKey = PLATFORM_KEY_MAP[platform];
          batchAssets[storageKey] = imageData;
          allAssets[storageKey] = imageData;
        }

        setProgress({
          current: Math.min((batchIndex + 1) * BATCH_SIZE, CANVAS_PLATFORMS.length),
          total: CANVAS_PLATFORMS.length,
          step: `Uploading batch ${batchIndex + 1}/${batches.length}...`,
        });

        const response = await fetch(`/api/orders/${orderId}/upload-mockups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
          body: JSON.stringify({
            socialAssets: batchAssets,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to upload batch ${batchIndex + 1}: ${errorText}`);
        }

        const result = await response.json();
        console.log(`[Social Generator] Batch ${batchIndex + 1} upload result:`, result);
      }

      setProgress({
        current: CANVAS_PLATFORMS.length,
        total: CANVAS_PLATFORMS.length,
        step: 'Complete!',
      });

      return {
        success: true,
        assets: allAssets,
      };

    } catch (error) {
      console.error('[Social Generator] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      setIsGenerating(false);
    }
  }, [renderSocialAsset]);

  return {
    isGenerating,
    progress,
    generateAndUploadSocialAssets,
  };
}
