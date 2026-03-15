import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth';
import { fontStorage } from '@/lib/font-storage';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = ['.ttf', '.otf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/admin/fonts/upload
 * Upload a font file (TTF/OTF)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const admin = await verifyAdminToken(token);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('font') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No font file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

    if (!isValidExtension) {
      return NextResponse.json(
        { error: 'Invalid file type. Only TTF and OTF files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Save font using storage utility
    try {
      const fontFile = await fontStorage.saveFont(file);

      return NextResponse.json({
        success: true,
        font: fontFile
      });
    } catch (error) {
      console.error('Error saving font file:', error);
      return NextResponse.json(
        { error: 'Failed to save font file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Font upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}