
"use client";

import { useState } from "react";
import { LogoForm } from "@/components/logo-form";
import { LogoGallery } from "@/components/logo-gallery";
import { PageHeader } from "@/components/page-header";
import type { LogoBatch } from "@/types";
import { generateLogoConcepts, type GenerateLogoConceptsInput } from "@/ai/flows/generate-logo-concepts";
import { refineLogoGeneration, type RefineLogoGenerationInput } from "@/ai/flows/refine-logo-generation";
import { useToast } from "@/hooks/use-toast";
import { constructBasePrompt, uuidv4 } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

export default function HomePage() {
  const [logoBatch, setLogoBatch] = useState<LogoBatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFeedbackFor, setLoadingFeedbackFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expectedLogoCount, setExpectedLogoCount] = useState<number>(4); // Default to 4


  const { toast } = useToast();

  const handleGenerateLogos = async (input: GenerateLogoConceptsInput) => {
    setIsLoading(true);
    setError(null);
    setLogoBatch(null);
    setExpectedLogoCount(input.numberOfLogos || 4); // Use submitted number or default

    try {
      const result = await generateLogoConcepts(input);
      if (result.logoUrls && result.logoUrls.length > 0) {
        const newLogoBatch: LogoBatch = {
          id: uuidv4(),
          logos: result.logoUrls.map(url => ({ id: uuidv4(), url })),
          generationInput: input, 
          basePrompt: constructBasePrompt(input), 
        };
        setLogoBatch(newLogoBatch);
        toast({
          title: "Logos Generated!",
          description: `${result.logoUrls.length} new logo concepts are ready.`,
        });
      } else {
        setError("No logos were generated. Please try adjusting your input.");
        toast({
          title: "Generation Issue",
          description: "No logos were generated. Try different keywords or settings.",
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
    targetLogoBatch: LogoBatch,
    logoId: string, 
    feedbackType: "thumbs_up" | "thumbs_down"
  ) => {
    if (!targetLogoBatch) return;

    setLoadingFeedbackFor(logoId); 
    setError(null);

    const { generationInput, basePrompt } = targetLogoBatch;

    const refineInput: RefineLogoGenerationInput = {
      businessName: generationInput.businessName,
      industry: generationInput.industry,
      keywords: generationInput.keywords,
      colorPalette: generationInput.preferredColorPalette,
      logoStyle: generationInput.preferredLogoStyle,
      iconPlacement: generationInput.iconPlacement, 
      fontStyle: generationInput.fontStyle,
      iconComplexity: generationInput.iconComplexity,
      targetAudience: generationInput.targetAudience,
      inspirationReferences: generationInput.inspirationReferences,
      usageContext: generationInput.usageContext, // Now a string
      negativeKeywords: generationInput.negativeKeywords,
      variationInstructions: generationInput.variationInstructions, // Added field
      feedback: feedbackType,
      previousPrompt: basePrompt,
    };

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
          icon={Lightbulb}
        />

        <LogoForm onSubmit={handleGenerateLogos} isLoading={isLoading} />

        {error && (
          <div className="mt-6 text-center text-destructive p-4 bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <LogoGallery
          logoBatch={logoBatch}
          onFeedback={handleFeedback}
          loadingFeedbackFor={loadingFeedbackFor}
          isLoading={isLoading}
          expectedLogoCount={expectedLogoCount}
        />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} LogoGenius. All rights reserved.
      </footer>
    </div>
  );
}
