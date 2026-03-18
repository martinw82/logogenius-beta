'use client';

import { useState, useRef } from 'react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Sparkles, Wand2, Type, Upload, FileImage } from 'lucide-react';
import * as z from 'zod';
import { 
  brandArchetypes, 
  colorPaletteMoods, 
  colorPaletteMoodsData, 
  commonFontList, 
  NONE_VALUE, 
  CLEAR_MOOD_VALUE 
} from './logo-form-types';

// Match frontend form schema exactly
const adminOrderSchema = z.object({
  customerEmail: z.string().email('Valid email required'),
  tier: z.enum(['basic', 'pro', 'premium']),
  businessName: z.string().min(1, 'Business name required'),
  industry: z.string().min(1, 'Industry required'),
  
  // Brand Identity - split keywords
  aestheticKeywords: z.string().max(150).optional(),
  emotionalKeywords: z.string().max(150).optional(),
  functionalKeywords: z.string().max(150).optional(),
  missionStatement: z.string().max(500).optional(),
  brandPillars: z.string().max(300).optional(),
  brandArchetype: z.enum(['', ...brandArchetypes, NONE_VALUE]).default('').optional(),
  keyTagline: z.string().max(150).optional(),

  // Colors
  colorPaletteMood: z.enum(['', ...colorPaletteMoods, CLEAR_MOOD_VALUE]).default('').optional(),
  primaryColors: z.string().max(150).optional(),
  secondaryColors: z.string().max(150).optional(),
  accentColors: z.string().max(150).optional(),

  // Logo Style
  preferredLogoStyle: z.enum(['', 'logomark', 'wordmark', 'lettermark', 'combination', 'emblem', 'abstract', 'mascot', 'minimalist', NONE_VALUE]).default('').optional(),
  composition: z.enum(['', 'horizontal', 'vertical', 'circular', 'square', NONE_VALUE]).default('').optional(),
  iconPlacement: z.enum(['', 'above_text', 'left_of_text', 'right_of_text', 'below_text', 'no_icon', 'icon_only', NONE_VALUE]).default('').optional(),
  iconComplexity: z.enum(['', 'simple', 'detailed', NONE_VALUE]).default('').optional(),
  iconSpecifics: z.string().max(200).optional(),
  fontStyle: z.string().max(100).optional(),

  // Typography
  fontHeadings: z.enum(['', ...commonFontList, NONE_VALUE]).default('').optional(),
  useHeadingsFontForLogo: z.boolean().optional().default(false),
  fontBody: z.enum(['', ...commonFontList, NONE_VALUE]).default('').optional(),
  useBodyFontForLogo: z.boolean().optional().default(false),
  fontOther: z.enum(['', ...commonFontList, NONE_VALUE]).default('').optional(),
  useOtherFontForLogo: z.boolean().optional().default(false),

  // Brand Details
  targetAudience: z.string().max(150).optional(),
  inspirationReferences: z.string().max(200).optional(),
  usageContext: z.string().max(200).optional(),
  negativeKeywords: z.string().max(150).optional(),
  competitorsToAvoid: z.string().max(200).optional(),

  // Generation Settings
  variationInstructions: z.string().max(200).optional(),
  numberOfLogos: z.coerce.number().min(1).max(8).default(4),
  
  // Web3
  web3: z.boolean().optional().default(false),
  web3BlockchainFocus: z.enum(['', 'Ethereum', 'Solana', 'Polygon', 'Bitcoin L2s', 'Cross-chain', 'Blockchain Agnostic', 'Other', NONE_VALUE]).default('').optional(),
  web3ProjectType: z.enum(['', 'DeFi', 'NFT Project', 'DAO', 'Infrastructure', 'Metaverse', 'Gaming', 'SocialFi', 'Other', NONE_VALUE]).default('').optional(),
  web3EnsDomainIdeas: z.string().max(300).optional(),
  web3TokenSymbolIdea: z.string().max(10).optional(),
  web3CommunityValues: z.string().max(300).optional(),
  web3NftAesthetic: z.string().max(200).optional(),
}).refine(data => data.aestheticKeywords || data.emotionalKeywords || data.functionalKeywords, {
  message: "Please provide keywords for at least one category.",
  path: ["aestheticKeywords"],
});

type AdminOrderFormData = z.infer<typeof adminOrderSchema>;

interface AdminOrderFormProps {
  onSubmit: (data: AdminOrderFormData) => Promise<void>;
  isSubmitting: boolean;
}

// Industries (same as frontend)
const industries = [
  'Technology', 'Finance', 'Healthcare', 'Retail', 'Food & Beverage',
  'Real Estate', 'Education', 'Entertainment', 'Manufacturing', 'Transportation',
  'Energy', 'Agriculture', 'Construction', 'Consulting', 'Marketing',
  'Legal', 'Non-profit', 'Fashion', 'Beauty', 'Sports',
  'Travel', 'Hospitality', 'Automotive', 'Pharmaceutical', 'Other'
];

// Extract hex codes from color string and display preview
function ColorPreview({ colorString }: { colorString?: string }) {
  if (!colorString) return null;
  const hexCodes = colorString.match(/#[0-9A-Fa-f]{6}/g) || [];
  if (hexCodes.length === 0) return null;
  
  return (
    <div className="flex gap-1 mt-1">
      {hexCodes.slice(0, 5).map((hex, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded border border-gray-300"
          style={{ backgroundColor: hex }}
          title={hex}
        />
      ))}
    </div>
  );
}

export function AdminOrderForm({ onSubmit, isSubmitting }: AdminOrderFormProps) {
  const [isAiFilling, setIsAiFilling] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [referenceFileName, setReferenceFileName] = useState<string>('');

  const form = useForm<AdminOrderFormData>({
    resolver: zodResolver(adminOrderSchema),
    defaultValues: {
      tier: 'basic',
      businessName: '',
      industry: '',
      customerEmail: '',
      aestheticKeywords: '',
      emotionalKeywords: '',
      functionalKeywords: '',
      colorPaletteMood: '',
      primaryColors: '',
      secondaryColors: '',
      accentColors: '',
      preferredLogoStyle: '',
      composition: '',
      iconPlacement: '',
      iconComplexity: '',
      iconSpecifics: '',
      fontStyle: '',
      fontHeadings: '',
      useHeadingsFontForLogo: false,
      fontBody: '',
      useBodyFontForLogo: false,
      fontOther: '',
      useOtherFontForLogo: false,
      targetAudience: '',
      inspirationReferences: '',
      usageContext: '',
      negativeKeywords: '',
      competitorsToAvoid: '',
      missionStatement: '',
      brandPillars: '',
      brandArchetype: '',
      keyTagline: '',
      variationInstructions: '',
      numberOfLogos: 4,
      web3: false,
      web3BlockchainFocus: '',
      web3ProjectType: '',
      web3EnsDomainIdeas: '',
      web3TokenSymbolIdea: '',
      web3CommunityValues: '',
      web3NftAesthetic: '',
    },
  });

  const watchWeb3 = form.watch('web3');
  const watchPrimaryColors = form.watch('primaryColors');
  const watchSecondaryColors = form.watch('secondaryColors');
  const watchAccentColors = form.watch('accentColors');
  const watchColorMood = form.watch('colorPaletteMood');

  // Auto-fill colors when mood is selected
  const handleColorMoodChange = (moodName: string) => {
    if (moodName && moodName !== '' && moodName !== CLEAR_MOOD_VALUE) {
      const mood = colorPaletteMoodsData.find(m => m.name === moodName);
      if (mood) {
        form.setValue('primaryColors', mood.primary, { shouldValidate: true });
        form.setValue('secondaryColors', mood.secondary, { shouldValidate: true });
        form.setValue('accentColors', mood.accent, { shouldValidate: true });
      }
    } else if (moodName === CLEAR_MOOD_VALUE) {
      form.setValue('primaryColors', '', { shouldValidate: true });
      form.setValue('secondaryColors', '', { shouldValidate: true });
      form.setValue('accentColors', '', { shouldValidate: true });
      form.setValue('colorPaletteMood', '', { shouldValidate: true });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceFileName(file.name);
    }
  };

  const handleAiAutoFill = async () => {
    const businessName = form.getValues('businessName');
    const industry = form.getValues('industry');
    
    if (!businessName || !industry) {
      setAiError('Please enter business name and industry first');
      return;
    }

    setIsAiFilling(true);
    setAiError(null);

    try {
      const response = await fetch('/api/admin/auto-fill-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, industry }),
      });

      if (!response.ok) throw new Error('AI fill failed');

      const data = await response.json();
      
      // Fill form fields with AI suggestions
      if (data.aestheticKeywords) form.setValue('aestheticKeywords', data.aestheticKeywords);
      if (data.emotionalKeywords) form.setValue('emotionalKeywords', data.emotionalKeywords);
      if (data.functionalKeywords) form.setValue('functionalKeywords', data.functionalKeywords);
      if (data.missionStatement) form.setValue('missionStatement', data.missionStatement);
      if (data.brandPillars) form.setValue('brandPillars', data.brandPillars);
      if (data.keyTagline) form.setValue('keyTagline', data.keyTagline);
      if (data.targetAudience) form.setValue('targetAudience', data.targetAudience);
      if (data.preferredLogoStyle) form.setValue('preferredLogoStyle', data.preferredLogoStyle);
      
    } catch (error) {
      setAiError('Failed to auto-fill. Please try again.');
    } finally {
      setIsAiFilling(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Basic Information
            </CardTitle>
            <CardDescription>Essential details about the business and order</CardDescription>
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
                        <SelectItem value="basic">Basic ($29)</SelectItem>
                        <SelectItem value="pro">Pro ($49)</SelectItem>
                        <SelectItem value="premium">Premium ($99)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corporation" {...field} />
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
                        <SelectValue placeholder="Select industry..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry.toLowerCase()}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* AI Auto-fill Button */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleAiAutoFill}
            disabled={isAiFilling}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
          >
            {isAiFilling ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Auto-fill with AI
          </Button>
          <span className="text-sm text-gray-500">Fills brand details based on business name & industry</span>
        </div>

        {aiError && (
          <Alert variant="destructive">
            <AlertDescription>{aiError}</AlertDescription>
          </Alert>
        )}

        {/* Section 2: Brand Identity */}
        <Accordion type="single" collapsible defaultValue="brand-identity">
          <AccordionItem value="brand-identity">
            <AccordionTrigger className="text-lg font-semibold">
              <span className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Brand Identity
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="aestheticKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aesthetic Keywords</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., modern, sleek, minimal" {...field} />
                      </FormControl>
                      <FormDescription>Visual style descriptors</FormDescription>
                      <FormMessage />
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
                        <Textarea placeholder="e.g., trustworthy, exciting, calm" {...field} />
                      </FormControl>
                      <FormDescription>How the brand should feel</FormDescription>
                      <FormMessage />
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
                        <Textarea placeholder="e.g., fast, reliable, innovative" {...field} />
                      </FormControl>
                      <FormDescription>What the brand does</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="missionStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission Statement</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What drives your business..." {...field} />
                    </FormControl>
                    <FormMessage />
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
                        <Input placeholder="e.g., Innovation, Quality, Service" {...field} />
                      </FormControl>
                      <FormDescription>Core values (comma-separated)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandArchetype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Archetype</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select archetype..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
                          {brandArchetypes.map(archetype => (
                            <SelectItem key={archetype} value={archetype}>{archetype}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                      <Input placeholder="Your brand tagline or slogan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Section 3: Colors */}
        <Accordion type="single" collapsible>
          <AccordionItem value="colors">
            <AccordionTrigger className="text-lg font-semibold">
              <span className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Colors
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="colorPaletteMood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Palette Mood</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleColorMoodChange(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a mood..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CLEAR_MOOD_VALUE}>Clear/Custom</SelectItem>
                        {colorPaletteMoods.map(mood => (
                          <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Selecting a mood auto-fills color suggestions</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="primaryColors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Colors</FormLabel>
                      <FormControl>
                        <Input placeholder="#3F51B5 or Deep Indigo" {...field} />
                      </FormControl>
                      <ColorPreview colorString={watchPrimaryColors} />
                      <FormMessage />
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
                        <Input placeholder="#EEEEEE or Light Grey" {...field} />
                      </FormControl>
                      <ColorPreview colorString={watchSecondaryColors} />
                      <FormMessage />
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
                        <Input placeholder="#009688 or Teal" {...field} />
                      </FormControl>
                      <ColorPreview colorString={watchAccentColors} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Section 4: Logo Style */}
        <Accordion type="single" collapsible>
          <AccordionItem value="logo-style">
            <AccordionTrigger className="text-lg font-semibold">
              <span className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Logo Style
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferredLogoStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Logo Style</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
                          <SelectItem value="logomark">Logomark (Icon only)</SelectItem>
                          <SelectItem value="wordmark">Wordmark (Text only)</SelectItem>
                          <SelectItem value="lettermark">Lettermark</SelectItem>
                          <SelectItem value="combination">Combination (Icon + Text)</SelectItem>
                          <SelectItem value="emblem">Emblem</SelectItem>
                          <SelectItem value="abstract">Abstract</SelectItem>
                          <SelectItem value="mascot">Mascot</SelectItem>
                          <SelectItem value="minimalist">Minimalist</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                            <SelectValue placeholder="Select composition..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
                          <SelectItem value="horizontal">Horizontal</SelectItem>
                          <SelectItem value="vertical">Vertical</SelectItem>
                          <SelectItem value="circular">Circular</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="iconPlacement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Placement</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
                          <SelectItem value="above_text">Above Text</SelectItem>
                          <SelectItem value="left_of_text">Left of Text</SelectItem>
                          <SelectItem value="right_of_text">Right of Text</SelectItem>
                          <SelectItem value="below_text">Below Text</SelectItem>
                          <SelectItem value="no_icon">No Icon</SelectItem>
                          <SelectItem value="icon_only">Icon Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iconComplexity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Complexity</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fontStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Font Style</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., modern sans-serif" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="iconSpecifics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Specifics</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe specific imagery or concepts for the icon..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Section 5: Typography */}
        <Accordion type="single" collapsible>
          <AccordionItem value="typography">
            <AccordionTrigger className="text-lg font-semibold">
              <span className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                Typography
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Headings Font */}
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="fontHeadings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Headings Font
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select font..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>None</SelectItem>
                            <SelectItem value="">Clear</SelectItem>
                            {commonFontList.map(font => (
                              <SelectItem key={font} value={font}>{font}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="useHeadingsFontForLogo"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Use for logo</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Body Font */}
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="fontBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Body Font
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select font..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>None</SelectItem>
                            <SelectItem value="">Clear</SelectItem>
                            {commonFontList.map(font => (
                              <SelectItem key={font} value={font}>{font}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="useBodyFontForLogo"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Use for logo</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Other Font */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="fontOther"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Other/Accent Font
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select font..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
                          <SelectItem value="">Clear</SelectItem>
                          {commonFontList.map(font => (
                            <SelectItem key={font} value={font}>{font}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="useOtherFontForLogo"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Use for logo</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Section 6: Brand Details */}
        <Accordion type="single" collapsible>
          <AccordionItem value="brand-details">
            <AccordionTrigger className="text-lg font-semibold">
              <span className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">6</span>
                Brand Details
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Input placeholder="Who is your ideal customer?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inspirationReferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspiration References</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brands or designs that inspire you..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usageContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Context</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Where will this logo be used? (web, print, merchandise...)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="negativeKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negative Keywords</FormLabel>
                      <FormControl>
                        <Input placeholder="What to avoid (e.g., cartoonish, cluttered)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="competitorsToAvoid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitors to Avoid</FormLabel>
                      <FormControl>
                        <Input placeholder="Brands to differentiate from" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Section 7: Web3 (Conditional) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">7</span>
              Web3 Project
              <FormField
                control={form.control}
                name="web3"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 ml-auto">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">This is a Web3 project</FormLabel>
                  </FormItem>
                )}
              />
            </CardTitle>
          </CardHeader>
          {watchWeb3 && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="web3BlockchainFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blockchain Focus</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blockchain..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
                          <SelectItem value="Ethereum">Ethereum</SelectItem>
                          <SelectItem value="Solana">Solana</SelectItem>
                          <SelectItem value="Polygon">Polygon</SelectItem>
                          <SelectItem value="Bitcoin L2s">Bitcoin L2s</SelectItem>
                          <SelectItem value="Cross-chain">Cross-chain</SelectItem>
                          <SelectItem value="Blockchain Agnostic">Blockchain Agnostic</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="web3ProjectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
                          <SelectItem value="DeFi">DeFi</SelectItem>
                          <SelectItem value="NFT Project">NFT Project</SelectItem>
                          <SelectItem value="DAO">DAO</SelectItem>
                          <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="Metaverse">Metaverse</SelectItem>
                          <SelectItem value="Gaming">Gaming</SelectItem>
                          <SelectItem value="SocialFi">SocialFi</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
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
                  name="web3TokenSymbolIdea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Symbol Idea</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., LGT (max 10 chars)" maxLength={10} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="web3EnsDomainIdeas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ENS Domain Ideas</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., myproject.eth" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="web3CommunityValues"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Values</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What does your community stand for?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="web3NftAesthetic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NFT Aesthetic</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Visual style for NFT artwork (if applicable)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}
        </Card>

        {/* Section 8: Generation Settings */}
        <Accordion type="single" collapsible>
          <AccordionItem value="generation-settings">
            <AccordionTrigger className="text-lg font-semibold">
              <span className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">8</span>
                Generation Settings
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="variationInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variation Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="How should the 4 logo variations differ from each other?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfLogos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Logos (1-8)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={8} {...field} />
                    </FormControl>
                    <FormDescription>How many logo variants to generate (default: 4)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Upload */}
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  Reference Image (Optional)
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Reference
                    </Button>
                    {referenceFileName && (
                      <span className="text-sm text-green-600">{referenceFileName}</span>
                    )}
                  </div>
                </FormControl>
                <FormDescription>Upload an image for style reference</FormDescription>
              </FormItem>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Reset Form
          </Button>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Order...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Order
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
