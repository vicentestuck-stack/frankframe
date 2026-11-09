import { Linking, StyleSheet, Text, View } from "react-native";
import { theme } from "@/lib/theme";
import { Button } from "./Button";

export function PermissionPrompt({
  title,
  body,
  canAskAgain,
  onRequest,
}: {
  title: string;
  body: string;
  canAskAgain: boolean;
  onRequest: () => void;
}) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.modal} accessibilityRole="alert">
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {canAskAgain ? (
          <Button label="Allow access" onPress={onRequest} />
        ) : (
          <Button label="Open Settings" onPress={() => Linking.openSettings()} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.color.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.space[5],
  },
  modal: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space[5],
    gap: theme.space[3],
  },
  title: { color: theme.color.text, fontSize: theme.type.lg.size, fontWeight: "700" },
  body: { color: theme.color.textMuted, fontSize: theme.type.sm.size, lineHeight: 20 },
});
