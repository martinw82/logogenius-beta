'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface FontPreviewProps {
  fontName: string;
  fontUrl?: string; // For uploaded fonts
  previewText?: string;
  fontSize?: number;
  className?: string;
}

export function FontPreview({
  fontName,
  fontUrl,
  previewText = 'The quick brown fox jumps over the lazy dog',
  fontSize = 24,
  className = ''
}: FontPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsLoading(true);
    setError(null);

    const loadFontAndRender = async () => {
      try {
        // If it's an uploaded font, load it
        if (fontUrl) {
          const fontFace = new FontFace(fontName, `url(${fontUrl})`);
          await fontFace.load();
          document.fonts.add(fontFace);
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set font
        ctx.font = `${fontSize}px "${fontName}"`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Measure text
        const metrics = ctx.measureText(previewText);
        const textWidth = metrics.width;
        const textHeight = fontSize * 1.2; // Approximate line height

        // Resize canvas to fit text
        canvas.width = Math.max(textWidth + 20, 300);
        canvas.height = Math.max(textHeight + 20, 60);

        // Re-apply font after resize
        ctx.font = `${fontSize}px "${fontName}"`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Draw text
        ctx.fillText(previewText, 10, 10);

        setIsLoading(false);
      } catch (err) {
        console.error('Font preview error:', err);
        setError('Failed to load font preview');
        setIsLoading(false);
      }
    };

    loadFontAndRender();
  }, [fontName, fontUrl, previewText, fontSize]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">{fontName}</h3>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}