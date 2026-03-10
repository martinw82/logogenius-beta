import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge classnames with Tailwind CSS class merging
 * Used for combining Tailwind classes while avoiding conflicts
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a simple UUID v4 string
 * @returns A UUID v4 string
 */
export function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Construct a base prompt from logo generation input
 * Converts structured input into a descriptive prompt for the logo AI model
 * @param input - The logo generation input data
 * @returns A descriptive prompt string
 */
export function constructBasePrompt(input: Record<string, any>): string {
  const parts: string[] = [];

  // Business name and industry
  if (input.businessName) {
    parts.push(`Create a logo for ${input.businessName}`);
  }
  if (input.industry) {
    parts.push(`in the ${input.industry} industry`);
  }

  // Brand characteristics
  if (input.keywords) {
    parts.push(`Brand identity: ${input.keywords}`);
  }

  // Logo preferences
  if (input.preferredLogoStyle) {
    parts.push(`Style: ${input.preferredLogoStyle}`);
  }
  if (input.composition) {
    parts.push(`Composition: ${input.composition}`);
  }

  // Design specifications
  if (input.fontStyle) {
    parts.push(`Font style: ${input.fontStyle}`);
  }
  if (input.preferredColorPalette) {
    parts.push(`Colors: ${input.preferredColorPalette}`);
  }

  // Audience and context
  if (input.targetAudience) {
    parts.push(`Target audience: ${input.targetAudience}`);
  }
  if (input.usageContext) {
    parts.push(`Usage: ${input.usageContext}`);
  }

  // Inspiration and restrictions
  if (input.inspirationReferences) {
    parts.push(`Inspired by: ${input.inspirationReferences}`);
  }
  if (input.negativeKeywords) {
    parts.push(`Avoid: ${input.negativeKeywords}`);
  }

  return parts.join(". ");
}
