import { createWriteStream, promises as fs } from 'fs';
import { Readable } from 'stream';
import archiver from 'archiver';
import path from 'path';

export interface AssetsToPackage {
  businessName: string;
  logoFiles?: {
    variant1?: string; // file path
    variant2?: string;
    variant3?: string;
    variant4?: string;
  };
  mockupFiles?: {
    letterhead1?: string;
    letterhead2?: string;
    letterhead3?: string;
    letterhead4?: string;
    tshirt1?: string;
    tshirt2?: string;
    tshirt3?: string;
    tshirt4?: string;
    businesscard1?: string;
    businesscard2?: string;
    businesscard3?: string;
    businesscard4?: string;
  };
  pdfPath?: string; // path to generated PDF
  readmeContent?: string; // markdown content
  outputPath: string; // where to save the ZIP
}

export async function createBrandAssetZip(assets: AssetsToPackage): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create output directory if it doesn't exist
      const outputDir = path.dirname(assets.outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      const output = createWriteStream(assets.outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('error', (err) => {
        reject(err);
      });

      output.on('close', () => {
        resolve(assets.outputPath);
      });

      archive.pipe(output);

      // Create folder structure
      const brandName = assets.businessName.replace(/\s+/g, '-').toLowerCase();
      const basePath = `${brandName}-brand-package`;

      // Add logos folder
      if (assets.logoFiles) {
        const logoDir = path.join(basePath, 'logos');

        if (assets.logoFiles.variant1) {
          try {
            const content = await fs.readFile(assets.logoFiles.variant1);
            archive.append(content, { name: `${logoDir}/logo-variant-1.svg` });
          } catch {
            /* ignore if file doesn't exist */
          }
        }

        if (assets.logoFiles.variant2) {
          try {
            const content = await fs.readFile(assets.logoFiles.variant2);
            archive.append(content, { name: `${logoDir}/logo-variant-2.svg` });
          } catch {
            /* ignore */
          }
        }

        if (assets.logoFiles.variant3) {
          try {
            const content = await fs.readFile(assets.logoFiles.variant3);
            archive.append(content, { name: `${logoDir}/logo-variant-3.svg` });
          } catch {
            /* ignore */
          }
        }

        if (assets.logoFiles.variant4) {
          try {
            const content = await fs.readFile(assets.logoFiles.variant4);
            archive.append(content, { name: `${logoDir}/logo-variant-4.svg` });
          } catch {
            /* ignore */
          }
        }
      }

      // Add mockups folder
      if (assets.mockupFiles) {
        const mockupsDir = path.join(basePath, 'mockups');
        const mockupEntries = Object.entries(assets.mockupFiles);

        for (const [key, filePath] of mockupEntries) {
          if (filePath) {
            try {
              const content = await fs.readFile(filePath);
              let fileName = key.replace(/(\d+)$/, (match) => `-${match}`).replace(/_/g, '-') + '.png';
              archive.append(content, { name: `${mockupsDir}/${fileName}` });
            } catch {
              /* ignore */
            }
          }
        }
      }

      // Add PDF if provided
      if (assets.pdfPath) {
        try {
          const content = await fs.readFile(assets.pdfPath);
          archive.append(content, { name: `${basePath}/brand-guide.pdf` });
        } catch {
          /* ignore */
        }
      }

      // Add README if provided
      if (assets.readmeContent) {
        archive.append(assets.readmeContent, { name: `${basePath}/README.md` });
      }

      // Add manifest file
      const manifest = generateManifest(assets);
      archive.append(manifest, { name: `${basePath}/MANIFEST.txt` });

      // Finalize
      await archive.finalize();
    } catch (error) {
      reject(error);
    }
  });
}

function generateManifest(assets: AssetsToPackage): string {
  const lines: string[] = [];

  lines.push('=================================================');
  lines.push(`Brand Asset Package: ${assets.businessName}`);
  lines.push('=================================================');
  lines.push('');

  lines.push('CONTENTS');
  lines.push('---------');
  lines.push('');

  lines.push('📁 logos/');
  lines.push('   - Logo variant 1 (SVG format)');
  lines.push('   - Logo variant 2 (SVG format)');
  lines.push('   - Logo variant 3 (SVG format)');
  lines.push('   - Logo variant 4 (SVG format)');
  lines.push('');

  lines.push('📁 mockups/');
  lines.push('   - Letterhead mockups (4 variants)');
  lines.push('   - T-shirt mockups (4 variants)');
  lines.push('   - Business card mockups (4 variants)');
  lines.push('');

  lines.push('📄 brand-guide.pdf');
  lines.push('   Complete brand guide with all specifications');
  lines.push('');

  lines.push('📄 README.md');
  lines.push('   Brand guidelines and usage instructions');
  lines.push('');

  lines.push('USAGE GUIDELINES');
  lines.push('---------');
  lines.push('');
  lines.push('1. Logo Files');
  lines.push('   - Use SVG format for scalability');
  lines.push('   - All variants have equal rights to usage');
  lines.push('   - Maintain proper spacing (minimum 10% of logo height)');
  lines.push('');

  lines.push('2. Mockup Files');
  lines.push('   - Mockups show the logo in real-world contexts');
  lines.push('   - Use mockups for presentations and proposals');
  lines.push('   - Select the variant that best represents your brand');
  lines.push('');

  lines.push('3. Brand Guide');
  lines.push('   - Reference guide for all brand specifications');
  lines.push('   - Color codes, fonts, and usage rules');
  lines.push('   - Share with team members for consistency');
  lines.push('');

  lines.push('FILE FORMATS');
  lines.push('---------');
  lines.push('');
  lines.push('SVG  - Scalable Vector Graphics (logos)');
  lines.push('PNG  - Portable Network Graphics (mockups)');
  lines.push('PDF  - Portable Document Format (guide)');
  lines.push('MD   - Markdown Format (README)');
  lines.push('');

  lines.push('=================================================');
  lines.push(`Generated: ${new Date().toLocaleDateString()}`);
  lines.push('=================================================');

  return lines.join('\n');
}
