import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { theme } from "@/lib/theme";
import { Button } from "@/components/Button";
import { safeGoBack } from "@/lib/navigation";

const COMING_SOON_TOOLS = ["Crop", "Sticker", "Draw", "Trim"];

export default function EditScreen() {
  const params = useLocalSearchParams<{
    uri: string;
    type: "photo" | "video";
    lensId: string;
    durationMs: string;
  }>();
  const [caption, setCaption] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function goToShare() {
    router.push({
      pathname: "/share",
      params: {
        uri: params.uri,
        type: params.type,
        lensId: params.lensId ?? "",
        durationMs: params.durationMs ?? "",
        caption,
      },
    });
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
        {caption ? (
          <View style={styles.captionWrap}>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.toolbar} accessibilityRole="toolbar">
        <ToolButton label="Text" active onPress={() => {}} />
        {COMING_SOON_TOOLS.map((tool) => (
          <ToolButton key={tool} label={tool} onPress={() => setNotice(`${tool} is coming soon.`)} />
        ))}
      </View>

      <View style={styles.captionInputRow}>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Add a caption"
          placeholderTextColor={theme.color.textMuted}
          style={styles.input}
          accessibilityLabel="Caption text"
          maxLength={80}
        />
      </View>

      {notice ? (
        <View style={styles.noticeBar}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button label="Back" variant="secondary" onPress={safeGoBack} style={styles.action} />
        <Button label="Done" onPress={goToShare} style={styles.action} />
      </View>
    </View>
  );
}

function ToolButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={styles.toolButton}
    >
      <Text style={[styles.toolLabel, active && styles.toolLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  preview: { flex: 1 },
  videoPlaceholder: { backgroundColor: theme.color.surface, alignItems: "center", justifyContent: "center" },
  videoGlyph: { fontSize: 48, color: theme.color.text },
  captionWrap: { position: "absolute", left: 0, right: 0, bottom: theme.space[6], alignItems: "center" },
  captionText: {
    color: theme.color.text,
    fontSize: theme.type.lg.size,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.sm,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: theme.space[3],
    backgroundColor: theme.color.surface,
  },
  toolButton: { paddingHorizontal: theme.space[2] },
  toolLabel: { color: theme.color.textMuted, fontSize: theme.type.sm.size },
  toolLabelActive: { color: theme.color.accent, fontWeight: "700" },
  captionInputRow: { paddingHorizontal: theme.space[4], paddingTop: theme.space[3] },
  input: {
    backgroundColor: theme.color.surface,
    color: theme.color.text,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: theme.space[3],
  },
  noticeBar: { paddingHorizontal: theme.space[4], paddingTop: theme.space[2] },
  noticeText: { color: theme.color.warning, fontSize: theme.type.xs.size },
  actions: { flexDirection: "row", gap: theme.space[3], padding: theme.space[4] },
  action: { flex: 1 },
});
