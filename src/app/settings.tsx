import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/lib/theme";

const ROWS = [
  "Camera & microphone permissions",
  "Output quality",
  "Watermark",
  "Account",
];

export default function SettingsScreen() {
  return (
    <View style={styles.root}>
      {ROWS.map((row) => (
        <View key={row} style={styles.row}>
          <Text style={styles.label}>{row}</Text>
          <Text style={styles.value}>Coming soon</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg, padding: theme.space[4] },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.space[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.color.border,
  },
  label: { color: theme.color.text, fontSize: theme.type.base.size },
  value: { color: theme.color.textMuted, fontSize: theme.type.sm.size },
});
