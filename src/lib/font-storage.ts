import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface FontFile {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
}

class FontStorage {
  private uploadDir: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'uploads', 'fonts');
  }

  async saveFont(file: File): Promise<FontFile> {
    // Create upload directory if it doesn't exist
    await mkdir(this.uploadDir, { recursive: true });

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    const filePath = join(this.uploadDir, uniqueFileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create font metadata
    const fontName = file.name.replace(/\.(ttf|otf)$/i, '');

    return {
      id: randomUUID(),
      name: fontName,
      fileName: uniqueFileName,
      filePath: `/uploads/fonts/${uniqueFileName}`, // Public URL path
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    };
  }

  async deleteFont(fontId: string): Promise<boolean> {
    // In a real implementation, you'd look up the font by ID from a database
    // For now, this is a placeholder
    try {
      // This would need actual font lookup logic
      // await unlink(fontPath);
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(fileName: string): string {
    return `/uploads/fonts/${fileName}`;
  }

  // Future: Add S3 integration
  // async saveFontToS3(file: File): Promise<FontFile> {
  //   // AWS S3 upload logic here
  // }
}

export const fontStorage = new FontStorage();