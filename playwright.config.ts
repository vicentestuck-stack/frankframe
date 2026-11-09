import { defineConfig, devices } from "@playwright/test";

// These specs run against the Expo app's WEB build (react-native-web),
// started here with `npm run web`. That is a deliberate, documented
// limitation, not an oversight — see replica/test-plan.md and
// replica/bugs.md "What's out of scope here":
//
//   - `expo-camera`, `expo-media-library` and `expo-sharing` are native
//     modules. On web they fall back to browser APIs (getUserMedia, no-op,
//     Web Share API) that behave differently from a real iOS/Android build,
//     and this sandboxed environment has no webcam at all — so every case
//     that needs an actual camera frame or a real gallery save is a manual
//     checklist item for a development build on a real device/simulator,
//     not a Playwright spec.
//   - What IS real here: screen rendering, navigation, form/slider
//     interaction, accessibility roles and labels, and error-path handling
//     (permission denied, no media-library access) — all through the same
//     React components the native build renders.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:8094",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx expo start --web --port 8094",
    url: "http://localhost:8094",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
