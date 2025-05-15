"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import type { Logo } from "@/types";

interface LogoCardProps {
  logo: Logo;
  onFeedback: (feedback: "thumbs_up" | "thumbs_down") => void;
  isFeedbackLoading: boolean;
  businessName?: string;
}

export function LogoCard({ logo, onFeedback, isFeedbackLoading, businessName }: LogoCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg transition-all hover:shadow-xl flex flex-col">
      <CardContent className="p-0 aspect-square relative flex-grow">
        <Image
          src={logo.url}
          alt={`Generated logo concept ${businessName ? `for ${businessName}` : ''} - ${logo.id}`}
          layout="fill"
          objectFit="contain"
          className="bg-slate-200" // A light background for transparency
          data-ai-hint="logo design"
        />
      </CardContent>
      <CardFooter className="p-3 bg-muted/50">
        <div className="flex justify-end w-full gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFeedback("thumbs_up")}
            disabled={isFeedbackLoading}
            aria-label="Like this logo"
            className="hover:bg-green-100 hover:border-green-400 hover:text-green-600"
          >
            {isFeedbackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFeedback("thumbs_down")}
            disabled={isFeedbackLoading}
            aria-label="Dislike this logo"
            className="hover:bg-red-100 hover:border-red-400 hover:text-red-600"
          >
            {isFeedbackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function LogoSkeletonCard() {
  return (
    <Card className="overflow-hidden shadow-lg flex flex-col">
      <CardContent className="p-0 aspect-square relative flex-grow bg-muted animate-pulse">
        {/* Placeholder for image skeleton */}
      </CardContent>
      <CardFooter className="p-3 bg-muted/50">
        <div className="flex justify-end w-full gap-2">
          <div className="w-9 h-9 bg-foreground/10 rounded-md animate-pulse"></div>
          <div className="w-9 h-9 bg-foreground/10 rounded-md animate-pulse"></div>
        </div>
      </CardFooter>
    </Card>
  );
}
