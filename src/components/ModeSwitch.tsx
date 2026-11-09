import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/lib/theme";

const MODES: Array<{ key: "photo" | "video"; label: string }> = [
  { key: "photo", label: "Photo" },
  { key: "video", label: "Video" },
];

export function ModeSwitch({
  value,
  onChange,
  disabled,
}: {
  value: "photo" | "video";
  onChange: (mode: "photo" | "video") => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {MODES.map((m) => {
        const selected = value === m.key;
        return (
          <Pressable
            key={m.key}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled: !!disabled }}
            accessibilityLabel={m.label}
            disabled={disabled}
            onPress={() => onChange(m.key)}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{m.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.pill,
    padding: 4,
  },
  tab: {
    height: 32,
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  tabSelected: { backgroundColor: theme.color.accent },
  label: { color: theme.color.textMuted, fontSize: theme.type.sm.size, fontWeight: "600" },
  labelSelected: { color: theme.color.onAccent },
});
