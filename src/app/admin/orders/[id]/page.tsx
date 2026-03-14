'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, Download, AlertCircle, Loader2 } from 'lucide-react';
import { useClientMockupGenerator } from '@/hooks/useClientMockupGenerator';
import { useClientSocialGenerator } from '@/hooks/useClientSocialGenerator';

interface OrderData {
  id: number;
  tier: string;
  status: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, any> & {
    // Mockups
    mockup_businesscard?: string;
    mockup_letterhead?: string;
    mockup_tshirt?: string;
    // Social Media
    social_instagram_post?: string;
    social_instagram_story?: string;
    social_facebook_cover?: string;
    social_twitter_header?: string;
    social_linkedin_banner?: string;
    social_youtube_thumbnail?: string;
    social_pinterest_pin?: string;
    social_tiktok_cover?: string;
    social_email_header?: string;
    social_website_hero?: string;
  };
  logos: Array<{
    id: number;
    variantNum: number;
    svgData: string;
    svgPath: string | null;
    mockupPaths: string | null;
  }>;
}



const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  generating: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  completed: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-800',
};

export default function AdminOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [clientGenStep, setClientGenStep] = useState<'idle' | 'logos' | 'mockups' | 'social' | 'complete'>('idle');
  
  // Client-side generators
  const { 
    isGenerating: isGeneratingMockups, 
    progress: mockupProgress, 
    generateAndUploadMockups 
  } = useClientMockupGenerator();
  
  const { 
    isGenerating: isGeneratingSocial, 
    progress: socialProgress, 
    generateAndUploadSocialAssets 
  } = useClientSocialGenerator();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        setOrder(data);
        setNewStatus(data.status);
        setNotes(data.data.admin_notes || '');
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSave = async () => {
    if (!order) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              data: { ...prev.data, admin_notes: notes },
            }
          : null
      );

      setSuccessMessage('Order updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickAction = (action: 'approve' | 'reject') => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const executeQuickAction = async () => {
    if (!confirmAction) return;

    setNewStatus(confirmAction === 'approve' ? 'approved' : 'rejected');
    setShowConfirmDialog(false);

    // Trigger save with new status
    const status = confirmAction === 'approve' ? 'approved' : 'rejected';
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes,
        }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to update');

      setOrder((prev) =>
        prev ? { ...prev, status } : null
      );

      setSuccessMessage(
        confirmAction === 'approve'
          ? 'Order approved successfully'
          : 'Order rejected'
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateLogos = async () => {
    setIsGenerating(true);
    setGenerationError('');
    setClientGenStep('logos');
    
    try {
      // Step 1: Generate logos server-side
      const response = await fetch(`/api/orders/${orderId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}` 
          : errorData.error || 'Generation failed';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccessMessage(`Generated ${data.generatedAssets.logoCount} logos! Creating mockups...`);
      
      // Refresh order data to get the logos
      const orderResponse = await fetch(`/api/admin/orders/${orderId}`, {
        credentials: 'include',
      });
      
      if (!orderResponse.ok) {
        throw new Error('Failed to fetch updated order');
      }
      
      const orderData = await orderResponse.json();
      setOrder(orderData);
      setNewStatus(orderData.status);
      
      // Step 2: Generate mockups client-side
      if (orderData.logos.length > 0 && orderData.data.businessName) {
        setClientGenStep('mockups');
        
        const firstLogo = orderData.logos[0].svgData;
        const primaryColor = orderData.data.primaryColors?.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#0a192f';
        const secondaryColor = orderData.data.secondaryColors?.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#f4a261';
        
        const mockupResult = await generateAndUploadMockups(parseInt(orderId), {
          logoUrl: firstLogo,
          businessName: orderData.data.businessName,
          tagline: orderData.data.keyTagline,
          primaryColor,
          secondaryColor,
        });
        
        if (!mockupResult.success) {
          console.warn('Mockup generation failed:', mockupResult.error);
        } else {
          console.log('Mockups generated:', mockupResult.mockups);
        }
        
        // Refresh to show mockups
        const updatedOrderResponse = await fetch(`/api/admin/orders/${orderId}`, {
          credentials: 'include',
        });
        if (updatedOrderResponse.ok) {
          const updatedData = await updatedOrderResponse.json();
          setOrder(updatedData);
        }
        
        // Step 3: Generate social media assets for Tier 3
        if (orderData.tier === 'premium') {
          setClientGenStep('social');
          setSuccessMessage('Creating social media assets...');
          
          const socialResult = await generateAndUploadSocialAssets(parseInt(orderId), {
            logoUrl: firstLogo,
            businessName: orderData.data.businessName,
            tagline: orderData.data.keyTagline,
            primaryColor,
            secondaryColor,
            accentColor: '#ffffff',
          });
          
          if (!socialResult.success) {
            console.warn('Social generation failed:', socialResult.error);
          } else {
            console.log('Social assets generated:', socialResult.assets);
          }
          
          // Refresh to show all assets
          const finalOrderResponse = await fetch(`/api/admin/orders/${orderId}`, {
            credentials: 'include',
          });
          if (finalOrderResponse.ok) {
            const finalData = await finalOrderResponse.json();
            setOrder(finalData);
          }
        }
      }
      
      setClientGenStep('complete');
      setSuccessMessage('All assets generated successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        setClientGenStep('idle');
      }, 5000);
      
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationError(error instanceof Error ? error.message : 'Generation failed');
      setClientGenStep('idle');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-600">{order.customerEmail}</p>
          </div>
        </div>
        <Badge className={statusColors[order.status] || 'bg-gray-100'}>
          {order.status}
        </Badge>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {generationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generationError}</AlertDescription>
        </Alert>
      )}

      {/* Generate/Regenerate Logos Button - Always show for admin */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">
                {order.logos.length > 0 ? 'Regenerate Logo Concepts' : 'Generate Logo Concepts'}
              </h3>
              <p className="text-sm text-blue-700">
                {isGenerating 
                  ? clientGenStep === 'logos' 
                    ? 'Generating 4 logo variants with AI...'
                    : clientGenStep === 'mockups'
                    ? `Creating mockups... (${mockupProgress.current}/${mockupProgress.total})`
                    : clientGenStep === 'social'
                    ? `Creating social media assets... (${socialProgress.current}/${socialProgress.total})`
                    : 'Finalizing...'
                  : order.status === 'processing' 
                  ? 'Form submitted. Ready to generate 4 logo variants and brand guide.'
                  : order.status === 'generation_failed'
                  ? 'Previous generation failed. Try again.'
                  : order.logos.length > 0
                  ? 'Regenerate to create new logo variants and mockups. This will overwrite existing logos.'
                  : 'Use AI to generate 4 logo variants, mockups, and brand guide for this order'}
              </p>
              
              {/* Progress indicators */}
              {isGenerating && (
                <div className="mt-3 space-y-2">
                  {clientGenStep === 'logos' && (
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating logos with Together AI...</span>
                    </div>
                  )}
                  
                  {clientGenStep === 'mockups' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-blue-800">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{mockupProgress.step}</span>
                      </div>
                      <Progress value={(mockupProgress.current / mockupProgress.total) * 100} className="h-2 w-64" />
                    </div>
                  )}
                  
                  {clientGenStep === 'social' && order.tier === 'premium' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-blue-800">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{socialProgress.step}</span>
                      </div>
                      <Progress value={(socialProgress.current / socialProgress.total) * 100} className="h-2 w-64" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button 
              onClick={handleGenerateLogos}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 ml-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : order.logos.length > 0 ? (
                'Regenerate Logos'
              ) : (
                'Generate Logos'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {/* Order Info */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Order Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Tier</p>
              <p className="font-semibold capitalize">{order.tier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-semibold text-sm">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="font-semibold">{order.data.businessName || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Industry</p>
              <p className="font-semibold">{order.data.industry || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Logos Preview */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Logo Variants</CardTitle>
            <CardDescription>4 generated logo concepts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {order.logos.map((logo) => (
                <div
                  key={logo.id}
                  className="border rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center min-h-48"
                >
                  {logo.svgData ? (
                    <img
                      src={logo.svgData}
                      alt={`Logo Variant ${logo.variantNum}`}
                      className="w-full h-40 object-contain"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">Logo not available</p>
                  )}
                  <p className="mt-2 text-xs text-gray-600">Variant {logo.variantNum}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mockup Preview Grid - 12 mockups (4 variants x 3 templates) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mockup Preview (4 variants × 3 templates)</CardTitle>
          <CardDescription>
            Review how logos look on different mockup templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {/* Column headers for variants */}
            <div className="col-span-4 grid grid-cols-4 gap-4 mb-4 pb-4 border-b">
              {[1, 2, 3, 4].map((variant) => (
                <div key={variant} className="text-center font-semibold text-sm">
                  Variant {variant}
                </div>
              ))}
            </div>

            {/* Row 1: Letterhead mockups */}
            <div className="col-span-4 grid grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((variant) => {
                const logo = order.logos.find(l => l.variantNum === variant);
                const mockups = logo?.mockupPaths ? JSON.parse(logo.mockupPaths) : {};
                return (
                  <div
                    key={`letterhead-${variant}`}
                    className="border rounded-lg bg-gray-50 aspect-video flex flex-col items-center justify-center p-4"
                  >
                    <div className="text-xs text-gray-400 mb-2">Letterhead</div>
                    {mockups.letterhead ? (
                      <img
                        src={mockups.letterhead}
                        alt={`Letterhead Mockup V${variant}`}
                        className="w-full h-24 object-contain"
                      />
                    ) : (
                      <div className="text-gray-300 text-sm">
                        [Mockup V{variant}]
                      </div>
                    )}
                    {mockups.letterhead && (
                      <Button variant="ghost" size="sm" className="mt-2" asChild>
                        <a href={mockups.letterhead} download={`letterhead-v${variant}.png`}>
                          <Download className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Row 2: T-Shirt mockups */}
            <div className="col-span-4 grid grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((variant) => {
                const logo = order.logos.find(l => l.variantNum === variant);
                const mockups = logo?.mockupPaths ? JSON.parse(logo.mockupPaths) : {};
                return (
                  <div
                    key={`tshirt-${variant}`}
                    className="border rounded-lg bg-gray-50 aspect-video flex flex-col items-center justify-center p-4"
                  >
                    <div className="text-xs text-gray-400 mb-2">T-Shirt</div>
                    {mockups.tshirt ? (
                      <img
                        src={mockups.tshirt}
                        alt={`T-Shirt Mockup V${variant}`}
                        className="w-full h-24 object-contain"
                      />
                    ) : (
                      <div className="text-gray-300 text-sm">
                        [Mockup V{variant}]
                      </div>
                    )}
                    {mockups.tshirt && (
                      <Button variant="ghost" size="sm" className="mt-2" asChild>
                        <a href={mockups.tshirt} download={`tshirt-v${variant}.png`}>
                          <Download className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Row 3: Business Card mockups */}
            <div className="col-span-4 grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((variant) => {
                const logo = order.logos.find(l => l.variantNum === variant);
                const mockups = logo?.mockupPaths ? JSON.parse(logo.mockupPaths) : {};
                return (
                  <div
                    key={`card-${variant}`}
                    className="border rounded-lg bg-gray-50 aspect-video flex flex-col items-center justify-center p-4"
                  >
                    <div className="text-xs text-gray-400 mb-2">Business Card</div>
                    {mockups.businesscard ? (
                      <img
                        src={mockups.businesscard}
                        alt={`Business Card Mockup V${variant}`}
                        className="w-full h-24 object-contain"
                      />
                    ) : (
                      <div className="text-gray-300 text-sm">
                        [Mockup V{variant}]
                      </div>
                    )}
                    {mockups.businesscard && (
                      <Button variant="ghost" size="sm" className="mt-2" asChild>
                        <a href={mockups.businesscard} download={`businesscard-v${variant}.png`}>
                          <Download className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {!order.logos.length && (
            <Alert className="mt-4 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Logos and mockups have not been generated yet
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Social Media Assets (Tier 3 Only) */}
      {order.tier === 'premium' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Social Media Assets (Tier 3)</CardTitle>
            <CardDescription>
              Ready-to-use social media templates with your branding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { key: 'social_instagram_post', label: 'Instagram Post', size: '1080×1080' },
                { key: 'social_instagram_story', label: 'Instagram Story', size: '1080×1920' },
                { key: 'social_facebook_cover', label: 'Facebook Cover', size: '820×312' },
                { key: 'social_twitter_header', label: 'Twitter Header', size: '1500×500' },
                { key: 'social_linkedin_banner', label: 'LinkedIn Banner', size: '1584×396' },
                { key: 'social_youtube_thumbnail', label: 'YouTube Thumb', size: '1280×720' },
                { key: 'social_pinterest_pin', label: 'Pinterest Pin', size: '1000×1500' },
                { key: 'social_tiktok_cover', label: 'TikTok Cover', size: '1080×1920' },
                { key: 'social_email_header', label: 'Email Header', size: '600×200' },
                { key: 'social_website_hero', label: 'Website Hero', size: '1920×1080' },
              ].map(({ key, label, size }) => {
                const imageUrl = order.data[key];
                return (
                  <div
                    key={key}
                    className="border rounded-lg bg-gray-50 flex flex-col items-center justify-center p-4 aspect-square"
                  >
                    <div className="text-xs text-gray-500 mb-1">{label}</div>
                    <div className="text-[10px] text-gray-400 mb-2">{size}</div>
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt={label}
                          className="w-full h-20 object-contain mb-2"
                        />
                        <Button variant="ghost" size="sm" className="mt-auto" asChild>
                          <a href={imageUrl} download={`${key.replace('social_', '')}.png`}>
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      </>
                    ) : (
                      <div className="text-gray-300 text-xs text-center">
                        Not generated
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(order.data)
              .filter(
                ([key]) =>
                  !key.startsWith('pdf_') &&
                  !key.startsWith('mockup_') &&
                  key !== 'admin_notes' &&
                  key !== 'businessName' &&
                  key !== 'industry'
              )
              .map(([key, value]) => (
                <div key={key} className="border-b pb-3 last:border-b-0">
                  <p className="text-sm text-gray-600 capitalize">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="font-medium">{String(value)}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Notes & Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admin Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Notes</label>
            <Textarea
              placeholder="Add notes about this order (quality feedback, revision requests, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => handleQuickAction('approve')}
              className="bg-green-600 hover:bg-green-700"
              disabled={isSaving}
            >
              Approve Order
            </Button>
            <Button
              onClick={() => handleQuickAction('reject')}
              variant="destructive"
              disabled={isSaving}
            >
              Reject Order
            </Button>
            <Button onClick={handleSave} variant="outline" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>
            {confirmAction === 'approve' ? 'Approve Order?' : 'Reject Order?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {confirmAction === 'approve'
              ? 'This will mark the order as approved and notify the customer.'
              : 'This will reject the order. Make sure you have provided feedback in the notes above.'}
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeQuickAction}>
              {confirmAction === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
