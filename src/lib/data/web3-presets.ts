export interface Web3Preset {
  id: string;
  name: string;
  type: "defi" | "nft" | "dao" | "l2" | "wallet";
  description: string;
  voice: {
    characteristics: string[];
    tone: string;
    keyPhrases: string[];
  };
  visual: {
    style: string;
    keywordList: string[];
    colorTendency: string;
  };
  brandGuidanceAdditions: {
    missionTemplate: string;
    communityValues: string[];
    focusAreas: string[];
  };
}

export const WEB3_PRESETS: Web3Preset[] = [
  {
    id: "defi",
    name: "DeFi Protocol",
    type: "defi",
    description:
      "For decentralized finance platforms, lending protocols, exchanges, and liquidity providers.",
    voice: {
      characteristics: [
        "Technical yet accessible",
        "Trustworthy and transparent",
        "Innovative and forward-thinking",
        "Security-conscious",
      ],
      tone: "Professional with expertise, reassuring, direct",
      keyPhrases: [
        "Secure finance",
        "Decentralized trading",
        "Transparent protocols",
        "Financial sovereignty",
        "Smart contracts",
      ],
    },
    visual: {
      style: "Modern, clean, minimalist with technical elements",
      keywordList: [
        "geometric",
        "modern",
        "clean",
        "trustworthy",
        "technical",
        "futuristic",
      ],
      colorTendency: "Blues, greens, silvers (trust and technology)",
    },
    brandGuidanceAdditions: {
      missionTemplate:
        "{{businessName}} provides secure, transparent, and decentralized financial services. We believe in empowering individuals with financial sovereignty and democratizing access to financial markets.",
      communityValues: [
        "Decentralization",
        "Transparency",
        "Security",
        "Financial Inclusion",
        "Innovation",
      ],
      focusAreas: [
        "Smart contract security",
        "Protocol transparency",
        "User education on DeFi risks",
        "Integration with ecosystem",
      ],
    },
  },
  {
    id: "nft",
    name: "NFT Project",
    type: "nft",
    description:
      "For NFT collections, digital art platforms, gaming NFTs, and blockchain-based digital ownership projects.",
    voice: {
      characteristics: [
        "Creative and artistic",
        "Community-focused and engaging",
        "Playful yet authentic",
        "Culturally aware",
      ],
      tone: "Conversational, inspiring, community-oriented",
      keyPhrases: [
        "Digital ownership",
        "Authentic creativity",
        "Community-driven",
        "Unique expression",
        "Digital heritage",
      ],
    },
    visual: {
      style: "Artistic, vibrant, dynamic with unique visual expression",
      keywordList: [
        "artistic",
        "vibrant",
        "creative",
        "dynamic",
        "unique",
        "expressive",
        "bold",
      ],
      colorTendency: "Vibrant colors, gradients, dynamic compositions",
    },
    brandGuidanceAdditions: {
      missionTemplate:
        "{{businessName}} creates a space where digital artists and collectors unite. We believe in the power of NFTs to revolutionize digital ownership and creative expression.",
      communityValues: [
        "Creative Freedom",
        "Community Ownership",
        "Authenticity",
        "Digital Innovation",
        "Inclusivity",
      ],
      focusAreas: [
        "Artist visibility and support",
        "Community engagement",
        "Royalty and creator rights",
        "Collection uniqueness",
        "Secondary market fairness",
      ],
    },
  },
  {
    id: "dao",
    name: "DAO (Decentralized Autonomous Organization)",
    type: "dao",
    description:
      "For DAOs, governance-focused projects, and community-governed protocols.",
    voice: {
      characteristics: [
        "Inclusive and democratic",
        "Transparent and open",
        "Community-driven",
        "Collaborative",
      ],
      tone: "Inclusive, transparent, empowering",
      keyPhrases: [
        "Community governance",
        "Transparent decisions",
        "Collective ownership",
        "Democratic participation",
        "Aligned incentives",
      ],
    },
    visual: {
      style: "Balanced, symmetrical, accessible, representing unity and participation",
      keywordList: [
        "balanced",
        "symmetrical",
        "accessible",
        "democratic",
        "unified",
        "inclusive",
        "interconnected",
      ],
      colorTendency:
        "Balanced color palettes, earth tones with accent colors representing diversity",
    },
    brandGuidanceAdditions: {
      missionTemplate:
        "{{businessName}} is governed by its community. We believe in the power of collective decision-making and shared ownership to create sustainable, aligned organizations.",
      communityValues: [
        "Democratic Governance",
        "Transparency",
        "Community Ownership",
        "Aligned Incentives",
        "Shared Vision",
      ],
      focusAreas: [
        "Voting mechanisms and clarity",
        "Proposal processes",
        "Treasury management transparency",
        "Member participation",
        "Governance evolution",
      ],
    },
  },
  {
    id: "l2",
    name: "Layer 2 Solution",
    type: "l2",
    description:
      "For scaling solutions, sidechains, zk-rollups, and infrastructure projects focused on performance.",
    voice: {
      characteristics: [
        "Technical and sophisticated",
        "Performance-focused",
        "Solution-oriented",
        "Future-focused",
      ],
      tone: "Expert, confident, forward-thinking",
      keyPhrases: [
        "Fast transactions",
        "Scalable solutions",
        "Ethereum compatibility",
        "Low fees",
        "High throughput",
      ],
    },
    visual: {
      style: "Modern, efficient, technical, representing speed and scalability",
      keywordList: [
        "modern",
        "efficient",
        "technical",
        "fast",
        "scalable",
        "sleek",
        "innovative",
      ],
      colorTendency: "Cool tones, technical blues and silvers, representing technology",
    },
    brandGuidanceAdditions: {
      missionTemplate:
        "{{businessName}} enables fast, scalable, and affordable blockchain transactions. We remove friction from decentralized applications while maintaining security and decentralization.",
      communityValues: [
        "Performance",
        "Scalability",
        "User Experience",
        "Technical Excellence",
        "Ecosystem Growth",
      ],
      focusAreas: [
        "Transaction speed benchmarks",
        "Security proofs",
        "Developer documentation",
        "Network growth",
        "Ecosystem partnerships",
      ],
    },
  },
  {
    id: "wallet",
    name: "Wallet / Self-Custody Solution",
    type: "wallet",
    description:
      "For crypto wallets, self-custody solutions, and custody and security-focused products.",
    voice: {
      characteristics: [
        "Secure and reassuring",
        "User-friendly and clear",
        "Trustworthy and reliable",
        "Protective",
      ],
      tone: "Calm, reassuring, clear, protective",
      keyPhrases: [
        "Secure storage",
        "Your keys, your crypto",
        "Financial control",
        "User privacy",
        "Asset protection",
      ],
    },
    visual: {
      style: "Clean, trustworthy, protective, representing security and simplicity",
      keywordList: [
        "clean",
        "trustworthy",
        "secure",
        "simple",
        "protective",
        "reliable",
        "minimalist",
      ],
      colorTendency: "Calming colors, greens, teals (security and trust)",
    },
    brandGuidanceAdditions: {
      missionTemplate:
        "{{businessName}} puts you in control of your crypto. We provide secure, simple, and reliable tools for managing your digital assets with confidence.",
      communityValues: [
        "Security",
        "Privacy",
        "User Control",
        "Simplicity",
        "Reliability",
      ],
      focusAreas: [
        "Security audits and certifications",
        "User education on security",
        "Recovery and backup processes",
        "Multi-platform support",
        "Customer support responsiveness",
      ],
    },
  },
];

export function getWeb3PresetById(id: string): Web3Preset | undefined {
  return WEB3_PRESETS.find((p) => p.id === id);
}

export function getWeb3PresetByType(
  type: "defi" | "nft" | "dao" | "l2" | "wallet"
): Web3Preset | undefined {
  return WEB3_PRESETS.find((p) => p.type === type);
}

/**
 * Get enhanced system prompt for brand guide generation when Web3 is involved
 */
export function getWeb3EnhancedSystemPrompt(preset: Web3Preset): string {
  return `
You are a brand strategist specializing in Web3 and blockchain projects.
For this ${preset.name} project, embody these key characteristics:

VOICE & TONE:
${preset.voice.characteristics.map((c) => `- ${c}`).join("\n")}
Tone: ${preset.voice.tone}

KEY PHRASES TO INCORPORATE:
${preset.voice.keyPhrases.map((p) => `- "${p}"`).join("\n")}

VISUAL STYLE:
${preset.visual.style}
Key visuals: ${preset.visual.keywordList.join(", ")}
Color tendency: ${preset.visual.colorTendency}

BRAND GUIDANCE FOCUS:
${preset.brandGuidanceAdditions.focusAreas.map((a) => `- ${a}`).join("\n")}

Community values to emphasize:
${preset.brandGuidanceAdditions.communityValues.join(", ")}

Ensure the brand guide reflects Web3 context and industry best practices.
`;
}
