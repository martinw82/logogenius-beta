'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import * as z from 'zod';

// Comprehensive form schema - same as customer-facing form
const createOrderSchema = z.object({
  // Required fields
  customerEmail: z.string().email('Valid email required'),
  tier: z.enum(['basic', 'pro', 'premium']),
  businessName: z.string().min(1, 'Business name required'),
  industry: z.string().min(1, 'Industry required'),
  
  // Brand identity
  aestheticKeywords: z.string().optional(),
  emotionalKeywords: z.string().optional(),
  functionalKeywords: z.string().optional(),
  
  // Colors
  primaryColors: z.string().optional(),
  secondaryColors: z.string().optional(),
  accentColors: z.string().optional(),
  
  // Logo style
  preferredLogoStyle: z.string().optional(),
  composition: z.string().optional(),
  iconPlacement: z.string().optional(),
  iconComplexity: z.string().optional(),
  
  // Fonts
  fontStyle: z.string().optional(),
  fontHeadings: z.string().optional(),
  fontBody: z.string().optional(),
  
  // Brand details (Pro/Premium)
  missionStatement: z.string().optional(),
  brandPillars: z.string().optional(),
  brandArchetype: z.string().optional(),
  keyTagline: z.string().optional(),
  targetAudience: z.string().optional(),
  
  // Premium
  web3: z.boolean().optional(),
  web3ProjectType: z.string().optional(),
  logoPreferences: z.string().optional(),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

const industries = [
  'Technology', 'Finance', 'Healthcare', 'E-commerce', 'Real Estate',
  'Education', 'Non-profit', 'Hospitality', 'Fashion', 'Food & Beverage',
  'Manufacturing', 'Consulting', 'Legal', 'Construction', 'Other'
];

const logoStyles = [
  'Modern Minimalist', 'Vintage/Retro', 'Hand-drawn/Organic', 'Geometric',
  'Typography-focused', 'Mascot/Character', 'Abstract', 'Emblem/Badge'
];

const compositions = [
  'Icon left, text right', 'Icon above, text below', 'Icon only', 'Text only',
  'Icon right, text left', 'Integrated icon in text'
];

const iconPlacements = [
  'Stand-alone icon', 'Integrated with text', 'Contained in shape',
  'Overlapping elements'
];

const iconComplexities = [
  'Simple/Minimal', 'Moderate detail', 'High detail/Intricate'
];

const fontStyles = [
  'Sans-serif (clean, modern)', 'Serif (traditional, elegant)',
  'Script/Handwritten', 'Display/Decorative'
];

const brandArchetypes = [
  'The Innovator', 'The Caregiver', 'The Hero', 'The Explorer',
  'The Creator', 'The Ruler', 'The Magician', 'The Lover',
  'The Jester', 'The Sage', 'The Outlaw', 'The Innocent'
];

const web3ProjectTypes = [
  'DeFi', 'NFT Project', 'DAO', 'Infrastructure', 'Metaverse', 'Gaming', 'SocialFi', 'Other'
];

export default function CreateOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const form = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      tier: 'basic',
      web3: false,
    },
  });

  const watchTier = form.watch('tier');
  const watchWeb3 = form.watch('web3');

  const onSubmit = async (data: CreateOrderFormData) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      setSuccessMessage(`Order #${result.orderId} created successfully!`);
      
      // Redirect after short delay
      setTimeout(() => {
        router.push(`/admin/orders/${result.orderId}`);
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
          <p className="text-gray-600">Create a new order with full brand details</p>
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Required information for the order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="customer@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Basic - Logo only</SelectItem>
                          <SelectItem value="pro">Pro - Logo + Brand Guide</SelectItem>
                          <SelectItem value="premium">Premium - Logo + Guide + Templates</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((ind) => (
                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Brand Identity */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity Keywords</CardTitle>
              <CardDescription>Describe the brand's personality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="aestheticKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aesthetic Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="modern, clean, minimalist" {...field} />
                    </FormControl>
                    <FormDescription>Visual style descriptors</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emotionalKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emotional Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="trustworthy, friendly, professional" {...field} />
                    </FormControl>
                    <FormDescription>How the brand should feel</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="functionalKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Functional Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="innovative, fast, reliable" {...field} />
                    </FormControl>
                    <FormDescription>What the brand does</FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Logo Style */}
          <Card>
            <CardHeader>
              <CardTitle>Logo Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferredLogoStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {logoStyles.map((style) => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="composition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Composition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select composition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {compositions.map((comp) => (
                            <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="iconPlacement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Placement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select placement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {iconPlacements.map((place) => (
                            <SelectItem key={place} value={place}>{place}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iconComplexity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Complexity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select complexity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {iconComplexities.map((comp) => (
                            <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fontStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Style Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select font style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fontStyles.map((font) => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pro/Premium Fields */}
          {(watchTier === 'pro' || watchTier === 'premium') && (
            <Card>
              <CardHeader>
                <CardTitle>Brand Guide Details</CardTitle>
                <CardDescription>Additional info for brand guide generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="missionStatement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mission Statement</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What is your brand's mission?" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandPillars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Pillars/Values</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Core values (one per line)" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brandArchetype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Archetype</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select archetype" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brandArchetypes.map((arch) => (
                              <SelectItem key={arch} value={arch}>{arch}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Input placeholder="Who is your ideal customer?" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="keyTagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Tagline</FormLabel>
                      <FormControl>
                        <Input placeholder="Brand tagline or slogan" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Premium Fields */}
          {watchTier === 'premium' && (
            <Card>
              <CardHeader>
                <CardTitle>Premium Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="web3"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Web3/Crypto Brand</FormLabel>
                    </FormItem>
                  )}
                />

                {watchWeb3 && (
                  <FormField
                    control={form.control}
                    name="web3ProjectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Web3 Project Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {web3ProjectTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="logoPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific Logo Preferences</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any specific requests for the logo design" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Order...' : 'Create Order'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
