import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string; // Keep for now, though not rendered, for interface consistency
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function PageHeader({
  title,
  description,
  icon: IconComponent,
  iconClassName,
  imageUrl,
  imageAlt = "Header image",
}: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-3">
      {(imageUrl || IconComponent) && (
        <div className="flex items-center justify-center w-32 h-32 p-0 mx-auto rounded-full bg-primary/10 text-primary shadow-md relative overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={128} // Corresponds to w-32 (16 * 8px base = 128px)
              height={128} // Corresponds to h-32
              className="object-contain"
              data-ai-hint="app logo"
            />
          ) : IconComponent ? (
            <IconComponent className={cn("w-20 h-20", iconClassName)} /> // Increased icon size as well
          ) : null}
        </div>
      )}
      {/* The h1 title element has been removed as per request */}
      {description && <p className="text-sm text-center text-muted-foreground md:text-base mt-4">{description}</p>}
    </div>
  );
}
