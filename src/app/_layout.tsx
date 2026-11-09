import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { theme } from "@/lib/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.color.bg },
          headerTintColor: theme.color.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.color.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="review" options={{ title: "Review" }} />
        <Stack.Screen name="edit" options={{ title: "Edit" }} />
        <Stack.Screen name="share" options={{ title: "Save & share" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="sign-in" options={{ title: "Sign in" }} />
      </Stack>
    </>
  );
}
