import { StyleSheet, Text, View } from "react-native";
import type { Lens } from "@/lib/data/types";
import { useFaceTracking } from "@/lib/face-tracking";

/**
 * Positions an AR sticker lens's emoji. Reads useFaceTracking() for where to
 * anchor it; in this environment that hook always returns a face: null (no
 * native face-detector module built — see src/lib/face-tracking.ts), so the
 * sticker falls back to a fixed top-of-frame position instead of tracking a
 * face in real time.
 */
export function ArStickerOverlay({ lens }: { lens: Lens | null }) {
  const { face } = useFaceTracking();

  if (lens?.category !== "ar_sticker") return null;

  const anchorStyle = face
    ? {
        position: "absolute" as const,
        left: face.x - 36,
        top: face.y - 36,
      }
    : styles.fallbackWrap;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={anchorStyle}>
        <Text style={styles.sticker}>{lens.thumbnailEmoji}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackWrap: { flex: 1, alignItems: "center", paddingTop: 48 },
  sticker: { fontSize: 72 },
});
