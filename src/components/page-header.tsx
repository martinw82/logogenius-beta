import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
}

export function PageHeader({ title, description, icon: Icon, iconClassName }: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-3">
      {Icon && (
        <div className="flex items-center justify-center w-16 h-16 p-3 mx-auto rounded-full bg-primary/10 text-primary shadow-md">
          <Icon className={cn("w-10 h-10", iconClassName)} />
        </div>
      )}
      <h1 className="text-3xl font-bold text-center md:text-4xl text-foreground tracking-tight">{title}</h1>
      {description && <p className="text-sm text-center text-muted-foreground md:text-base">{description}</p>}
    </div>
  );
}

// Helper for cn if not globally available, or import from "@/lib/utils"
// For this example, assuming cn is imported where PageHeader is used or defined in utils.
const cn = (...args: any[]) => args.filter(Boolean).join(' ');
