
import type { GenerateLogoConceptsInput } from '@/ai/flows/generate-logo-concepts';
import type { brandArchetypes, colorPaletteMoods, commonFontList, NONE_VALUE } from '@/components/logo-form-types'; // Added commonFontList & NONE_VALUE

export interface Logo {
  id: string;
  url: string;
}

// This type represents all the data captured by the form and stored in LogoBatch.
// It's more comprehensive than what's sent *just* for logo image generation.
export type ExtendedGenerateLogoConceptsInput = Omit<GenerateLogoConceptsInput, 'userApiKey' | 'keywords' | 'preferredColorPalette' | 'fontStyle'> & {
  // Core fields also in GenerateLogoConceptsInput (but might be transformed, e.g. keywords)
  businessName: string;
  industry: string;
  keywords: string; // Combined from aesthetic, emotional, functional
  
  // This is the combined string sent to the AI for image generation.
  // It's also useful for display if the granular inputs aren't available.
  preferredColorPalette?: string; 

  // This is the font style string sent to AI for logo image generation. Determined by user choices.
  fontStyle?: string; 
  
  // Granular color inputs from the form, for more precise display in BrandGuide
  primaryColors?: string;
  secondaryColors?: string;
  accentColors?: string;
  colorPaletteMood?: typeof colorPaletteMoods[number] | '';
  
  // Fields for brand guide text generation and display
  missionStatement?: string;
  brandPillars?: string;
  brandArchetype?: typeof brandArchetypes[number] | '' | typeof NONE_VALUE;
  keyTagline?: string;
  
  // Typography fields for brand guide
  fontHeadings?: (typeof commonFontList)[number] | '' | typeof NONE_VALUE;
  useHeadingsFontForLogo?: boolean;
  fontBody?: (typeof commonFontList)[number] | '' | typeof NONE_VALUE;
  useBodyFontForLogo?: boolean;
  fontOther?: (typeof commonFontList)[number] | '' | typeof NONE_VALUE;
  useOtherFontForLogo?: boolean;

  // Web3 Specific Fields
  web3BlockchainFocus?: string;
  web3ProjectType?: string;
  web3EnsDomainIdeas?: string;
  web3TokenSymbolIdea?: string;
  web3CommunityValues?: string;
  web3NftAesthetic?: string;
};


export interface LogoBatch {
  id: string;
  logos: Logo[];
  // generationInput here should match ExtendedGenerateLogoConceptsInput structure
  // plus numberOfLogos and userApiKey (which are specific to the generation call).
  generationInput: ExtendedGenerateLogoConceptsInput & { numberOfLogos: number; userApiKey?: string };
  basePrompt: string; // The base prompt text sent for logo image generation
}

    
