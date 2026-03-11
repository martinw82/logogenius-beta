'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  FileText,
  Package,
  Image as ImageIcon,
  Star,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Mail,
  Eye,
} from 'lucide-react';
import { MockupTemplate } from '@/components/MockupTemplate';

interface OrderData {
  id: number;
  tier: string;
  status: string;
  businessName: string;
  createdAt: string;
  selectedLogoUrl?: string;
  logos?: Array<{ url: string }>;
  mockupPaths?: string[];
  pdfPath?: string;
  zipPath?: string;
  guide?: Record<string, string>;
}

const TEMPLATE_TYPES = ['letterhead', 'tshirt', 'businesscard'] as const;

export default function CustomerDashboard() {
  const params = useParams();
  const token = params.token as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/dashboard/${token}`);
        if (!response.ok) {
          throw new Error('Unable to access dashboard. Please check your link.');
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchOrderData();
    }
  }, [token]);

  const handleDownload = async (assetType: string) => {
    setDownloading(assetType);
    try {
      const response = await fetch(`/api/dashboard/${token}/download/${assetType}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Set filename based on asset type
      const filename = {
        zip: `${order?.businessName}-brand-package.zip`,
        pdf: `${order?.businessName}-brand-guide.pdf`,
        logos: `${order?.businessName}-logos.zip`,
        mockups: `${order?.businessName}-mockups.zip`,
      }[assetType as string] || 'download';

      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your brand assets...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Dashboard not found. Please check your access link.'}
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = order.status === 'completed';
  const tier3 = order.tier === 'premium';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{order.businessName}</h1>
          <p className="text-lg text-slate-600">Your Brand Assets Dashboard</p>

          {isCompleted && (
            <div className="flex items-center gap-2 mt-4 text-green-700 bg-green-50 px-4 py-2 rounded-lg w-fit">
              <CheckCircle2 className="h-5 w-5" />
              <span>✅ Order completed - All assets ready for download</span>
            </div>
          )}
        </div>

        {/* Order Status & Info */}
        <Card className="mb-8 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Order Details
              <span className="text-sm font-normal text-gray-600">
                Tier: {order.tier === 'basic' ? 'Basic' : order.tier === 'pro' ? 'Pro' : 'Premium'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase">Order ID</p>
              <p className="font-mono font-semibold">{order.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Status</p>
              <p className="font-semibold capitalize">{order.status.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Created</p>
              <p className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Version</p>
              <p className="font-semibold">1.0</p>
            </div>
          </CardContent>
        </Card>

        {/* Selected Logo Preview */}
        {order.selectedLogoUrl && (
          <Card className="mb-8 bg-white">
            <CardHeader>
              <CardTitle>Your Selected Logo</CardTitle>
              <CardDescription>The logo variant you selected for your brand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg p-8 flex items-center justify-center min-h-48">
                <img
                  src={
                    order.selectedLogoUrl.startsWith('data:')
                      ? order.selectedLogoUrl
                      : `data:image/svg+xml,${encodeURIComponent(order.selectedLogoUrl)}`
                  }
                  alt="Selected logo"
                  className="max-w-full max-h-48 object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Full Package Download */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Complete Brand Package
              </CardTitle>
              <CardDescription>All assets in one ZIP file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700">
                Includes: Logos, mockups, brand guide PDF, README, and color swatches
              </p>
              <Button
                onClick={() => handleDownload('zip')}
                disabled={downloading === 'zip'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {downloading === 'zip' ? 'Downloading...' : 'Download Package'}
              </Button>
            </CardContent>
          </Card>

          {/* PDF Download */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Brand Guide PDF
              </CardTitle>
              <CardDescription>Professional PDF guide only</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700">
                13-section comprehensive brand guide with colors, fonts, and guidelines
              </p>
              <Button
                onClick={() => handleDownload('pdf')}
                disabled={downloading === 'pdf'}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {downloading === 'pdf' ? 'Downloading...' : 'Download PDF'}
              </Button>
            </CardContent>
          </Card>

          {/* Logos Download */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Logo Files
              </CardTitle>
              <CardDescription>All SVG logo variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700">
                Download all 4 logo variants as SVG files (scalable, editable)
              </p>
              <Button
                onClick={() => handleDownload('logos')}
                disabled={downloading === 'logos'}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {downloading === 'logos' ? 'Downloading...' : 'Download Logos'}
              </Button>
            </CardContent>
          </Card>

          {/* Mockups Download */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Mockup Images
              </CardTitle>
              <CardDescription>Logo on real-world templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700">
                12 mockup images (3 templates × 4 variants) showing your logo in use
              </p>
              <Button
                onClick={() => handleDownload('mockups')}
                disabled={downloading === 'mockups'}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {downloading === 'mockups' ? 'Downloading...' : 'Download Mockups'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Mockup Gallery */}
        {order.logos && order.logos.length > 0 && (
          <Card className="mb-8 bg-white">
            <CardHeader>
              <CardTitle>Selected Logo on Mockups</CardTitle>
              <CardDescription>See how your logo looks on real-world applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TEMPLATE_TYPES.map((template) => (
                  <div key={template} className="border rounded-lg p-4 bg-slate-50">
                    <div className="bg-white rounded-lg p-4 min-h-48 flex items-center justify-center mb-3">
                      {order.selectedLogoUrl && (
                        <MockupTemplate
                          template={template}
                          logoSvgData={order.selectedLogoUrl}
                          width="100%"
                          showLoading={false}
                        />
                      )}
                    </div>
                    <p className="text-sm font-semibold capitalize text-center">{template}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions for Tier 2-3 */}
        {(order.tier === 'pro' || order.tier === 'premium') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Request Revision */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Request Revision
                </CardTitle>
                <CardDescription>Request changes to your brand guide</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 mb-4">
                  You have <span className="font-semibold">2 revisions included</span> with your order. Request
                  specific sections to be regenerated.
                </p>
                <Link href={`/dashboard/${token}/revisions`}>
                  <Button variant="outline" className="w-full">
                    Start Revision Request
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Provide Feedback */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Rate & Feedback
                </CardTitle>
                <CardDescription>Help us improve your experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 mb-4">
                  Share your feedback and rate your experience. Your input helps us create better brands.
                </p>
                <Button
                  onClick={() => setShowFeedback(true)}
                  variant="outline"
                  className="w-full"
                >
                  Give Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Support Card */}
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">
              For questions about your brand assets, usage rights, or custom requests, reach out to our support team at{' '}
              <a href="mailto:support@logogenius.com" className="text-blue-600 hover:underline">
                support@logogenius.com
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-600 mt-12">
          <p>
            Your assets are ready to use! This link remains valid for <span className="font-semibold">1 year</span>.
          </p>
          <p className="mt-2">
            <Link href="/" className="text-blue-600 hover:underline">
              Create another brand →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
