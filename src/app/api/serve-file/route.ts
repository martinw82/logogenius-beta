import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DOWNLOADS_DIR = '/tmp/downloads';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      return NextResponse.json({ error: 'No file specified' }, { status: 400 });
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFileName = path.basename(fileName);
    const filePath = path.join(DOWNLOADS_DIR, sanitizedFileName);

    // Read the file
    const content = await fs.readFile(filePath);

    // Determine content type
    let contentType = 'application/octet-stream';
    if (fileName.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (fileName.endsWith('.zip')) {
      contentType = 'application/zip';
    } else if (fileName.endsWith('.md')) {
      contentType = 'text/markdown';
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${sanitizedFileName}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}