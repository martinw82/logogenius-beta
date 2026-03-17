"use client";
import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // or wherever you use toasts (sonner/shadcn)
import type { Logo } from "@/types";
import type { GenerateLogoConceptsInput } from "@/ai/flows/generate-logo-concepts";
import { generateAIMockups } from "@/lib/services/ai-mockup-generator";
import { generateAISocialAssets } from "@/lib/services/ai-social-generator";

interface BrandSheetProps {
  selectedLogo: Logo;
  brandDetails?: Omit<GenerateLogoConceptsInput, "userApiKey" | "numberOfLogos">;
  onAssetsGenerated?: (mockups: any, social: any) => void; // optional callback for parent to save
}

export function BrandSheet({ selectedLogo, brandDetails, onAssetsGenerated }: BrandSheetProps) {
  const [mockups, setMockups] = useState<any>(null);
  const [socialAssets, setSocialAssets] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!brandDetails) return null;

  const parseColorPalette = (paletteString?: string) => {
    if (!paletteString) return [];
    return paletteString.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  const colorPaletteItems = parseColorPalette(brandDetails.preferredColorPalette);

  const handleGenerateAssets = async () => {
    if (!selectedLogo?.url) {
      toast.error("Please select a logo first");
      return;
    }

    setIsGenerating(true);
    try {
      const commonOptions = {
        businessName: brandDetails.businessName || "",
        brandColors: parseColorPalette(brandDetails.preferredColorPalette),
        industry: brandDetails.industry || "",
        logoStyle: selectedLogo.style || "modern minimalist",
        logoUrl: selectedLogo.url,
      };

      const [mockupResults, socialResults] = await Promise.all([
        generateAIMockups(commonOptions),
        generateAISocialAssets({
          ...commonOptions,
          tagline: selectedLogo.tagline || "",
        }),
      ]);

      setMockups(mockupResults);
      setSocialAssets(socialResults);

      toast.success("✅ Real Dynamic Mockups + Social Assets generated!");

      if (onAssetsGenerated) {
        onAssetsGenerated(mockupResults, socialResults);
      }
    } catch (err) {
      console.error(err);
      toast.error("Generation failed – check console");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl mt-12">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Brand Identity Snapshot</CardTitle>
        {brandDetails.businessName && (
          <CardDescription className="text-xl text-muted-foreground">
            For {brandDetails.businessName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-10 p-6 md:p-10">
        {/* Existing Logo, Color, Typography, Notes sections unchanged */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Logo</h2>
          <div className="flex justify-center items-center p-6 bg-slate-100 rounded-lg shadow-inner aspect-video max-h-[300px]">
            <Image src={selectedLogo.url} alt={`Selected logo`} width={250} height={250} className="object-contain" />
          </div>
        </section>

        {/* ... rest of your existing Color Palette, Typography, Additional Brand Notes sections stay exactly the same ... */}

        {/* NEW: Mockups + Social Assets Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Product Mockups + Social Assets</h2>
            <Button onClick={handleGenerateAssets} disabled={isGenerating || !!mockups}>
              {isGenerating ? "Generating with Dynamic Mockups..." : mockups ? "✅ Generated" : "Generate Mockups & Social Assets"}
            </Button>
          </div>

          {mockups && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="font-medium mb-2">T-Shirt</p>
                <Image src={mockups.tshirt} alt="T-shirt mockup" width={300} height={300} className="rounded-lg shadow" />
              </div>
              <div className="text-center">
                <p className="font-medium mb-2">Coffee Mug</p>
                <Image src={mockups.coffeeMug} alt="Mug mockup" width={300} height={300} className="rounded-lg shadow" />
              </div>
              <div className="text-center">
                <p className="font-medium mb-2">Tote Bag</p>
                <Image src={mockups.toteBag} alt="Tote mockup" width={300} height={300} className="rounded-lg shadow" />
              </div>
            </div>
          )}

          {socialAssets && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="font-medium mb-2">Instagram Post</p>
                <Image src={socialAssets.instagramPost} alt="IG" width={300} height={300} className="rounded-lg shadow" />
              </div>
              <div className="text-center">
                <p className="font-medium mb-2">YouTube Thumbnail</p>
                <Image src={socialAssets.youtubeThumbnail} alt="YT" width={300} height={300} className="rounded-lg shadow" />
              </div>
              <div className="text-center">
                <p className="font-medium mb-2">Website Hero</p>
                <Image src={socialAssets.websiteHero} alt="Hero" width={300} height={300} className="rounded-lg shadow" />
              </div>
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
