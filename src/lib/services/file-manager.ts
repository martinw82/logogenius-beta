import { promises as fs } from 'fs';
import path from 'path';

const DOWNLOADS_DIR = path.join(process.cwd(), 'public', 'downloads');

export async function ensureDownloadsDir(): Promise<void> {
  try {
    await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create downloads directory:', error);
    throw error;
  }
}

export async function saveFile(fileName: string, content: Buffer): Promise<string> {
  try {
    await ensureDownloadsDir();
    const filePath = path.join(DOWNLOADS_DIR, fileName);
    await fs.writeFile(filePath, content);
    return `/downloads/${fileName}`;
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
    return `/downloads/${fileName}`;
  } catch (error) {
    console.error('Failed to save text file:', error);
    throw error;
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Failed to delete file:', error);
    // Don't throw - file might not exist
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await fs.stat(fullPath);
    return true;
  } catch {
    return false;
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
