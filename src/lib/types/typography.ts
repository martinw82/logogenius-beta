import { z } from 'zod';

export const commonFontList = [
  "Arial", "Verdana", "Helvetica", "Tahoma", "Trebuchet MS",
  "Times New Roman", "Georgia", "Garamond",
  "Courier New", "Brush Script MT",
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Raleway", "Poppins", "Noto Sans",
  "Playfair Display", "Merriweather", "Source Sans Pro", "Ubuntu", "Lobster", "Pacifico"
] as const;

export const NONE_VALUE = "_NONE_";

export const typographySchema = z.object({
  // Brand Typography
  fontHeadings: z.enum(['', ...commonFontList, NONE_VALUE]).default('').optional(),
  useHeadingsFontForLogo: z.boolean().optional().default(false),
  fontBody: z.enum(['', ...commonFontList, NONE_VALUE]).default('').optional(),
  useBodyFontForLogo: z.boolean().optional().default(false),
  fontOther: z.enum(['', ...commonFontList, NONE_VALUE]).default('').optional(),
  useOtherFontForLogo: z.boolean().optional().default(false),
});

export type TypographyData = z.infer<typeof typographySchema>;

export const mapTypographyField = <T extends string>(value: T | typeof NONE_VALUE | '' | undefined): T | undefined => {
  return value === '' || value === NONE_VALUE ? undefined : value as T;
};