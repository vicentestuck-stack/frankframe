import { useEffect } from "react";
import { AccessibilityInfo, StyleSheet, Text, View } from "react-native";
import { theme } from "@/lib/theme";

export type ToastKind = "success" | "error";

export function Toast({
  message,
  kind,
}: {
  message: string | null;
  kind: ToastKind;
}) {
  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  if (!message) return null;

  return (
    <View style={[styles.toast, kind === "error" ? styles.error : styles.success]}>
      <Text style={styles.icon}>{kind === "error" ? "⚠" : "✓"}</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: theme.space[4],
    right: theme.space[4],
    bottom: theme.space[8],
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    padding: theme.space[3],
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space[2],
    shadowColor: "#000",
    shadowOpacity: 0.32,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  success: { borderLeftWidth: 3, borderLeftColor: theme.color.success },
  error: { borderLeftWidth: 3, borderLeftColor: theme.color.danger },
  icon: { fontSize: 16, color: theme.color.text },
  text: { color: theme.color.text, fontSize: theme.type.sm.size, flexShrink: 1 },
});
