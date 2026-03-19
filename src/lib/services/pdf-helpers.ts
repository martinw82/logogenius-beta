/**
 * PDF Handlebars Helpers
 * 
 * Custom helpers for Handlebars templates used in PDF generation.
 * Includes formatting, color conversion, and conditional logic.
 */

import Handlebars from 'handlebars';

/**
 * Convert hex color to RGB string for CSS
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Calculate luminance of a color to determine contrast
 */
function getLuminance(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 0;
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Determine if text should be black or white based on background color
 */
function contrastColor(hex: string): string {
  const luminance = getLuminance(hex);
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Format date to readable string
 */
function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Convert text to HTML paragraphs
 */
function paragraphs(text: string): string {
  if (!text) return '';
  
  return text
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.trim()}</p>`)
    .join('\n');
}

/**
 * Truncate text with ellipsis
 */
function truncate(text: string, length: number): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length - 3) + '...';
}

/**
 * Uppercase first letter
 */
function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert to uppercase
 */
function uppercase(text: string): string {
  if (!text) return '';
  return text.toUpperCase();
}

/**
 * Convert to lowercase
 */
function lowercase(text: string): string {
  if (!text) return '';
  return text.toLowerCase();
}

/**
 * JSON stringify for debugging
 */
function json(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

/**
 * Multiply number by value
 */
function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Add two numbers
 */
function add(a: number, b: number): number {
  return a + b;
}

/**
 * Get array length
 */
function length(arr: unknown[]): number {
  return arr?.length || 0;
}

/**
 * Check if array has items
 */
function hasItems(arr: unknown[]): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Join array with separator
 */
function join(arr: string[], separator: string): string {
  if (!Array.isArray(arr)) return '';
  return arr.join(separator);
}

/**
 * Register all helpers with Handlebars instance
 */
export function registerHelpers(handlebars: typeof Handlebars): void {
  // Color helpers
  handlebars.registerHelper('hexToRgb', hexToRgb);
  handlebars.registerHelper('contrastColor', contrastColor);
  
  // Date helpers
  handlebars.registerHelper('formatDate', formatDate);
  
  // Text helpers
  handlebars.registerHelper('paragraphs', paragraphs);
  handlebars.registerHelper('truncate', truncate);
  handlebars.registerHelper('capitalize', capitalize);
  handlebars.registerHelper('uppercase', uppercase);
  handlebars.registerHelper('lowercase', lowercase);
  
  // Debug helpers
  handlebars.registerHelper('json', json);
  
  // Math helpers
  handlebars.registerHelper('multiply', multiply);
  handlebars.registerHelper('add', add);
  
  // Array helpers
  handlebars.registerHelper('length', length);
  handlebars.registerHelper('hasItems', hasItems);
  handlebars.registerHelper('join', join);
  
  // Comparison helpers
  handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
  handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b);
  handlebars.registerHelper('gt', (a: number, b: number) => a > b);
  handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
  handlebars.registerHelper('lt', (a: number, b: number) => a < b);
  handlebars.registerHelper('lte', (a: number, b: number) => a <= b);
  handlebars.registerHelper('and', (a: unknown, b: unknown) => a && b);
  handlebars.registerHelper('or', (a: unknown, b: unknown) => a || b);
  handlebars.registerHelper('not', (a: unknown) => !a);
  
  // String inclusion
  handlebars.registerHelper('includes', (str: string, substr: string) => {
    if (typeof str !== 'string') return false;
    return str.includes(substr);
  });
  
  // Conditional helpers
  handlebars.registerHelper('ifEq', function(this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
    return a === b ? options.fn(this) : options.inverse(this);
  });
  
  handlebars.registerHelper('ifNotEq', function(this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
    return a !== b ? options.fn(this) : options.inverse(this);
  });
}

// Export individual helpers for direct use
export {
  hexToRgb,
  contrastColor,
  formatDate,
  paragraphs,
  truncate,
  capitalize,
  uppercase,
  lowercase,
  getLuminance,
};
