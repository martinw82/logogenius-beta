import { z } from "zod";

// Base schema for Tier 1 (Basic)
export const tier1FormSchema = z.object({
  businessName: z
    .string()
    .min(1, "Business name is required")
    .max(255, "Business name is too long"),
  industry: z
    .string()
    .min(1, "Industry is required")
    .max(255, "Industry is too long"),
  brandArchetype: z
    .string()
    .min(1, "Brand archetype is required")
    .max(50, "Invalid archetype"),
  aestheticKeywords: z.string().optional().default(""),
  emotionalKeywords: z.string().optional().default(""),
  functionalKeywords: z.string().optional().default(""),
});

export type Tier1FormData = z.infer<typeof tier1FormSchema>;

// Extended schema for Tier 2 (Pro)
export const tier2FormSchema = tier1FormSchema.extend({
  missionStatement: z
    .string()
    .min(10, "Mission statement should be at least 10 characters")
    .max(1000, "Mission statement is too long"),
  brandPillars: z
    .array(z.string().min(1, "Pillar cannot be empty"))
    .min(1, "Add at least one brand pillar")
    .max(5, "Maximum 5 pillars allowed"),
  targetAudience: z
    .string()
    .min(1, "Target audience is required")
    .max(500, "Target audience description is too long"),
  companyValues: z.string().optional().default(""),
  keyTagline: z.string().optional().default(""),
});

export type Tier2FormData = z.infer<typeof tier2FormSchema>;

// Extended schema for Tier 3 (Premium)
export const tier3FormSchema = tier2FormSchema.extend({
  preferredLogoStyle: z
    .string()
    .min(1, "Preferred logo style is required")
    .max(100, "Style description is too long"),
  composition: z
    .string()
    .min(1, "Composition is required")
    .max(100, "Composition description is too long"),
  iconPlacement: z
    .string()
    .min(1, "Icon placement is required")
    .max(100, "Icon placement description is too long"),

  // Web3 fields (all optional)
  web3BlockchainFocus: z.boolean().optional().default(false),
  web3ProjectType: z.string().optional().default(""),
  web3EnsDomainIdeas: z.string().optional().default(""),
  web3TokenSymbolIdea: z.string().optional().default(""),
  web3CommunityValues: z.string().optional().default(""),
  web3NftAesthetic: z.string().optional().default(""),

  // File upload (optional)
  brandAssetsFile: z.instanceof(File).optional(),
});

export type Tier3FormData = z.infer<typeof tier3FormSchema>;

// Industry options for select dropdown
export const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance",
  "E-commerce",
  "Education",
  "Entertainment",
  "Food & Beverage",
  "Fashion",
  "Real Estate",
  "Travel & Hospitality",
  "Manufacturing",
  "Consulting",
  "Non-profit",
  "Media & Publishing",
  "Automotive",
  "Construction",
  "Legal Services",
  "Art & Design",
  "Sports & Recreation",
  "Other",
];

// Logo style options
export const LOGO_STYLE_OPTIONS = [
  "Minimalist",
  "Abstract",
  "Geometric",
  "Illustrative",
  "Typographic",
  "Wordmark",
  "Mascot",
  "Emblem",
  "Combination Mark",
  "Modern",
  "Vintage",
  "Hand-drawn",
];

// Composition options
export const COMPOSITION_OPTIONS = [
  "Horizontal",
  "Vertical",
  "Square",
  "Circular",
  "Symmetrical",
  "Asymmetrical",
  "Balanced",
  "Dynamic",
];

// Icon placement options
export const ICON_PLACEMENT_OPTIONS = [
  "Left of text",
  "Right of text",
  "Above text",
  "Below text",
  "Centered",
  "No text",
  "Integrated with text",
];

// Web3 project types
export const WEB3_PROJECT_TYPES = [
  "DeFi Protocol",
  "NFT Project",
  "DAO",
  "Layer 2 Solution",
  "Wallet",
  "Exchange",
  "Gaming",
  "Metaverse",
  "Social Network",
  "Payment Solution",
  "Storage",
  "Analytics",
  "Other",
];
