'use client';

import React, { useEffect, useRef, useState } from 'react';
import { renderMockupToCanvas, MockupTemplate as MockupTemplateType, getTemplateUrl } from '@/lib/services/mockupRenderer';

interface MockupTemplateProps {
  /** Template type: letterhead, t-shirt, or business card */
  template: MockupTemplateType;
  /** Logo SVG data (data URI or SVG string) */
  logoSvgData: string;
  /** Optional CSS class for styling */
  className?: string;
  /** Optional width for the rendered mockup */
  width?: number | string;
  /** Optional callback when rendering is complete */
  onRenderComplete?: () => void;
  /** Show loading state while rendering */
  showLoading?: boolean;
}

/**
 * MockupTemplate Component
 * Renders a logo on a specific mockup template (letterhead, t-shirt, or business card)
 * Uses Canvas for high-quality rendering with proper scaling and positioning
 */
export const MockupTemplate: React.FC<MockupTemplateProps> = ({
  template,
  logoSvgData,
  className = '',
  width = '100%',
  onRenderComplete,
  showLoading = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderMockup = async () => {
      if (!canvasRef.current || !logoSvgData) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        await renderMockupToCanvas(canvasRef.current, {
          template,
          logoSvgData,
        });

        setIsLoading(false);
        onRenderComplete?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to render mockup';
        setError(errorMessage);
        console.error('Mockup rendering error:', err);
        setIsLoading(false);
      }
    };

    renderMockup();
  }, [template, logoSvgData, onRenderComplete]);

  const getTemplateLabel = (): string => {
    const labels: Record<MockupTemplateType, string> = {
      letterhead: 'Letterhead',
      tshirt: 'T-Shirt',
      businesscard: 'Business Card',
    };
    return labels[template];
  };

  return (
    <div
      ref={containerRef}
      className={`mockup-template-container ${className}`}
      style={{
        width,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Template label */}
      <div className="mockup-label">
        <h4 className="text-sm font-semibold text-gray-700">
          {getTemplateLabel()}
        </h4>
      </div>

      {/* Loading state */}
      {showLoading && isLoading && (
        <div className="mockup-loading" style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          textAlign: 'center',
          color: '#999',
          fontSize: '14px',
        }}>
          Rendering mockup...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mockup-error" style={{
          padding: '12px',
          backgroundColor: '#fee',
          borderRadius: '4px',
          border: '1px solid #fcc',
          color: '#c33',
          fontSize: '13px',
        }}>
          Error: {error}
        </div>
      )}

      {/* Canvas for rendering */}
      {!error && (
        <canvas
          ref={canvasRef}
          className={`mockup-canvas ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{
            width: '100%',
            height: 'auto',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
            transition: 'opacity 0.3s ease-in-out',
            display: isLoading && showLoading ? 'none' : 'block',
          }}
        />
      )}

      {/* Alternative SVG-based rendering (fallback) */}
      {error && (
        <svg
          viewBox="0 0 100 100"
          className="mockup-fallback"
          style={{
            width: '100%',
            height: 'auto',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <rect width="100" height="100" fill="#f9f9f9" stroke="#ddd" strokeWidth="1" />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="#999"
          >
            Failed to render
          </text>
        </svg>
      )}
    </div>
  );
};

export default MockupTemplate;
