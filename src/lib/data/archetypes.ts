export interface BrandArchetype {
  id: string;
  name: string;
  description: string;
  traits: string[];
  color: string;
}

export const BRAND_ARCHETYPES: BrandArchetype[] = [
  {
    id: "innocent",
    name: "The Innocent",
    description: "Optimistic, happy, and safe. Seeks happiness and simplicity.",
    traits: [
      "Optimistic",
      "Happy",
      "Safe",
      "Simple",
      "Wholesome",
      "Cheerful",
    ],
    color: "#FFE5B4",
  },
  {
    id: "everyman",
    name: "The Everyman",
    description:
      "Down-to-earth and approachable. Wants to belong and connect with others.",
    traits: ["Down-to-earth", "Approachable", "Friendly", "Relatable", "Honest"],
    color: "#D2B48C",
  },
  {
    id: "hero",
    name: "The Hero",
    description:
      "Courageous and bold. Motivated by challenges and the desire to make a difference.",
    traits: [
      "Courageous",
      "Bold",
      "Determined",
      "Strong",
      "Heroic",
      "Inspiring",
    ],
    color: "#DC143C",
  },
  {
    id: "rebel",
    name: "The Rebel",
    description:
      "Disruptive and revolutionary. Questions the status quo and challenges conventions.",
    traits: ["Disruptive", "Revolutionary", "Bold", "Unconventional", "Edgy"],
    color: "#000000",
  },
  {
    id: "explorer",
    name: "The Explorer",
    description:
      "Risk-taker and adventure-seeker. Driven by curiosity and the desire to discover.",
    traits: [
      "Adventurous",
      "Curious",
      "Risk-taker",
      "Wandering",
      "Independent",
      "Bold",
    ],
    color: "#228B22",
  },
  {
    id: "creator",
    name: "The Creator",
    description:
      "Imaginative and expressive. Driven by the need for self-expression and innovation.",
    traits: [
      "Creative",
      "Imaginative",
      "Innovative",
      "Expressive",
      "Artistic",
      "Visionary",
    ],
    color: "#9370DB",
  },
  {
    id: "ruler",
    name: "The Ruler",
    description:
      "Leader and authority figure. Seeks control, order, and leadership.",
    traits: [
      "Authoritative",
      "Organized",
      "Commanding",
      "Responsible",
      "Strategic",
      "Dominant",
    ],
    color: "#FFD700",
  },
  {
    id: "magician",
    name: "The Magician",
    description:
      "Charismatic and transformative. Believes in the power of knowledge and transformation.",
    traits: [
      "Charismatic",
      "Transformative",
      "Knowledgeable",
      "Mystical",
      "Powerful",
    ],
    color: "#4B0082",
  },
  {
    id: "lover",
    name: "The Lover",
    description:
      "Passionate and emotional. Driven by intimacy, sensuality, and emotional connection.",
    traits: [
      "Passionate",
      "Emotional",
      "Intimate",
      "Sensual",
      "Tender",
      "Devoted",
    ],
    color: "#FF69B4",
  },
  {
    id: "caregiver",
    name: "The Caregiver",
    description:
      "Supportive and nurturing. Motivated by compassion and the desire to help others.",
    traits: ["Supportive", "Nurturing", "Compassionate", "Helpful", "Generous"],
    color: "#87CEEB",
  },
  {
    id: "jester",
    name: "The Jester",
    description:
      "Playful and entertaining. Uses humor and wit to bring joy and lighten the mood.",
    traits: ["Playful", "Humorous", "Entertaining", "Witty", "Fun", "Irreverent"],
    color: "#FF8C00",
  },
  {
    id: "sage",
    name: "The Sage",
    description:
      "Knowledgeable and analytical. Driven by the desire for truth and understanding.",
    traits: [
      "Analytical",
      "Knowledgeable",
      "Thoughtful",
      "Reflective",
      "Wise",
      "Logical",
    ],
    color: "#4A4A4A",
  },
];

export function getArchetypeById(id: string): BrandArchetype | undefined {
  return BRAND_ARCHETYPES.find((a) => a.id === id);
}
