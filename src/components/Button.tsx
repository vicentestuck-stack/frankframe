import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { theme } from "@/lib/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const HEIGHT: Record<Size, number> = { sm: 32, md: 40, lg: 48 };

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { height: HEIGHT[size] },
        variantStyle(variant),
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? theme.color.accent : theme.color.onAccent} />
      ) : (
        <Text style={[styles.label, labelStyle(variant)]}>{label}</Text>
      )}
    </Pressable>
  );
}

function variantStyle(variant: Variant): ViewStyle {
  switch (variant) {
    case "primary":
      return { backgroundColor: theme.color.accent };
    case "secondary":
      return { backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.border };
    case "ghost":
      return { backgroundColor: "transparent" };
    case "danger":
      return { backgroundColor: theme.color.danger };
  }
}

function labelStyle(variant: Variant) {
  if (variant === "ghost") return { color: theme.color.accent };
  if (variant === "secondary") return { color: theme.color.text };
  return { color: theme.color.onAccent };
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space[4],
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: {
    fontSize: theme.type.sm.size,
    fontWeight: "600",
  },
});
