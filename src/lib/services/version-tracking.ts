/**
 * Brand Guide Version Tracking Service
 * Tracks versions of brand guides as customers request revisions
 */

export interface BrandGuideVersion {
  version: string;
  versionNumber: number;
  orderId: number;
  createdAt: Date;
  revisionReason?: string;
  sections: {
    projectOverview?: string;
    brandIdentity?: string;
    logoPhilosophy?: string;
    colorPalette?: string;
    colorAccessibility?: string;
    typography?: string;
    imageryStyle?: string;
    graphicElements?: string;
    brandVoice?: string;
    visualStyleGuide?: string;
    usageRulesAndDonts?: string;
    web3Section?: string;
    appendix?: string;
  };
}

/**
 * Generate version string (e.g., "1.0", "1.1", "2.0")
 * @param majorVersion - Major version number
 * @param minorVersion - Minor version number
 * @returns Version string
 */
export function generateVersionString(majorVersion: number, minorVersion: number = 0): string {
  return `${majorVersion}.${minorVersion}`;
}

/**
 * Increment version after revision
 * Minor version: 1.0 -> 1.1 -> 1.2
 * Major version: 2.0 when significant changes made
 * @param currentVersion - Current version string
 * @param isMajorRevision - Whether this is a major revision
 * @returns Next version string
 */
export function incrementVersion(currentVersion: string, isMajorRevision: boolean = false): string {
  const [major, minor] = currentVersion.split('.').map(Number);

  if (isMajorRevision) {
    return `${major + 1}.0`;
  }

  return `${major}.${minor + 1}`;
}

/**
 * Parse version string
 * @param versionString - Version string (e.g., "1.2")
 * @returns Object with major and minor version numbers
 */
export function parseVersion(versionString: string): { major: number; minor: number } {
  const [major, minor] = versionString.split('.').map((v) => parseInt(v, 10));
  return { major, minor: minor || 0 };
}

/**
 * Check if version is greater than another version
 * @param version1 - First version (e.g., "1.2")
 * @param version2 - Second version (e.g., "1.0")
 * @returns true if version1 > version2
 */
export function isVersionGreater(version1: string, version2: string): boolean {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);

  if (v1.major !== v2.major) {
    return v1.major > v2.major;
  }

  return v1.minor > v2.minor;
}

/**
 * Create initial version 1.0 of a brand guide
 * @param orderId - Order ID
 * @param guideSections - Brand guide sections
 * @returns Version object
 */
export function createInitialVersion(orderId: number, guideSections: any): BrandGuideVersion {
  return {
    version: '1.0',
    versionNumber: 1,
    orderId,
    createdAt: new Date(),
    sections: guideSections,
  };
}

/**
 * Create a new version after revision
 * @param orderId - Order ID
 * @param previousVersion - Previous version string
 * @param revisedSections - Updated sections
 * @param revisionReason - Why this revision was made
 * @returns New version object
 */
export function createRevision(
  orderId: number,
  previousVersion: string,
  revisedSections: any,
  revisionReason: string
): BrandGuideVersion {
  const nextVersion = incrementVersion(previousVersion);
  const { major } = parseVersion(nextVersion);

  return {
    version: nextVersion,
    versionNumber: major,
    orderId,
    createdAt: new Date(),
    revisionReason,
    sections: revisedSections,
  };
}

/**
 * Generate changelog entry for new version
 * @param previousVersion - Previous version
 * @param newVersion - New version
 * @param changedSections - List of sections that changed
 * @returns Formatted changelog entry
 */
export function generateChangelogEntry(
  previousVersion: string,
  newVersion: string,
  changedSections: string[]
): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
## Version ${newVersion} (${date})
- Updated from version ${previousVersion}
- Revised sections: ${changedSections.join(', ')}
  `.trim();
}
