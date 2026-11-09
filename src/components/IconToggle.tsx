import { Pressable, StyleSheet, Text } from "react-native";
import { theme } from "@/lib/theme";

export function IconToggle({
  glyph,
  label,
  active,
  disabled,
  onPress,
}: {
  glyph: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.disabled]}
    >
      <Text style={[styles.glyph, active && styles.active]}>{glyph}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: { fontSize: 20, color: theme.color.text },
  active: { color: theme.color.accent },
  disabled: { opacity: 0.4 },
});
