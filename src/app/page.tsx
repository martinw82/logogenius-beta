
"use client";

import { useState, useEffect, useRef } from "react";
import { LogoForm } from "@/components/logo-form";
import { LogoGallery } from "@/components/logo-gallery";
import { PageHeader } from "@/components/page-header";
import { BrandGuideDisplay } from "@/components/brand-guide-display";
import type { Logo, LogoBatch } from "@/types";
import type { GenerateLogoConceptsInput } from "@/ai/flows/generate-logo-concepts";
import { generateLogoConcepts } from "@/ai/flows/generate-logo-concepts";
import type { RefineLogoGenerationInput } from "@/ai/flows/refine-logo-generation";
import { refineLogoGeneration } from "@/ai/flows/refine-logo-generation";
import { useToast } from "@/hooks/use-toast";
import { constructBasePrompt, uuidv4 } from "@/lib/utils";
import { ApiKeyInput } from "@/components/api-key-input";
import type { GenerateBrandGuideTextOutput, GenerateBrandGuideTextInput } from "@/ai/flows/generate-brand-guide-text";
import { generateBrandGuideText } from "@/ai/flows/generate-brand-guide-text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Zap } from "lucide-react";

const API_KEY_STORAGE_KEY = "userGoogleApiKey";


export default function HomePage() {
  const [logoBatch, setLogoBatch] = useState<LogoBatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFeedbackFor, setLoadingFeedbackFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expectedLogoCount, setExpectedLogoCount] = useState<number>(4);
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [selectedLogoForBrandSheet, setSelectedLogoForBrandSheet] = useState<Logo | null>(null);
  const [brandGuideText, setBrandGuideText] = useState<GenerateBrandGuideTextOutput | null>(null);
  const [isGeneratingBrandText, setIsGeneratingBrandText] = useState(false);

  const brandSheetRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setUserApiKey(storedApiKey);
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === API_KEY_STORAGE_KEY) {
        setUserApiKey(event.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const { toast } = useToast();

  const getApiKey = (): string | undefined => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_KEY_STORAGE_KEY) || undefined;
    }
    return undefined;
  };

  const handleGenerateLogos = async (
    aiInput: GenerateLogoConceptsInput & {
      missionStatement?: string;
      brandPillars?: string;
      brandArchetype?: string;
      keyTagline?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    setLogoBatch(null);
    setSelectedLogoForBrandSheet(null);
    setBrandGuideText(null);
    setExpectedLogoCount(aiInput.numberOfLogos || 4);

    const currentApiKey = getApiKey();
    const finalInput: GenerateLogoConceptsInput = { ...aiInput };
    if (currentApiKey) {
      finalInput.userApiKey = currentApiKey;
    }

    try {
      const result = await generateLogoConcepts(finalInput);
      if (result.logoUrls && result.logoUrls.length > 0) {
        const newLogoBatch: LogoBatch = {
          id: uuidv4(),
          logos: result.logoUrls.map(url => ({ id: uuidv4(), url })),
          generationInput: { 
            businessName: aiInput.businessName,
            industry: aiInput.industry,
            keywords: aiInput.keywords,
            preferredColorPalette: aiInput.preferredColorPalette,
            primaryColors: aiInput.primaryColors,
            secondaryColors: aiInput.secondaryColors,
            accentColors: aiInput.accentColors,
            colorPaletteMood: aiInput.colorPaletteMood,
            preferredLogoStyle: aiInput.preferredLogoStyle,
            composition: aiInput.composition,
            iconPlacement: aiInput.iconPlacement,
            fontStyle: aiInput.fontStyle,
            fontHeadings: aiInput.fontHeadings,
            useHeadingsFontForLogo: aiInput.useHeadingsFontForLogo,
            fontBody: aiInput.fontBody,
            useBodyFontForLogo: aiInput.useBodyFontForLogo,
            fontOther: aiInput.fontOther,
            useOtherFontForLogo: aiInput.useOtherFontForLogo,
            iconComplexity: aiInput.iconComplexity,
            iconSpecifics: aiInput.iconSpecifics,
            targetAudience: aiInput.targetAudience,
            inspirationReferences: aiInput.inspirationReferences,
            usageContext: aiInput.usageContext,
            negativeKeywords: aiInput.negativeKeywords,
            competitorsToAvoid: aiInput.competitorsToAvoid,
            variationInstructions: aiInput.variationInstructions,
            numberOfLogos: aiInput.numberOfLogos,
            referenceImageDataUri: aiInput.referenceImageDataUri,
            missionStatement: aiInput.missionStatement,
            brandPillars: aiInput.brandPillars,
            brandArchetype: aiInput.brandArchetype,
            keyTagline: aiInput.keyTagline,
            web3BlockchainFocus: aiInput.web3BlockchainFocus,
            web3ProjectType: aiInput.web3ProjectType,
            web3EnsDomainIdeas: aiInput.web3EnsDomainIdeas,
            web3TokenSymbolIdea: aiInput.web3TokenSymbolIdea,
            web3CommunityValues: aiInput.web3CommunityValues,
            web3NftAesthetic: aiInput.web3NftAesthetic,
          },
          basePrompt: constructBasePrompt(aiInput),
        };
        setLogoBatch(newLogoBatch);
        toast({
          title: "Logos Generated!",
          description: `${result.logoUrls.length} new logo concepts are ready. Select one to view brand details.`,
        });
      } else {
        setError("No logos were generated. Please try adjusting your input or API key.");
        toast({
          title: "Generation Issue",
          description: "No logos were generated. Try different keywords, settings, or check your API key.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Error generating logos:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to generate logos: ${errorMessage}`);
      toast({
        title: "Generation Failed",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (
    logoId: string,
    feedbackType: "thumbs_up" | "thumbs_down"
  ) => {
    if (!logoBatch) return;

    setLoadingFeedbackFor(logoId);
    setError(null);

    const { generationInput, basePrompt } = logoBatch;
    const currentApiKey = getApiKey();

    const refineInput: RefineLogoGenerationInput = {
      businessName: generationInput.businessName,
      industry: generationInput.industry,
      keywords: generationInput.keywords,
      colorPalette: generationInput.preferredColorPalette,
      logoStyle: generationInput.preferredLogoStyle,
      composition: generationInput.composition,
      iconPlacement: generationInput.iconPlacement,
      fontStyle: generationInput.fontStyle,
      iconComplexity: generationInput.iconComplexity,
      iconSpecifics: generationInput.iconSpecifics,
      targetAudience: generationInput.targetAudience,
      inspirationReferences: generationInput.inspirationReferences,
      usageContext: generationInput.usageContext,
      negativeKeywords: generationInput.negativeKeywords,
      competitorsToAvoid: generationInput.competitorsToAvoid,
      variationInstructions: generationInput.variationInstructions,
      referenceImageDataUri: generationInput.referenceImageDataUri,
      feedback: feedbackType,
      previousPrompt: basePrompt,
    };

    if (currentApiKey) {
      refineInput.userApiKey = currentApiKey;
    }

    try {
      const refinedResult = await refineLogoGeneration(refineInput);
      toast({
        title: "Feedback Received!",
        description: (
          <div className="flex flex-col gap-1">
            <p>Thanks! We'll use this to improve future suggestions.</p>
            <p className="text-xs mt-1">Refined prompt idea: "${refinedResult.prompt.substring(0, 100)}..."</p>
          </div>
        ),
        duration: 7000,
      });
    } catch (e) {
      console.error("Error refining prompt:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to process feedback: ${errorMessage}`);
      toast({
        title: "Feedback Error",
        description: `Could not process feedback: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoadingFeedbackFor(null);
    }
  };

  const handleSelectLogoForDisplay = async (logo: Logo) => {
    setSelectedLogoForBrandSheet(logo);
    setBrandGuideText(null); 
    setIsGeneratingBrandText(true);

    if (!logoBatch) {
      setIsGeneratingBrandText(false);
      return;
    }
    const { generationInput } = logoBatch;
    const currentApiKey = getApiKey();

    const brandTextGenInput: GenerateBrandGuideTextInput = {
      businessName: generationInput.businessName,
      industry: generationInput.industry,
      keywords: generationInput.keywords,
      selectedLogoUrl: logo.url,
      preferredColorPalette: generationInput.preferredColorPalette,
      fontStyle: generationInput.fontStyle,
      missionStatement: generationInput.missionStatement,
      brandPillars: generationInput.brandPillars,
      brandArchetype: generationInput.brandArchetype,
      keyTagline: generationInput.keyTagline,
    };

    if (currentApiKey) {
      brandTextGenInput.userApiKey = currentApiKey;
    }

    try {
      const result = await generateBrandGuideText(brandTextGenInput);
      setBrandGuideText(result);
      toast({
        title: "Brand Narrative Generated",
        description: "Additional brand details are ready.",
      });
    } catch (e) {
      console.error("Error generating brand guide text:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      toast({
        title: "Brand Narrative Error",
        description: `Could not generate brand narrative: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBrandText(false);
    }

    setTimeout(() => {
      brandSheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <PageHeader
          title="LogoGenius"
          description="Let AI craft the perfect logo for your brand. Describe your vision, and watch concepts come to life."
          imageUrl="/logogenius-logo.png"
          imageAlt="LogoGenius App Logo"
        />

        <Card className="mb-8 bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-primary">
              <Info className="w-5 h-5 mr-2" />
              Welcome to LogoGenius!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/80 space-y-2">
            <p>
              <span className="font-semibold text-amber-600 dark:text-amber-400">BETA NOTICE:</span> LogoGenius is currently in beta. We're actively developing new features and refining existing ones. Your feedback is invaluable!
            </p>
            <p>
              Simply describe your brand and vision in the form below, and our AI will generate unique logo concepts and foundational brand narratives to kickstart your project.
            </p>
            <p>
              <Zap className="w-4 h-4 inline-block mr-1 text-blue-500" /> 
              For uninterrupted or extended use, you can add your own Google AI API key in the "Use Your Own API Key" section at the bottom of this page. This will utilize your personal quota.
            </p>
          </CardContent>
        </Card>

        <LogoForm onSubmit={handleGenerateLogos} isLoading={isLoading} />

        {error && (
          <div className="mt-6 text-center text-destructive p-4 bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <LogoGallery
          logoBatch={logoBatch}
          onFeedback={(logoId, feedbackType) => handleFeedback(logoId, feedbackType)}
          onSelectLogoForBrandSheet={handleSelectLogoForDisplay}
          loadingFeedbackFor={loadingFeedbackFor}
          isLoading={isLoading}
          expectedLogoCount={expectedLogoCount}
        />

        {selectedLogoForBrandSheet && logoBatch && (
          <div ref={brandSheetRef} className="mt-12">
            <BrandGuideDisplay
              selectedLogo={selectedLogoForBrandSheet}
              brandDetails={logoBatch.generationInput}
              brandNarrative={brandGuideText}
              isLoadingNarrative={isGeneratingBrandText}
            />
          </div>
        )}

        <div className="mt-12">
           <ApiKeyInput />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} LogoGenius. All rights reserved.
      </footer>
    </div>
  );
}
