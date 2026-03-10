'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MockupTemplate } from './MockupTemplate';
import { MockupTemplate as MockupTemplateType } from '@/lib/services/mockupRenderer';

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
}

/**
 * LogoMockupModal Component
 * Displays 4 logo variants on 3 different mockup templates
 * Total: 4 variants × 3 templates = 12 mockup views
 * Users can navigate between variants and see how logos look in real-world contexts
 */
export const LogoMockupModal: React.FC<LogoMockupModalProps> = ({
  isOpen,
  onClose,
  logos,
  onSelectLogo,
  showSelection = true,
}) => {
  // Default to first logo variant
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<MockupTemplateType>('letterhead');

  const currentLogo = logos[selectedVariantIndex];
  const mockupTemplates: MockupTemplateType[] = ['letterhead', 'tshirt', 'businesscard'];

  const handleSelectLogo = useCallback((variantIndex: number) => {
    if (onSelectLogo && logos[variantIndex]) {
      onSelectLogo(logos[variantIndex].id, variantIndex);
      // Optionally close modal after selection
      setTimeout(onClose, 300);
    }
  }, [logos, onSelectLogo, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Logo Preview on Mockups
            <p className="text-sm font-normal text-gray-500 mt-1">
              See how your logo looks in real-world contexts
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Logo Variant Selector */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              Select Logo Variant
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {logos.map((logo, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedVariantIndex(index)}
                  className={`relative p-2 rounded-lg border-2 transition-all ${
                    selectedVariantIndex === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {/* Logo preview thumbnail */}
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
                  <p className="text-xs text-center mt-2 text-gray-600">
                    Variant {index + 1}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Mockup Preview Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-700">
              Logo on Mockups (Variant {selectedVariantIndex + 1})
            </h3>

            {/* Template Tabs */}
            <Tabs
              value={selectedTemplate}
              onValueChange={(value) => setSelectedTemplate(value as MockupTemplateType)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="letterhead">Letterhead</TabsTrigger>
                <TabsTrigger value="tshirt">T-Shirt</TabsTrigger>
                <TabsTrigger value="businesscard">Business Card</TabsTrigger>
              </TabsList>

              {/* Mockup Preview Tabs */}
              {mockupTemplates.map((template) => (
                <TabsContent key={template} value={template} className="mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
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
                  <div className="bg-white rounded">
                    <MockupTemplate
                      template={template}
                      logoSvgData={currentLogo.url}
                      width="100%"
                      showLoading={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Buttons */}
          {showSelection && (
            <div className="border-t pt-4">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-600">
                  Ready to use Variant {selectedVariantIndex + 1}?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSelectLogo(selectedVariantIndex)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                  >
                    Select This Variant
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
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
