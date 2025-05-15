"use client";

import type { Logo, LogoBatch } from "@/types";
import { LogoCard, LogoSkeletonCard } from "./logo-card";

interface LogoGalleryProps {
  logoBatch: LogoBatch | null;
  onFeedback: (logoId: string, feedback: "thumbs_up" | "thumbs_down") => void;
  loadingFeedbackFor: string | null; // ID of the logo for which feedback is loading
  isLoading: boolean; // General loading for the whole gallery (e.g., initial generation)
  expectedLogoCount?: number; // Used for showing skeletons during initial load
}

export function LogoGallery({
  logoBatch,
  onFeedback,
  loadingFeedbackFor,
  isLoading,
  expectedLogoCount = 4, // Default if not provided
}: LogoGalleryProps) {
  if (isLoading && !logoBatch) {
    return (
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-semibold text-center text-foreground">
          Generating your logos...
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: expectedLogoCount }).map((_, i) => (
            <LogoSkeletonCard key={`skeleton-${i}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!logoBatch || logoBatch.logos.length === 0) {
    return null; // Or a message like "No logos generated yet."
  }

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-semibold text-center text-foreground">Your Logo Concepts</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {logoBatch.logos.map((logo) => (
          <LogoCard
            key={logo.id}
            logo={logo}
            onFeedback={(feedbackType) => onFeedback(logo.id, feedbackType)}
            isFeedbackLoading={loadingFeedbackFor === logo.id}
            businessName={logoBatch.generationInput.businessName}
          />
        ))}
      </div>
    </div>
  );
}
