
import { z } from 'zod';
import type { GenerateLogoConceptsInput } from '@/ai/flows/generate-logo-concepts';

export const brandArchetypes = [
  "The Innocent", "The Everyman", "The Hero", "The Outlaw", "The Explorer",
  "The Creator", "The Ruler", "The Magician", "The Lover", "The Caregiver",
  "The Jester", "The Sage"
] as const;

export const colorPaletteMoods = [
  "Minimalist", "Vibrant", "Earthy", "Playful", "Corporate", "Luxurious", "Techy", "Friendly", "Bold"
] as const;

export const logoFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required.").max(100, "Business name too long."),
  industry: z.string().min(1, "Industry is required.").max(100, "Industry too long."),
  aestheticKeywords: z.string().max(150, "Aesthetic keywords too long (max 150 chars).").optional(),
  emotionalKeywords: z.string().max(150, "Emotional keywords too long (max 150 chars).").optional(),
  functionalKeywords: z.string().max(150, "Functional keywords too long (max 150 chars).").optional(),
  
  primaryColors: z.string().max(150, "Primary colors description too long.").optional(),
  secondaryColors: z.string().max(150, "Secondary colors description too long.").optional(),
  accentColors: z.string().max(150, "Accent colors description too long.").optional(),
  colorPaletteMood: z.enum(['', ...colorPaletteMoods]).default('').optional(),

  preferredLogoStyle: z.enum([
    '',
    'logomark',
    'wordmark',
    'lettermark',
    'combination',
    'emblem',
    'abstract',
    'mascot',
    'minimalist'
  ]).default('').optional(),
  composition: z.enum(['', 'horizontal', 'vertical', 'circular', 'square']).default('').optional().describe('Preferred overall layout or arrangement of logo elements.'),
  iconPlacement: z.enum(['', 'above_text', 'left_of_text', 'right_of_text', 'below_text', 'no_icon', 'icon_only']).default('').optional().describe('Preferred placement of the icon relative to the text.'),
  fontStyle: z.string().max(100, "Font style description too long.").optional().describe('Preferred font style for the logo (e.g., modern sans-serif, elegant script).'),
  iconComplexity: z.enum(['', 'simple', 'detailed']).default('').optional().describe('Preferred icon complexity (e.g., simple, detailed).'),
  iconSpecifics: z.string().max(200, "Icon specifics description too long.").optional().describe('Describe any specific imagery, objects, or concepts for the icon.'),
  
  fontHeadings: z.string().max(100, "Heading font description too long.").optional(),
  fontBody: z.string().max(100, "Body font description too long.").optional(),
  fontOther: z.string().max(100, "Other font description too long.").optional(),

  targetAudience: z.string().max(150, "Target audience description too long (max 150 chars).").optional(),
  inspirationReferences: z.string().max(200, "Inspiration references too long (max 200 chars).").optional(),
  usageContext: z.string().max(200, "Usage context description too long (max 200 chars).").optional().describe('Primary intended usage context for the logo.'),
  negativeKeywords: z.string().max(150, "Negative keywords too long (max 150 chars).").optional(),
  competitorsToAvoid: z.string().max(200, "Competitors description too long.").optional().describe('List competitor brands to differentiate from.'),
  variationInstructions: z.string().max(200, "Variation instructions too long (max 200 chars).").optional().describe('Instructions on how the generated variations should differ.'),
  numberOfLogos: z.coerce.number().min(1, "Generate at least 1 logo.").max(8, "Cannot generate more than 8 logos at a time.").default(4),
  referenceImageFile: z.instanceof(File).optional().nullable().describe("Optional reference image file."),

  // New fields for Brand Guide
  missionStatement: z.string().max(500, "Mission statement too long (max 500 chars).").optional(),
  brandPillars: z.string().max(300, "Brand pillars description too long (max 300 chars).").optional().describe("e.g., Innovation, Customer-centricity, Sustainability"),
  brandArchetype: z.enum(['', ...brandArchetypes]).default('').optional(),
  keyTagline: z.string().max(150, "Key tagline too long (max 150 chars).").optional(),

}).refine(data => data.aestheticKeywords || data.emotionalKeywords || data.functionalKeywords, {
  message: "Please provide keywords for at least one category (Aesthetic, Emotional, or Functional).",
  path: ["aestheticKeywords"],
});


export type LogoFormData = z.infer<typeof logoFormSchema>;

// This type alias is for what's stored in LogoBatch and passed to BrandGuideDisplay
// It includes fields not directly sent for logo image generation but are part of the overall brand spec.
export type ExtendedLogoGenerationInputs = Omit<GenerateLogoConceptsInput, 'userApiKey' | 'numberOfLogos' | 'preferredColorPalette' | 'keywords'> & {
  businessName: string;
  industry: string;
  keywords: string; // Combined keywords
  preferredColorPalette?: string; // Combined palette
  numberOfLogos: number;

  missionStatement?: string;
  brandPillars?: string;
  brandArchetype?: typeof brandArchetypes[number] | '';
  keyTagline?: string;

  // Typography and Color Mood for Brand Guide Display
  fontHeadings?: string;
  fontBody?: string;
  fontOther?: string;
  colorPaletteMood?: typeof colorPaletteMoods[number] | '';
};


export async function mapFormDataToAiInput(formData: LogoFormData): Promise<ExtendedLogoGenerationInputs & { userApiKey?: string }> {
  const {
    preferredLogoStyle,
    iconPlacement,
    iconComplexity,
    composition,
    aestheticKeywords,
    emotionalKeywords,
    functionalKeywords,
    referenceImageFile,
    brandArchetype,
    missionStatement,
    brandPillars,
    keyTagline,
    primaryColors,
    secondaryColors,
    accentColors,
    fontHeadings,
    fontBody,
    fontOther,
    colorPaletteMood,
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

  let combinedPalette = "";
  if (primaryColors && primaryColors.trim()) {
    combinedPalette += `Primary Colors: ${primaryColors.trim()}. `;
  }
  if (secondaryColors && secondaryColors.trim()) {
    combinedPalette += `Secondary Colors: ${secondaryColors.trim()}. `;
  }
  if (accentColors && accentColors.trim()) {
    combinedPalette += `Accent Colors: ${accentColors.trim()}. `;
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
  
  // This is the object that will be used for the generateLogoConcepts AI flow
  const aiFlowInput: GenerateLogoConceptsInput = {
    ...rest, // includes businessName, industry, etc.
    keywords: combinedKeywords.trim(),
    preferredColorPalette: combinedPalette.trim() || undefined,
    preferredLogoStyle: preferredLogoStyle === '' ? undefined : preferredLogoStyle as GenerateLogoConceptsInput['preferredLogoStyle'],
    composition: composition === '' ? undefined : composition as GenerateLogoConceptsInput['composition'],
    iconPlacement: iconPlacement === '' ? undefined : iconPlacement as GenerateLogoConceptsInput['iconPlacement'],
    iconComplexity: iconComplexity === '' ? undefined : iconComplexity as GenerateLogoConceptsInput['iconComplexity'],
    usageContext: formData.usageContext === '' ? undefined : formData.usageContext,
    variationInstructions: formData.variationInstructions === '' ? undefined : formData.variationInstructions,
    referenceImageDataUri,
    // userApiKey will be added in page.tsx
    numberOfLogos: formData.numberOfLogos,
  };

  // This is the extended object stored in LogoBatch and used by BrandGuideDisplay
  // It includes all form fields.
  const extendedInputs: ExtendedLogoGenerationInputs = {
    // Fields from aiFlowInput that are also in ExtendedLogoGenerationInputs
    businessName: aiFlowInput.businessName,
    industry: aiFlowInput.industry,
    keywords: aiFlowInput.keywords, // Combined keywords
    preferredColorPalette: aiFlowInput.preferredColorPalette, // Combined palette
    preferredLogoStyle: aiFlowInput.preferredLogoStyle,
    composition: aiFlowInput.composition,
    iconPlacement: aiFlowInput.iconPlacement,
    fontStyle: aiFlowInput.fontStyle, // Font style for logo
    iconComplexity: aiFlowInput.iconComplexity,
    iconSpecifics: aiFlowInput.iconSpecifics,
    targetAudience: aiFlowInput.targetAudience,
    inspirationReferences: aiFlowInput.inspirationReferences,
    usageContext: aiFlowInput.usageContext,
    negativeKeywords: aiFlowInput.negativeKeywords,
    competitorsToAvoid: aiFlowInput.competitorsToAvoid,
    variationInstructions: aiFlowInput.variationInstructions,
    referenceImageDataUri: aiFlowInput.referenceImageDataUri,
    numberOfLogos: aiFlowInput.numberOfLogos,


    // Fields specific to ExtendedLogoGenerationInputs (from formData)
    missionStatement: missionStatement === '' ? undefined : missionStatement,
    brandPillars: brandPillars === '' ? undefined : brandPillars,
    brandArchetype: brandArchetype === '' ? undefined : brandArchetype as typeof brandArchetypes[number],
    keyTagline: keyTagline === '' ? undefined : keyTagline,
    fontHeadings: fontHeadings === '' ? undefined : fontHeadings,
    fontBody: fontBody === '' ? undefined : fontBody,
    fontOther: fontOther === '' ? undefined : fontOther,
    colorPaletteMood: colorPaletteMood === '' ? undefined : colorPaletteMood as typeof colorPaletteMoods[number],
  };

  return extendedInputs;
}
