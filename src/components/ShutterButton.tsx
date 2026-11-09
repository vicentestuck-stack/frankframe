import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "@/lib/theme";

export function ShutterButton({
  mode,
  recording,
  disabled,
  onPress,
  onLongPress,
}: {
  mode: "photo" | "video";
  recording: boolean;
  disabled?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const label =
    mode === "photo" ? "Take photo" : recording ? "Stop recording" : "Hold to record video";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy: recording }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.ring, disabled && styles.disabled]}
    >
      <View style={[styles.inner, recording && styles.recording]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.pill,
    borderWidth: 4,
    borderColor: theme.color.borderInput,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.color.onAccent,
  },
  recording: {
    backgroundColor: theme.color.danger,
    borderRadius: theme.radius.sm,
    width: 28,
    height: 28,
  },
  disabled: { opacity: 0.4 },
});
