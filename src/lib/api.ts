import { supabase } from "./supabase/client";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Thin client for camera-clone-backend's routes (replica/backend.md).
 * Returns null whenever the real backend genuinely can't be reached right
 * now — no API URL configured, no signed-in session, or the request
 * itself fails — so every call site in src/lib/data/store.ts can fall back
 * to the local data layer instead of throwing. This is the swap point: the
 * fake data layer and the real one share exactly these shapes.
 */
export async function apiAvailable(): Promise<boolean> {
  if (!API_URL || !supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

async function authedFetch(path: string, init?: RequestInit): Promise<Response | null> {
  if (!API_URL || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;
  try {
    return await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch {
    // Network failure (offline, backend down) — the caller falls back to
    // the local data layer; this is not an error state to surface, it's
    // the expected offline-first path (see replica/architecture.md "the
    // entire core loop must work with zero network").
    return null;
  }
}

export async function apiGetLenses(category?: string) {
  const res = await authedFetch(`/api/lenses${category ? `?category=${category}` : ""}`);
  if (!res || !res.ok) return null;
  const body = await res.json();
  return body.lenses as Array<{
    id: string;
    name: string;
    category: string;
    thumbnail_url: string;
    asset_bundle_url: string;
    is_premium: boolean;
    requires_face: boolean;
  }>;
}

export async function apiGetActiveBeautyPreset() {
  const res = await authedFetch("/api/beauty-presets/active");
  if (!res || !res.ok) return null;
  const body = await res.json();
  return body.preset as {
    id: string;
    face_slim: number;
    skin_smooth: number;
    eye_size: number;
    skin_tone: number;
    blemish_removal: number;
    updated_at: string;
  } | null;
}

export async function apiSaveBeautyPreset(patch: Record<string, number>) {
  const res = await authedFetch("/api/beauty-presets", {
    method: "POST",
    body: JSON.stringify(patch),
  });
  if (!res || !res.ok) return null;
  const body = await res.json();
  return body.preset;
}

export async function apiSaveCapture(input: {
  idempotencyKey: string;
  type: string;
  lensId: string | null;
  beautyPresetId: string | null;
  durationMs: number | null;
}) {
  const res = await authedFetch("/api/captures", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res || !res.ok) return null;
  const body = await res.json();
  return body.capture;
}
