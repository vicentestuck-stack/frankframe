import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { theme } from "@/lib/theme";
import { Button } from "@/components/Button";
import { LensTintOverlay } from "@/components/LensTintOverlay";
import { ArStickerOverlay } from "@/components/ArStickerOverlay";
import { getActiveBeautyPreset, getLensById } from "@/lib/data/store";
import type { BeautyPreset, Lens } from "@/lib/data/types";
import { DEFAULT_BEAUTY } from "@/lib/data/types";
import { safeGoBack } from "@/lib/navigation";

export default function ReviewScreen() {
  const params = useLocalSearchParams<{
    uri: string;
    type: "photo" | "video";
    lensId: string;
    durationMs: string;
  }>();
  const [lens, setLens] = useState<Lens | null>(null);
  const [beauty, setBeauty] = useState<BeautyPreset>({ id: "pending", ...DEFAULT_BEAUTY, updatedAt: "" });

  useEffect(() => {
    if (params.lensId) getLensById(params.lensId).then(setLens);
    getActiveBeautyPreset().then(setBeauty);
  }, [params.lensId]);

  const durationMs = params.durationMs ? Number(params.durationMs) : null;

  function goToEdit() {
    router.push({
      pathname: "/edit",
      params: { uri: params.uri, type: params.type, lensId: params.lensId, durationMs: params.durationMs ?? "" },
    });
  }

  return (
    <View style={styles.root} role="main">
      <View style={styles.preview}>
        {params.type === "photo" ? (
          // Already graded per-pixel at capture time (src/lib/bakeGrading.ts) —
          // shown as-is, not re-filtered, so the preview matches the saved file.
          <Image source={{ uri: params.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.videoPlaceholder]}>
            <Text style={styles.videoGlyph}>▶</Text>
            <Text style={styles.videoLabel}>
              Video captured{durationMs ? ` · ${(durationMs / 1000).toFixed(0)}s` : ""}
            </Text>
            <Text style={styles.videoNote}>
              Playback preview isn't wired up in this slice — see replica/build-log.md.
            </Text>
          </View>
        )}
        {params.type === "video" ? <LensTintOverlay lens={lens} beauty={beauty} /> : null}
        <ArStickerOverlay lens={lens} />
      </View>

      <View style={styles.actions}>
        <Button label="Retake" variant="secondary" onPress={safeGoBack} style={styles.action} />
        <Button label="Use this" onPress={goToEdit} style={styles.action} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  preview: { flex: 1 },
  videoPlaceholder: {
    backgroundColor: theme.color.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
    paddingHorizontal: theme.space[5],
  },
  videoGlyph: { fontSize: 48, color: theme.color.text },
  videoLabel: { color: theme.color.text, fontSize: theme.type.base.size },
  videoNote: { color: theme.color.textMuted, fontSize: theme.type.xs.size, textAlign: "center" },
  actions: {
    flexDirection: "row",
    gap: theme.space[3],
    padding: theme.space[4],
    backgroundColor: theme.color.bg,
  },
  action: { flex: 1 },
});
