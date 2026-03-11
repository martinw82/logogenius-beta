'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, AlertCircle } from 'lucide-react';

interface FormData {
  customerEmail: string;
  tier: 'basic' | 'pro' | 'premium';
  businessName: string;
  industry: string;
  brandArchetype?: string;
  mission?: string;
  pillars?: string;
  targetAudience?: string;
  logoPreferences?: string;
  web3?: boolean;
}

const archetypes = [
  { value: 'the-hero', label: 'The Hero' },
  { value: 'the-innovator', label: 'The Innovator' },
  { value: 'the-sage', label: 'The Sage' },
  { value: 'the-everyman', label: 'The Everyman' },
  { value: 'the-lover', label: 'The Lover' },
  { value: 'the-caregiver', label: 'The Caregiver' },
  { value: 'the-jester', label: 'The Jester' },
  { value: 'the-explorer', label: 'The Explorer' },
  { value: 'the-creator', label: 'The Creator' },
  { value: 'the-ruler', label: 'The Ruler' },
  { value: 'the-magician', label: 'The Magician' },
  { value: 'the-innocent', label: 'The Innocent' },
];

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'E-commerce',
  'Real Estate',
  'Education',
  'Non-profit',
  'Hospitality',
  'Fashion',
  'Food & Beverage',
  'Manufacturing',
  'Other',
];

export default function CreateOrderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    customerEmail: '',
    tier: 'basic',
    businessName: '',
    industry: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [fiverrPaste, setFiverrPaste] = useState('');
  const [fiverrParsed, setFiverrParsed] = useState<FormData | null>(null);
  const [fiverrError, setFiverrError] = useState('');

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleParseFiverr = () => {
    setFiverrError('');
    setFiverrParsed(null);

    if (!fiverrPaste.trim()) {
      setFiverrError('Please paste Fiverr order data');
      return;
    }

    try {
      // Try to parse as JSON first
      let data;
      try {
        data = JSON.parse(fiverrPaste);
      } catch {
        // If JSON fails, try simple key-value parsing
        data = {};
        const lines = fiverrPaste.split('\n');
        lines.forEach((line) => {
          const [key, value] = line.split(':').map((s) => s.trim());
          if (key && value) {
            data[key.toLowerCase().replace(/\s+/g, '_')] = value;
          }
        });
      }

      // Extract known fields
      const parsed: FormData = {
        customerEmail: data.email || data.customer_email || '',
        tier: data.tier || 'basic',
        businessName: data.business_name || data.businessName || '',
        industry: data.industry || '',
        brandArchetype: data.archetype || data.brand_archetype || '',
        mission: data.mission || '',
        pillars: data.pillars || '',
        targetAudience: data.audience || data.target_audience || '',
        logoPreferences: data.preferences || data.logo_preferences || '',
        web3: !!data.web3 || !!data.crypto,
      };

      if (!parsed.customerEmail || !parsed.businessName) {
        setFiverrError(
          'Could not parse email and business name. Please ensure data includes these fields.'
        );
        return;
      }

      setFiverrParsed(parsed);
    } catch (err) {
      setFiverrError('Failed to parse data. Please check the format.');
      console.error('Parse error:', err);
    }
  };

  const handleUseFiverrData = () => {
    if (fiverrParsed) {
      setFormData(fiverrParsed);
      setFiverrPaste('');
      setFiverrParsed(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.customerEmail || !formData.businessName || !formData.industry) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!formData.customerEmail.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: formData.tier,
          customerEmail: formData.customerEmail,
          orderData: formData,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const data = await response.json();
      setSuccessMessage(`Order created successfully! Order ID: ${data.orderId}`);

      setTimeout(() => {
        router.push(`/admin/orders/${data.orderId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Order</h1>
          <p className="text-gray-600">Manually create an order or import from Fiverr</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="fiverr">Import from Fiverr</TabsTrigger>
        </TabsList>

        {/* Manual Entry Tab */}
        <TabsContent value="manual">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer Email *</label>
                    <Input
                      type="email"
                      placeholder="customer@example.com"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        handleInputChange('customerEmail', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tier *</label>
                    <Select
                      value={formData.tier}
                      onValueChange={(value) =>
                        handleInputChange('tier', value as FormData['tier'])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Name *</label>
                    <Input
                      placeholder="Company name"
                      value={formData.businessName}
                      onChange={(e) =>
                        handleInputChange('businessName', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry *</label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) =>
                        handleInputChange('industry', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand Archetype</label>
                  <Select
                    value={formData.brandArchetype || ''}
                    onValueChange={(value) =>
                      handleInputChange('brandArchetype', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select archetype" />
                    </SelectTrigger>
                    <SelectContent>
                      {archetypes.map((arch) => (
                        <SelectItem key={arch.value} value={arch.value}>
                          {arch.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Pro/Premium Details */}
            {(formData.tier === 'pro' || formData.tier === 'premium') && (
              <Card>
                <CardHeader>
                  <CardTitle>Brand Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mission Statement</label>
                    <Textarea
                      placeholder="What is your brand's mission?"
                      value={formData.mission || ''}
                      onChange={(e) => handleInputChange('mission', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Core Pillars</label>
                    <Textarea
                      placeholder="List your brand's core values/pillars (one per line)"
                      value={formData.pillars || ''}
                      onChange={(e) => handleInputChange('pillars', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Audience</label>
                    <Textarea
                      placeholder="Describe your target audience"
                      value={formData.targetAudience || ''}
                      onChange={(e) =>
                        handleInputChange('targetAudience', e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Premium Details */}
            {formData.tier === 'premium' && (
              <Card>
                <CardHeader>
                  <CardTitle>Premium Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Logo Preferences</label>
                    <Textarea
                      placeholder="Any specific logo style preferences?"
                      value={formData.logoPreferences || ''}
                      onChange={(e) =>
                        handleInputChange('logoPreferences', e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="web3"
                      checked={formData.web3 || false}
                      onCheckedChange={(checked) =>
                        handleInputChange('web3', !!checked)
                      }
                    />
                    <label htmlFor="web3" className="text-sm font-medium cursor-pointer">
                      Web3/Crypto Brand
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Order...' : 'Create Order'}
            </Button>
          </form>
        </TabsContent>

        {/* Fiverr Import Tab */}
        <TabsContent value="fiverr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import from Fiverr</CardTitle>
              <CardDescription>
                Paste Fiverr order data (JSON or text format) to auto-populate the form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fiverrError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{fiverrError}</AlertDescription>
                </Alert>
              )}

              <Textarea
                placeholder={'Paste Fiverr order data here (JSON or text format):\n{\n  "email": "customer@example.com",\n  "business_name": "Acme Corp",\n  "industry": "Technology",\n  ...'}
                value={fiverrPaste}
                onChange={(e) => setFiverrPaste(e.target.value)}
                rows={8}
              />

              <Button
                onClick={handleParseFiverr}
                className="w-full"
              >
                Parse Fiverr Data
              </Button>

              {fiverrParsed && (
                <>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-base">Parsed Data Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{fiverrParsed.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Business Name</p>
                        <p className="font-semibold">{fiverrParsed.businessName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tier</p>
                        <p className="font-semibold capitalize">{fiverrParsed.tier}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Industry</p>
                        <p className="font-semibold">{fiverrParsed.industry || '-'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={handleUseFiverrData}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Use This Data & Edit
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
