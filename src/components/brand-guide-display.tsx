
"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { Logo } from "@/types";
import type { ExtendedGenerateLogoConceptsInput } from "@/types"; 
import type { GenerateBrandGuideTextOutput } from "@/ai/flows/generate-brand-guide-text";
import { Loader2, Type, Palette as PaletteIcon, Droplet, GlobeLock } from "lucide-react"; // Renamed Palette to PaletteIcon to avoid conflict

interface BrandGuideDisplayProps {
  selectedLogo: Logo;
  brandDetails: ExtendedGenerateLogoConceptsInput; 
  brandNarrative: GenerateBrandGuideTextOutput | null;
  isLoadingNarrative: boolean;
}

const DetailItem = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div>
      <span className="font-semibold">{label}:</span> {value}
    </div>
  );
};

const ColorDisplaySwatch = ({ colorValue }: { colorValue?: string }) => {
  if (!colorValue || colorValue.trim() === "") return null;
  
  const isValidColor = /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(colorValue) || /^[a-zA-Z]+$/.test(colorValue);

  return (
    <div className="flex items-center gap-2"> 
      {isValidColor && (
        <div 
          className="w-4 h-4 rounded border shrink-0" 
          style={{ backgroundColor: colorValue }}
          title={`Color: ${colorValue}`}
        ></div>
      )}
      <span className="text-xs italic">{colorValue}</span>
    </div>
  );
};


export function BrandGuideDisplay({ selectedLogo, brandDetails, brandNarrative, isLoadingNarrative }: BrandGuideDisplayProps) {

  const renderColorSwatches = (colorString?: string) => {
    if (!colorString || colorString.trim() === "") return null;
    const colors = colorString.split(',').map(c => c.trim()).filter(Boolean);
    if (colors.length === 0) return <p className="text-xs italic text-muted-foreground">Not specified.</p>;
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
        {colors.map((color, index) => (
          <ColorDisplaySwatch key={index} colorValue={color} />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl mt-12">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          Brand Hub
        </CardTitle>
        {brandDetails.businessName && (
          <CardDescription className="text-xl text-muted-foreground">
            For {brandDetails.businessName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6 md:p-10">
        <Tabs defaultValue="snapshot" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
            <TabsTrigger value="snapshot">Logo & Visual Inputs</TabsTrigger>
            <TabsTrigger value="narrative">Brand Narrative</TabsTrigger>
            <TabsTrigger value="web3">Web3 Presence</TabsTrigger>
          </TabsList>

          <TabsContent value="snapshot">
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Selected Logo</h2>
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

              <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                  <PaletteIcon className="w-6 h-6 text-primary/80" />
                  Color Palette Inputs
                </h2>
                 <p className="text-sm text-muted-foreground mb-3">
                  The following color preferences were specified during form input:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {brandDetails.primaryColors && (
                      <div className="p-3 bg-muted/30 rounded-md">
                          <h3 className="font-medium mb-1 text-sm flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5"/>Primary Color(s):</h3>
                          {renderColorSwatches(brandDetails.primaryColors)}
                      </div>
                    )}
                    {brandDetails.secondaryColors && (
                      <div className="p-3 bg-muted/30 rounded-md">
                          <h3 className="font-medium mb-1 text-sm flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5"/>Secondary Color(s):</h3>
                           {renderColorSwatches(brandDetails.secondaryColors)}
                      </div>
                    )}
                    {brandDetails.accentColors && (
                      <div className="p-3 bg-muted/30 rounded-md">
                          <h3 className="font-medium mb-1 text-sm flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5"/>Accent Color(s):</h3>
                          {renderColorSwatches(brandDetails.accentColors)}
                      </div>
                    )}
                     {(!brandDetails.primaryColors && !brandDetails.secondaryColors && !brandDetails.accentColors) && (
                        <p className="text-xs text-muted-foreground italic p-3 bg-muted/30 rounded-md">No specific primary, secondary, or accent colors provided.</p>
                     )}
                  </div>
                  <div className="space-y-4">
                    {brandDetails.colorPaletteMood && (
                      <div className="p-3 bg-muted/30 rounded-md">
                        <h3 className="font-medium mb-1 text-sm">Overall Palette Mood:</h3>
                        <p className="italic text-xs">"{brandDetails.colorPaletteMood}"</p>
                      </div>
                    )}
                     {brandDetails.preferredColorPalette && ( 
                         <div className="p-3 bg-muted/30 rounded-md">
                            <h3 className="font-medium mb-1 text-sm">Combined Palette (sent to AI for logo gen):</h3>
                            <p className="italic text-xs">"{brandDetails.preferredColorPalette}"</p>
                         </div>
                    )}
                     {(!brandDetails.colorPaletteMood && !brandDetails.preferredColorPalette) && (
                        <p className="text-xs text-muted-foreground italic p-3 bg-muted/30 rounded-md">No mood or combined palette string was generated for AI.</p>
                     )}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                  <Type className="w-6 h-6 text-primary/80" />
                  Typography Inputs
                </h2>
                {brandDetails.fontStyle && (
                  <div className="mb-4 p-4 bg-muted/50 rounded-md">
                    <h3 className="text-sm font-medium">Requested Font Style for Logo:</h3>
                    <p className="italic text-xs">
                      "{brandDetails.fontStyle}"
                    </p>
                  </div>
                )}
                <div className="space-y-3 text-sm p-4 bg-muted/50 rounded-md">
                  {brandDetails.fontHeadings && <p><span className="font-semibold">Brand Headings Font:</span> {brandDetails.fontHeadings}</p>}
                  {brandDetails.fontBody && <p><span className="font-semibold">Brand Body Font:</span> {brandDetails.fontBody}</p>}
                  {brandDetails.fontOther && <p><span className="font-semibold">Brand Other Fonts:</span> {brandDetails.fontOther}</p>}
                  {(!brandDetails.fontHeadings && !brandDetails.fontBody && !brandDetails.fontOther && !brandDetails.fontStyle) && (
                    <p className="text-xs text-muted-foreground italic">No specific typography inputs provided for logo or brand.</p>
                  )}
                </div>
                

                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2 text-muted-foreground">Application Type Samples (using Inter):</h3>
                  <div className="space-y-3 font-sans p-4 border rounded-md bg-slate-50">
                    <p className="text-3xl font-bold">{brandDetails.businessName || "Brand Name"}</p>
                    <p className="text-xl">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</p>
                    <p className="text-sm">0 1 2 3 4 5 6 7 8 9</p>
                    <p className="text-base">The quick brown fox jumps over the lazy dog.</p>
                  </div>
                </div>
              </section>

              <section>
                  <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Additional Logo Input Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <DetailItem label="Industry" value={brandDetails.industry} />
                      <DetailItem label="Keywords" value={brandDetails.keywords} />
                      <DetailItem label="Preferred Logo Style" value={brandDetails.preferredLogoStyle} />
                      <DetailItem label="Composition" value={brandDetails.composition} />
                      <DetailItem label="Icon Placement" value={brandDetails.iconPlacement} />
                      <DetailItem label="Icon Complexity" value={brandDetails.iconComplexity} />
                      <DetailItem label="Icon Specifics" value={brandDetails.iconSpecifics} />
                      <DetailItem label="Target Audience" value={brandDetails.targetAudience} />
                      <DetailItem label="Inspiration" value={brandDetails.inspirationReferences} />
                      <DetailItem label="Usage Context" value={brandDetails.usageContext} />
                      <DetailItem label="To Avoid" value={brandDetails.negativeKeywords} />
                      <DetailItem label="Differentiate From" value={brandDetails.competitorsToAvoid} />
                      {brandDetails.referenceImageDataUri && <div><span className="font-semibold">Reference Image:</span> Provided</div>}
                  </div>
                   {Object.values(brandDetails).every(val => val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) &&
                     !brandDetails.referenceImageDataUri && 
                     !brandDetails.businessName && 
                     !brandDetails.industry &&
                     !brandDetails.keywords &&
                     <p className="text-xs text-muted-foreground italic mt-2">No additional logo input details were provided.</p>
                   }
              </section>
            </div>
          </TabsContent>

          <TabsContent value="narrative">
            <div className="space-y-8">
              {isLoadingNarrative ? (
                 <div className="flex flex-col items-center justify-center space-y-4 py-10">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating brand narrative...</p>
                 </div>
              ) : brandNarrative ? (
                <>
                  <section>
                    <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Project Overview</h2>
                    <div
                        className="prose prose-sm max-w-none text-foreground"
                        dangerouslySetInnerHTML={{ __html: brandNarrative.projectOverviewSummary.replace(/\n/g, "<br />") || "<p>No overview generated.</p>" }}
                    />
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Brand Identity</h2>
                     <div
                        className="prose prose-sm max-w-none text-foreground"
                        dangerouslySetInnerHTML={{ __html: brandNarrative.brandIdentitySummary.replace(/\n/g, "<br />") || "<p>No identity summary generated.</p>" }}
                    />
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Core Strategic Inputs</h2>
                    <div className="space-y-3 text-sm">
                        <DetailItem label="Mission Statement" value={brandDetails.missionStatement} />
                        <DetailItem label="Brand Pillars" value={brandDetails.brandPillars} />
                        <DetailItem label="Brand Archetype" value={brandDetails.brandArchetype} />
                        <DetailItem label="Key Tagline" value={brandDetails.keyTagline} />
                        {(!brandDetails.missionStatement && !brandDetails.brandPillars && !brandDetails.brandArchetype && !brandDetails.keyTagline) && <p className="text-muted-foreground italic">No additional strategic inputs were provided for narrative generation.</p>}
                    </div>
                  </section>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-10">
                  Brand narrative will appear here once generated. Select a logo from the gallery first.
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="web3">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-3 border-b pb-2 flex items-center gap-2">
                  <GlobeLock className="w-6 h-6 text-primary/80" /> Web3 Presence Considerations
                </h2>
                <div className="space-y-4 text-sm p-4 bg-muted/50 rounded-md">
                  <DetailItem label="Primary Blockchain Focus" value={brandDetails.web3BlockchainFocus} />
                  <DetailItem label="Web3 Project Type" value={brandDetails.web3ProjectType} />
                  <DetailItem label="ENS/Domain Ideas" value={brandDetails.web3EnsDomainIdeas} />
                  <DetailItem label="Token Symbol Idea" value={brandDetails.web3TokenSymbolIdea} />
                  <DetailItem label="Core Community Values" value={brandDetails.web3CommunityValues} />
                  <DetailItem label="Desired NFT Aesthetic" value={brandDetails.web3NftAesthetic} />
                  
                  {(!brandDetails.web3BlockchainFocus &&
                    !brandDetails.web3ProjectType &&
                    !brandDetails.web3EnsDomainIdeas &&
                    !brandDetails.web3TokenSymbolIdea &&
                    !brandDetails.web3CommunityValues &&
                    !brandDetails.web3NftAesthetic) && (
                      <p className="text-xs text-muted-foreground italic">No Web3 specific considerations were provided.</p>
                  )}
                </div>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

    
