import { promises as fs } from 'fs';
import path from 'path';

// Use /tmp for Vercel serverless compatibility (writable)
// Files stored here will be temporary and need to be served via API or uploaded to persistent storage
const DOWNLOADS_DIR = '/tmp/downloads';

export async function ensureDownloadsDir(): Promise<void> {
  try {
    await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
    console.log('Downloads dir ready');
  }
}

export async function saveFile(fileName: string, content: Buffer): Promise<string> {
  try {
    await ensureDownloadsDir();
    const filePath = path.join(DOWNLOADS_DIR, fileName);
    await fs.writeFile(filePath, content);
    // Return a path that can be used to serve via API
    return `/api/serve-file?file=${encodeURIComponent(fileName)}`;
  } catch (error) {
    console.error('Failed to save file:', error);
    throw error;
  }
}

export async function saveTextFile(fileName: string, content: string): Promise<string> {
  try {
    await ensureDownloadsDir();
    const filePath = path.join(DOWNLOADS_DIR, fileName);
    await fs.writeFile(filePath, content, 'utf-8');
    return `/api/serve-file?file=${encodeURIComponent(fileName)}`;
  } catch (error) {
    console.error('Failed to save text file:', error);
    throw error;
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    // Extract filename from path if it's a URL
    const fileName = filePath.split('/').pop() || filePath;
    const fullPath = path.join(DOWNLOADS_DIR, fileName);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Failed to delete file:', error);
    // Don't throw - file might not exist
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fileName = filePath.split('/').pop() || filePath;
    const fullPath = path.join(DOWNLOADS_DIR, fileName);
    await fs.stat(fullPath);
    return true;
  } catch {
    return false;
  }
}

export async function getFileContents(fileName: string): Promise<Buffer | null> {
  try {
    const fullPath = path.join(DOWNLOADS_DIR, fileName);
    return await fs.readFile(fullPath);
  } catch {
    return null;
  }
}

export function generateFileName(type: 'pdf' | 'zip' | 'readme', orderId: number, businessName: string): string {
  const sanitized = businessName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = Date.now();

  switch (type) {
    case 'pdf':
      return `${sanitized}-brand-guide-${orderId}-${timestamp}.pdf`;
    case 'zip':
      return `${sanitized}-brand-package-${orderId}-${timestamp}.zip`;
    case 'readme':
      return `${sanitized}-readme-${orderId}-${timestamp}.md`;
    default:
      return `file-${orderId}-${timestamp}`;
  }
}
