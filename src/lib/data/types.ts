// Mirrors replica/schema.sql — keep field names in step with that file.
// This is the fake/local data layer's contract. When /replica-backend wires
// up the real API, these types (and the function signatures in store.ts)
// should not need to change, only their implementation.

export type LensCategory = "filter" | "beauty_preset" | "ar_sticker";

export interface Lens {
  id: string;
  name: string;
  category: LensCategory;
  /** Emoji placeholder for a thumbnail — own asset, not traced from any app. */
  thumbnailEmoji: string;
  /**
   * Visual approximation only (see build-log.md): a flat colour tint drawn
   * over the preview and over the review photo as an on-screen overlay. This
   * does NOT modify the saved image's pixels — real per-pixel colour
   * grading needs a native/Skia pipeline, out of scope for this slice.
   */
  tint: string | null;
  requiresFace: boolean;
  isPremium: boolean;
}

export interface BeautyPreset {
  id: string;
  faceSlim: number; // 0-100 — UI only in this slice, no geometry warp yet
  skinSmooth: number; // 0-100 — drives the smooth-overlay opacity
  eyeSize: number; // 0-100 — UI only in this slice
  skinTone: number; // 0-100 — drives the warm-overlay opacity
  blemishRemoval: number; // 0-100 — UI only in this slice
  updatedAt: string;
}

export type CaptureType = "photo" | "video" | "gif";

export interface Capture {
  id: string;
  type: CaptureType;
  uri: string;
  lensId: string | null;
  beautyPreset: BeautyPreset | null;
  durationMs: number | null;
  savedToDevice: boolean;
  createdAt: string;
}

export const DEFAULT_BEAUTY: Omit<BeautyPreset, "id" | "updatedAt"> = {
  faceSlim: 0,
  skinSmooth: 0,
  eyeSize: 0,
  skinTone: 0,
  blemishRemoval: 0,
};
