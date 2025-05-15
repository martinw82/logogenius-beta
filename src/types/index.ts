import type { GenerateLogoConceptsInput } from '@/ai/flows/generate-logo-concepts';

export interface Logo {
  id: string;
  url: string;
}

export interface LogoBatch {
  id: string;
  logos: Logo[];
  generationInput: GenerateLogoConceptsInput;
  basePrompt: string; // The prompt constructed for refinement purposes
}
