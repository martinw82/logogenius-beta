
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { LogoFormData } from "./logo-form-types";
import { logoFormSchema, mapFormDataToAiInput } from "./logo-form-types";
import type { GenerateLogoConceptsInput } from "@/ai/flows/generate-logo-concepts";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Wand2, FileImage } from "lucide-react";

interface LogoFormProps {
  onSubmit: (data: GenerateLogoConceptsInput) => Promise<void>;
  isLoading: boolean;
  initialValues?: Partial<LogoFormData>;
}

export function LogoForm({ onSubmit, isLoading, initialValues }: LogoFormProps) {
  const form = useForm<LogoFormData>({
    resolver: zodResolver(logoFormSchema),
    defaultValues: initialValues || {
      businessName: "",
      industry: "",
      aestheticKeywords: "",
      emotionalKeywords: "",
      functionalKeywords: "",
      preferredColorPalette: "",
      preferredLogoStyle: "",
      iconPlacement: "",
      fontStyle: "",
      iconComplexity: "",
      targetAudience: "",
      inspirationReferences: "",
      usageContext: "",
      negativeKeywords: "",
      variationInstructions: "",
      numberOfLogos: 4,
      referenceImageFile: null,
    },
  });

  const handleSubmit = async (data: LogoFormData) => {
    const aiInput = await mapFormDataToAiInput(data); // Now async
    await onSubmit(aiInput);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Wand2 className="w-6 h-6 text-primary" />
          Describe Your Brand
        </CardTitle>
        <CardDescription>Fill in the details below to generate logo concepts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <Accordion type="multiple" defaultValue={["basic-info", "brand-keywords"]} className="w-full space-y-4">
              <AccordionItem value="basic-info" className="border-b-0 rounded-md border p-4 shadow-sm">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline">Basic Information</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Innovatech Solutions" {...field} />
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
                        <FormLabel>Industry / Niche</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Technology, SaaS, Coffee Shop" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Young professionals, Eco-conscious consumers" {...field} />
                        </FormControl>
                        <FormDescription>Describe who your brand is for.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="brand-keywords" className="border-b-0 rounded-md border p-4 shadow-sm">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline">Brand Keywords</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormDescription>
                    Describe your brand identity using keywords. (e.g., modern, minimalist, friendly, bold)
                  </FormDescription>
                  <FormField
                    control={form.control}
                    name="aestheticKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aesthetic Keywords</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., sleek, vintage, futuristic, minimalist, playful"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Visual style and appearance.</FormDescription>
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
                          <Textarea
                            placeholder="e.g., trustworthy, energetic, calm, joyful, sophisticated"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Feelings or emotions the brand should evoke.</FormDescription>
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
                          <Textarea
                            placeholder="e.g., scalable, versatile, memorable, simple, efficient"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Practical attributes or benefits.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="visual-prefs" className="border-b-0 rounded-md border p-4 shadow-sm">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline">Visual Preferences</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="preferredColorPalette"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Preferences (1-4 Colors) (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Blue (trust), Gold (luxury)" {...field} />
                        </FormControl>
                        <FormDescription>
                          List 1-4 colors. Optionally specify roles (primary/accent) or mood.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="preferredLogoStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Logo Style (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="logomark">Logomark: Icon-only, symbolic</SelectItem>
                              <SelectItem value="wordmark">Wordmark: Text-only, stylized typography</SelectItem>
                              <SelectItem value="lettermark">Lettermark: Initials or monogram</SelectItem>
                              <SelectItem value="combination">Combination Mark: Icon + Text, integrated</SelectItem>
                              <SelectItem value="emblem">Emblem: Text inside a symbol/badge, traditional</SelectItem>
                              <SelectItem value="abstract">Abstract Mark: Unique, conceptual shape</SelectItem>
                              <SelectItem value="mascot">Mascot: Illustrated character</SelectItem>
                              <SelectItem value="minimalist">Minimalist: Simple forms, clean lines</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="iconPlacement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon Placement (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select icon placement" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="above_text">Above Text</SelectItem>
                              <SelectItem value="left_of_text">Left of Text</SelectItem>
                              <SelectItem value="right_of_text">Right of Text</SelectItem>
                              <SelectItem value="below_text">Below Text</SelectItem>
                              <SelectItem value="no_icon">No Icon (Wordmark/Lettermark)</SelectItem>
                              <SelectItem value="icon_only">Icon Only (Logomark)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fontStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Font Style (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Geometric Sans-Serif, Handwritten Script, No Text" {...field} />
                          </FormControl>
                          <FormDescription>
                            Describe font attributes (e.g., geometric, handwritten) or 'No Text' for icon-only logos.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="iconComplexity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon Complexity (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select icon complexity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="simple">Simple: Clean lines, minimal detail</SelectItem>
                              <SelectItem value="detailed">Detailed: More intricate, elaborate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="advanced-details" className="border-b-0 rounded-md border p-4 shadow-sm">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline">Advanced Details</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="referenceImageFile"
                    render={({ field: { onChange, onBlur, name, ref } }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileImage className="w-4 h-4" />
                          Reference Image (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onBlur={onBlur}
                            name={name}
                            ref={ref}
                            onChange={(e) => {
                              onChange(e.target.files ? e.target.files[0] : null);
                            }}
                            className="pt-2"
                          />
                        </FormControl>
                        <FormDescription>Upload an existing sketch, character, or logo for inspiration.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inspirationReferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inspiration / References (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Inspired by Nike's simplicity, Apple's sleekness."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Provide visual or brand benchmarks.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="usageContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Usage Context (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Web (responsive), Packaging (bold & scalable), Social media profiles."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Where will the logo primarily be used? (e.g., "Digital & Print", "Merchandise").</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="negativeKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Things to Avoid (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., No gradients, avoid cartoonish elements, not too corporate, avoid complex details."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>List elements, styles, or concepts to exclude.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="gen-settings" className="border-b-0 rounded-md border p-4 shadow-sm">
                <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline">Generation Settings</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="numberOfLogos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Logos to Generate</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="8"
                            {...field}
                            onChange={event => field.onChange(+event.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Choose between 1 and 8 logos.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="variationInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variation Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Emphasize different fonts; Try one minimalist icon and one detailed."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Guide how the multiple logo concepts should differ.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button type="submit" className="w-full !mt-8" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Logos"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
