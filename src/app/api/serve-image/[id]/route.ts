import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const TEMP_IMAGES_DIR = '/tmp/mockup-images';

/**
 * Serve a temporarily stored image by its ID.
 * Used to provide public URLs for base64 logo images
 * so external mockup APIs can fetch them.
 *
 * GET /api/serve-image/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format (hex only, prevents directory traversal)
    if (!/^[a-f0-9]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    // Find the file (try common extensions)
    const extensions = ['png', 'jpeg', 'jpg', 'webp'];
    let filePath: string | null = null;
    let contentType = 'image/png';

    for (const ext of extensions) {
      const candidate = path.join(TEMP_IMAGES_DIR, `${id}.${ext}`);
      try {
        await fs.access(candidate);
        filePath = candidate;
        contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
        break;
      } catch {
        // Try next extension
      }
    }

    if (!filePath) {
      return NextResponse.json({ error: 'Image not found or expired' }, { status: 404 });
    }

    const content = await fs.readFile(filePath);

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=600', // 10 min cache
      },
    });
  } catch (error) {
    console.error('[serve-image] Error:', error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
