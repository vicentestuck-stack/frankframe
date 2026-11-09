import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./client";

export interface AuthState {
  /** true until the client has checked for an existing session once. */
  loading: boolean;
  session: Session | null;
  user: User | null;
  /** Whether sign-in is even possible right now (Supabase env vars set). */
  configured: boolean;
}

/** Live auth state, updated on sign in/out/token refresh. */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: !!supabase,
    session: null,
    user: null,
    configured: !!supabase,
  });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((s) => ({ ...s, session, user: session?.user ?? null, loading: false }));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((s) => ({ ...s, session, user: session?.user ?? null, loading: false }));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return state;
}

export class AuthNotConfiguredError extends Error {
  constructor() {
    super(
      "Sign-in isn't set up yet — EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_ANON_KEY are unset. See .env.example and replica/backend.md."
    );
  }
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new AuthNotConfiguredError();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) throw new AuthNotConfiguredError();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

/**
 * Google/Apple sign-in. Needs a real OAuth client configured in the
 * Supabase dashboard (replica/backend.md step 3-4) — functionally wired
 * here, but untestable without one. Supabase's `signInWithOAuth` opens the
 * provider's consent screen in a browser and redirects back via the app's
 * URL scheme (`frankframe://`, set in app.json).
 */
export async function signInWithProvider(provider: "google" | "apple") {
  if (!supabase) throw new AuthNotConfiguredError();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: "frankframe://auth-callback" },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) throw new AuthNotConfiguredError();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** The bearer token for calling camera-clone-backend's API routes, or null if signed out / not configured. */
export function getAccessToken(session: Session | null): string | null {
  return session?.access_token ?? null;
}
