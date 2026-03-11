'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MockupTemplate } from './MockupTemplate';
import { MockupTemplate as MockupTemplateType } from '@/lib/services/mockupRenderer';
import { Download, ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react';

interface Logo {
  id: string;
  url: string; // SVG data URI or SVG string
}

interface LogoMockupModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Array of 4 logo variants to display */
  logos: Logo[];
  /** Optional callback when a logo is selected */
  onSelectLogo?: (logoId: string, variantIndex: number) => void;
  /** Show selection buttons */
  showSelection?: boolean;
  /** Show download buttons */
  showDownload?: boolean;
}

/**
 * LogoMockupModal Component (Enhanced for Sprint 4)
 * Displays 4 logo variants on 3 different mockup templates
 * Total: 4 variants × 3 templates = 12 mockup views
 * Features: variant navigation, template tabs, zoom controls, download capability
 */
export const LogoMockupModal: React.FC<LogoMockupModalProps> = ({
  isOpen,
  onClose,
  logos,
  onSelectLogo,
  showSelection = true,
  showDownload = false,
}) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<MockupTemplateType>('letterhead');
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const mockupContainerRef = useRef<HTMLDivElement>(null);

  const currentLogo = logos[selectedVariantIndex];
  const mockupTemplates: MockupTemplateType[] = ['letterhead', 'tshirt', 'businesscard'];

  const handleSelectLogo = useCallback(
    (variantIndex: number) => {
      if (onSelectLogo && logos[variantIndex]) {
        onSelectLogo(logos[variantIndex].id, variantIndex);
        // Close modal after selection
        setTimeout(onClose, 300);
      }
    },
    [logos, onSelectLogo, onClose]
  );

  const handleDownloadMockup = useCallback(async () => {
    if (!mockupContainerRef.current) return;

    try {
      const canvas = mockupContainerRef.current.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `logo-mockup-v${selectedVariantIndex + 1}-${selectedTemplate}.png`;
        link.click();
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [selectedVariantIndex, selectedTemplate]);

  const handleDownloadLogo = useCallback(() => {
    if (!currentLogo.url) return;

    try {
      const link = document.createElement('a');
      link.href = currentLogo.url.startsWith('data:')
        ? currentLogo.url
        : `data:image/svg+xml,${encodeURIComponent(currentLogo.url)}`;
      link.download = `logo-variant-${selectedVariantIndex + 1}.svg`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [currentLogo.url, selectedVariantIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Logo Preview on Mockups
            <p className="text-sm font-normal text-gray-500 mt-1">
              Variant {selectedVariantIndex + 1} of {logos.length} - See how your logo looks in
              real-world contexts
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Logo Variant Selector */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Select Logo Variant</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {logos.map((logo, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedVariantIndex(index);
                    setZoom(1); // Reset zoom when changing variant
                  }}
                  className={`relative p-2 rounded-lg border-2 transition-all ${
                    selectedVariantIndex === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="aspect-square rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                    {logo.url ? (
                      <img
                        src={
                          logo.url.startsWith('data:')
                            ? logo.url
                            : `data:image/svg+xml,${encodeURIComponent(logo.url)}`
                        }
                        alt={`Logo variant ${index + 1}`}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No logo</span>
                    )}
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-600">Variant {index + 1}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="px-2 py-1 text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                disabled={zoom >= 2}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className="gap-2"
            >
              {showGrid ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Grid
            </Button>

            {showDownload && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadMockup}
                  className="gap-2 ml-auto"
                >
                  <Download className="h-4 w-4" />
                  Download Mockup
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadLogo}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Logo
                </Button>
              </>
            )}
          </div>

          {/* Mockup Preview Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-700">
              Logo on Mockups (Variant {selectedVariantIndex + 1})
            </h3>

            {/* Template Tabs */}
            <Tabs
              value={selectedTemplate}
              onValueChange={(value) => {
                setSelectedTemplate(value as MockupTemplateType);
                setZoom(1); // Reset zoom when changing template
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="letterhead">Letterhead</TabsTrigger>
                <TabsTrigger value="tshirt">T-Shirt</TabsTrigger>
                <TabsTrigger value="businesscard">Business Card</TabsTrigger>
              </TabsList>

              {/* Mockup Preview Tabs with Zoom */}
              {mockupTemplates.map((template) => (
                <TabsContent key={template} value={template} className="mt-4">
                  <div
                    ref={selectedTemplate === template ? mockupContainerRef : null}
                    className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                  >
                    <MockupTemplate
                      template={template}
                      logoSvgData={currentLogo.url}
                      className="w-full"
                      showLoading={true}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Template Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {mockupTemplates.map((template) => (
                <div
                  key={template}
                  className={`rounded-lg border-2 cursor-pointer transition-all p-2 ${
                    selectedTemplate === template
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="bg-white rounded overflow-hidden max-h-48">
                    <MockupTemplate
                      template={template}
                      logoSvgData={currentLogo.url}
                      width="100%"
                      showLoading={false}
                    />
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-600 capitalize">{template}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Buttons */}
          {showSelection && (
            <div className="border-t pt-4">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-600">Ready to use Variant {selectedVariantIndex + 1}?</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSelectLogo(selectedVariantIndex)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Select This Variant
                  </Button>
                  <Button onClick={onClose} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoMockupModal;
