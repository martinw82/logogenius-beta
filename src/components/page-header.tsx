import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
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
        <div className="flex items-center justify-center w-16 h-16 p-0 mx-auto rounded-full bg-primary/10 text-primary shadow-md relative overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-contain"
              data-ai-hint="app logo"
            />
          ) : IconComponent ? (
            <IconComponent className={cn("w-10 h-10", iconClassName)} />
          ) : null}
        </div>
      )}
      <h1 className="text-3xl font-bold text-center md:text-4xl text-foreground tracking-tight">{title}</h1>
      {description && <p className="text-sm text-center text-muted-foreground md:text-base">{description}</p>}
    </div>
  );
}
