
"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Logo } from "@/types";
import type { GenerateLogoConceptsInput } from "@/ai/flows/generate-logo-concepts";

interface BrandSheetProps {
  selectedLogo: Logo;
  brandDetails?: Omit<GenerateLogoConceptsInput, "userApiKey" | "numberOfLogos">;
}

export function BrandSheet({ selectedLogo, brandDetails }: BrandSheetProps) {
  if (!brandDetails) {
    return null; // Or some placeholder if brandDetails are essential but missing
  }

  // Simple parsing for color palette string for display
  const parseColorPalette = (paletteString?: string) => {
    if (!paletteString) return [];
    // Example: "Blue for trust, Gold for luxury" -> ["Blue for trust", "Gold for luxury"]
    // Example: "Red, Green, Blue" -> ["Red", "Green", "Blue"]
    return paletteString.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  const colorPaletteItems = parseColorPalette(brandDetails.preferredColorPalette);

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl mt-12">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          Brand Identity Snapshot
        </CardTitle>
        {brandDetails.businessName && (
          <CardDescription className="text-xl text-muted-foreground">
            For {brandDetails.businessName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-10 p-6 md:p-10">
        {/* Logo Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Logo</h2>
          <div className="flex justify-center items-center p-6 bg-slate-100 rounded-lg shadow-inner aspect-video max-h-[300px]">
            <Image
              src={selectedLogo.url}
              alt={`Selected logo for ${brandDetails.businessName || 'the brand'}`}
              width={250}
              height={250}
              className="object-contain"
              data-ai-hint="selected logo"
            />
          </div>
        </section>

        {/* Color Palette Section */}
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
            {/* 
            Future enhancement: If actual color values (hex, rgb) were extracted or provided,
            swatches could be rendered here. For now, displaying the descriptive text.
            <div className="flex flex-wrap gap-4 mt-3">
              {colorPaletteItems.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-md border shadow-md"
                    // Attempt to use item as background if it's a valid CSS color
                    // This is very basic and might not work for descriptive names
                    style={{ backgroundColor: item.split(' ')[0].toLowerCase() }} 
                  />
                  <span className="text-xs mt-1">{item}</span>
                </div>
              ))}
            </div>
            */}
          </section>
        )}

        {/* Typography Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Typography</h2>
          {brandDetails.fontStyle && (
            <div className="mb-6">
              <h3 className="text-lg font-medium">Requested Font Style for Logo:</h3>
              <p className="p-3 bg-muted/50 rounded-md italic">
                "{brandDetails.fontStyle}"
              </p>
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

        {/* Other Details Section */}
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


      </CardContent>
    </Card>
  );
}
