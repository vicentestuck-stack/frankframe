import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/lib/theme";
import type { BeautyPreset } from "@/lib/data/types";

const STEP = 10;

const ROWS: Array<{ key: keyof Omit<BeautyPreset, "id" | "updatedAt">; label: string }> = [
  { key: "faceSlim", label: "Face slim" },
  { key: "skinSmooth", label: "Skin smoothing" },
  { key: "eyeSize", label: "Eye size" },
  { key: "skinTone", label: "Warm tone" },
  { key: "blemishRemoval", label: "Blemish removal" },
];

export function BeautySliders({
  value,
  onChange,
}: {
  value: BeautyPreset;
  onChange: (next: Partial<Omit<BeautyPreset, "id" | "updatedAt">>) => void;
}) {
  return (
    <View style={styles.container}>
      {ROWS.map((row) => (
        <SliderRow
          key={row.key}
          label={row.label}
          value={value[row.key]}
          onChange={(v) => onChange({ [row.key]: v })}
        />
      ))}
    </View>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const dec = () => onChange(Math.max(0, value - STEP));
  const inc = () => onChange(Math.min(100, value + STEP));
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={styles.control}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: value }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          onPress={dec}
          style={styles.stepButton}
        >
          <Text style={styles.stepText}>–</Text>
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${value}%` }]} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          onPress={inc}
          style={styles.stepButton}
        >
          <Text style={styles.stepText}>+</Text>
        </Pressable>
        <Text style={styles.value}>{value}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.space[4] },
  row: { gap: theme.space[1] },
  label: { color: theme.color.text, fontSize: theme.type.sm.size },
  control: { flexDirection: "row", alignItems: "center", gap: theme.space[2] },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.borderInput,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { color: theme.color.text, fontSize: 18, lineHeight: 18 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.border,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: theme.color.accent },
  value: { width: 40, textAlign: "right", color: theme.color.textMuted, fontSize: theme.type.xs.size },
});
