/**
 * Brand Assets Service
 *
 * Maps brand archetypes to visual asset packs and provides random selection.
 * Each order gets unique assets based on orderId (seeded random for reproducibility).
 *
 * 6 Asset Packs (merging 12 archetypes):
 * - soft-safe: Innocent + Caregiver — rounded, pastel, organic
 * - bold-intense: Hero + Outlaw — sharp, high contrast, gritty
 * - authentic-real: Explorer + Everyman — earthy, wide layouts, honest
 * - authority-expert: Sage + Ruler — grid-based, structured, typographic
 * - visionary-innovation: Creator + Magician — asymmetric, expressive
 * - emotion-connection: Lover + Jester — playful/sensual, curved, warm
 *
 * 4 Asset Types Per Pack:
 * - textures/ (TX) — full-bleed background fills, 8-15% opacity
 * - accents/ (GEO) — corner/edge decorative shapes, 8-15% opacity
 * - chrome/ (CHR) — header rules, footer bars, dividers
 * - patterns/ (PAT) — repeat motifs for divider pages, 5-8% opacity
 */

import { promises as fs } from 'fs';
import path from 'path';

// Map 12 archetypes to 6 asset packs
export const ARCHETYPE_TO_PACK: Record<string, string> = {
  'The Innocent': 'soft-safe',
  'Innocent': 'soft-safe',
  'The Caregiver': 'soft-safe',
  'Caregiver': 'soft-safe',
  'The Hero': 'bold-intense',
  'Hero': 'bold-intense',
  'The Rebel': 'bold-intense',
  'Rebel': 'bold-intense',
  'The Outlaw': 'bold-intense',
  'Outlaw': 'bold-intense',
  'The Explorer': 'authentic-real',
  'Explorer': 'authentic-real',
  'The Everyman': 'authentic-real',
  'Everyman': 'authentic-real',
  'The Sage': 'authority-expert',
  'Sage': 'authority-expert',
  'The Ruler': 'authority-expert',
  'Ruler': 'authority-expert',
  'The Creator': 'visionary-innovation',
  'Creator': 'visionary-innovation',
  'The Magician': 'visionary-innovation',
  'Magician': 'visionary-innovation',
  'The Lover': 'emotion-connection',
  'Lover': 'emotion-connection',
  'The Jester': 'emotion-connection',
  'Jester': 'emotion-connection',
};

// Per-pack design configuration
export const PACK_CONFIG: Record<string, PackConfig> = {
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

export interface PackConfig {
  fonts: {
    heading: string;
    body: string;
  };
  design: {
    cornerRadius: string;
    layoutBias: 'centered' | 'asymmetric' | 'wide' | 'grid';
    gradients: boolean;
  };
}

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
 * List image/SVG files in a folder, returning empty array if folder doesn't exist
 */
async function listFolder(folderPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(folderPath);
    return files.filter((f: string) => /\.(svg|png|jpg|jpeg|webp)$/i.test(f));
  } catch {
    return [];
  }
}

/**
 * Get random brand assets for an archetype
 *
 * @param archetype - Brand archetype name (e.g., "The Hero" or "Hero")
 * @param orderId - Order ID for seeded randomness
 * @param basePath - Base path to assets folder (default: ./assets)
 * @returns BrandAssets with selected texture, accent, chrome, pattern, and design tokens
 */
export async function getRandomBrandAssets(
  archetype: string,
  orderId: number,
  basePath: string = './assets'
): Promise<BrandAssets> {
  const packName = ARCHETYPE_TO_PACK[archetype] || 'bold-intense';
  const packPath = path.join(basePath, packName);
  const config = PACK_CONFIG[packName] || PACK_CONFIG['bold-intense'];

  // Create seeded random generator
  const seed = orderId % 100000;
  const random = createSeededRandom(seed);

  // Load all asset folders in parallel
  const [textures, accents, chrome, patterns] = await Promise.all([
    listFolder(path.join(packPath, 'textures')),
    listFolder(path.join(packPath, 'accents')),
    listFolder(path.join(packPath, 'chrome')),
    listFolder(path.join(packPath, 'patterns')),
  ]);

  // Random selection using seeded random
  const pick = <T>(arr: T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(random() * arr.length)];
  };

  const selectedTexture = pick(textures);
  const selectedAccent = pick(accents);
  const selectedChrome = pick(chrome);
  const selectedPattern = pick(patterns);

  // Random positioning values
  const accentOpacity = Math.floor(8 + (random() * 7));     // 8-15
  const accentRotation = Math.floor(random() * 90);          // 0-89
  const accentSide = random() > 0.5 ? 'right' as const : 'left' as const;

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
    hasAssets: textures.length > 0 || accents.length > 0,
  };
}

/**
 * Get pack name for an archetype (without loading assets)
 */
export function getPackNameForArchetype(archetype: string): string {
  return ARCHETYPE_TO_PACK[archetype] || 'bold-intense';
}

/**
 * Get all available archetypes for a pack
 */
export function getArchetypesForPack(packName: string): string[] {
  return Object.entries(ARCHETYPE_TO_PACK)
    .filter(([, pack]) => pack === packName)
    .map(([archetype]) => archetype);
}

/**
 * Check if assets exist for a pack
 */
export async function checkPackAssetsExist(
  packName: string,
  basePath: string = './assets'
): Promise<{ textures: boolean; accents: boolean; chrome: boolean; patterns: boolean }> {
  const packPath = path.join(basePath, packName);

  const [textures, accents, chrome, patterns] = await Promise.all([
    listFolder(path.join(packPath, 'textures')).then(f => f.length > 0),
    listFolder(path.join(packPath, 'accents')).then(f => f.length > 0),
    listFolder(path.join(packPath, 'chrome')).then(f => f.length > 0),
    listFolder(path.join(packPath, 'patterns')).then(f => f.length > 0),
  ]);

  return { textures, accents, chrome, patterns };
}
