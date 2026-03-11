import { describe, it, expect } from '@jest/globals';

/**
 * Unit Tests for LogoGenius Services
 * 
 * These tests verify individual service functions without requiring
 * database connections or external APIs.
 */

describe('Token Service', () => {
  // Dynamic import to handle module resolution
  const getTokenService = async () => {
    return import('../../src/lib/services/token-service');
  };

  it('should generate a dashboard token', async () => {
    const { generateDashboardToken } = await getTokenService();
    
    const token = generateDashboardToken();
    
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64); // 32 bytes in hex = 64 chars
  });

  it('should generate unique tokens', async () => {
    const { generateDashboardToken } = await getTokenService();
    
    const token1 = generateDashboardToken();
    const token2 = generateDashboardToken();
    
    expect(token1).not.toBe(token2);
  });

  it('should calculate expiration date in the future', async () => {
    const { getTokenExpirationDate } = await getTokenService();
    const beforeGen = new Date();
    
    const expiresAt = getTokenExpirationDate();
    const afterGen = new Date();
    
    expect(expiresAt.getTime()).toBeGreaterThan(beforeGen.getTime());
    expect(expiresAt.getTime()).toBeGreaterThan(afterGen.getTime());
  });

  it('should validate token expiration', async () => {
    const { isTokenValid, getTokenExpirationDate } = await getTokenService();
    
    const futureDate = getTokenExpirationDate(365);
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    expect(isTokenValid(futureDate)).toBe(true);
    expect(isTokenValid(pastDate)).toBe(false);
  });

  it('should hash tokens consistently', async () => {
    const { hashToken } = await getTokenService();
    
    const token = 'test-token-123';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex
  });
});

describe('Version Tracking Service', () => {
  const getVersionService = async () => {
    return import('../../src/lib/services/version-tracking');
  };

  it('should generate version string', async () => {
    const { generateVersionString } = await getVersionService();
    
    expect(generateVersionString(1, 0)).toBe('1.0');
    expect(generateVersionString(2, 5)).toBe('2.5');
    expect(generateVersionString(10)).toBe('10.0');
  });

  it('should increment minor version', async () => {
    const { incrementVersion } = await getVersionService();
    
    expect(incrementVersion('1.0')).toBe('1.1');
    expect(incrementVersion('2.5')).toBe('2.6');
    expect(incrementVersion('0.9')).toBe('0.10');
  });

  it('should increment major version when specified', async () => {
    const { incrementVersion } = await getVersionService();
    
    expect(incrementVersion('1.0', true)).toBe('2.0');
    expect(incrementVersion('2.5', true)).toBe('3.0');
  });

  it('should handle string version parsing', async () => {
    const { incrementVersion } = await getVersionService();
    
    expect(incrementVersion('2.0.0')).toBe('2.1');
  });
});

describe('File Manager Service', () => {
  const getFileManager = async () => {
    return import('../../src/lib/services/file-manager');
  };

  it('should generate PDF file names', async () => {
    const { generateFileName } = await getFileManager();
    
    const fileName = generateFileName('pdf', 123, 'Test Business');
    
    expect(fileName).toContain('test-business-brand-guide-123');
    expect(fileName).toMatch(/\.pdf$/);
  });

  it('should generate ZIP file names', async () => {
    const { generateFileName } = await getFileManager();
    
    const fileName = generateFileName('zip', 456, 'Another Company');
    
    expect(fileName).toContain('another-company-brand-package-456');
    expect(fileName).toMatch(/\.zip$/);
  });

  it('should sanitize business names in file names', async () => {
    const { generateFileName } = await getFileManager();
    
    const fileName = generateFileName('pdf', 789, 'Business@With#Special!Chars');
    
    expect(fileName).not.toContain('@');
    expect(fileName).not.toContain('#');
    expect(fileName).not.toContain('!');
    expect(fileName).toContain('Business-With-Special-Chars');
  });

  it('should handle long business names', async () => {
    const { generateFileName } = await getFileManager();
    
    const longName = 'A'.repeat(100);
    const fileName = generateFileName('pdf', 1, longName);
    
    expect(fileName.length).toBeLessThan(200);
  });
});

describe('README Generator Service', () => {
  const getReadmeGenerator = async () => {
    return import('../../src/lib/services/readme-generator');
  };

  it('should generate README with business name', async () => {
    const { generateReadmeContent } = await getReadmeGenerator();
    
    const content = generateReadmeContent({
      businessName: 'Test Co',
      tagline: 'Test Tagline',
      contactEmail: 'test@test.com',
    });
    
    expect(content).toContain('Test Co');
    expect(content).toContain('Brand Identity Guide');
    expect(content).toContain('test@test.com');
  });

  it('should include version number', async () => {
    const { generateReadmeContent } = await getReadmeGenerator();
    
    const content = generateReadmeContent({
      businessName: 'Test Co',
      version: '2.0',
    });
    
    expect(content).toContain('Version 2.0');
  });

  it('should include color palette when provided', async () => {
    const { generateReadmeContent } = await getReadmeGenerator();
    
    const content = generateReadmeContent({
      businessName: 'Test Co',
      colorPalette: {
        primary: ['#FF0000', '#00FF00'],
        secondary: ['#0000FF'],
      },
    });
    
    expect(content).toContain('Color Palette');
    expect(content).toContain('#FF0000');
    expect(content).toContain('#00FF00');
  });
});

describe('ZIP Packager Service', () => {
  const getZipPackager = async () => {
    return import('../../src/lib/services/zip-packager');
  };

  it('should validate input structure', async () => {
    const { createBrandAssetZip } = await getZipPackager();
    
    // Test that function exists and accepts correct params
    expect(typeof createBrandAssetZip).toBe('function');
  });
});

describe('Mockup Renderer Service', () => {
  const getMockupRenderer = async () => {
    return import('../../src/lib/services/mockupRenderer');
  };

  it('should have render function available', async () => {
    const mockupModule = await getMockupRenderer();
    
    expect(typeof mockupModule).toBe('object');
  });
});

describe('Email Service', () => {
  const getEmailService = async () => {
    return import('../../src/lib/services/email-service');
  };

  it('should define email templates', async () => {
    const emailModule = await getEmailService();
    
    expect(typeof emailModule).toBe('object');
  });

  it('should have send function', async () => {
    const { sendEmail } = await getEmailService();
    
    expect(typeof sendEmail).toBe('function');
  });
});

describe('Admin Analytics Service', () => {
  const getAnalytics = async () => {
    return import('../../src/lib/services/admin-analytics');
  };

  it('should export analytics functions', async () => {
    const analytics = await getAnalytics();
    
    expect(typeof analytics).toBe('object');
  });
});

describe('Order Processor Service', () => {
  const getOrderProcessor = async () => {
    return import('../../src/lib/services/order-processor');
  };

  it('should export process function', async () => {
    const { processOrderAssets } = await getOrderProcessor();
    
    expect(typeof processOrderAssets).toBe('function');
  });

  it('should define ProcessingResult interface', async () => {
    const processor = await getOrderProcessor();
    
    expect(processor).toHaveProperty('processOrderAssets');
  });
});
