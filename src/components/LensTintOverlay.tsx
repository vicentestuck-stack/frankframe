import { StyleSheet, View } from "react-native";
import type { BeautyPreset, Lens } from "@/lib/data/types";

/**
 * Flat-colour approximation of a filter/beauty preset, used ONLY for the
 * live camera viewfinder (src/app/index.tsx). Skia can grade pixels it
 * draws itself but not a sibling native CameraView, so a genuinely
 * real-time per-pixel graded viewfinder needs a native frame-processor
 * module (see src/lib/colorGrading.ts's header) — out of reach without a
 * real device/dev build. Captured photos and the review screen no longer
 * use this: they get real per-pixel Skia grading, see
 * src/components/GradedPhoto.tsx and src/lib/bakeGrading.ts. The AR sticker
 * itself lives in src/components/ArStickerOverlay.tsx.
 */
export function LensTintOverlay({
  lens,
  beauty,
}: {
  lens: Lens | null;
  beauty: BeautyPreset;
}) {
  const warmOpacity = (beauty.skinTone / 100) * 0.22;
  const smoothOpacity = (beauty.skinSmooth / 100) * 0.16;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {smoothOpacity > 0 ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#FFFFFF", opacity: smoothOpacity }]} />
      ) : null}
      {warmOpacity > 0 ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#FFB347", opacity: warmOpacity }]} />
      ) : null}
      {lens?.tint ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: lens.tint, opacity: 0.16 }]} />
      ) : null}
    </View>
  );
}
