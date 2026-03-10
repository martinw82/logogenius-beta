
"use client";

import { useState } from "react";
import type { Logo, LogoBatch } from "@/types";
import { LogoCard, LogoSkeletonCard } from "./logo-card";
import { LogoMockupModal } from "./LogoMockupModal";

interface LogoGalleryProps {
  logoBatch: LogoBatch | null;
  onFeedback: (logoBatchId: string, feedback: "thumbs_up" | "thumbs_down") => void;
  onSelectLogoForBrandSheet: (logo: Logo) => void;
  loadingFeedbackFor: string | null;
  isLoading: boolean;
  expectedLogoCount?: number;
}

export function LogoGallery({
  logoBatch,
  onFeedback,
  onSelectLogoForBrandSheet,
  loadingFeedbackFor,
  isLoading,
  expectedLogoCount = 4,
}: LogoGalleryProps) {
  const [mockupModalOpen, setMockupModalOpen] = useState(false);

  const handleViewMockups = (logo: Logo) => {
    setMockupModalOpen(true);
  };

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
    return null;
  }

  return (
    <>
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-semibold text-center text-foreground">Your Logo Concepts</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {logoBatch.logos.map((logo) => (
            <LogoCard
              key={logo.id}
              logo={logo}
              onFeedback={(feedbackType) => onFeedback(logo.id, feedbackType)}
              onSelectForBrandSheet={onSelectLogoForBrandSheet}
              onViewMockups={handleViewMockups}
              isFeedbackLoading={loadingFeedbackFor === logo.id}
              businessName={logoBatch.generationInput.businessName}
            />
          ))}
        </div>
      </div>

      {/* Mockup Modal - displays logo on 3 different templates */}
      {logoBatch && (
        <LogoMockupModal
          isOpen={mockupModalOpen}
          onClose={() => setMockupModalOpen(false)}
          logos={logoBatch.logos}
          showSelection={false}
        />
      )}
    </>
  );
}
