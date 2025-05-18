
import { z } from 'zod';
import type { GenerateLogoConceptsInput } from '@/ai/flows/generate-logo-concepts';

export const brandArchetypes = [
  "The Innocent", "The Everyman", "The Hero", "The Rebel", "The Explorer",
  "The Creator", "The Ruler", "The Magician", "The Lover", "The Caregiver",
  "The Jester", "The Sage"
] as const;

// Updated colorPaletteMoodsData with associated hex codes
export const colorPaletteMoodsData = [
  { name: "Happy & Playful", primary: "#FFD166", secondary: "#06D6A0", accent: "#EF476F" },
  { name: "Calm & Peaceful", primary: "#A9D6E5", secondary: "#89C2D9", accent: "#61A5C2" },
  { name: "Trustworthy & Stable", primary: "#0D47A1", secondary: "#1565C0", accent: "#1976D2" },
  { name: "Energetic & Vibrant", primary: "#FF6F00", secondary: "#FF9800", accent: "#FF5722" },
  { name: "Sophisticated & Elegant", primary: "#4A4A4A", secondary: "#7B7B7B", accent: "#F5F5F5" },
  { name: "Bold & Powerful", primary: "#B71C1C", secondary: "#D32F2F", accent: "#F44336" },
  { name: "Caring & Nurturing", primary: "#FFC0CB", secondary: "#FFDAB9", accent: "#90EE90" },
  { name: "Innovative & Modern", primary: "#00BCD4", secondary: "#26C6DA", accent: "#80DEEA" },
  { name: "Wise & Formal", primary: "#311B92", secondary: "#4527A0", accent: "#512DA8" },
  { name: "Romantic & Passionate", primary: "#E91E63", secondary: "#EC407A", accent: "#F06292" },
  { name: "Earthy & Natural", primary: "#795548", secondary: "#A1887F", accent: "#8BC34A" },
  { name: "Mysterious & Dramatic", primary: "#263238", secondary: "#455A64", accent: "#607D8B" },
  { name: "Nostalgic & Classic", primary: "#D7CCC8", secondary: "#BCAAA4", accent: "#A1887F" },
  { name: "Clean & Pure", primary: "#FFFFFF", secondary: "#F5F5F5", accent: "#E0E0E0" },
  { name: "Luxurious & Indulgent", primary: "#FFD700", secondary: "#B8860B", accent: "#D4AF37" },
  { name: "Friendly & Accessible", primary: "#42A5F5", secondary: "#64B5F6", accent: "#90CAF9" },
  { name: "Secure & Reliable", primary: "#1B5E20", secondary: "#2E7D32", accent: "#388E3C" },
  { name: "Exciting & Adventurous", primary: "#FF5722", secondary: "#FF7043", accent: "#FF8A65" },
  { name: "Spiritual & Mystical", primary: "#673AB7", secondary: "#7E57C2", accent: "#9575CD" },
  { name: "Gritty & Authentic", primary: "#3E2723", secondary: "#5D4037", accent: "#795548" },
  { name: "Youthful & Fresh", primary: "#8BC34A", secondary: "#AED581", accent: "#CDDC39" },
  { name: "Serious & Professional", primary: "#212121", secondary: "#424242", accent: "#616161" },
  { name: "Playful & Whimsical", primary: "#AB47BC", secondary: "#BA68C8", accent: "#CE93D8" },
  { name: "Rustic & Warm", primary: "#BF360C", secondary: "#D84315", accent: "#E64A19" },
  { name: "Bold & Disruptive", primary: "#F50057", secondary: "#FF4081", accent: "#FF80AB" },
  { name: "Minimalist & Clean", primary: "#E0E0E0", secondary: "#EEEEEE", accent: "#F5F5F5" },
  { name: "Welcoming & Inviting", primary: "#FFA726", secondary: "#FFB74D", accent: "#FFCC80" },
] as const;

export const colorPaletteMoods = colorPaletteMoodsData.map(item => item.name);

export const NONE_VALUE = "_NONE_";
export const CLEAR_MOOD_VALUE = "_CLEAR_MOOD_";

export const commonFontList = [
  "Arial", "Verdana", "Helvetica", "Tahoma", "Trebuchet MS", 
  "Times New Roman", "Georgia", "Garamond", 
  "Courier New", "Brush Script MT", 
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Raleway", "Poppins", "Noto Sans",
  "Playfair Display", "Merriweather", "Source Sans Pro", "Ubuntu", "Lobster", "Pacifico"
] as const;


export const logoFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required.").max(100, "Business name too long."),
  industry: z.string().min(1, "Industry is required.").max(100, "Industry too long."),
  aestheticKeywords: z.string().max(150, "Aesthetic keywords too long (max 150 chars).").optional(),
  emotionalKeywords: z.string().max(150, "Emotional keywords too long (max 150 chars).").optional(),
  functionalKeywords: z.string().max(150, "Functional keywords too long (max 150 chars).").optional(),
  
  colorPaletteMood: z.enum(['', ...colorPaletteMoods, typeof CLEAR_MOOD_VALUE]).default('').optional(),
  primaryColors: z.string().max(150, "Primary color description too long.").optional().describe("Specify the primary brand color (e.g., '#3F51B5', 'Deep Indigo')."),
  secondaryColors: z.string().max(150, "Secondary color description too long.").optional().describe("Specify the secondary brand color (e.g., '#EEEEEE', 'Light Grey')."),
  accentColors: z.string().max(150, "Accent color description too long.").optional().describe("Specify the accent brand color (e.g., '#009688', 'Teal')."),

  preferredLogoStyle: z.enum([
    '',
    'logomark',
    'wordmark',
    'lettermark',
    'combination',
    'emblem',
    'abstract',
    'mascot',
    'minimalist',
    NONE_VALUE,
  ]).default('').optional(),
  composition: z.enum(['', 'horizontal', 'vertical', 'circular', 'square', NONE_VALUE]).default('').optional().describe('Preferred overall layout or arrangement of logo elements.'),
  iconPlacement: z.enum(['', 'above_text', 'left_of_text', 'right_of_text', 'below_text', 'no_icon', 'icon_only', NONE_VALUE]).default('').optional().describe('Preferred placement of the icon relative to the text.'),
  fontStyle: z.string().max(100, "Font style description too long.").optional().describe('Preferred font style for the logo (e.g., modern sans-serif, elegant script).'),
  iconComplexity: z.enum(['', 'simple', 'detailed', NONE_VALUE]).default('').optional().describe('Preferred icon complexity (e.g., simple, detailed).'),
  iconSpecifics: z.string().max(200, "Icon specifics description too long.").optional().describe('Describe any specific imagery, objects, or concepts for the icon.'),
  
  fontHeadings: z.enum(['', ...commonFontList, NONE_VALUE]).default('').optional(),
  useHeadingsFontForLogo: z.boolean().optional().default(false),
  fontBody: z.enum(['', ...commonFontList, NONE_VALUE]).default('').optional(),
  useBodyFontForLogo: z.boolean().optional().default(false),
  fontOther: z.enum(['', ...commonFontList, NONE_VALUE]).default('').optional(),
  useOtherFontForLogo: z.boolean().optional().default(false),

  targetAudience: z.string().max(150, "Target audience description too long (max 150 chars).").optional(),
  inspirationReferences: z.string().max(200, "Inspiration references too long (max 200 chars).").optional(),
  usageContext: z.string().max(200, "Usage context description too long (max 200 chars).").optional().describe('Primary intended usage context for the logo.'),
  negativeKeywords: z.string().max(150, "Negative keywords too long (max 150 chars).").optional(),
  competitorsToAvoid: z.string().max(200, "Competitors description too long.").optional().describe('List competitor brands to differentiate from.'),
  variationInstructions: z.string().max(200, "Variation instructions too long (max 200 chars).").optional().describe('Instructions on how the generated variations should differ.'),
  numberOfLogos: z.coerce.number().min(1, "Generate at least 1 logo.").max(8, "Cannot generate more than 8 logos at a time.").default(4),
  referenceImageFile: z.instanceof(File).optional().nullable().describe("Optional reference image file."),

  missionStatement: z.string().max(500, "Mission statement too long (max 500 chars).").optional(),
  brandPillars: z.string().max(300, "Brand pillars description too long (max 300 chars).").optional().describe("e.g., Innovation, Customer-centricity, Sustainability"),
  brandArchetype: z.enum(['', ...brandArchetypes, NONE_VALUE]).default('').optional(),
  keyTagline: z.string().max(150, "Key tagline too long (max 150 chars).").optional(),

}).refine(data => data.aestheticKeywords || data.emotionalKeywords || data.functionalKeywords, {
  message: "Please provide keywords for at least one category (Aesthetic, Emotional, or Functional).",
  path: ["aestheticKeywords"],
});


export type LogoFormData = z.infer<typeof logoFormSchema>;

// This type combines direct form inputs with transformed inputs for AI
// It is used to store comprehensive details in LogoBatch.generationInput
export type ExtendedLogoGenerationInputs = Omit<GenerateLogoConceptsInput, 'userApiKey' | 'numberOfLogos' | 'preferredColorPalette' | 'keywords' | 'fontStyle'> & {
  businessName: string;
  industry: string;
  keywords: string; // Combined from aesthetic, emotional, functional for GenerateLogoConceptsInput
  
  // This is the combined string of primary, secondary, accent colors sent to the AI for logo image generation.
  preferredColorPalette?: string; 

  // This is the font style string sent to AI for logo image generation. Determined by user choices.
  fontStyle?: string;
  
  numberOfLogos: number;

  // Store individual form color inputs for BrandGuideDisplay and potentially other AI flows
  primaryColors?: string;      // Direct form input
  secondaryColors?: string;    // Direct form input
  accentColors?: string;       // Direct form input
  colorPaletteMood?: (typeof colorPaletteMoods)[number] | '' | typeof CLEAR_MOOD_VALUE; 

  // Brand strategy inputs
  missionStatement?: string;
  brandPillars?: string;
  brandArchetype?: (typeof brandArchetypes)[number] | '' | typeof NONE_VALUE;
  keyTagline?: string;

  // Typography inputs for brand guide
  fontHeadings?: (typeof commonFontList)[number] | '' | typeof NONE_VALUE;
  useHeadingsFontForLogo?: boolean;
  fontBody?: (typeof commonFontList)[number] | '' | typeof NONE_VALUE;
  useBodyFontForLogo?: boolean;
  fontOther?: (typeof commonFontList)[number] | '' | typeof NONE_VALUE;
  useOtherFontForLogo?: boolean;
};


export async function mapFormDataToAiInput(formData: LogoFormData): Promise<ExtendedLogoGenerationInputs & { userApiKey?: string }> {
  const {
    aestheticKeywords,
    emotionalKeywords,
    functionalKeywords,
    referenceImageFile,
    primaryColors, 
    secondaryColors, 
    accentColors, 
    colorPaletteMood, 
    fontHeadings,
    useHeadingsFontForLogo,
    fontBody,
    useBodyFontForLogo,
    fontOther,
    useOtherFontForLogo,
    missionStatement,
    brandPillars,
    keyTagline,
    preferredLogoStyle,
    composition,
    iconPlacement,
    iconComplexity,
    brandArchetype,
    usageContext,
    variationInstructions,
    fontStyle: dedicatedLogoFontStyle, 
    ...rest 
  } = formData;

  let combinedKeywords = "";
  if (aestheticKeywords && aestheticKeywords.trim()) {
    combinedKeywords += `Aesthetic: ${aestheticKeywords.trim()}. `;
  }
  if (emotionalKeywords && emotionalKeywords.trim()) {
    combinedKeywords += `Emotional: ${emotionalKeywords.trim()}. `;
  }
  if (functionalKeywords && functionalKeywords.trim()) {
    combinedKeywords += `Functional: ${functionalKeywords.trim()}. `;
  }

  let combinedPaletteForAI = "";
  if (primaryColors && primaryColors.trim()) {
    combinedPaletteForAI += `Primary Color(s): ${primaryColors.trim()}. `;
  }
  if (secondaryColors && secondaryColors.trim()) {
    combinedPaletteForAI += `Secondary Color(s): ${secondaryColors.trim()}. `;
  }
  if (accentColors && accentColors.trim()) {
    combinedPaletteForAI += `Accent Color(s): ${accentColors.trim()}. `;
  }
  if (colorPaletteMood && colorPaletteMood.trim() && colorPaletteMood !== '' && colorPaletteMood !== CLEAR_MOOD_VALUE) {
    combinedPaletteForAI += `Overall Mood: ${colorPaletteMood.trim()}. `;
  }


  let referenceImageDataUri: string | undefined = undefined;
  if (referenceImageFile) {
    try {
      referenceImageDataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(referenceImageFile);
      });
    } catch (error) {
      console.error("Error converting file to data URI:", error);
    }
  }
  
  const mapOptionalField = <T extends string>(value: T | typeof NONE_VALUE | '' | undefined): T | undefined => {
    return value === '' || value === NONE_VALUE ? undefined : value as T;
  };

  let finalFontStyleForAI: string | undefined = undefined;
  if (useHeadingsFontForLogo && fontHeadings && fontHeadings.trim() && fontHeadings !== NONE_VALUE) {
    finalFontStyleForAI = fontHeadings.trim();
  } else if (useBodyFontForLogo && fontBody && fontBody.trim() && fontBody !== NONE_VALUE) {
    finalFontStyleForAI = fontBody.trim();
  } else if (useOtherFontForLogo && fontOther && fontOther.trim() && fontOther !== NONE_VALUE) {
    finalFontStyleForAI = fontOther.trim();
  } else if (dedicatedLogoFontStyle && dedicatedLogoFontStyle.trim() && dedicatedLogoFontStyle !== '') {
    finalFontStyleForAI = dedicatedLogoFontStyle.trim();
  }


  const aiFlowInput: GenerateLogoConceptsInput = {
    ...rest, 
    keywords: combinedKeywords.trim() || undefined,
    preferredColorPalette: combinedPaletteForAI.trim() || undefined, 
    fontStyle: finalFontStyleForAI, 
    preferredLogoStyle: mapOptionalField(preferredLogoStyle as GenerateLogoConceptsInput['preferredLogoStyle'] | typeof NONE_VALUE | ''),
    composition: mapOptionalField(composition as GenerateLogoConceptsInput['composition'] | typeof NONE_VALUE | ''),
    iconPlacement: mapOptionalField(iconPlacement as GenerateLogoConceptsInput['iconPlacement'] | typeof NONE_VALUE | ''),
    iconComplexity: mapOptionalField(iconComplexity as GenerateLogoConceptsInput['iconComplexity'] | typeof NONE_VALUE | ''),
    iconSpecifics: formData.iconSpecifics === '' ? undefined : formData.iconSpecifics,
    targetAudience: formData.targetAudience === '' ? undefined : formData.targetAudience,
    inspirationReferences: formData.inspirationReferences === '' ? undefined : formData.inspirationReferences,
    competitorsToAvoid: formData.competitorsToAvoid === '' ? undefined : formData.competitorsToAvoid,
    negativeKeywords: formData.negativeKeywords === '' ? undefined : formData.negativeKeywords,
    usageContext: formData.usageContext === '' ? undefined : formData.usageContext,
    variationInstructions: variationInstructions === '' ? undefined : variationInstructions,
    referenceImageDataUri,
    numberOfLogos: formData.numberOfLogos,
  };

  const extendedInputs: ExtendedLogoGenerationInputs = {
    businessName: aiFlowInput.businessName,
    industry: aiFlowInput.industry,
    keywords: aiFlowInput.keywords!, 
    preferredColorPalette: aiFlowInput.preferredColorPalette, 
    fontStyle: aiFlowInput.fontStyle, 
    preferredLogoStyle: mapOptionalField(preferredLogoStyle as GenerateLogoConceptsInput['preferredLogoStyle'] | typeof NONE_VALUE | ''),
    composition: mapOptionalField(composition as GenerateLogoConceptsInput['composition'] | typeof NONE_VALUE | ''),
    iconPlacement: mapOptionalField(iconPlacement as GenerateLogoConceptsInput['iconPlacement'] | typeof NONE_VALUE | ''),
    iconComplexity: mapOptionalField(iconComplexity as GenerateLogoConceptsInput['iconComplexity'] | typeof NONE_VALUE | ''),
    iconSpecifics: formData.iconSpecifics === '' ? undefined : formData.iconSpecifics,
    targetAudience: formData.targetAudience === '' ? undefined : formData.targetAudience,
    inspirationReferences: formData.inspirationReferences === '' ? undefined : formData.inspirationReferences,
    usageContext: formData.usageContext === '' ? undefined : formData.usageContext,
    negativeKeywords: formData.negativeKeywords === '' ? undefined : formData.negativeKeywords,
    competitorsToAvoid: formData.competitorsToAvoid === '' ? undefined : formData.competitorsToAvoid,
    variationInstructions: variationInstructions === '' ? undefined : variationInstructions,
    referenceImageDataUri: aiFlowInput.referenceImageDataUri,
    numberOfLogos: aiFlowInput.numberOfLogos,

    primaryColors: primaryColors === '' ? undefined : primaryColors,
    secondaryColors: secondaryColors === '' ? undefined : secondaryColors,
    accentColors: accentColors === '' ? undefined : accentColors,
    colorPaletteMood: colorPaletteMood === '' || colorPaletteMood === CLEAR_MOOD_VALUE ? undefined : colorPaletteMood as (typeof colorPaletteMoods)[number],

    missionStatement: missionStatement === '' ? undefined : missionStatement,
    brandPillars: brandPillars === '' ? undefined : brandPillars,
    brandArchetype: mapOptionalField(brandArchetype as (typeof brandArchetypes)[number] | typeof NONE_VALUE | ''),
    keyTagline: keyTagline === '' ? undefined : keyTagline,

    fontHeadings: mapOptionalField(fontHeadings as (typeof commonFontList)[number] | typeof NONE_VALUE | ''),
    useHeadingsFontForLogo: useHeadingsFontForLogo,
    fontBody: mapOptionalField(fontBody as (typeof commonFontList)[number] | typeof NONE_VALUE | ''),
    useBodyFontForLogo: useBodyFontForLogo,
    fontOther: mapOptionalField(fontOther as (typeof commonFontList)[number] | typeof NONE_VALUE | ''),
    useOtherFontForLogo: useOtherFontForLogo,
  };

  return extendedInputs;
}

