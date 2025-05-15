
import { z } from 'zod';
import type { GenerateLogoConceptsInput } from '@/ai/flows/generate-logo-concepts';

export const logoFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required.").max(100, "Business name too long."),
  industry: z.string().min(1, "Industry is required.").max(100, "Industry too long."),
  aestheticKeywords: z.string().max(150, "Aesthetic keywords too long (max 150 chars).").optional(),
  emotionalKeywords: z.string().max(150, "Emotional keywords too long (max 150 chars).").optional(),
  functionalKeywords: z.string().max(150, "Functional keywords too long (max 150 chars).").optional(),
  preferredColorPalette: z.string().max(100, "Color palette description too long.").optional(),
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
  fontStyle: z.string().max(100, "Font style description too long.").optional().describe('Preferred font style (e.g., modern sans-serif, elegant script).'),
  iconComplexity: z.enum(['', 'simple', 'detailed']).default('').optional().describe('Preferred icon complexity (e.g., simple, detailed).'),
  iconSpecifics: z.string().max(200, "Icon specifics description too long.").optional().describe('Describe any specific imagery, objects, or concepts for the icon.'),
  targetAudience: z.string().max(150, "Target audience description too long (max 150 chars).").optional(),
  inspirationReferences: z.string().max(200, "Inspiration references too long (max 200 chars).").optional(),
  usageContext: z.string().max(200, "Usage context description too long (max 200 chars).").optional().describe('Primary intended usage context for the logo.'),
  negativeKeywords: z.string().max(150, "Negative keywords too long (max 150 chars).").optional(),
  competitorsToAvoid: z.string().max(200, "Competitors description too long.").optional().describe('List competitor brands to differentiate from.'),
  variationInstructions: z.string().max(200, "Variation instructions too long (max 200 chars).").optional().describe('Instructions on how the generated variations should differ.'),
  numberOfLogos: z.coerce.number().min(1, "Generate at least 1 logo.").max(8, "Cannot generate more than 8 logos at a time.").default(4),
  referenceImageFile: z.instanceof(File).optional().nullable().describe("Optional reference image file."),
}).refine(data => data.aestheticKeywords || data.emotionalKeywords || data.functionalKeywords, {
  message: "Please provide keywords for at least one category (Aesthetic, Emotional, or Functional).",
  path: ["aestheticKeywords"],
});


export type LogoFormData = z.infer<typeof logoFormSchema>;

export async function mapFormDataToAiInput(formData: LogoFormData): Promise<GenerateLogoConceptsInput> {
  const {
    preferredLogoStyle,
    iconPlacement,
    iconComplexity,
    composition,
    aestheticKeywords,
    emotionalKeywords,
    functionalKeywords,
    referenceImageFile,
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
      // Handle error or inform user; for now, URI will remain undefined
    }
  }

  return {
    ...rest,
    keywords: combinedKeywords.trim(),
    preferredLogoStyle: preferredLogoStyle === '' ? undefined : preferredLogoStyle as GenerateLogoConceptsInput['preferredLogoStyle'],
    composition: composition === '' ? undefined : composition as GenerateLogoConceptsInput['composition'],
    iconPlacement: iconPlacement === '' ? undefined : iconPlacement,
    iconComplexity: iconComplexity === '' ? undefined : iconComplexity as GenerateLogoConceptsInput['iconComplexity'],
    usageContext: formData.usageContext === '' ? undefined : formData.usageContext,
    variationInstructions: formData.variationInstructions === '' ? undefined : formData.variationInstructions,
    referenceImageDataUri,
  };
}
