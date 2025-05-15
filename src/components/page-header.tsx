import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string; // Still present from previous, not rendered.
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
        imageUrl ? (
          // Case for imageUrl: Larger image, smaller background circle
          <div className="relative mx-auto flex items-center justify-center w-64 h-64"> {/* Container for the image, defines image size (256px) */}
            {/* Background Circle - smaller and centered */}
            <div
              className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-primary/10 shadow-md" // Circle is 128px
            />
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={256} // Tailwind w-64 = 256px
              height={256} // Tailwind h-64 = 256px
              className="object-contain relative" // `relative` to ensure it stacks above the absolute positioned circle
              data-ai-hint="app logo"
            />
          </div>
        ) : IconComponent ? (
          // Case for IconComponent (if imageUrl is not present)
          // Icon is w-24 h-24 (96px), its circle is w-16 h-16 (64px).
          <div className="relative mx-auto flex items-center justify-center w-24 h-24"> {/* Container for the icon */}
              <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-primary/10 shadow-md" /> {/* Circle is 64px */}
              <IconComponent className={cn("w-full h-full relative text-primary object-contain", iconClassName)} /> {/* Icon fills 96px */}
          </div>
        ) : null
      )}
      {description && <p className="text-sm text-center text-muted-foreground md:text-base mt-4">{description}</p>}
    </div>
  );
}
