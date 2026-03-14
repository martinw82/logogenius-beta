/**
 * Client-Side Social Media Generator Hook
 * 
 * Renders social media assets using HTML5 Canvas in the browser
 * Automatically uploads rendered images to server
 */

import { useState, useCallback, useRef } from 'react';

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

// All platforms to generate
const ALL_PLATFORMS: SocialPlatform[] = [
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

export function useClientSocialGenerator(): UseClientSocialGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 10,
    step: '',
  });
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /**
   * Load an image from URL
   */
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
   * Render a single social asset to canvas
   */
  const renderSocialAsset = useCallback(async (
    platform: SocialPlatform,
    options: SocialAssetOptions
  ): Promise<string> => {
    const spec = PLATFORM_SPECS[platform];
    
    // Get or create canvas
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }
    
    canvas.width = spec.width;
    canvas.height = spec.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    const primaryColor = options.primaryColor || '#0a192f';
    const secondaryColor = options.secondaryColor || '#f4a261';
    const accentColor = options.accentColor || '#ffffff';

    // Clear canvas
    ctx.clearRect(0, 0, spec.width, spec.height);

    // Draw platform-specific design
    switch (platform) {
      case 'instagram-post':
        await drawInstagramPost(ctx, spec, options, primaryColor, secondaryColor, accentColor);
        break;
      case 'instagram-story':
        await drawInstagramStory(ctx, spec, options, primaryColor, secondaryColor, accentColor);
        break;
      case 'facebook-cover':
        await drawFacebookCover(ctx, spec, options, primaryColor, secondaryColor, accentColor);
        break;
      case 'twitter-header':
        await drawTwitterHeader(ctx, spec, options, primaryColor, secondaryColor, accentColor);
        break;
      case 'linkedin-banner':
        await drawLinkedInBanner(ctx, spec, options, primaryColor, secondaryColor, accentColor);
        break;
      case 'youtube-thumbnail':
        await drawYouTubeThumbnail(ctx, spec, options, primaryColor, secondaryColor, accentColor);
        break;
      case 'pinterest-pin':
        await drawPinterestPin(ctx, spec, options, primaryColor, secondaryColor, accentColor);
        break;
      case 'tiktok-cover':
        await drawTikTokCover(ctx, spec, options, primaryColor, secondaryColor, accentColor);
        break;
      case 'email-header':
        await drawEmailHeader(ctx, spec, options, primaryColor, secondaryColor, accentColor);
        break;
      case 'website-hero':
        await drawWebsiteHero(ctx, spec, options, primaryColor, secondaryColor, accentColor);
        break;
    }

    // Convert to data URL
    return canvas.toDataURL('image/png', 0.9);
  }, [loadImage]);

  // Template drawing functions
  const drawInstagramPost = async (
    ctx: CanvasRenderingContext2D,
    spec: typeof PLATFORM_SPECS['instagram-post'],
    options: SocialAssetOptions,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string
  ) => {
    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, spec.width, spec.height);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(1, secondaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, spec.width, spec.height);

    // Centered content area
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(140, 140, 800, 800);

    // Logo
    try {
      const logo = await loadImage(options.logoUrl);
      const logoSize = 300;
      ctx.drawImage(logo, (spec.width - logoSize) / 2, 250, logoSize, logoSize);
    } catch {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.businessName.substring(0, 2).toUpperCase(), spec.width / 2, 400);
    }

    // Business name
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.businessName, spec.width / 2, 620);

    // Tagline
    if (options.tagline) {
      ctx.font = '32px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(options.tagline, spec.width / 2, 680);
    }

    ctx.textAlign = 'left';
  };

  const drawInstagramStory = async (
    ctx: CanvasRenderingContext2D,
    spec: typeof PLATFORM_SPECS['instagram-story'],
    options: SocialAssetOptions,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string
  ) => {
    // Full gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, spec.height);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(0.5, secondaryColor);
    gradient.addColorStop(1, primaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, spec.width, spec.height);

    // Top logo area
    try {
      const logo = await loadImage(options.logoUrl);
      ctx.drawImage(logo, 340, 300, 400, 400);
    } catch {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.businessName.substring(0, 2).toUpperCase(), spec.width / 2, 520);
    }

    // Business name
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.businessName, spec.width / 2, 800);

    // CTA
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(290, 1000, 500, 80);
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Swipe Up', spec.width / 2, 1055);

    ctx.textAlign = 'left';
  };

  const drawFacebookCover = async (
    ctx: CanvasRenderingContext2D,
    spec: typeof PLATFORM_SPECS['facebook-cover'],
    options: SocialAssetOptions,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string
  ) => {
    // Split design
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, spec.width * 0.6, spec.height);
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(spec.width * 0.6, 0, spec.width * 0.4, spec.height);

    // Logo on left
    try {
      const logo = await loadImage(options.logoUrl);
      ctx.drawImage(logo, 80, 56, 200, 200);
    } catch {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText(options.businessName.substring(0, 2).toUpperCase(), 140, 170);
    }

    // Text
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(options.businessName, 320, 130);

    if (options.tagline) {
      ctx.font = '20px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(options.tagline, 320, 165);
    }

    // Decorative element on right
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(spec.width * 0.8, spec.height / 2, 80, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawTwitterHeader = async (
    ctx: CanvasRenderingContext2D,
    spec: typeof PLATFORM_SPECS['twitter-header'],
    options: SocialAssetOptions,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string
  ) => {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, spec.width, 0);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(0.5, secondaryColor);
    gradient.addColorStop(1, primaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, spec.width, spec.height);

    // Logo
    try {
      const logo = await loadImage(options.logoUrl);
      ctx.drawImage(logo, 100, 100, 300, 300);
    } catch {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText(options.businessName.substring(0, 2).toUpperCase(), 200, 280);
    }

    // Text
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(options.businessName, 450, 220);

    if (options.tagline) {
      ctx.font = '24px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(options.tagline, 450, 260);
    }

    // Pattern
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(1200 + i * 150, 250, 60, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawLinkedInBanner = async (
    ctx: CanvasRenderingContext2D,
    spec: typeof PLATFORM_SPECS['linkedin-banner'],
    options: SocialAssetOptions,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string
  ) => {
    // Clean professional look
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, spec.width, spec.height);

    // Accent line
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(0, spec.height - 8, spec.width, 8);

    // Logo
    try {
      const logo = await loadImage(options.logoUrl);
      ctx.drawImage(logo, 80, 78, 240, 240);
    } catch {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText(options.businessName.substring(0, 2).toUpperCase(), 160, 220);
    }

    // Text
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(options.businessName, 360, 180);

    if (options.tagline) {
      ctx.font = '22px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(options.tagline, 360, 220);
    }

    // Right side pattern
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(1200 + i * 120, 50, 80, 296);
    }
  };

  const drawYouTubeThumbnail = async (
    ctx: CanvasRenderingContext2D,
    spec: typeof PLATFORM_SPECS['youtube-thumbnail'],
    options: SocialAssetOptions,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string
  ) => {
    // Bold background
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, spec.width, spec.height);

    // Corner accent
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(400, 0);
    ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.fill();

    // Logo
    try {
      const logo = await loadImage(options.logoUrl);
      ctx.drawImage(logo, 80, 210, 300, 300);
    } catch {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 80px sans-serif';
      ctx.fillText(options.businessName.substring(0, 2).toUpperCase(), 180, 400);
    }

    // Title
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(options.businessName, 420, 300);

    if (options.tagline) {
      ctx.font = '28px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(options.tagline, 420, 350);
    }

    // YouTube play button style element
    ctx.fillStyle = 'rgba(255,0,0,0.8)';
    ctx.beginPath();
    ctx.roundRect(1000, 260, 200, 120, 20);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(1060, 290);
    ctx.lineTo(1060, 350);
    ctx.lineTo(1140, 320);
    ctx.closePath();
    ctx.fill();
  };

  const drawPinterestPin = async (
    ctx: CanvasRenderingContext2D,
    spec: typeof PLATFORM_SPECS['pinterest-pin'],
    options: SocialAssetOptions,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string
  ) => {
    // Vertical layout
    const gradient = ctx.createLinearGradient(0, 0, 0, spec.height);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(1, secondaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, spec.width, spec.height);

    // Top logo area
    try {
      const logo = await loadImage(options.logoUrl);
      ctx.drawImage(logo, 200, 200, 600, 600);
    } catch {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 160px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.businessName.substring(0, 2).toUpperCase(), spec.width / 2, 500);
    }

    // Bottom text area
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 1000, spec.width, 500);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.businessName, spec.width / 2, 1100);

    if (options.tagline) {
      ctx.font = '32px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(options.tagline, spec.width / 2, 1160);
    }

    ctx.textAlign = 'left';
  };

  const drawTikTokCover = async (
    ctx: CanvasRenderingContext2D,
    spec: typeof PLATFORM_SPECS['tiktok-cover'],
    options: SocialAssetOptions,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string
  ) => {
    // Dark trendy background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, spec.width, spec.height);

    // Neon accents
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(40, 40, 100, 10);
    ctx.fillRect(40, 40, 10, 100);

    ctx.fillStyle = '#ff0050'; // TikTok pink
    ctx.fillRect(spec.width - 140, spec.height - 140, 100, 10);
    ctx.fillRect(spec.width - 50, spec.height - 140, 10, 100);

    // Center content
    try {
      const logo = await loadImage(options.logoUrl);
      ctx.drawImage(logo, 290, 400, 500, 500);
    } catch {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 140px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.businessName.substring(0, 2).toUpperCase(), spec.width / 2, 680);
    }

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(options.businessName, spec.width / 2, 1000);

    if (options.tagline) {
      ctx.font = '32px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(options.tagline, spec.width / 2, 1060);
    }

    ctx.textAlign = 'left';
  };

  const drawEmailHeader = async (
    ctx: CanvasRenderingContext2D,
    spec: typeof PLATFORM_SPECS['email-header'],
    options: SocialAssetOptions,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string
  ) => {
    // Clean header
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, spec.width, spec.height);

    // Logo
    try {
      const logo = await loadImage(options.logoUrl);
      ctx.drawImage(logo, 30, 30, 140, 140);
    } catch {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(options.businessName.substring(0, 2).toUpperCase(), 70, 120);
    }

    // Text
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(options.businessName, 190, 90);

    if (options.tagline) {
      ctx.font = '14px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(options.tagline, 190, 115);
    }

    // Right accent
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(450, 0, 150, spec.height);
  };

  const drawWebsiteHero = async (
    ctx: CanvasRenderingContext2D,
    spec: typeof PLATFORM_SPECS['website-hero'],
    options: SocialAssetOptions,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string
  ) => {
    // Full-width hero
    const gradient = ctx.createLinearGradient(0, 0, spec.width, spec.height);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(0.5, `${secondaryColor}80`);
    gradient.addColorStop(1, primaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, spec.width, spec.height);

    // Left content
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 96px sans-serif';
    ctx.fillText(options.businessName, 120, 500);

    if (options.tagline) {
      ctx.font = '40px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(options.tagline, 120, 580);
    }

    // CTA button
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(120, 650, 280, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('Learn More', 180, 702);

    // Right side logo
    try {
      const logo = await loadImage(options.logoUrl);
      ctx.drawImage(logo, 1200, 250, 600, 600);
    } catch {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 200px sans-serif';
      ctx.fillText(options.businessName.substring(0, 2).toUpperCase(), 1400, 600);
    }
  };

  /**
   * Generate all social assets and upload to server
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
    const assets: Record<string, string> = {};

    try {
      // Generate each platform
      for (let i = 0; i < ALL_PLATFORMS.length; i++) {
        const platform = ALL_PLATFORMS[i];
        setProgress({
          current: i + 1,
          total: ALL_PLATFORMS.length,
          step: `Generating ${PLATFORM_SPECS[platform].name}...`,
        });

        const imageData = await renderSocialAsset(platform, options);
        assets[platform] = imageData;
      }

      // Upload to server
      setProgress({
        current: ALL_PLATFORMS.length,
        total: ALL_PLATFORMS.length,
        step: 'Uploading to server...',
      });

      const response = await fetch(`/api/orders/${orderId}/upload-mockups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({
          socialAssets: assets,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload social assets');
      }

      const result = await response.json();
      console.log('[Social Generator] Upload result:', result);

      setProgress({
        current: ALL_PLATFORMS.length,
        total: ALL_PLATFORMS.length,
        step: 'Complete!',
      });

      return {
        success: true,
        assets,
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
