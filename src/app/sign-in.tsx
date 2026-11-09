import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { theme } from "@/lib/theme";
import { Button } from "@/components/Button";
import { Toast, ToastKind } from "@/components/Toast";
import {
  signInWithEmail,
  signInWithProvider,
  signUpWithEmail,
  useAuth,
} from "@/lib/supabase/auth";

export default function SignInScreen() {
  const { configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);

  async function submit() {
    if (!email || !password) {
      setToast({ message: "Enter an email and a password.", kind: "error" });
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        router.back();
      } else {
        await signUpWithEmail(email, password);
        setToast({ message: "Check your email to confirm the account.", kind: "success" });
      }
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Couldn't sign in.", kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function withProvider(provider: "google" | "apple") {
    setLoading(true);
    try {
      await signInWithProvider(provider);
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Couldn't sign in.", kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} role="main">
      <Text style={styles.title}>{mode === "signin" ? "Sign in" : "Create an account"}</Text>
      <Text style={styles.subtitle}>
        Syncs your beauty preset and, once connected, your lens library and captures across
        devices. The camera itself never requires this.
      </Text>

      {!configured ? (
        <Text style={styles.warning}>
          Sign-in isn't set up in this build yet — no Supabase project is connected. See
          replica/backend.md.
        </Text>
      ) : null}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={theme.color.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        accessibilityLabel="Email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={theme.color.textMuted}
        secureTextEntry
        style={styles.input}
        accessibilityLabel="Password"
      />

      <Button
        label={mode === "signin" ? "Sign in" : "Sign up"}
        onPress={submit}
        loading={loading}
        style={styles.action}
      />
      <Button
        label={mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        variant="ghost"
        onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
      />

      <View style={styles.divider} />

      <Button label="Continue with Google" variant="secondary" onPress={() => withProvider("google")} style={styles.action} />
      <Button label="Continue with Apple" variant="secondary" onPress={() => withProvider("apple")} style={styles.action} />

      <Toast message={toast?.message ?? null} kind={toast?.kind ?? "success"} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  content: { padding: theme.space[5], gap: theme.space[3] },
  title: { color: theme.color.text, fontSize: theme.type.xl.size, fontWeight: "700" },
  subtitle: { color: theme.color.textMuted, fontSize: theme.type.sm.size, lineHeight: 20 },
  warning: {
    color: theme.color.warning,
    fontSize: theme.type.xs.size,
    backgroundColor: theme.color.surface,
    padding: theme.space[3],
    borderRadius: theme.radius.md,
  },
  input: {
    backgroundColor: theme.color.surface,
    color: theme.color.text,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: theme.space[3],
  },
  action: { marginTop: theme.space[1] },
  divider: { height: 1, backgroundColor: theme.color.border, marginVertical: theme.space[2] },
});
