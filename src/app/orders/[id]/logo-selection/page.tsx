'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogoMockupModal } from '@/components/LogoMockupModal';
import { ChevronLeft, CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface LogoData {
  id: string;
  url: string;
}

interface OrderData {
  id: number;
  tier: string;
  status: string;
  customerEmail: string;
  data: Record<string, any>;
  logos: Array<{
    id: number;
    variantNum: number;
    svgData: string;
    svgPath: string | null;
  }>;
}

export default function LogoSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [logos, setLogos] = useState<LogoData[]>([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/detail`);
        if (!response.ok) throw new Error('Failed to fetch order');

        const data = await response.json();
        setOrder(data);

        // Convert logos to LogoData format
        if (data.logos && Array.isArray(data.logos)) {
          const convertedLogos = data.logos.map((logo: any) => ({
            id: logo.svgData || logo.id.toString(),
            url: logo.svgData,
          }));
          setLogos(convertedLogos);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSelectLogo = async (logoId: string, variantIndex: number) => {
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedLogoVariant: variantIndex + 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to select logo');
      }

      setSelectedLogoId(logoId);
      setSuccessMessage(`Variant ${variantIndex + 1} selected! Generating your final assets...`);

      // Trigger asset generation
      try {
        await fetch(`/api/orders/${orderId}/generate-assets`, {
          method: 'POST',
        });
      } catch (assetErr) {
        console.warn('Asset generation request failed:', assetErr);
        // Continue anyway - assets might be generated in background
      }

      setTimeout(() => {
        router.push(`/orders/${orderId}/confirmation`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select logo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadLogo = (variantIndex: number) => {
    if (logos[variantIndex]?.url) {
      const link = document.createElement('a');
      link.href = logos[variantIndex].url.startsWith('data:')
        ? logos[variantIndex].url
        : `data:image/svg+xml,${encodeURIComponent(logos[variantIndex].url)}`;
      link.download = `logo-variant-${variantIndex + 1}.svg`;
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your logos...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Order not found or not yet approved for logo selection</AlertDescription>
          </Alert>
          <Link href="/" className="mt-4">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/orders/${orderId}`} className="inline-block mb-4">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Select Your Logo</h1>
          <p className="text-lg text-slate-600">
            Choose your preferred logo variant. You'll see how each one looks across different
            mockups.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Logo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {logos.map((logo, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedLogoId === logo.id ? 'ring-2 ring-blue-600' : ''
              }`}
              onClick={() => setSelectedLogoId(logo.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Variant {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo Preview */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg p-4 min-h-40 flex items-center justify-center">
                  {logo.url ? (
                    <img
                      src={
                        logo.url.startsWith('data:')
                          ? logo.url
                          : `data:image/svg+xml,${encodeURIComponent(logo.url)}`
                      }
                      alt={`Logo variant ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">Logo not available</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalOpen(true);
                      setSelectedLogoId(logo.id);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Preview Mockups
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadLogo(index);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selection Confirmation */}
                {selectedLogoId === logo.id && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-blue-600 font-medium">Selected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Confirmation Card */}
        {selectedLogoId && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Ready to Confirm?
              </CardTitle>
              <CardDescription>
                You've selected a logo variant. Click below to confirm your selection and proceed to
                your brand assets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  const variantIndex = logos.findIndex((l) => l.id === selectedLogoId);
                  if (variantIndex >= 0) {
                    handleSelectLogo(selectedLogoId, variantIndex);
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
                disabled={isSaving}
              >
                {isSaving ? 'Confirming...' : 'Confirm Selection & Get Assets'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base">How to Choose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                1
              </div>
              <div>
                <p className="font-medium text-slate-900">Preview on Mockups</p>
                <p className="text-sm text-slate-600">
                  Click "Preview Mockups" to see how each variant looks on letterheads, t-shirts,
                  and business cards.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                2
              </div>
              <div>
                <p className="font-medium text-slate-900">Compare Variants</p>
                <p className="text-sm text-slate-600">
                  Use the zoom and grid controls in the mockup viewer to get a detailed look at
                  each design approach.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                3
              </div>
              <div>
                <p className="font-medium text-slate-900">Select & Confirm</p>
                <p className="text-sm text-slate-600">
                  Once you've found your favorite, click to select it and we'll generate your
                  complete brand package.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mockup Modal */}
      {selectedLogoId && logos.length > 0 && (
        <LogoMockupModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          logos={logos}
          showSelection={false}
          showDownload={true}
        />
      )}
    </div>
  );
}
