import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { theme } from "@/lib/theme";
import { Button } from "@/components/Button";
import { Toast, ToastKind } from "@/components/Toast";
import { saveCapture, markCaptureSaved } from "@/lib/data/store";

export default function ShareScreen() {
  const params = useLocalSearchParams<{
    uri: string;
    type: "photo" | "video";
    lensId: string;
    durationMs: string;
    caption: string;
  }>();
  const [permission, requestPermission] = MediaLibrary.usePermissions({ writeOnly: true });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    try {
      let perm = permission;
      if (!perm?.granted) {
        perm = await requestPermission();
      }
      if (!perm.granted) {
        setToast({ message: "Can't save without library access.", kind: "error" });
        return;
      }
      const capture = await saveCapture({
        type: params.type,
        uri: params.uri,
        lensId: params.lensId || null,
        beautyPreset: null,
        durationMs: params.durationMs ? Number(params.durationMs) : null,
      });
      await MediaLibrary.Asset.create(params.uri);
      await markCaptureSaved(capture.id);
      setSavedId(capture.id);
      setToast({ message: "Saved to gallery", kind: "success" });
    } catch (err) {
      setToast({ message: "Couldn't save — try again", kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      setToast({ message: "Sharing isn't available on this device.", kind: "error" });
      return;
    }
    await Sharing.shareAsync(params.uri);
  }

  return (
    <View style={styles.root} role="main">
      <View style={styles.preview}>
        {params.type === "photo" ? (
          <Image source={{ uri: params.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.videoPlaceholder]}>
            <Text style={styles.videoGlyph}>▶</Text>
          </View>
        )}
      </View>

      <View style={styles.sheet}>
        {params.caption ? <Text style={styles.captionNote}>Caption “{params.caption}” is shown in-app only — it isn't baked into the saved file yet (see build-log.md).</Text> : null}
        <Button label={savedId ? "Saved ✓" : "Save to device"} onPress={handleSave} loading={saving} disabled={!!savedId} />
        <Button label="Share…" variant="secondary" onPress={handleShare} />
        <Button label="Done" variant="ghost" onPress={() => router.replace("/")} />
      </View>

      <Toast message={toast?.message ?? null} kind={toast?.kind ?? "success"} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  preview: { flex: 0.6 },
  videoPlaceholder: { backgroundColor: theme.color.surface, alignItems: "center", justifyContent: "center" },
  videoGlyph: { fontSize: 48, color: theme.color.text },
  sheet: {
    backgroundColor: theme.color.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.space[4],
    gap: theme.space[3],
    flex: 0.4,
  },
  captionNote: { color: theme.color.textMuted, fontSize: theme.type.xs.size },
});
