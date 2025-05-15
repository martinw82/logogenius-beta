
import type { GenerateLogoConceptsInput } from '@/ai/flows/generate-logo-concepts';

export interface Logo {
  id: string;
  url: string;
}

export interface LogoBatch {
  id: string;
  logos: Logo[];
  // Use Omit to exclude userApiKey from being stored, but include all other fields from GenerateLogoConceptsInput
  generationInput: Omit<GenerateLogoConceptsInput, 'userApiKey'>;
  basePrompt: string; 
}
