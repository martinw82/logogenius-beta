export interface ReadmeData {
  businessName: string;
  tagline?: string;
  missionStatement?: string;
  brandStory?: string;
  colorPalette?: {
    primary: string[];
    secondary: string[];
    accent: string[];
  };
  typography?: {
    headings: string;
    body: string;
    usage: string;
  };
  logoUsageRules?: string;
  usageRulesAndDonts?: string;
  brandVoice?: string;
  imageryStyle?: string;
  web3Section?: string;
  contactEmail?: string;
  generatedDate?: Date;
  version?: string;
}

export function generateReadmeContent(data: ReadmeData): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${data.businessName} - Brand Guidelines`);
  lines.push('');

  if (data.tagline) {
    lines.push(`_${data.tagline}_`);
    lines.push('');
  }

  // Document Info
  lines.push(`Generated: ${data.generatedDate ? data.generatedDate.toLocaleDateString() : new Date().toLocaleDateString()}`);
  if (data.version) {
    lines.push(`Version: ${data.version}`);
  }
  lines.push('');

  // Table of Contents
  lines.push('## Table of Contents');
  lines.push('');
  lines.push('1. [Brand Story](#brand-story)');
  lines.push('2. [Mission & Values](#mission--values)');
  lines.push('3. [Logo Usage Guidelines](#logo-usage-guidelines)');
  lines.push('4. [Color Palette](#color-palette)');
  lines.push('5. [Typography](#typography)');
  lines.push('6. [Voice & Tone](#voice--tone)');
  lines.push('7. [Photography & Imagery](#photography--imagery)');
  lines.push('8. [Usage Rules](#usage-rules)');
  if (data.web3Section) {
    lines.push('9. [Web3 Specifications](#web3-specifications)');
  }
  lines.push('[Contact & Support](#contact--support)');
  lines.push('');

  // Brand Story
  lines.push('## Brand Story');
  lines.push('');
  if (data.brandStory) {
    lines.push(data.brandStory);
  } else {
    lines.push(`${data.businessName} is a forward-thinking brand dedicated to innovation and excellence.`);
  }
  lines.push('');

  // Mission & Values
  lines.push('## Mission & Values');
  lines.push('');
  if (data.missionStatement) {
    lines.push(`**Mission:** ${data.missionStatement}`);
  } else {
    lines.push(`**Mission:** To deliver exceptional value and innovation.`);
  }
  lines.push('');

  // Logo Usage Guidelines
  lines.push('## Logo Usage Guidelines');
  lines.push('');
  if (data.logoUsageRules) {
    lines.push(data.logoUsageRules);
  } else {
    lines.push('- Always maintain proper spacing around the logo');
    lines.push('- Do not distort or modify the logo');
    lines.push('- Use logo on clear backgrounds for best visibility');
    lines.push('- Minimum size: 100px for web, 1cm for print');
  }
  lines.push('');

  // Color Palette
  lines.push('## Color Palette');
  lines.push('');
  if (data.colorPalette) {
    if (data.colorPalette.primary && data.colorPalette.primary.length > 0) {
      lines.push('### Primary Colors');
      data.colorPalette.primary.forEach((color) => {
        lines.push(`- ${color}`);
      });
      lines.push('');
    }

    if (data.colorPalette.secondary && data.colorPalette.secondary.length > 0) {
      lines.push('### Secondary Colors');
      data.colorPalette.secondary.forEach((color) => {
        lines.push(`- ${color}`);
      });
      lines.push('');
    }

    if (data.colorPalette.accent && data.colorPalette.accent.length > 0) {
      lines.push('### Accent Colors');
      data.colorPalette.accent.forEach((color) => {
        lines.push(`- ${color}`);
      });
      lines.push('');
    }
  }

  // Typography
  lines.push('## Typography');
  lines.push('');
  if (data.typography) {
    if (data.typography.headings) {
      lines.push(`**Headings:** ${data.typography.headings}`);
    }
    if (data.typography.body) {
      lines.push(`**Body Text:** ${data.typography.body}`);
    }
    if (data.typography.usage) {
      lines.push(`**Usage Guidelines:** ${data.typography.usage}`);
    }
  } else {
    lines.push('- Headings: Modern, clean sans-serif');
    lines.push('- Body: Readable, accessible sans-serif');
    lines.push('- Use consistent sizing and weight throughout');
  }
  lines.push('');

  // Voice & Tone
  lines.push('## Voice & Tone');
  lines.push('');
  if (data.brandVoice) {
    lines.push(data.brandVoice);
  } else {
    lines.push('- Professional yet approachable');
    lines.push('- Clear and direct communication');
    lines.push('- Inspiring and forward-thinking');
  }
  lines.push('');

  // Photography & Imagery
  lines.push('## Photography & Imagery');
  lines.push('');
  if (data.imageryStyle) {
    lines.push(data.imageryStyle);
  } else {
    lines.push('- Use high-quality, professional photography');
    lines.push('- Maintain consistent color grading');
    lines.push('- Authentic and relatable imagery');
  }
  lines.push('');

  // Usage Rules
  lines.push('## Usage Rules');
  lines.push('');
  lines.push('### Do\'s');
  lines.push('- ✓ Use logos with proper spacing');
  lines.push('- ✓ Maintain brand colors consistently');
  lines.push('- ✓ Use professional typography');
  lines.push('- ✓ Ensure good contrast for readability');
  lines.push('');
  lines.push('### Don\'ts');
  lines.push('- ✗ Do not distort or skew logos');
  lines.push('- ✗ Do not use incorrect color variations');
  lines.push('- ✗ Do not overcomplicate designs');
  lines.push('- ✗ Do not remove important brand elements');
  if (data.usageRulesAndDonts) {
    lines.push('');
    lines.push(data.usageRulesAndDonts);
  }
  lines.push('');

  // Web3 Section
  if (data.web3Section) {
    lines.push('## Web3 Specifications');
    lines.push('');
    lines.push(data.web3Section);
    lines.push('');
  }

  // Contact & Support
  lines.push('## Contact & Support');
  lines.push('');
  if (data.contactEmail) {
    lines.push(`For questions about brand usage, please contact: ${data.contactEmail}`);
  } else {
    lines.push('For questions about brand usage, please contact the brand team.');
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`Last Updated: ${new Date().toLocaleDateString()}`);

  return lines.join('\n');
}
