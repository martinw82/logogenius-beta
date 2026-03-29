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

/**
 * Draw an organic bezier curve accent line
 */
function drawOrganicCurve(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  x2: number, y2: number,
  color: string, opacity: number,
  lineWidth: number = 2
) {
  const { r, g, b } = hexToRgb(color);
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
  ctx.stroke();
}

/**
 * Draw a geometric accent shape (triangle, diamond, hexagon, circle)
 */
function drawAccentShape(
  ctx: CanvasRenderingContext2D,
  type: 'triangle' | 'diamond' | 'hexagon' | 'circle',
  x: number, y: number,
  size: number,
  color: string, opacity: number
) {
  const { r, g, b } = hexToRgb(color);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  ctx.beginPath();

  switch (type) {
    case 'triangle':
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.866, y + size * 0.5);
      ctx.lineTo(x - size * 0.866, y + size * 0.5);
      break;
    case 'diamond':
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.6, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.6, y);
      break;
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      break;
    case 'circle':
      ctx.arc(x, y, size, 0, Math.PI * 2);
      break;
  }

  ctx.closePath();
  ctx.fill();
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

    // Rich multi-stop gradient background
    const grad = ctx.createLinearGradient(0, 0, W * 0.3, H);
    grad.addColorStop(0, primary);
    grad.addColorStop(0.35, secondary);
    grad.addColorStop(0.65, primary);
    grad.addColorStop(1, lightenHex(primary, 0.15));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Soft radial glow behind logo area
    const { r, g, b } = hexToRgb(secondary);
    const glow = ctx.createRadialGradient(W / 2, 460, 60, W / 2, 460, 350);
    glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.2)`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Subtle diagonal lines
    drawDiagonalLines(ctx, W, H, '#ffffff', 0.03, 70, 1);

    // Decorative top bar
    ctx.fillStyle = `rgba(255,255,255,0.08)`;
    ctx.fillRect(0, 0, W, 80);

    // Logo in upper third — slightly larger
    await drawLogo(ctx, options.logoUrl, (W - 380) / 2, 260, 380, 380, options.businessName, accent);

    // Business name with slight letter spacing effect
    ctx.fillStyle = accent;
    ctx.font = 'bold 58px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.businessName, W / 2, 770);

    // Tagline in a frosted glass pill
    if (options.tagline) {
      ctx.font = '26px sans-serif';
      const tagWidth = ctx.measureText(options.tagline).width + 70;
      const pillX = (W - tagWidth) / 2;

      // Frosted pill background
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      roundedRect(ctx, pillX, 800, tagWidth, 54, 27);
      ctx.fill();
      // Pill border
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      roundedRect(ctx, pillX, 800, tagWidth, 54, 27);
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.fillText(options.tagline, W / 2, 835);
    }

    // CTA pill at bottom — frosted glass style
    const ctaWidth = 280;
    const ctaX = (W - ctaWidth) / 2;
    ctx.fillStyle = secondary;
    roundedRect(ctx, ctaX, H - 220, ctaWidth, 64, 32);
    ctx.fill();
    ctx.fillStyle = isLightColor(secondary) ? '#111' : '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Learn More', W / 2, H - 180);

    // Chevron arrow
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(W / 2 - 12, H - 130);
    ctx.lineTo(W / 2, H - 142);
    ctx.lineTo(W / 2 + 12, H - 130);
    ctx.stroke();

    // Organic curve accent near bottom (above CTA, in safe zone)
    drawOrganicCurve(ctx, W * 0.1, H * 0.82, W * 0.3, H * 0.78, W * 0.7, H * 0.84, W * 0.9, H * 0.80, accent, 0.12, 2.5);
    drawOrganicCurve(ctx, W * 0.15, H * 0.85, W * 0.4, H * 0.81, W * 0.6, H * 0.87, W * 0.85, H * 0.83, accent, 0.08, 1.5);

    // Diamond accent shapes in top corners (safe zone: top 14% is cropped, so place at ~15%)
    drawAccentShape(ctx, 'diamond', 80, H * 0.16, 18, accent, 0.15);
    drawAccentShape(ctx, 'diamond', W - 80, H * 0.16, 18, accent, 0.15);
    drawAccentShape(ctx, 'diamond', 50, H * 0.22, 10, accent, 0.1);
    drawAccentShape(ctx, 'diamond', W - 50, H * 0.22, 10, accent, 0.1);

    ctx.textAlign = 'left';
  };

  const drawFacebookCover = async (
    ctx: CanvasRenderingContext2D,
    spec: { width: number; height: number },
    options: SocialAssetOptions,
    primary: string, secondary: string, accent: string
  ) => {
    const { width: W, height: H } = spec;

    // Horizontal gradient with smooth midpoint
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, primary);
    grad.addColorStop(0.55, primary);
    grad.addColorStop(0.85, secondary);
    grad.addColorStop(1, lightenHex(secondary, 0.15));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle geometric shape (angled divider)
    const { r, g, b } = hexToRgb(secondary);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
    ctx.beginPath();
    ctx.moveTo(W * 0.5, 0);
    ctx.lineTo(W * 0.7, 0);
    ctx.lineTo(W * 0.55, H);
    ctx.lineTo(W * 0.35, H);
    ctx.closePath();
    ctx.fill();

    // Dot pattern — very subtle
    drawDotPattern(ctx, W, H, '#ffffff', 0.03, 35, 1.5);

    // Triangle accent shapes on left side (profile photo safe zone area)
    drawAccentShape(ctx, 'triangle', 60, H * 0.3, 25, secondary, 0.12);
    drawAccentShape(ctx, 'triangle', 100, H * 0.7, 18, secondary, 0.1);
    drawAccentShape(ctx, 'triangle', 40, H * 0.55, 12, secondary, 0.08);

    // Organic curve accent across middle
    drawOrganicCurve(ctx, 0, H * 0.6, W * 0.25, H * 0.4, W * 0.5, H * 0.55, W * 0.75, H * 0.35, accent, 0.08, 2);

    // Profile photo safe zone (left 170px) — logo after it
    await drawLogo(ctx, options.logoUrl, 200, (H - 150) / 2, 150, 150, options.businessName, accent);

    // Business name with proper vertical centering (right of logo)
    ctx.fillStyle = accent;
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(options.businessName, 380, H / 2 - 8);

    if (options.tagline) {
      ctx.font = '17px sans-serif';
      ctx.fillStyle = isLightColor(primary) ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)';
      ctx.fillText(options.tagline, 380, H / 2 + 22);
    }

    // Bottom accent — gradient bar instead of flat
    const barGrad = ctx.createLinearGradient(0, H - 5, W, H - 5);
    barGrad.addColorStop(0, secondary);
    barGrad.addColorStop(1, lightenHex(secondary, 0.3));
    ctx.fillStyle = barGrad;
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

    // Hexagon accent shapes in accent color (right side, avoiding bottom-left profile zone)
    drawAccentShape(ctx, 'hexagon', W - 150, H * 0.25, 22, accent, 0.12);
    drawAccentShape(ctx, 'hexagon', W - 80, H * 0.6, 16, accent, 0.1);
    drawAccentShape(ctx, 'hexagon', W - 220, H * 0.75, 12, accent, 0.08);

    // Organic curve accent along bottom edge (avoiding bottom-left profile photo zone)
    drawOrganicCurve(ctx, W * 0.3, H * 0.92, W * 0.5, H * 0.85, W * 0.7, H * 0.95, W * 0.95, H * 0.88, accent, 0.12, 2.5);
    drawOrganicCurve(ctx, W * 0.35, H * 0.96, W * 0.55, H * 0.9, W * 0.75, H * 0.98, W * 0.9, H * 0.92, accent, 0.08, 1.5);
  };

  const drawLinkedInBanner = async (
    ctx: CanvasRenderingContext2D,
    spec: { width: number; height: number },
    options: SocialAssetOptions,
    primary: string, secondary: string, accent: string
  ) => {
    const { width: W, height: H } = spec;

    // Professional gradient — primary to slightly darker
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, primary);
    grad.addColorStop(1, lightenHex(primary, -0.1));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid lines (corporate feel)
    const { r, g, b } = hexToRgb('#ffffff');
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.04)`;
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Right-side accent shape (subtle branded triangle)
    const sr = hexToRgb(secondary);
    ctx.fillStyle = `rgba(${sr.r}, ${sr.g}, ${sr.b}, 0.1)`;
    ctx.beginPath();
    ctx.moveTo(W - 400, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H);
    ctx.lineTo(W - 200, H);
    ctx.closePath();
    ctx.fill();

    // Logo left with subtle glow
    const glowGrad = ctx.createRadialGradient(170, H / 2, 30, 170, H / 2, 120);
    glowGrad.addColorStop(0, `rgba(${sr.r}, ${sr.g}, ${sr.b}, 0.08)`);
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(50, 0, 240, H);

    await drawLogo(ctx, options.logoUrl, 80, (H - 180) / 2, 180, 180, options.businessName, accent);

    // Name next to logo
    ctx.fillStyle = accent;
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(options.businessName, 290, H / 2 - 5);

    // Thin divider line
    ctx.fillStyle = `rgba(${sr.r}, ${sr.g}, ${sr.b}, 0.4)`;
    ctx.fillRect(290, H / 2 + 10, 100, 2);

    // Tagline right-aligned
    if (options.tagline) {
      ctx.font = '20px sans-serif';
      ctx.fillStyle = isLightColor(primary) ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.55)';
      ctx.textAlign = 'right';
      ctx.fillText(options.tagline, W - 90, H / 2 + 5);
      ctx.textAlign = 'left';
    }

    // Bottom accent — gradient bar
    const barGrad = ctx.createLinearGradient(0, 0, W, 0);
    barGrad.addColorStop(0, secondary);
    barGrad.addColorStop(0.5, lightenHex(secondary, 0.2));
    barGrad.addColorStop(1, secondary);
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, H - 5, W, 5);
  };

  const drawPinterestPin = async (
    ctx: CanvasRenderingContext2D,
    spec: { width: number; height: number },
    options: SocialAssetOptions,
    primary: string, secondary: string, accent: string
  ) => {
    const { width: W, height: H } = spec;

    // Upper section — soft warm gradient
    const upperGrad = ctx.createLinearGradient(0, 0, W * 0.3, H * 0.65);
    upperGrad.addColorStop(0, lightenHex(primary, 0.88));
    upperGrad.addColorStop(0.5, lightenHex(secondary, 0.85));
    upperGrad.addColorStop(1, lightenHex(primary, 0.75));
    ctx.fillStyle = upperGrad;
    ctx.fillRect(0, 0, W, H * 0.65);

    // Subtle pattern — small cross/plus marks instead of dots
    const pr = hexToRgb(primary);
    ctx.strokeStyle = `rgba(${pr.r}, ${pr.g}, ${pr.b}, 0.06)`;
    ctx.lineWidth = 1.5;
    for (let x = 30; x < W; x += 50) {
      for (let y = 30; y < H * 0.65; y += 50) {
        ctx.beginPath();
        ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y);
        ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5);
        ctx.stroke();
      }
    }

    // Large logo centered in upper half
    await drawLogo(ctx, options.logoUrl, (W - 420) / 2, 150, 420, 420, options.businessName, primary);

    // Decorative divider between sections — wavy accent line
    const cardY = Math.round(H * 0.65);
    ctx.fillStyle = secondary;
    ctx.fillRect((W - 80) / 2, cardY - 15, 80, 3);

    // Bottom card with brand color
    const cardGrad = ctx.createLinearGradient(0, cardY, 0, H);
    cardGrad.addColorStop(0, primary);
    cardGrad.addColorStop(1, lightenHex(primary, -0.1));
    ctx.fillStyle = cardGrad;
    ctx.fillRect(0, cardY, W, H - cardY);

    // Business name on card
    const textColor = isLightColor(primary) ? '#111' : '#fff';
    ctx.fillStyle = textColor;
    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.businessName, W / 2, cardY + 90);

    // Tagline
    if (options.tagline) {
      ctx.font = '26px sans-serif';
      ctx.fillStyle = isLightColor(primary) ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)';
      ctx.fillText(options.tagline, W / 2, cardY + 140);
    }

    // CTA pill — rounded with border
    const ctaText = 'Learn More';
    ctx.font = 'bold 22px sans-serif';
    const ctaW = ctx.measureText(ctaText).width + 64;
    const ctaH = 52;
    const ctaX = (W - ctaW) / 2;
    const ctaY = cardY + 180;

    ctx.fillStyle = secondary;
    roundedRect(ctx, ctaX, ctaY, ctaW, ctaH, 26);
    ctx.fill();
    ctx.fillStyle = isLightColor(secondary) ? '#111' : '#fff';
    ctx.fillText(ctaText, W / 2, ctaY + 34);

    ctx.textAlign = 'left';
  };

  const drawTikTokCover = async (
    ctx: CanvasRenderingContext2D,
    spec: { width: number; height: number },
    options: SocialAssetOptions,
    primary: string, secondary: string, accent: string
  ) => {
    const { width: W, height: H } = spec;

    // Dark gradient base — not pure black, has brand tint
    const pr = hexToRgb(primary);
    const baseGrad = ctx.createLinearGradient(0, 0, 0, H);
    baseGrad.addColorStop(0, '#0a0a0a');
    baseGrad.addColorStop(0.5, `rgba(${Math.min(pr.r, 30)}, ${Math.min(pr.g, 30)}, ${Math.min(pr.b, 30)}, 1)`);
    baseGrad.addColorStop(1, '#050505');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);

    // Primary neon glow — main ring behind logo
    const { r, g, b } = hexToRgb(secondary);
    const glow1 = ctx.createRadialGradient(W / 2, H * 0.38, 80, W / 2, H * 0.38, 380);
    glow1.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.35)`);
    glow1.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.12)`);
    glow1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H);

    // Secondary glow — offset for depth
    const glow2 = ctx.createRadialGradient(W * 0.45, H * 0.35, 40, W * 0.45, H * 0.35, 250);
    glow2.addColorStop(0, `rgba(${pr.r}, ${pr.g}, ${pr.b}, 0.2)`);
    glow2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    // Neon corner brackets (TikTok creator aesthetic)
    ctx.strokeStyle = secondary;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // Top-left
    ctx.beginPath();
    ctx.moveTo(60, 130); ctx.lineTo(60, 60); ctx.lineTo(130, 60);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(W - 130, 60); ctx.lineTo(W - 60, 60); ctx.lineTo(W - 60, 130);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(60, H - 130); ctx.lineTo(60, H - 60); ctx.lineTo(130, H - 60);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(W - 130, H - 60); ctx.lineTo(W - 60, H - 60); ctx.lineTo(W - 60, H - 130);
    ctx.stroke();

    // Logo centered
    await drawLogo(ctx, options.logoUrl, (W - 400) / 2, 340, 400, 400, options.businessName, accent);

    // Business name — bold with subtle text shadow
    ctx.save();
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 66px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.businessName, W / 2, 880);
    ctx.restore();

    // Tagline with neon color
    if (options.tagline) {
      ctx.fillStyle = secondary;
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.tagline, W / 2, 930);
    }

    // Handle text at bottom
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
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

    // Clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Very subtle top tint bar using primary at low opacity
    const { r, g, b } = hexToRgb(primary);
    const topGrad = ctx.createLinearGradient(0, 0, 0, 8);
    topGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.08)`);
    topGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, 40);

    // Logo left with proper spacing
    await drawLogo(ctx, options.logoUrl, 24, (H - 70) / 2, 70, 70, options.businessName, primary);

    // Thin vertical divider
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
    ctx.fillRect(108, H * 0.25, 1, H * 0.5);

    // Company name
    ctx.fillStyle = primary;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(options.businessName, 124, H / 2 - 4);

    // Tagline
    if (options.tagline) {
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#999999';
      ctx.fillText(options.tagline, 124, H / 2 + 14);
    }

    // Bottom border — two-tone gradient
    const barGrad = ctx.createLinearGradient(0, 0, W, 0);
    barGrad.addColorStop(0, secondary);
    barGrad.addColorStop(0.3, primary);
    barGrad.addColorStop(1, primary);
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, H - 4, W, 4);
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
