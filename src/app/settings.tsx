import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { theme } from "@/lib/theme";
import { useAuth, signOut } from "@/lib/supabase/auth";

const STUB_ROWS = ["Camera & microphone permissions", "Output quality", "Watermark"];

export default function SettingsScreen() {
  const { loading, user, configured } = useAuth();

  return (
    <View style={styles.root} role="main">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={user ? `Signed in as ${user.email}` : "Sign in"}
        onPress={() => (user ? signOut() : router.push("/sign-in"))}
        style={styles.row}
      >
        <Text style={styles.label}>Account</Text>
        <Text style={styles.value}>
          {loading ? "…" : user ? `${user.email} · Sign out` : configured ? "Sign in" : "Not set up"}
        </Text>
      </Pressable>
      {STUB_ROWS.map((row) => (
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
