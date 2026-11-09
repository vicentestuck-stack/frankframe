import type { Lens } from "./types";

// Seed catalog for the vertical slice. No network, no asset bundles yet —
// that pipeline (GET /api/lenses, signed asset downloads) is a must-have
// in architecture.md's build order, not this step. Own names, own tint
// values, nothing traced from any existing app.

export const SEED_LENSES: Lens[] = [
  {
    id: "lens-golden-hour",
    name: "Golden Hour",
    category: "filter",
    thumbnailEmoji: "🌅",
    tint: "#FFB347",
    requiresFace: false,
    isPremium: false,
  },
  {
    id: "lens-clean-blue",
    name: "Clean Blue",
    category: "filter",
    thumbnailEmoji: "🧊",
    tint: "#4C6FFF",
    requiresFace: false,
    isPremium: false,
  },
  {
    id: "lens-soft-glow",
    name: "Soft Glow",
    category: "beauty_preset",
    thumbnailEmoji: "✨",
    tint: "#FFE3C2",
    requiresFace: true,
    isPremium: false,
  },
  {
    id: "lens-star-crown",
    name: "Star Crown",
    category: "ar_sticker",
    thumbnailEmoji: "👑",
    tint: null,
    requiresFace: true,
    isPremium: true,
  },
];
