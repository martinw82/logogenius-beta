/**
 * Brand Assets Service
 * 
 * Maps brand archetypes to visual asset packs and provides random selection.
 * Each order gets unique assets based on orderId (seeded random for reproducibility).
 * 
 * Archetype Packs:
 * - soft-safe: Innocent + Caregiver
 * - bold-intense: Hero + Rebel/Outlaw
 * - authentic-real: Explorer + Everyman
 * - authority-expert: Sage + Ruler
 * - visionary-innovation: Creator + Magician
 * - emotion-connection: Lover + Jester
 */

import { promises as fs } from 'fs';
import path from 'path';

// Map 12 archetypes to 6 asset packs
export const ARCHETYPE_TO_PACK: Record<string, string> = {
  'The Innocent': 'soft-safe',
  'The Caregiver': 'soft-safe',
  'The Hero': 'bold-intense',
  'The Rebel': 'bold-intense',
  'The Explorer': 'authentic-real',
  'The Everyman': 'authentic-real',
  'The Sage': 'authority-expert',
  'The Ruler': 'authority-expert',
  'The Creator': 'visionary-innovation',
  'The Magician': 'visionary-innovation',
  'The Lover': 'emotion-connection',
  'The Jester': 'emotion-connection',
  // Also support lowercase or no "The " prefix
  'Innocent': 'soft-safe',
  'Caregiver': 'soft-safe',
  'Hero': 'bold-intense',
  'Rebel': 'bold-intense',
  'Explorer': 'authentic-real',
  'Everyman': 'authentic-real',
  'Sage': 'authority-expert',
  'Ruler': 'authority-expert',
  'Creator': 'visionary-innovation',
  'Magician': 'visionary-innovation',
  'Lover': 'emotion-connection',
  'Jester': 'emotion-connection',
};

// Pack-specific design configuration
export const PACK_CONFIG: Record<string, {
  fonts: { heading: string; body: string };
  design: { cornerRadius: string; layoutBias: string; gradients: boolean };
}> = {
  'soft-safe': {
    fonts: { heading: 'Quicksand', body: 'Roboto' },
    design: { cornerRadius: '16px', layoutBias: 'centered', gradients: true },
  },
  'bold-intense': {
    fonts: { heading: 'Anton', body: 'Roboto Condensed' },
    design: { cornerRadius: '0px', layoutBias: 'asymmetric', gradients: false },
  },
  'authentic-real': {
    fonts: { heading: 'Bebas Neue', body: 'Open Sans' },
    design: { cornerRadius: '4px', layoutBias: 'wide', gradients: false },
  },
  'authority-expert': {
    fonts: { heading: 'Oswald', body: 'Lato' },
    design: { cornerRadius: '2px', layoutBias: 'grid', gradients: false },
  },
  'visionary-innovation': {
    fonts: { heading: 'Permanent Marker', body: 'Inter' },
    design: { cornerRadius: '0px', layoutBias: 'asymmetric', gradients: true },
  },
  'emotion-connection': {
    fonts: { heading: 'Playfair Display', body: 'Inter' },
    design: { cornerRadius: '12px', layoutBias: 'centered', gradients: true },
  },
};

export interface BrandAssets {
  packName: string;
  selectedTexture: string | null;
  selectedAccent: string | null;
  selectedChrome: string | null;
  selectedPattern: string | null;
  accentOpacity: number;    // 8-15%
  accentRotation: number;   // 0-89°
  accentSide: 'left' | 'right';
  fonts: { heading: string; body: string };
  design: { cornerRadius: string; layoutBias: string; gradients: boolean };
  hasAssets: boolean;
}

/**
 * Seeded random number generator for reproducibility
 * Same orderId will always produce same assets
 */
function createSeededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Get random brand assets for an archetype
 * 
 * @param archetype - Brand archetype name (e.g., "The Hero")
 * @param orderId - Order ID for seeded randomness
 * @param basePath - Base path to assets folder (default: ./assets)
 * @returns BrandAssets with selected texture, accent, and positioning
 */
export async function getRandomBrandAssets(
  archetype: string,
  orderId: number,
  basePath: string = './assets'
): Promise<BrandAssets> {
  // Find pack name - normalize archetype input
  let packName = ARCHETYPE_TO_PACK[archetype];
  if (!packName) {
    // Try with "The " prefix
    packName = ARCHETYPE_TO_PACK[`The ${archetype}`] || 'bold-intense';
  }
  const packPath = path.join(basePath, packName);
  
  // Get pack-specific config
  const config = PACK_CONFIG[packName] || PACK_CONFIG['bold-intense'];
  
  // Create seeded random generator
  const seed = orderId % 100000;
  const random = createSeededRandom(seed);
  
  // Try to load available textures, accents, chrome, and patterns
  let textures: string[] = [];
  let accents: string[] = [];
  let chrome: string[] = [];
  let patterns: string[] = [];
  
  try {
    textures = await fs.readdir(path.join(packPath, 'textures'));
    textures = textures.filter(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
  } catch {
    textures = [];
  }
  
  try {
    accents = await fs.readdir(path.join(packPath, 'accents'));
    accents = accents.filter(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
  } catch {
    accents = [];
  }

  try {
    chrome = await fs.readdir(path.join(packPath, 'chrome'));
    chrome = chrome.filter(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
  } catch {
    chrome = [];
  }

  try {
    patterns = await fs.readdir(path.join(packPath, 'patterns'));
    patterns = patterns.filter(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
  } catch {
    patterns = [];
  }
  
  // Random selection using seeded random
  const pick = <T>(arr: T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(random() * arr.length)];
  };
  
  const selectedTexture = pick(textures);
  const selectedAccent = pick(accents);
  const selectedChrome = pick(chrome);
  const selectedPattern = pick(patterns);
  
  // Random positioning values (8-15% opacity, 0-89° rotation)
  const accentOpacity = Math.floor(8 + (random() * 7));     // 8-15
  const accentRotation = Math.floor(random() * 90);         // 0-89
  const accentSide = random() > 0.5 ? 'right' : 'left';
  
  return {
    packName,
    selectedTexture: selectedTexture ? `textures/${selectedTexture}` : null,
    selectedAccent: selectedAccent ? `accents/${selectedAccent}` : null,
    selectedChrome: selectedChrome ? `chrome/${selectedChrome}` : null,
    selectedPattern: selectedPattern ? `patterns/${selectedPattern}` : null,
    accentOpacity,
    accentRotation,
    accentSide,
    fonts: config.fonts,
    design: config.design,
    hasAssets: textures.length > 0 || accents.length > 0 || chrome.length > 0 || patterns.length > 0,
  };
}

/**
 * Get pack name for an archetype (without loading assets)
 * Useful for debugging or quick lookups
 */
export function getPackNameForArchetype(archetype: string): string {
  return ARCHETYPE_TO_PACK[archetype] || 'bold-intense';
}

/**
 * Get all available archetypes for a pack
 * Inverse lookup of ARCHETYPE_TO_PACK
 */
export function getArchetypesForPack(packName: string): string[] {
  return Object.entries(ARCHETYPE_TO_PACK)
    .filter(([, pack]) => pack === packName)
    .map(([archetype]) => archetype);
}

/**
 * Check if assets exist for a pack
 * Useful for pre-flight checks
 */
export async function checkPackAssetsExist(
  packName: string,
  basePath: string = './assets'
): Promise<{ textures: boolean; accents: boolean }> {
  const packPath = path.join(basePath, packName);
  
  let textures = false;
  let accents = false;
  
  try {
    const textureFiles = await fs.readdir(path.join(packPath, 'textures'));
    textures = textureFiles.some(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
  } catch {
    textures = false;
  }
  
  try {
    const accentFiles = await fs.readdir(path.join(packPath, 'accents'));
    accents = accentFiles.some(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
  } catch {
    accents = false;
  }
  
  return { textures, accents };
}
