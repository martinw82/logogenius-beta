/**
 * Font Loader Service
 * 
 * Handles loading and preparing fonts for PDF generation.
 * Maps font names to Google Fonts URLs and generates CSS imports.
 * Falls back to system fonts if custom fonts unavailable.
 */

import { promises as fs } from 'fs';
import path from 'path';

// Google Fonts API base URL
const GOOGLE_FONTS_BASE = 'https://fonts.googleapis.com/css2';

// Font name mappings (common name variations)
const FONT_NAME_MAPPINGS: Record<string, string> = {
  // Sans-serif
  'Arial': 'Arial',
  'Helvetica': 'Helvetica Neue',
  'Verdana': 'Verdana',
  'Tahoma': 'Tahoma',
  'Inter': 'Inter',
  'Roboto': 'Roboto',
  'Open Sans': 'Open+Sans',
  'Lato': 'Lato',
  'Montserrat': 'Montserrat',
  'Oswald': 'Oswald',
  'Raleway': 'Raleway',
  'Poppins': 'Poppins',
  'Noto Sans': 'Noto+Sans',
  'Source Sans Pro': 'Source+Sans+3',
  'Ubuntu': 'Ubuntu',
  
  // Serif
  'Times New Roman': 'Times New Roman',
  'Georgia': 'Georgia',
  'Garamond': 'EB+Garamond',
  'Playfair Display': 'Playfair+Display',
  'Merriweather': 'Merriweather',
  
  // Display/Decorative
  'Anton': 'Anton',
  'Lobster': 'Lobster',
  'Pacifico': 'Pacifico',
  'Brush Script MT': 'Dancing+Script',
};

// System font fallbacks by category
const SYSTEM_FONTS = {
  sans: "'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  display: "'Helvetica Neue', Arial, sans-serif",
  script: "'Brush Script MT', cursive",
};

export interface FontConfig {
  headingFont: string;
  bodyFont: string;
  otherFont: string;
  googleFontHeadings: string;
  googleFontBody: string;
  cssImports: string;
}

/**
 * Convert font name to Google Fonts compatible format
 */
function sanitizeFontName(name: string): string {
  // Check mappings first
  if (FONT_NAME_MAPPINGS[name]) {
    return FONT_NAME_MAPPINGS[name];
  }
  
  // Replace spaces with +
  return name.replace(/\s+/g, '+');
}

/**
 * Check if a font is likely available on Google Fonts
 * System fonts don't need Google Fonts import
 */
function isSystemFont(name: string): boolean {
  const systemFonts = [
    'Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS',
    'Times New Roman', 'Georgia', 'Garamond', 'Courier New',
    'Brush Script MT'
  ];
  return systemFonts.includes(name);
}

/**
 * Generate Google Fonts CSS import URL
 */
function generateGoogleFontsUrl(fonts: string[]): string {
  const uniqueFonts = [...new Set(fonts.filter(f => f && !isSystemFont(f)))];
  
  if (uniqueFonts.length === 0) {
    return '';
  }
  
  const familyParams = uniqueFonts.map(font => {
    const sanitized = sanitizeFontName(font);
    return `family=${sanitized}:wght@400;500;600;700`;
  }).join('&');
  
  return `${GOOGLE_FONTS_BASE}?${familyParams}&display=swap`;
}

/**
 * Load fonts for PDF generation
 * 
 * @param fontHeadings - Heading font name
 * @param fontBody - Body font name
 * @param fontOther - Optional accent/other font name
 * @returns FontConfig with CSS imports and font names
 */
export async function loadFontsForPDF(
  fontHeadings?: string,
  fontBody?: string,
  fontOther?: string
): Promise<FontConfig> {
  // Default fonts
  const defaultHeading = 'Inter';
  const defaultBody = 'Inter';
  
  // Normalize font names
  const headings = fontHeadings || defaultHeading;
  const body = fontBody || defaultBody;
  const other = fontOther || body;
  
  // Generate Google Fonts URL
  const fontsForGoogle = [headings, body];
  if (other && other !== headings && other !== body) {
    fontsForGoogle.push(other);
  }
  
  const googleFontsUrl = generateGoogleFontsUrl(fontsForGoogle);
  
  // Build CSS imports
  let cssImports = '';
  if (googleFontsUrl) {
    cssImports = `@import url('${googleFontsUrl}');`;
  }
  
  return {
    headingFont: headings,
    bodyFont: body,
    otherFont: other,
    googleFontHeadings: sanitizeFontName(headings),
    googleFontBody: sanitizeFontName(body),
    cssImports,
  };
}

/**
 * Load custom font file and return base64 encoded data
 * Useful for uploaded TTF/OTF fonts
 */
export async function loadCustomFontFile(filePath: string): Promise<{
  base64: string;
  format: string;
  family: string;
} | null> {
  try {
    const fontData = await fs.readFile(filePath);
    const base64 = fontData.toString('base64');
    
    // Determine format from extension
    const ext = path.extname(filePath).toLowerCase();
    let format = 'truetype';
    if (ext === '.otf') format = 'opentype';
    if (ext === '.woff') format = 'woff';
    if (ext === '.woff2') format = 'woff2';
    
    // Extract family name from filename
    const family = path.basename(filePath, ext)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    
    return { base64, format, family };
  } catch (error) {
    console.error(`Failed to load custom font from ${filePath}:`, error);
    return null;
  }
}

/**
 * Generate @font-face CSS for custom fonts
 */
export function generateFontFaceCSS(
  family: string,
  base64: string,
  format: string
): string {
  return `
    @font-face {
      font-family: '${family}';
      src: url('data:font/${format};base64,${base64}') format('${format}');
      font-weight: 400 700;
      font-style: normal;
      font-display: swap;
    }
  `;
}

/**
 * Get font stack with fallbacks
 */
export function getFontStack(fontName: string): string {
  if (isSystemFont(fontName)) {
    return `'${fontName}', sans-serif`;
  }
  
  // For Google Fonts, add system fallbacks
  return `'${fontName}', 'Helvetica Neue', Arial, sans-serif`;
}

/**
 * Validate that a font name is usable
 */
export function isValidFontName(name: string): boolean {
  if (!name || name.trim() === '') return false;
  if (name === '_NONE_') return false;
  return true;
}
