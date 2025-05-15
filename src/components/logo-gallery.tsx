"use client";

import type { Logo, LogoBatch } from "@/types";
import { LogoCard, LogoSkeletonCard } from "./logo-card";

interface LogoGalleryProps {
  logoBatch: LogoBatch | null;
  onFeedback: (logoBatchId: string, feedback: "thumbs_up" | "thumbs_down") => void;
  loadingFeedbackFor: string | null; 
  isLoading: boolean; 
  expectedLogoCount?: number; 
}

export function LogoGallery({
  logoBatch,
  onFeedback,
  loadingFeedbackFor,
  isLoading,
  expectedLogoCount = 4, 
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
    // Optionally, show a message if the form has been submitted but no logos are available yet (e.g. still loading but logoBatch exists)
    // For now, returning null if no logos to display, which is fine if skeletons handle the loading state.
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-semibold text-center text-foreground">Your Logo Concepts</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {logoBatch.logos.map((logo) => (
          <LogoCard
            key={logo.id}
            logo={logo}
            onFeedback={(feedbackType) => onFeedback(logo.id, feedbackType)} // Pass logo.id for specific feedback if needed by handleFeedback
            isFeedbackLoading={loadingFeedbackFor === logo.id}
            businessName={logoBatch.generationInput.businessName}
          />
        ))}
      </div>
    </div>
  );
}
