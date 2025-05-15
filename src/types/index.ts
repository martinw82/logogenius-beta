
import type { GenerateLogoConceptsInput } from '@/ai/flows/generate-logo-concepts';
import type { brandArchetypes } from '@/components/logo-form-types';

export interface Logo {
  id: string;
  url: string;
}

// Extend this to include all fields from GenerateLogoConceptsInput PLUS new ones
export type ExtendedGenerateLogoConceptsInput = Omit<GenerateLogoConceptsInput, 'userApiKey'> & {
  missionStatement?: string;
  brandPillars?: string;
  brandArchetype?: typeof brandArchetypes[number] | ''; // Match the form type
  keyTagline?: string;
};


export interface LogoBatch {
  id: string;
  logos: Logo[];
  generationInput: ExtendedGenerateLogoConceptsInput;
  basePrompt: string;
}
