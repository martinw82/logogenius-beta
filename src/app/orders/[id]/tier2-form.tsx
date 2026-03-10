"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArchetypeSelector } from "@/components/ArchetypeSelector";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import {
  tier2FormSchema,
  type Tier2FormData,
  INDUSTRY_OPTIONS,
} from "@/lib/schemas/order-forms";

interface Tier2FormProps {
  orderId: string;
  onSuccess?: (data: any) => void;
}

export function Tier2Form({ orderId, onSuccess }: Tier2FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<Tier2FormData>({
    resolver: zodResolver(tier2FormSchema),
    defaultValues: {
      businessName: "",
      industry: "",
      brandArchetype: "",
      aestheticKeywords: "",
      emotionalKeywords: "",
      functionalKeywords: "",
      missionStatement: "",
      brandPillars: [""],
      targetAudience: "",
      companyValues: "",
      keyTagline: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "brandPillars",
  });

  async function onSubmit(data: Tier2FormData) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier: "pro",
          data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to submit form",
        });
        return;
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: "Your order has been submitted!",
      });

      if (onSuccess) {
        onSuccess(result);
      }

      window.location.href = result.confirmationUrl;
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us about your business
            </p>
          </div>

          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your business name"
                    disabled={isSubmitting}
                    {...field}
                  />
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandArchetype"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Archetype *</FormLabel>
                <FormDescription>
                  Select a brand personality that represents your business
                </FormDescription>
                <FormControl>
                  <ArchetypeSelector
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                    showDescription={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Keywords */}
        <div className="space-y-6 border-t pt-6">
          <div>
            <h2 className="text-lg font-semibold">Brand Keywords</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Help us understand your brand essence
            </p>
          </div>

          <FormField
            control={form.control}
            name="aestheticKeywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aesthetic Keywords</FormLabel>
                <FormDescription>
                  Visual style keywords (e.g., "modern, clean, minimalist")
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Enter keywords separated by commas"
                    disabled={isSubmitting}
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
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
                <FormDescription>
                  How should customers feel?
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Enter keywords separated by commas"
                    disabled={isSubmitting}
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
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
                <FormDescription>
                  What does your business do?
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Enter keywords separated by commas"
                    disabled={isSubmitting}
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Brand Strategy */}
        <div className="space-y-6 border-t pt-6">
          <div>
            <h2 className="text-lg font-semibold">Brand Strategy</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Define your brand deeper
            </p>
          </div>

          <FormField
            control={form.control}
            name="missionStatement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mission Statement *</FormLabel>
                <FormDescription>
                  What is your business purpose?
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Describe your business mission and purpose"
                    disabled={isSubmitting}
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandPillars"
            render={() => (
              <FormItem>
                <FormLabel>Brand Pillars *</FormLabel>
                <FormDescription>
                  3-5 core values that define your brand
                </FormDescription>
                <div className="space-y-3 mt-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`brandPillars.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder={`Pillar ${index + 1}`}
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={isSubmitting}
                          className="mt-1"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {fields.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append("")}
                    disabled={isSubmitting}
                    className="mt-3"
                  >
                    Add Pillar
                  </Button>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience *</FormLabel>
                <FormDescription>
                  Who is your ideal customer?
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Describe your target audience, demographics, and preferences"
                    disabled={isSubmitting}
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyValues"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Values</FormLabel>
                <FormDescription>
                  What are your core values? (optional)
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="e.g., integrity, innovation, customer-focus"
                    disabled={isSubmitting}
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keyTagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Tagline</FormLabel>
                <FormDescription>
                  A memorable one-liner for your brand (optional)
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="e.g., 'Think Different', 'Just Do It'"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" type="button" disabled={isSubmitting}>
            Save as Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit & Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
