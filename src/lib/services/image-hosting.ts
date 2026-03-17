/**
 * Image Hosting Utility
 *
 * Converts base64 data URLs into publicly accessible image URLs
 * that external APIs (mockup providers) can fetch.
 *
 * Strategies (in order of preference):
 * 1. **Local temp serve** — saves to /tmp, serves via /api/serve-image/[id].
 *    Works in production where NEXT_PUBLIC_BASE_URL is publicly accessible.
 * 2. **imgbb upload** — free image hosting, works everywhere (even localhost).
 *    Requires IMGBB_API_KEY env var (free at https://api.imgbb.com/).
 *
 * For Dynamic Mockups specifically, we bypass this entirely and use
 * FormData binary upload (see mockup-generation.ts).
 */

// Note: fs, path, crypto are dynamically imported in functions that need them
// to avoid bundling Node.js modules in client-side code

const TEMP_IMAGES_DIR = '/tmp/mockup-images';

/**
 * Convert a base64 data URL to a publicly accessible URL.
 *
 * Returns the original string unchanged if it's already a URL (http/https).
 */
export async function resolveImageUrl(dataUrlOrUrl: string): Promise<string> {
  // Already a public URL — pass through
  if (dataUrlOrUrl.startsWith('http://') || dataUrlOrUrl.startsWith('https://')) {
    return dataUrlOrUrl;
  }

  // Must be a base64 data URL
  if (!dataUrlOrUrl.startsWith('data:image/')) {
    throw new Error('Expected a base64 data URL (data:image/...) or an http(s) URL');
  }

  // Strategy 1: imgbb upload (works everywhere including localhost)
  const imgbbKey = process.env.IMGBB_API_KEY;
  if (imgbbKey) {
    try {
      return await uploadToImgbb(dataUrlOrUrl, imgbbKey);
    } catch (error) {
      console.warn('[ImageHosting] imgbb upload failed, trying local serve:', error);
    }
  }

  // Strategy 2: Local temp file serve (works when app is publicly accessible)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (baseUrl) {
    return await saveAndServeLocally(dataUrlOrUrl, baseUrl);
  }

  throw new Error(
    'Cannot convert base64 image to public URL. Either:\n' +
    '  1. Set NEXT_PUBLIC_BASE_URL to your public app URL (production), or\n' +
    '  2. Set IMGBB_API_KEY for free image hosting (get key at https://api.imgbb.com/), or\n' +
    '  3. Use Dynamic Mockups provider (supports binary upload, no public URL needed)'
  );
}

/**
 * Decode a base64 data URL into a Buffer and its MIME type.
 */
export function decodeDataUrl(dataUrl: string): { buffer: Buffer; mimeType: string; extension: string } {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL format');
  }

  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const extension = mimeType.split('/')[1] || 'png';

  return { buffer, mimeType, extension };
}

// ==================== Strategy: imgbb ====================

async function uploadToImgbb(dataUrl: string, apiKey: string): Promise<string> {
  // imgbb accepts base64 without the data:image/... prefix
  const base64Data = dataUrl.split(',')[1];
  if (!base64Data) {
    throw new Error('Could not extract base64 data from data URL');
  }

  const formData = new FormData();
  formData.append('key', apiKey);
  formData.append('image', base64Data);
  formData.append('expiration', '600'); // 10 minutes — enough for mockup API to fetch

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`imgbb upload failed (${response.status}): ${error}`);
  }

  const data = await response.json();
  const url = data.data?.url;

  if (!url) {
    throw new Error('imgbb returned no URL');
  }

  console.log(`[ImageHosting] Uploaded to imgbb (expires in 10min): ${url}`);
  return url;
}

// ==================== Strategy: Local temp serve ====================

async function saveAndServeLocally(dataUrl: string, baseUrl: string): Promise<string> {
  // Dynamic imports for Node.js modules - only loaded when needed
  const { promises: fs } = await import('fs');
  const path = await import('path');
  const crypto = await import('crypto');
  
  const { buffer, extension } = decodeDataUrl(dataUrl);

  // Generate unique filename
  const id = crypto.randomBytes(16).toString('hex');
  const fileName = `${id}.${extension}`;

  // Ensure temp directory exists
  await fs.mkdir(TEMP_IMAGES_DIR, { recursive: true });

  // Save file
  const filePath = path.join(TEMP_IMAGES_DIR, fileName);
  await fs.writeFile(filePath, buffer);

  // Clean URL — remove trailing slash from base URL
  const cleanBase = baseUrl.replace(/\/$/, '');
  const publicUrl = `${cleanBase}/api/serve-image/${id}`;

  console.log(`[ImageHosting] Saved temp image: ${filePath} → ${publicUrl}`);
  return publicUrl;
}

/**
 * Clean up temp images older than maxAgeMs (default 30 minutes)
 */
export async function cleanupTempImages(maxAgeMs = 30 * 60 * 1000): Promise<number> {
  try {
    // Dynamic import for Node.js module
    const { promises: fs } = await import('fs');
    const path = await import('path');
    
    const files = await fs.readdir(TEMP_IMAGES_DIR);
    const now = Date.now();
    let cleaned = 0;

    for (const file of files) {
      const filePath = path.join(TEMP_IMAGES_DIR, file);
      const stat = await fs.stat(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        await fs.unlink(filePath);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[ImageHosting] Cleaned up ${cleaned} temp images`);
    }
    return cleaned;
  } catch {
    return 0; // Directory may not exist yet
  }
}
