"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  tier3FormSchema,
  type Tier3FormData,
  INDUSTRY_OPTIONS,
  LOGO_STYLE_OPTIONS,
  COMPOSITION_OPTIONS,
  ICON_PLACEMENT_OPTIONS,
  WEB3_PROJECT_TYPES,
} from "@/lib/schemas/order-forms";

interface Tier3FormProps {
  orderId: string;
  onSuccess?: (data: any) => void;
}

export function Tier3Form({ orderId, onSuccess }: Tier3FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<Tier3FormData>({
    resolver: zodResolver(tier3FormSchema),
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
      preferredLogoStyle: "",
      composition: "",
      iconPlacement: "",
      web3BlockchainFocus: false,
      web3ProjectType: "",
      web3EnsDomainIdeas: "",
      web3TokenSymbolIdea: "",
      web3CommunityValues: "",
      web3NftAesthetic: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "brandPillars",
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      form.setValue("brandAssetsFile", undefined);
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      setFileError("File type must be PDF, PNG, JPG, or SVG");
      return;
    }

    form.setValue("brandAssetsFile", file);
  }

  async function onSubmit(data: Tier3FormData) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("tier", "premium");

      // Prepare data without file
      const { brandAssetsFile, ...formDataWithoutFile } = data;
      formData.append("data", JSON.stringify(formDataWithoutFile));

      // Add file if present
      if (brandAssetsFile) {
        formData.append("file", brandAssetsFile);
      }

      const response = await fetch(`/api/orders/${orderId}/submit`, {
        method: "POST",
        body: formData,
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
                <FormControl>
                  <Textarea
                    placeholder="Visual style keywords"
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
                <FormControl>
                  <Textarea
                    placeholder="How should customers feel?"
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
                <FormControl>
                  <Textarea
                    placeholder="What does your business do?"
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
                <FormDescription>3-5 core values</FormDescription>
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
                <FormControl>
                  <Textarea
                    placeholder="Describe your target audience"
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
                <FormControl>
                  <Input
                    placeholder="A memorable one-liner for your brand"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Logo Design Preferences */}
        <div className="space-y-6 border-t pt-6">
          <div>
            <h2 className="text-lg font-semibold">Logo Design Preferences</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Guide the visual design of your logo
            </p>
          </div>

          <FormField
            control={form.control}
            name="preferredLogoStyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Logo Style *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a logo style" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LOGO_STYLE_OPTIONS.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
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
            name="composition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Composition *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select composition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMPOSITION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
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
            name="iconPlacement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon Placement *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon placement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ICON_PLACEMENT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Web3 Section */}
        <div className="space-y-6 border-t pt-6">
          <div>
            <h2 className="text-lg font-semibold">Web3 & Blockchain</h2>
            <p className="text-sm text-muted-foreground mt-1">
              If your project is Web3-focused, provide details (all optional)
            </p>
          </div>

          <FormField
            control={form.control}
            name="web3BlockchainFocus"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer">
                  This is a Web3/Blockchain project
                </FormLabel>
              </FormItem>
            )}
          />

          {form.watch("web3BlockchainFocus") && (
            <>
              <FormField
                control={form.control}
                name="web3ProjectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WEB3_PROJECT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                name="web3EnsDomainIdeas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ENS Domain Ideas</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., myprotocol.eth, defiapp.eth"
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
                name="web3TokenSymbolIdea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Symbol Idea</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., PROTO, DEFI, DAO"
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
                name="web3CommunityValues"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Values</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., decentralization, transparency, innovation"
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
                name="web3NftAesthetic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NFT Aesthetic (if applicable)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the visual aesthetic for NFTs or digital assets"
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
            </>
          )}
        </div>

        {/* File Upload */}
        <div className="space-y-6 border-t pt-6">
          <div>
            <h2 className="text-lg font-semibold">Brand Assets</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload any existing brand files (optional)
            </p>
          </div>

          <FormItem>
            <FormLabel>Brand Assets File</FormLabel>
            <FormDescription>
              Accepted formats: PDF, PNG, JPG, SVG (Max 10MB)
            </FormDescription>
            <FormControl>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-2 text-muted-foreground"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 5.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2l2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, PNG, JPG or SVG (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.svg"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </FormControl>
            {fileError && (
              <p className="text-sm font-medium text-destructive mt-2">
                {fileError}
              </p>
            )}
            {form.watch("brandAssetsFile") && (
              <p className="text-sm text-muted-foreground mt-2">
                File selected: {form.watch("brandAssetsFile")?.name}
              </p>
            )}
          </FormItem>
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
