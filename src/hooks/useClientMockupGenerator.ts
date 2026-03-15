/**
 * Client-Side Mockup Generator Hook
 * 
 * Renders mockups using HTML5 Canvas in the browser
 * Automatically uploads rendered images to server
 */

import { useState, useCallback, useRef } from 'react';

export type MockupTemplate = 'letterhead' | 'tshirt' | 'businesscard';

interface MockupOptions {
  logoUrl: string;
  businessName: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface LogoVariant {
  variantNum: number;
  svgData: string;
}

interface UseClientMockupGeneratorReturn {
  isGenerating: boolean;
  progress: {
    current: number;
    total: number;
    step: string;
  };
  generateAndUploadMockups: (
    orderId: number,
    logos: LogoVariant[],
    brandData: {
      businessName: string;
      tagline?: string;
      primaryColor?: string;
      secondaryColor?: string;
    }
  ) => Promise<{
    success: boolean;
    mockups?: Record<string, Record<string, string>>;
    error?: string;
  }>;
}

// Template configurations with positions for logo overlay
const TEMPLATE_CONFIGS: Record<MockupTemplate, {
  width: number;
  height: number;
  logoX: number;
  logoY: number;
  logoWidth: number;
  logoHeight: number;
  bgColor: string;
}> = {
  letterhead: {
    width: 800,
    height: 1100,
    logoX: 50,
    logoY: 40,
    logoWidth: 120,
    logoHeight: 80,
    bgColor: '#ffffff',
  },
  tshirt: {
    width: 600,
    height: 700,
    logoX: 225,
    logoY: 250,
    logoWidth: 150,
    logoHeight: 150,
    bgColor: '#f5f5f5',
  },
  businesscard: {
    width: 900,
    height: 500,
    logoX: 50,
    logoY: 50,
    logoWidth: 100,
    logoHeight: 100,
    bgColor: '#ffffff',
  },
};

export function useClientMockupGenerator(): UseClientMockupGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 3,
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
   * Render a single mockup to canvas
   */
  const renderMockup = useCallback(async (
    template: MockupTemplate,
    options: MockupOptions
  ): Promise<string> => {
    const config = TEMPLATE_CONFIGS[template];
    
    // Get or create canvas
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }
    
    canvas.width = config.width;
    canvas.height = config.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Clear canvas
    ctx.clearRect(0, 0, config.width, config.height);

    // Draw background
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, config.width, config.height);

    // Draw template-specific design
    await drawTemplate(ctx, template, options, config);

    // Load and draw logo
    try {
      const logoImg = await loadImage(options.logoUrl);
      
      // Draw logo with proper sizing
      ctx.drawImage(
        logoImg,
        config.logoX,
        config.logoY,
        config.logoWidth,
        config.logoHeight
      );
    } catch (error) {
      console.warn(`[Mockup] Could not load logo for ${template}:`, error);
      // Draw placeholder text
      ctx.fillStyle = '#666666';
      ctx.font = '16px sans-serif';
      ctx.fillText(options.businessName, config.logoX, config.logoY + 20);
    }

    // Convert to data URL
    return canvas.toDataURL('image/png', 0.9);
  }, [loadImage]);

  /**
   * Draw template-specific background elements
   */
  const drawTemplate = async (
    ctx: CanvasRenderingContext2D,
    template: MockupTemplate,
    options: MockupOptions,
    config: typeof TEMPLATE_CONFIGS[MockupTemplate]
  ): Promise<void> => {
    const primaryColor = options.primaryColor || '#0a192f';
    const secondaryColor = options.secondaryColor || '#f4a261';

    switch (template) {
      case 'letterhead':
        // Header bar
        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, 0, config.width, 180);
        
        // Company name in header
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(options.businessName, 50, 110);
        
        // Tagline if provided
        if (options.tagline) {
          ctx.font = '16px sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillText(options.tagline, 50, 140);
        }

        // Content lines (simulated text)
        ctx.fillStyle = '#333333';
        ctx.font = '14px sans-serif';
        const lines = [
          'Dear Valued Partner,',
          '',
          'Thank you for your continued support and collaboration.',
          'We are excited to share our latest updates with you.',
          '',
          'Best regards,',
          'The Team',
        ];
        let y = 250;
        lines.forEach(line => {
          ctx.fillText(line, 50, y);
          y += 25;
        });
        
        // Footer accent
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(0, config.height - 10, config.width, 10);
        break;

      case 'tshirt':
        // T-shirt shape (simplified)
        ctx.fillStyle = primaryColor;
        
        // Main body
        const shirtPath = new Path2D();
        shirtPath.moveTo(150, 100);
        shirtPath.lineTo(450, 100);
        shirtPath.lineTo(480, 150);
        shirtPath.lineTo(480, 600);
        shirtPath.lineTo(120, 600);
        shirtPath.lineTo(120, 150);
        shirtPath.closePath();
        ctx.fill(shirtPath);
        
        // Collar
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        const collarPath = new Path2D();
        collarPath.moveTo(220, 100);
        collarPath.lineTo(300, 180);
        collarPath.lineTo(380, 100);
        collarPath.closePath();
        ctx.fill(collarPath);
        
        // Sleeves
        ctx.fillStyle = primaryColor;
        ctx.fillRect(80, 120, 80, 150);
        ctx.fillRect(440, 120, 80, 150);
        
        // Brand name below logo area
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(options.businessName, 300, 450);
        ctx.textAlign = 'left';
        break;

      case 'businesscard':
        // Card background
        ctx.fillStyle = primaryColor;
        ctx.fillRect(0, 0, config.width, config.height);
        
        // Accent stripe
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(0, config.height - 80, config.width, 80);
        
        // Company name (large)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(options.businessName, 50, 200);
        
        // Tagline
        if (options.tagline) {
          ctx.font = 'italic 18px sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillText(options.tagline, 50, 240);
        }
        
        // Contact info placeholders
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '14px sans-serif';
        ctx.fillText('www.yourwebsite.com', 50, 360);
        ctx.fillText('hello@yourwebsite.com', 50, 390);
        ctx.fillText('+1 (555) 123-4567', 50, 420);
        
        // Back of card (right side)
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(config.width / 2, 0, config.width / 2, config.height);
        
        // Back pattern
        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            ctx.beginPath();
            ctx.arc(
              config.width / 2 + 100 + i * 80,
              100 + j * 80,
              20,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
        break;
    }
  };

  /**
   * Generate all mockups for all variants and upload to server
   */
  const generateAndUploadMockups = useCallback(async (
    orderId: number,
    logos: LogoVariant[],
    brandData: {
      businessName: string;
      tagline?: string;
      primaryColor?: string;
      secondaryColor?: string;
    }
  ): Promise<{
    success: boolean;
    mockups?: Record<string, Record<string, string>>;
    error?: string;
  }> => {
    setIsGenerating(true);
    const templates: MockupTemplate[] = ['businesscard', 'letterhead', 'tshirt'];
    const allMockups: Record<string, Record<string, string>> = {};

    try {
      // Generate mockups for each variant
      for (let v = 0; v < logos.length; v++) {
        const logo = logos[v];
        const variantNum = logo.variantNum;
        const mockups: Record<string, string> = {};
        
        const options: MockupOptions = {
          logoUrl: logo.svgData,
          businessName: brandData.businessName,
          tagline: brandData.tagline,
          primaryColor: brandData.primaryColor,
          secondaryColor: brandData.secondaryColor,
        };

        // Generate each template for this variant
        for (let i = 0; i < templates.length; i++) {
          const template = templates[i];
          setProgress({
            current: v * templates.length + i + 1,
            total: logos.length * templates.length,
            step: `Generating ${template} for Variant ${variantNum}...`,
          });

          const imageData = await renderMockup(template, options);
          mockups[template] = imageData;
        }

        // Upload this variant's mockups to server
        setProgress({
          current: v * templates.length + templates.length,
          total: logos.length * templates.length,
          step: `Uploading Variant ${variantNum}...`,
        });

        const response = await fetch(`/api/orders/${orderId}/upload-mockups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
          body: JSON.stringify({
            mockups,
            variantNum: variantNum,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to upload mockups for variant ${variantNum}`);
        }

        allMockups[`variant${variantNum}`] = mockups;
      }

      setProgress({
        current: logos.length * templates.length,
        total: logos.length * templates.length,
        step: 'Complete!',
      });

      return {
        success: true,
        mockups: allMockups,
      };

    } catch (error) {
      console.error('[Mockup Generator] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      setIsGenerating(false);
    }
  }, [renderMockup]);

  return {
    isGenerating,
    progress,
    generateAndUploadMockups,
  };
}
