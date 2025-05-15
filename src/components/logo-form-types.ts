import { z } from 'zod';
import type { GenerateLogoConceptsInput } from '@/ai/flows/generate-logo-concepts';

export const logoFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required.").max(100, "Business name too long."),
  industry: z.string().min(1, "Industry is required.").max(100, "Industry too long."),
  keywords: z.string().min(3, "Keywords are required (min 3 characters).").max(200, "Keywords too long."),
  preferredColorPalette: z.string().max(100, "Color palette description too long.").optional(),
  preferredLogoStyle: z.enum(['', 'logomark', 'wordmark', 'combination mark', 'abstract']).default('').optional(),
  iconPlacement: z.enum(['', 'above_text', 'left_of_text', 'right_of_text', 'below_text', 'no_icon', 'icon_only']).default('').optional().describe('Preferred placement of the icon relative to the text.'),
  fontStyle: z.string().max(100, "Font style description too long.").optional().describe('Preferred font style (e.g., modern sans-serif, elegant script).'),
  numberOfLogos: z.coerce.number().min(1, "Generate at least 1 logo.").max(8, "Generate at most 8 logos.").default(4),
});

export type LogoFormData = z.infer<typeof logoFormSchema>;

export function mapFormDataToAiInput(formData: LogoFormData): GenerateLogoConceptsInput {
  const { preferredLogoStyle, iconPlacement, ...rest } = formData;
  return {
    ...rest,
    // Map empty string to undefined as per AI flow's optional enum
    preferredLogoStyle: preferredLogoStyle === '' ? undefined : preferredLogoStyle,
    iconPlacement: iconPlacement === '' ? undefined : iconPlacement,
  };
}
