"use client";

import { useState } from "react";
import { BRAND_ARCHETYPES } from "@/lib/data/archetypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils";

interface ArchetypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  showDescription?: boolean;
}

export function ArchetypeSelector({
  value,
  onChange,
  disabled = false,
  className,
  showDescription = true,
}: ArchetypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedArchetype = BRAND_ARCHETYPES.find((a) => a.id === value);

  return (
    <div className={cn("space-y-2", className)}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select a brand archetype..." />
        </SelectTrigger>
        <SelectContent>
          {BRAND_ARCHETYPES.map((archetype) => (
            <SelectItem key={archetype.id} value={archetype.id}>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: archetype.color }}
                />
                <span>{archetype.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showDescription && selectedArchetype && (
        <Card className="p-4 bg-muted">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-base flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: selectedArchetype.color }}
                />
                {selectedArchetype.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedArchetype.description}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                KEY TRAITS
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedArchetype.traits.map((trait) => (
                  <span
                    key={trait}
                    className="inline-flex items-center rounded-md bg-background px-2 py-1 text-xs font-medium ring-1 ring-inset ring-border"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
