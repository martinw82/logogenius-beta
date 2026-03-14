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

// Form schema
const adminOrderSchema = z.object({
  customerEmail: z.string().email('Valid email required'),
  tier: z.enum(['basic', 'pro', 'premium']),
  businessName: z.string().min(1, 'Business name required'),
  industry: z.string().min(1, 'Industry required'),
  industrySubcategory: z.string().optional(),
  
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

// Expanded industries with subcategories
const industryCategories: Record<string, { label: string; subcategories: string[] }> = {
  'technology': {
    label: '💻 Technology & Software',
    subcategories: ['SaaS', 'Mobile Apps', 'Web Development', 'AI/Machine Learning', 'Cybersecurity', 'Data Analytics', 'Cloud Services', 'IT Consulting', 'Hardware', 'Gaming', 'Blockchain/Web3']
  },
  'finance': {
    label: '💰 Finance & Banking',
    subcategories: ['Banking', 'Investment', 'Insurance', 'Accounting', 'Fintech', 'Cryptocurrency', 'Wealth Management', 'Mortgage', 'Financial Planning']
  },
  'healthcare': {
    label: '🏥 Healthcare & Wellness',
    subcategories: ['Medical Practice', 'Dental', 'Mental Health', 'Fitness & Gym', 'Nutrition', 'Pharmaceuticals', 'Medical Devices', 'Telehealth', 'Elder Care', 'Veterinary']
  },
  'retail': {
    label: '🛍️ Retail & E-commerce',
    subcategories: ['E-commerce', 'Brick & Mortar', 'Fashion & Apparel', 'Electronics', 'Home & Garden', 'Beauty & Cosmetics', 'Food & Grocery', 'Luxury Goods', 'Sports & Outdoors']
  },
  'food': {
    label: '🍽️ Food & Beverage',
    subcategories: ['Restaurant', 'Cafe', 'Fast Food', 'Catering', 'Food Truck', 'Bakery', 'Bar & Pub', 'Winery/Brewery', 'Food Production', 'Organic/Health Food']
  },
  'realestate': {
    label: '🏠 Real Estate & Construction',
    subcategories: ['Residential Real Estate', 'Commercial Real Estate', 'Property Management', 'Construction', 'Architecture', 'Interior Design', 'Landscaping', 'Home Services', 'Rental/Airbnb']
  },
  'professional': {
    label: '👔 Professional Services',
    subcategories: ['Legal', 'Accounting', 'Consulting', 'Marketing Agency', 'HR/Recruiting', 'Coaching', 'Translation', 'Event Planning', 'Public Relations']
  },
  'creative': {
    label: '🎨 Creative & Media',
    subcategories: ['Graphic Design', 'Photography', 'Video Production', 'Music & Audio', 'Writing/Publishing', 'Advertising', 'Animation', 'Art Gallery', 'Performing Arts']
  },
  'education': {
    label: '📚 Education & Training',
    subcategories: ['K-12 School', 'University', 'Online Courses', 'Tutoring', 'Corporate Training', 'Language Learning', 'Vocational Training', 'Childcare/Daycare']
  },
  'hospitality': {
    label: '🏨 Hospitality & Travel',
    subcategories: ['Hotel', 'Resort', 'Vacation Rental', 'Travel Agency', 'Tourism', 'Spa & Wellness', 'Event Venue', 'Transportation']
  },
  'automotive': {
    label: '🚗 Automotive & Transportation',
    subcategories: ['Car Dealership', 'Auto Repair', 'Car Rental', 'Car Wash', 'Parts & Accessories', 'Electric Vehicles', 'Fleet Services', 'Logistics', 'Rideshare']
  },
  'manufacturing': {
    label: '🏭 Manufacturing & Industrial',
    subcategories: ['Consumer Goods', 'Industrial Equipment', 'Electronics Manufacturing', 'Textile', 'Chemical', 'Packaging', 'Printing', 'Quality Control']
  },
  'nonprofit': {
    label: '💚 Non-Profit & Community',
    subcategories: ['Charity', 'Foundation', 'Religious Organization', 'Community Center', 'Environmental', 'Animal Welfare', 'Arts & Culture', 'Social Services', 'Advocacy']
  },
  'sports': {
    label: '⚽ Sports & Recreation',
    subcategories: ['Sports Team', 'Gym/Fitness Center', 'Yoga Studio', 'Sports Equipment', 'Outdoor Recreation', 'Esports', 'Sports Coaching', 'Dance Studio']
  },
  'pets': {
    label: '🐾 Pets & Animals',
    subcategories: ['Pet Store', 'Veterinary', 'Pet Grooming', 'Pet Boarding', 'Pet Training', 'Pet Food/Treats', 'Animal Rescue']
  },
  'other': {
    label: '📦 Other',
    subcategories: ['General']
  }
};

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

  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    form.setValue('industry', category);
    form.setValue('industrySubcategory', '');
  };

  // Collect existing field values to send to AI
  const getExistingFields = () => {
    const fields = [
      'aestheticKeywords', 'emotionalKeywords', 'functionalKeywords',
      'primaryColors', 'secondaryColors', 'accentColors',
      'preferredLogoStyle', 'brandArchetype', 'composition',
      'targetAudience', 'keyTagline', 'missionStatement', 'brandPillars'
    ];
    
    const existing: Record<string, string> = {};
    fields.forEach(field => {
      const value = form.getValues(field as any);
      if (value && value.trim() !== '') {
        existing[field] = value;
      }
    });
    return existing;
  };

  // Count how many fields are filled (for showing AI button)
  const getFilledFieldCount = () => {
    const existing = getExistingFields();
    return Object.keys(existing).length;
  };

  const handleAiFill = async () => {
    const businessName = form.getValues('businessName');
    const industry = form.getValues('industry');
    const subcategory = form.getValues('industrySubcategory');

    if (!businessName || !industry) {
      setAiError('Please enter Business Name and Industry first');
      return;
    }

    setIsAiFilling(true);
    setAiError('');

    // Get existing fields to preserve and use as context
    const existingFields = getExistingFields();

    try {
      // Call API route with existing fields
      const response = await fetch('/api/admin/auto-fill-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          businessName,
          industry: subcategory || industryCategories[industry]?.label.replace(/^\W+\s*/, '') || industry,
          subcategory,
          existingFields,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to auto-fill form');
      }

      const result = await response.json();

      // Fill ONLY empty form fields (preserve existing)
      const fieldsToFill: Record<string, string> = {
        aestheticKeywords: result.aestheticKeywords,
        emotionalKeywords: result.emotionalKeywords,
        functionalKeywords: result.functionalKeywords,
        primaryColors: result.primaryColors,
        secondaryColors: result.secondaryColors,
        accentColors: result.accentColors,
        preferredLogoStyle: result.preferredLogoStyle,
        targetAudience: result.targetAudience,
        brandArchetype: result.brandArchetype,
        composition: result.composition,
        keyTagline: result.keyTagline,
        missionStatement: result.missionStatement,
        brandPillars: result.brandPillars,
      };

      let filledCount = 0;
      Object.entries(fieldsToFill).forEach(([field, value]) => {
        const currentValue = form.getValues(field as any);
        if ((!currentValue || currentValue.trim() === '') && value) {
          form.setValue(field as any, value, { shouldValidate: true });
          filledCount++;
        }
      });

      // Show success message
      if (filledCount > 0) {
        setAiError(''); // Clear any errors
      }

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
              Business Information
            </CardTitle>
            <CardDescription>
              Enter business details, then use AI to auto-fill brand elements
            </CardDescription>
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

            <div className="space-y-4 pt-4 border-t border-purple-200">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Industry Category */}
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry Category *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleCategoryChange(value);
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {Object.entries(industryCategories).map(([key, category]) => (
                            <SelectItem key={key} value={key}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Industry Subcategory */}
                <FormField
                  control={form.control}
                  name="industrySubcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!selectedCategory}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={selectedCategory ? "Select subcategory" : "Select category first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-72">
                          {selectedCategory && industryCategories[selectedCategory]?.subcategories.map((sub) => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        More specific industry for better AI results
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* AI Auto-fill button - shown after basic info is filled */}
            {watchBusinessName && watchIndustry && watchTier && (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAiFill}
                  disabled={isAiFilling}
                  className="w-full bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300 hover:from-purple-200 hover:to-blue-200"
                >
                  {isAiFilling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI is thinking...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      ✨ Auto-fill Remaining Brand Details
                    </>
                  )}
                </Button>

                {getFilledFieldCount() > 0 && (
                  <p className="text-sm text-gray-600 text-center">
                    <span className="font-medium">{getFilledFieldCount()} fields</span> already filled - AI will use these as inspiration
                  </p>
                )}

                <p className="text-xs text-gray-500 text-center">
                  AI will only fill empty fields, preserving your existing input
                </p>
              </div>
            )}

            {aiError && (
              <Alert variant="destructive">
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            )}
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
