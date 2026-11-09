import "react-native-url-polyfill/auto";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * `null` until EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are
 * set (see .env.example) — i.e. always null in this pass, since no Supabase
 * project exists yet (replica/backend.md). Every call site must handle the
 * null case: fall back to the local data layer (src/lib/data/store.ts)
 * rather than crash. This is the real swap point `/replica-backend`'s
 * backend.md "Next" section asked for — not a stub, genuinely wired, just
 * unable to connect to anything until the user creates that project.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

if (supabase && Platform.OS !== "web") {
  // Keeps the session's access token refreshed while the app is foregrounded,
  // and lets `onAuthStateChange` fire TOKEN_REFRESHED/SIGNED_OUT correctly —
  // per Supabase's own React Native guidance. Web doesn't need this; the
  // browser handles it.
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
