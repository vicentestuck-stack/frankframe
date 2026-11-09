import type { BeautyPreset, Lens } from "./data/types";

function hexToRgb01(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  return [r, g, b];
}

// Luminance-preserving saturation matrix (ITU-R BT.601 weights).
function saturationMatrix3x3(saturation: number): number[][] {
  const lr = 0.3086;
  const lg = 0.6094;
  const lb = 0.082;
  const sr = (1 - saturation) * lr;
  const sg = (1 - saturation) * lg;
  const sb = (1 - saturation) * lb;
  return [
    [sr + saturation, sg, sb],
    [sr, sg + saturation, sb],
    [sr, sg, sb + saturation],
  ];
}

/**
 * Builds a real 4x5 Skia ColorMatrix (RGBA, row-major, offsets in Skia's own
 * 0-1 colour range) from a beauty preset and an optional lens tint. This is
 * genuine per-pixel linear colour grading — skinSmooth lowers saturation and
 * lifts brightness slightly (the "soft/bright" beauty look), skinTone warms
 * the image by biasing red up and blue down, and a lens's tint colour is
 * blended in as a small additive offset per channel. It replaces the flat
 * alpha-overlay approximation this app used before (see
 * replica/build-log.md): used on captured photos (baked into the saved
 * file, src/lib/bakeGrading.ts) and the review screen
 * (src/components/GradedPhoto.tsx). The live camera viewfinder still uses
 * the old flat overlay (src/components/LensTintOverlay.tsx) — Skia can only
 * grade pixels it draws itself, not a sibling native CameraView, so a
 * genuinely real-time graded viewfinder needs a native frame-processor
 * (e.g. VisionCamera + a Skia frame-processor plugin), which needs a real
 * device/dev build this environment doesn't have.
 */
export function buildColorMatrix(beauty: BeautyPreset, lens: Lens | null): number[] {
  const smooth = Math.max(0, Math.min(100, beauty.skinSmooth)) / 100;
  const tone = Math.max(0, Math.min(100, beauty.skinTone)) / 100;

  const saturation = 1 - smooth * 0.35;
  const brightnessLift = smooth * 0.08;
  const warm = tone * 0.12;

  const sat = saturationMatrix3x3(saturation);

  let offR = brightnessLift + warm;
  let offG = brightnessLift;
  let offB = brightnessLift - warm * 0.6;

  if (lens?.tint) {
    const [lr, lg, lb] = hexToRgb01(lens.tint);
    const w = 0.12;
    offR += lr * w;
    offG += lg * w;
    offB += lb * w;
  }

  return [
    sat[0][0], sat[0][1], sat[0][2], 0, offR,
    sat[1][0], sat[1][1], sat[1][2], 0, offG,
    sat[2][0], sat[2][1], sat[2][2], 0, offB,
    0, 0, 0, 1, 0,
  ];
}

export function isIdentityGrade(beauty: BeautyPreset, lens: Lens | null): boolean {
  return beauty.skinSmooth === 0 && beauty.skinTone === 0 && !lens?.tint;
}
