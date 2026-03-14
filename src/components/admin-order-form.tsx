'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import * as z from 'zod';
import { suggestFormDetails } from '@/ai/flows/suggest-form-details';

// Form schema
const adminOrderSchema = z.object({
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
  
  // Brand details
  missionStatement: z.string().optional(),
  brandPillars: z.string().optional(),
  brandArchetype: z.string().optional(),
  keyTagline: z.string().optional(),
  targetAudience: z.string().optional(),
  
  // Premium
  web3: z.boolean().optional(),
});

type AdminOrderFormData = z.infer<typeof adminOrderSchema>;

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

const brandArchetypes = [
  'The Innovator', 'The Caregiver', 'The Hero', 'The Explorer',
  'The Creator', 'The Ruler', 'The Magician', 'The Lover',
  'The Jester', 'The Sage', 'The Outlaw', 'The Innocent'
];

interface AdminOrderFormProps {
  onSubmit: (data: AdminOrderFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function AdminOrderForm({ onSubmit, isSubmitting }: AdminOrderFormProps) {
  const [isAiFilling, setIsAiFilling] = useState(false);
  const [aiError, setAiError] = useState('');

  const form = useForm<AdminOrderFormData>({
    resolver: zodResolver(adminOrderSchema),
    defaultValues: {
      tier: 'basic',
      web3: false,
    },
  });

  const watchTier = form.watch('tier');
  const watchBusinessName = form.watch('businessName');
  const watchIndustry = form.watch('industry');

  const handleAiFill = async () => {
    const businessName = form.getValues('businessName');
    const industry = form.getValues('industry');

    if (!businessName || !industry) {
      setAiError('Please enter Business Name and Industry first');
      return;
    }

    setIsAiFilling(true);
    setAiError('');

    try {
      // Use server-side API key for admin form
      const result = await suggestFormDetails({
        businessName,
        industry,
        userApiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_KEY || '',
      });

      // Fill form fields
      if (result.aestheticKeywords) form.setValue('aestheticKeywords', result.aestheticKeywords);
      if (result.emotionalKeywords) form.setValue('emotionalKeywords', result.emotionalKeywords);
      if (result.functionalKeywords) form.setValue('functionalKeywords', result.functionalKeywords);
      if (result.primaryColors) form.setValue('primaryColors', result.primaryColors);
      if (result.secondaryColors) form.setValue('secondaryColors', result.secondaryColors);
      if (result.accentColors) form.setValue('accentColors', result.accentColors);
      if (result.preferredLogoStyle) form.setValue('preferredLogoStyle', result.preferredLogoStyle);
      if (result.targetAudience) form.setValue('targetAudience', result.targetAudience);
      if (result.brandArchetype) form.setValue('brandArchetype', result.brandArchetype);
      if (result.keyTagline) form.setValue('keyTagline', result.keyTagline);
      if (result.missionStatement) form.setValue('missionStatement', result.missionStatement);
      if (result.brandPillars) form.setValue('brandPillars', result.brandPillars);

    } catch (error) {
      console.error('AI fill error:', error);
      setAiError(error instanceof Error ? error.message : 'Failed to auto-fill form');
    } finally {
      setIsAiFilling(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* AI Auto-fill Section */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Auto-Fill
            </CardTitle>
            <CardDescription>
              Let AI fill out the brand details based on business name and industry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

            <Button
              type="button"
              variant="outline"
              onClick={handleAiFill}
              disabled={isAiFilling || !watchBusinessName || !watchIndustry}
              className="w-full"
            >
              {isAiFilling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI is thinking...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  ✨ Auto-fill Brand Details
                </>
              )}
            </Button>

            {aiError && (
              <Alert variant="destructive">
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basic">Basic - Logo only ($50)</SelectItem>
                        <SelectItem value="pro">Pro - Logo + Brand Guide ($150)</SelectItem>
                        <SelectItem value="premium">Premium - Everything + Social ($500)</SelectItem>
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
            <CardTitle>Brand Identity</CardTitle>
            <CardDescription>AI will suggest these, or edit manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="aestheticKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aesthetic Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="Modern, Minimalist" {...field} />
                    </FormControl>
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
                      <Input placeholder="Trustworthy, Friendly" {...field} />
                    </FormControl>
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
                      <Input placeholder="Fast, Reliable" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="primaryColors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Colors</FormLabel>
                    <FormControl>
                      <Input placeholder="Deep Blue #00008B" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondaryColors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Colors</FormLabel>
                    <FormControl>
                      <Input placeholder="Light Grey" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accentColors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accent Colors</FormLabel>
                    <FormControl>
                      <Input placeholder="Bright Yellow" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo Style */}
        <Card>
          <CardHeader>
            <CardTitle>Logo Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preferredLogoStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo Style</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

            <FormField
              control={form.control}
              name="brandArchetype"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Archetype</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
          </CardContent>
        </Card>

        {/* Brand Details (Collapsible for Basic tier) */}
        {(watchTier === 'pro' || watchTier === 'premium') && (
          <Card>
            <CardHeader>
              <CardTitle>Brand Details (Pro/Premium)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="missionStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission Statement</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Our mission is to..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brandPillars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Pillars</FormLabel>
                      <FormControl>
                        <Input placeholder="Innovation, Trust, Excellence" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keyTagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Tagline</FormLabel>
                      <FormControl>
                        <Input placeholder="Your catchy tagline" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Young professionals aged 25-35..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Premium Features */}
        {watchTier === 'premium' && (
          <Card>
            <CardHeader>
              <CardTitle>Premium Features</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="web3"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Web3/Blockchain Project</FormLabel>
                      <FormDescription>
                        Includes Web3-specific branding guidelines
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Order...
            </>
          ) : (
            'Create Order'
          )}
        </Button>
      </form>
    </Form>
  );
}
