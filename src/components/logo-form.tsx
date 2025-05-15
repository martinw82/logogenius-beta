
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2 } from "lucide-react";

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
      numberOfLogos: 4,
    },
  });

  const handleSubmit = async (data: LogoFormData) => {
    const aiInput = mapFormDataToAiInput(data);
    await onSubmit(aiInput);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Wand2 className="w-6 h-6 text-primary" />
          Describe Your Brand
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="text-lg font-medium">Brand Keywords</h3>
              <FormDescription>
                Describe your brand identity using keywords in the categories below. (e.g., modern, minimalist, friendly, bold)
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
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="preferredColorPalette"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Preferences (1-4 Colors)</FormLabel>
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
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        <SelectItem value="no_icon">No Icon (Wordmark)</SelectItem>
                        <SelectItem value="icon_only">Icon Only (Logomark)</SelectItem>
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
                    <FormLabel>Font Style (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Geometric Sans-Serif, Handwritten Script, No Text" {...field} />
                    </FormControl>
                    <FormDescription>
                      Describe font attributes (e.g., geometric, handwritten) or 'No Text' for icon-only logos. Consider compatibility with your chosen logo style.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        onChange={event => field.onChange(+event.target.value)} // Ensure value is a number
                       />
                    </FormControl>
                    <FormDescription>
                      Choose between 1 and 8 logos.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
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
