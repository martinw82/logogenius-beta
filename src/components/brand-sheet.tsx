"use client";
import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Logo } from "@/types";
import type { GenerateLogoConceptsInput } from "@/ai/flows/generate-logo-concepts";
import { generateAIMockups } from "@/lib/services/ai-mockup-generator";
import { generateAISocialAssets } from "@/lib/services/ai-social-generator";

interface BrandSheetProps {
  selectedLogo: Logo;
  brandDetails?: Omit<GenerateLogoConceptsInput, "userApiKey" | "numberOfLogos">;
  onAssetsGenerated?: (mockups: any, social: any) => void;
}

export function BrandSheet({ selectedLogo, brandDetails, onAssetsGenerated }: BrandSheetProps) {
  const [mockups, setMockups] = useState<any>(null);
  const [socialAssets, setSocialAssets] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  if (!brandDetails) return null;

  const parseColorPalette = (paletteString?: string) => {
    if (!paletteString) return [];
    return paletteString.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  const colorPaletteItems = parseColorPalette(brandDetails.preferredColorPalette);

  const handleGenerateAssets = async () => {
    if (!selectedLogo?.url) {
      toast({ title: "Error", description: "Please select a logo first", variant: "destructive" });
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
        generateAISocialAssets({ ...commonOptions, tagline: selectedLogo.tagline || "" }),
      ]);

      setMockups(mockupResults);
      setSocialAssets(socialResults);

      toast({ title: "✅ Success", description: "Real Dynamic Mockups + Social Assets generated!" });

      if (onAssetsGenerated) onAssetsGenerated(mockupResults, socialResults);
    } catch (err) {
      console.error(err);
      toast({ title: "Generation failed", description: "Check console for details", variant: "destructive" });
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
        {/* === ORIGINAL SECTIONS RESTORED === */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Logo</h2>
          <div className="flex justify-center items-center p-6 bg-slate-100 rounded-lg shadow-inner aspect-video max-h-[300px]">
            <Image
              src={selectedLogo.url}
              alt={`Selected logo for ${brandDetails.businessName || 'the brand'}`}
              width={250}
              height={250}
              className="object-contain"
            />
          </div>
        </section>

        {(brandDetails.preferredColorPalette || colorPaletteItems.length > 0) && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Color Palette</h2>
            <p className="text-sm text-muted-foreground mb-3">
              The following color preferences were specified for the logo generation:
            </p>
            {brandDetails.preferredColorPalette && (
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="italic">"{brandDetails.preferredColorPalette}"</p>
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Typography</h2>
          {brandDetails.fontStyle && (
            <div className="mb-6">
              <h3 className="text-lg font-medium">Requested Font Style for Logo:</h3>
              <p className="p-3 bg-muted/50 rounded-md italic">"{brandDetails.fontStyle}"</p>
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium mb-2">Application Type Samples (using Inter):</h3>
            <div className="space-y-3 font-sans">
              <p className="text-4xl font-bold">{brandDetails.businessName || "Brand Name"}</p>
              <p className="text-2xl">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</p>
              <p className="text-md">0 1 2 3 4 5 6 7 8 9</p>
              <p className="text-lg">The quick brown fox jumps over the lazy dog.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Additional Brand Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {brandDetails.industry && <div><span className="font-semibold">Industry:</span> {brandDetails.industry}</div>}
            {brandDetails.keywords && <div><span className="font-semibold">Keywords:</span> {brandDetails.keywords}</div>}
            {brandDetails.preferredLogoStyle && <div><span className="font-semibold">Preferred Logo Style:</span> {brandDetails.preferredLogoStyle}</div>}
            {brandDetails.composition && <div><span className="font-semibold">Composition:</span> {brandDetails.composition}</div>}
            {brandDetails.iconPlacement && <div><span className="font-semibold">Icon Placement:</span> {brandDetails.iconPlacement}</div>}
            {brandDetails.iconComplexity && <div><span className="font-semibold">Icon Complexity:</span> {brandDetails.iconComplexity}</div>}
            {brandDetails.iconSpecifics && <div><span className="font-semibold">Icon Specifics:</span> {brandDetails.iconSpecifics}</div>}
            {brandDetails.targetAudience && <div><span className="font-semibold">Target Audience:</span> {brandDetails.targetAudience}</div>}
            {brandDetails.inspirationReferences && <div><span className="font-semibold">Inspiration:</span> {brandDetails.inspirationReferences}</div>}
            {brandDetails.usageContext && <div><span className="font-semibold">Usage Context:</span> {brandDetails.usageContext}</div>}
            {brandDetails.negativeKeywords && <div><span className="font-semibold">To Avoid:</span> {brandDetails.negativeKeywords}</div>}
            {brandDetails.competitorsToAvoid && <div><span className="font-semibold">Differentiate From:</span> {brandDetails.competitorsToAvoid}</div>}
          </div>
        </section>

        {/* === NEW: MOCKUPS + SOCIAL ASSETS (your main request) === */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Product Mockups + Social Assets</h2>
            <Button onClick={handleGenerateAssets} disabled={isGenerating || !!mockups}>
              {isGenerating ? "Generating with Dynamic Mockups..." : mockups ? "✅ Generated" : "Generate Mockups & Social Assets"}
            </Button>
          </div>

          {mockups && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center"><p className="font-medium mb-2">T-Shirt</p><Image src={mockups.tshirt} alt="T-shirt" width={300} height={300} className="rounded-lg shadow" /></div>
              <div className="text-center"><p className="font-medium mb-2">Coffee Mug</p><Image src={mockups.coffeeMug} alt="Mug" width={300} height={300} className="rounded-lg shadow" /></div>
              <div className="text-center"><p className="font-medium mb-2">Tote Bag</p><Image src={mockups.toteBag} alt="Tote" width={300} height={300} className="rounded-lg shadow" /></div>
            </div>
          )}

          {socialAssets && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center"><p className="font-medium mb-2">Instagram Post</p><Image src={socialAssets.instagramPost} alt="IG" width={300} height={300} className="rounded-lg shadow" /></div>
              <div className="text-center"><p className="font-medium mb-2">YouTube Thumbnail</p><Image src={socialAssets.youtubeThumbnail} alt="YT" width={300} height={300} className="rounded-lg shadow" /></div>
              <div className="text-center"><p className="font-medium mb-2">Website Hero</p><Image src={socialAssets.websiteHero} alt="Hero" width={300} height={300} className="rounded-lg shadow" /></div>
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
