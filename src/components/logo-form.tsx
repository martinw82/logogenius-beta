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
      keywords: "",
      preferredColorPalette: "",
      preferredLogoStyle: "",
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
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descriptive Keywords</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., modern, minimalist, friendly, bold, innovative"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated words that describe your brand identity.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="preferredColorPalette"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Colors (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., shades of blue and green" {...field} />
                    </FormControl>
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
                        <SelectItem value="">Any Style</SelectItem>
                        <SelectItem value="logomark">Logomark (Icon-based)</SelectItem>
                        <SelectItem value="wordmark">Wordmark (Text-based)</SelectItem>
                        <SelectItem value="combination mark">Combination Mark (Icon + Text)</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="numberOfLogos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Logos to Generate</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="8" {...field} 
                           onChange={event => field.onChange(+event.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
