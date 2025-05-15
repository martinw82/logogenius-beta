
import type { GenerateLogoConceptsInput } from '@/ai/flows/generate-logo-concepts';
import type { brandArchetypes, colorPaletteMoods } from '@/components/logo-form-types';

export interface Logo {
  id: string;
  url: string;
}

// This type represents all the data captured by the form and stored in LogoBatch.
// It's more comprehensive than what's sent *just* for logo image generation.
export type ExtendedGenerateLogoConceptsInput = Omit<GenerateLogoConceptsInput, 'userApiKey' | 'keywords' | 'preferredColorPalette'> & {
  // Core fields also in GenerateLogoConceptsInput (but might be transformed, e.g. keywords)
  businessName: string;
  industry: string;
  keywords: string; // Combined from aesthetic, emotional, functional
  preferredColorPalette?: string; // Combined from primary, secondary, accent
  
  // Fields for brand guide text generation and display
  missionStatement?: string;
  brandPillars?: string;
  brandArchetype?: typeof brandArchetypes[number] | '';
  keyTagline?: string;
  
  // New typography and color mood fields
  fontHeadings?: string;
  fontBody?: string;
  fontOther?: string;
  colorPaletteMood?: typeof colorPaletteMoods[number] | '';
};


export interface LogoBatch {
  id: string;
  logos: Logo[];
  // generationInput here should match ExtendedGenerateLogoConceptsInput structure
  // plus numberOfLogos and userApiKey (which are specific to the generation call).
  generationInput: ExtendedGenerateLogoConceptsInput;
  basePrompt: string; // The base prompt text sent for logo image generation
}
