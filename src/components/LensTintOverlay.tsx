import { StyleSheet, Text, View } from "react-native";
import type { BeautyPreset, Lens } from "@/lib/data/types";

/**
 * Visual approximation of a filter/lens/beauty preset, drawn as flat colour
 * overlays on top of the live preview or the review photo. This is NOT the
 * real pipeline: no face tracking, no per-pixel colour grading, the AR
 * sticker is not anchored to a face. See replica/build-log.md and
 * replica/architecture.md's "parts that bite" — that work needs a native
 * frame-processor module. This overlay exists so the lens picker and beauty
 * sliders have something visible to react to in this slice.
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
      {lens?.category === "ar_sticker" ? (
        <View style={styles.stickerWrap}>
          <Text style={styles.sticker}>{lens.thumbnailEmoji}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stickerWrap: { flex: 1, alignItems: "center", paddingTop: 48 },
  sticker: { fontSize: 72 },
});
