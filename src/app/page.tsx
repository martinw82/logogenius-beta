
"use client";

import { useState, useEffect } from "react";
import { LogoForm } from "@/components/logo-form";
import { LogoGallery } from "@/components/logo-gallery";
import { PageHeader } from "@/components/page-header";
import type { LogoBatch } from "@/types";
import { generateLogoConcepts, type GenerateLogoConceptsInput } from "@/ai/flows/generate-logo-concepts";
import { refineLogoGeneration, type RefineLogoGenerationInput } from "@/ai/flows/refine-logo-generation";
import { useToast } from "@/hooks/use-toast";
import { constructBasePrompt, uuidv4 } from "@/lib/utils";
// import { Sparkles } from "lucide-react"; // No longer needed if only used for PageHeader icon
import { ApiKeyInput } from "@/components/api-key-input";

const API_KEY_STORAGE_KEY = "userGoogleApiKey";


export default function HomePage() {
  const [logoBatch, setLogoBatch] = useState<LogoBatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFeedbackFor, setLoadingFeedbackFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expectedLogoCount, setExpectedLogoCount] = useState<number>(4);
  const [userApiKey, setUserApiKey] = useState<string | null>(null); 

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

  const handleGenerateLogos = async (aiInput: GenerateLogoConceptsInput) => {
    setIsLoading(true);
    setError(null);
    setLogoBatch(null);
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
            ...aiInput,
            userApiKey: undefined 
          },
          basePrompt: constructBasePrompt(aiInput),
        };
        setLogoBatch(newLogoBatch);
        toast({
          title: "Logos Generated!",
          description: `${result.logoUrls.length} new logo concepts are ready.`,
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
            <p className="text-xs mt-1">Refined prompt idea: "${refinedResult.prompt.substring(0,100)}..."</p>
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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <PageHeader
          title="LogoGenius"
          description="Let AI craft the perfect logo for your brand. Describe your vision, and watch concepts come to life."
          imageUrl="/logogenius-logo.png" 
          imageAlt="LogoGenius App Logo"
        />

        <LogoForm onSubmit={handleGenerateLogos} isLoading={isLoading} />

        {error && (
          <div className="mt-6 text-center text-destructive p-4 bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <LogoGallery
          logoBatch={logoBatch}
          onFeedback={(logoId, feedbackType) => handleFeedback(logoId, feedbackType)}
          loadingFeedbackFor={loadingFeedbackFor}
          isLoading={isLoading}
          expectedLogoCount={expectedLogoCount}
        />

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
