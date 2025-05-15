
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { GenerateLogoConceptsInput } from '@/ai/flows/generate-logo-concepts';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to construct the 'previousPrompt' for refinement
export function constructBasePrompt(input: Omit<GenerateLogoConceptsInput, 'numberOfLogos'>): string {
  let prompt = `Logo concept for a business named "${input.businessName}" in the "${input.industry}" industry. Brand identity keywords: ${input.keywords}.`;
  if (input.preferredColorPalette) {
    prompt += ` Preferred color palette: ${input.preferredColorPalette}.`;
  }
  if (input.preferredLogoStyle) {
    prompt += ` Preferred logo style: ${input.preferredLogoStyle}.`;
  }
  if (input.iconPlacement) {
    prompt += ` Icon placement: ${input.iconPlacement}.`;
  }
  if (input.fontStyle) {
    prompt += ` Font style: ${input.fontStyle}.`;
  }
  if (input.iconComplexity) {
    prompt += ` Icon complexity: ${input.iconComplexity}.`;
  }
  if (input.targetAudience) {
    prompt += ` Target audience: ${input.targetAudience}.`;
  }
  if (input.inspirationReferences) {
    prompt += ` Inspiration references: ${input.inspirationReferences}.`;
  }
  if (input.usageContext) { // Now a string
    prompt += ` Primary usage context: ${input.usageContext}.`;
  }
  if (input.negativeKeywords) {
    prompt += ` Avoid the following: ${input.negativeKeywords}.`;
  }
  if (input.variationInstructions) {
    prompt += ` Variation instructions were: ${input.variationInstructions}.`;
  }
  return prompt;
}

export function uuidv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto.randomUUID is not available (e.g. older Node.js versions in some serverless contexts)
  // This is a simplified version and not as robust as a proper polyfill.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
