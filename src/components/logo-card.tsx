
"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2, Download, Eye } from "lucide-react";
import type { Logo } from "@/types";

interface LogoCardProps {
  logo: Logo;
  onFeedback: (feedback: "thumbs_up" | "thumbs_down") => void;
  isFeedbackLoading: boolean;
  businessName?: string;
  onSelectForBrandSheet?: (logo: Logo) => void;
}

export function LogoCard({ 
  logo, 
  onFeedback, 
  isFeedbackLoading, 
  businessName,
  onSelectForBrandSheet 
}: LogoCardProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = logo.url; // This is the data URI
    const safeBusinessName = businessName ? businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'logo';
    const filename = `${safeBusinessName}_${logo.id.substring(0, 8)}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="overflow-hidden shadow-lg transition-all hover:shadow-xl flex flex-col">
      <CardContent className="p-0 aspect-square relative flex-grow">
        <Image
          src={logo.url}
          alt={`Generated logo concept ${businessName ? `for ${businessName}` : ''} - ${logo.id}`}
          layout="fill"
          objectFit="contain"
          className="bg-slate-200" 
          data-ai-hint="logo design"
        />
      </CardContent>
      <CardFooter className="p-3 bg-muted/50">
        <div className="flex justify-between items-center w-full gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={isFeedbackLoading}
            aria-label="Download this logo"
            className="hover:bg-blue-100 hover:border-blue-400 hover:text-blue-600 flex-shrink-0"
          >
            <Download className="w-4 h-4" />
          </Button>

          {onSelectForBrandSheet && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSelectForBrandSheet(logo)}
              disabled={isFeedbackLoading}
              aria-label="View on Brand Sheet"
              className="hover:bg-purple-100 hover:border-purple-400 hover:text-purple-600 flex-shrink-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex gap-1 ml-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onFeedback("thumbs_up")}
              disabled={isFeedbackLoading}
              aria-label="Like this logo"
              className="hover:bg-green-100 hover:border-green-400 hover:text-green-600 flex-shrink-0"
            >
              {isFeedbackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onFeedback("thumbs_down")}
              disabled={isFeedbackLoading}
              aria-label="Dislike this logo"
              className="hover:bg-red-100 hover:border-red-400 hover:text-red-600 flex-shrink-0"
            >
              {isFeedbackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
            </Button>
          </div>
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
        <div className="flex justify-between items-center w-full gap-2">
            <div className="w-9 h-9 bg-foreground/10 rounded-md animate-pulse"></div>
            <div className="w-9 h-9 bg-foreground/10 rounded-md animate-pulse"></div> {/* For Eye icon placeholder */}
            <div className="flex gap-2 ml-auto">
                <div className="w-9 h-9 bg-foreground/10 rounded-md animate-pulse"></div>
                <div className="w-9 h-9 bg-foreground/10 rounded-md animate-pulse"></div>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
