
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
  
  primaryColors: z.string().max(150, "Primary color(s) description too long.").optional().describe("Specify your primary brand color (e.g., '#3F51B5', 'Deep Indigo', or 'Blue, Light Blue')."),
  secondaryColors: z.string().max(150, "Secondary color(s) description too long.").optional().describe("Specify your secondary brand color (e.g., '#EEEEEE', 'Light Grey')."),
  accentColors: z.string().max(150, "Accent color(s) description too long.").optional().describe("Specify your accent brand color (e.g., '#009688', 'Teal')."),
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

  missionStatement: z.string().max(500, "Mission statement too long (max 500 chars).").optional(),
  brandPillars: z.string().max(300, "Brand pillars description too long (max 300 chars).").optional().describe("e.g., Innovation, Customer-centricity, Sustainability"),
  brandArchetype: z.enum(['', ...brandArchetypes]).default('').optional(),
  keyTagline: z.string().max(150, "Key tagline too long (max 150 chars).").optional(),

}).refine(data => data.aestheticKeywords || data.emotionalKeywords || data.functionalKeywords, {
  message: "Please provide keywords for at least one category (Aesthetic, Emotional, or Functional).",
  path: ["aestheticKeywords"],
});


export type LogoFormData = z.infer<typeof logoFormSchema>;

export type ExtendedLogoGenerationInputs = Omit<GenerateLogoConceptsInput, 'userApiKey' | 'numberOfLogos' | 'preferredColorPalette' | 'keywords'> & {
  businessName: string;
  industry: string;
  keywords: string; 
  preferredColorPalette?: string; // Combined palette string for AI image generation
  numberOfLogos: number;

  // Store individual form color inputs for BrandGuideDisplay
  primaryColors?: string;
  secondaryColors?: string;
  accentColors?: string;
  colorPaletteMood?: typeof colorPaletteMoods[number] | '';

  missionStatement?: string;
  brandPillars?: string;
  brandArchetype?: typeof brandArchetypes[number] | '';
  keyTagline?: string;

  fontHeadings?: string;
  fontBody?: string;
  fontOther?: string;
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
  
  const aiFlowInput: GenerateLogoConceptsInput = {
    ...rest, 
    keywords: combinedKeywords.trim(),
    preferredColorPalette: combinedPaletteForAI.trim() || undefined, // This is the combined string for the AI
    preferredLogoStyle: preferredLogoStyle === '' ? undefined : preferredLogoStyle as GenerateLogoConceptsInput['preferredLogoStyle'],
    composition: composition === '' ? undefined : composition as GenerateLogoConceptsInput['composition'],
    iconPlacement: iconPlacement === '' ? undefined : iconPlacement as GenerateLogoConceptsInput['iconPlacement'],
    iconComplexity: iconComplexity === '' ? undefined : iconComplexity as GenerateLogoConceptsInput['iconComplexity'],
    usageContext: formData.usageContext === '' ? undefined : formData.usageContext,
    variationInstructions: formData.variationInstructions === '' ? undefined : formData.variationInstructions,
    referenceImageDataUri,
    numberOfLogos: formData.numberOfLogos,
  };

  const extendedInputs: ExtendedLogoGenerationInputs = {
    businessName: aiFlowInput.businessName,
    industry: aiFlowInput.industry,
    keywords: aiFlowInput.keywords, 
    preferredColorPalette: aiFlowInput.preferredColorPalette, // The combined palette string
    preferredLogoStyle: aiFlowInput.preferredLogoStyle,
    composition: aiFlowInput.composition,
    iconPlacement: aiFlowInput.iconPlacement,
    fontStyle: aiFlowInput.fontStyle, 
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

    primaryColors: primaryColors === '' ? undefined : primaryColors,
    secondaryColors: secondaryColors === '' ? undefined : secondaryColors,
    accentColors: accentColors === '' ? undefined : accentColors,
    colorPaletteMood: colorPaletteMood === '' ? undefined : colorPaletteMood as typeof colorPaletteMoods[number],

    missionStatement: missionStatement === '' ? undefined : missionStatement,
    brandPillars: brandPillars === '' ? undefined : brandPillars,
    brandArchetype: brandArchetype === '' ? undefined : brandArchetype as typeof brandArchetypes[number],
    keyTagline: keyTagline === '' ? undefined : keyTagline,
    fontHeadings: fontHeadings === '' ? undefined : fontHeadings,
    fontBody: fontBody === '' ? undefined : fontBody,
    fontOther: fontOther === '' ? undefined : fontOther,
  };

  return extendedInputs;
}

    