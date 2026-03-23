/**
 * PDF Handlebars Helpers
 *
 * Custom helpers for Handlebars templates used in PDF generation.
 * Includes formatting, color conversion (hex→RGB→CMYK), and conditional logic.
 */

import Handlebars from 'handlebars';

// ── Colour conversion ─────────────────────────────────────────

/**
 * Convert hex color to RGB string for CSS
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * Parse hex to individual R, G, B values
 */
function hexToRgbObj(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to CMYK
 */
function rgbToCmyk({ r, g, b }: { r: number; g: number; b: number }): { c: number; m: number; y: number; k: number } {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = Math.round(((1 - rr - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gg - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bb - k) / (1 - k)) * 100);
  return { c, m, y, k: Math.round(k * 100) };
}

/**
 * Convert hex color to CMYK string
 */
function hexToCmyk(hex: string): string {
  const rgb = hexToRgbObj(hex);
  const cmyk = rgbToCmyk(rgb);
  return `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`;
}

/**
 * Get individual CMYK component from hex
 */
function hexToCmykObj(hex: string): { c: number; m: number; y: number; k: number } {
  return rgbToCmyk(hexToRgbObj(hex));
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
  const a = [r, g, b].map(v =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Determine if text should be black or white based on background color
 */
function contrastColor(hex: string): string {
  return getLuminance(hex) > 0.5 ? '#000000' : '#ffffff';
}

// ── Date helpers ──────────────────────────────────────────────

function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateShort(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
  });
}

// ── Text helpers ──────────────────────────────────────────────

function paragraphs(text: string): string {
  if (!text) return '';
  return text
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.trim()}</p>`)
    .join('\n');
}

function truncate(text: string, length: number): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length - 3) + '...';
}

function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function uppercase(text: string): string {
  if (!text) return '';
  return text.toUpperCase();
}

function lowercase(text: string): string {
  if (!text) return '';
  return text.toLowerCase();
}

// ── Debug helpers ─────────────────────────────────────────────

function json(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

// ── Math helpers ──────────────────────────────────────────────

function multiply(a: number, b: number): number {
  return a * b;
}

function add(a: number, b: number): number {
  return a + b;
}

function subtract(a: number, b: number): number {
  return a - b;
}

function divide(a: number, b: number): number {
  return b !== 0 ? a / b : 0;
}

// ── Array helpers ─────────────────────────────────────────────

function length(arr: unknown[]): number {
  return arr?.length || 0;
}

function hasItems(arr: unknown[]): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

function join(arr: string[], separator: string): string {
  if (!Array.isArray(arr)) return '';
  return arr.join(separator);
}

// ── Colour utility helpers for templates ──────────────────────

/**
 * Return hex with appended alpha hex for CSS (e.g. #C8102E0d for 5% opacity)
 */
function hexWithAlpha(hex: string, alphaPercent: number): string {
  const alpha = Math.round((alphaPercent / 100) * 255);
  return `${hex}${alpha.toString(16).padStart(2, '0')}`;
}

/**
 * Return an rgba() CSS string from hex + opacity
 */
function hexToRgba(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb}, ${opacity})`;
}

// ── Registration ──────────────────────────────────────────────

/**
 * Register all helpers with Handlebars instance
 */
export function registerHelpers(handlebars: typeof Handlebars): void {
  // Color helpers
  handlebars.registerHelper('hexToRgb', hexToRgb);
  handlebars.registerHelper('hexToCmyk', hexToCmyk);
  handlebars.registerHelper('contrastColor', contrastColor);
  handlebars.registerHelper('hexWithAlpha', hexWithAlpha);
  handlebars.registerHelper('hexToRgba', hexToRgba);

  // Date helpers
  handlebars.registerHelper('formatDate', formatDate);
  handlebars.registerHelper('formatDateShort', formatDateShort);

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
  handlebars.registerHelper('subtract', subtract);
  handlebars.registerHelper('divide', divide);

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

  // Conditional block helpers
  handlebars.registerHelper('ifEq', function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  handlebars.registerHelper('ifNotEq', function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
    return a !== b ? options.fn(this) : options.inverse(this);
  });

  // Repeat helper (for generating N items)
  handlebars.registerHelper('times', function (this: unknown, n: number, options: Handlebars.HelperOptions) {
    let result = '';
    for (let i = 0; i < n; i++) {
      result += options.fn({ index: i, num: i + 1 });
    }
    return result;
  });

  // Pad number with leading zero (01, 02, etc.)
  handlebars.registerHelper('padZero', (n: number) => {
    return String(n).padStart(2, '0');
  });
}

// Export individual helpers for direct use
export {
  hexToRgb,
  hexToRgbObj,
  rgbToCmyk,
  hexToCmyk,
  hexToCmykObj,
  contrastColor,
  formatDate,
  formatDateShort,
  paragraphs,
  truncate,
  capitalize,
  uppercase,
  lowercase,
  getLuminance,
  hexWithAlpha,
  hexToRgba,
};
