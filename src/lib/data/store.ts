// Data layer for camera-clone-app. Beauty presets now genuinely prefer the
// real backend (camera-clone-backend, see replica/backend.md) when a user
// is signed in and it's reachable, falling back to the local AsyncStorage
// copy otherwise — the actual swap /replica-build's own comment here used
// to only promise. Lenses and captures are still local-only: the backend's
// `lenses` table has no thumbnail_url/asset_bundle_url content yet (seeded
// with placeholder seed:// URLs, see camera-clone-backend/db/seed.ts) and
// no emoji/tint fields at all — those are UI-only concepts invented for
// this slice's decorative overlay (src/components/LensTintOverlay.tsx).
// Wiring getLenses() to the real API would silently break the lens
// carousel/overlay until that shape gap is closed — a /replica-build task,
// not papered over here. saveCapture() stays local for the same reason
// (no real asset pipeline to upload to yet).

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SEED_LENSES } from "./lenses";
import {
  apiAvailable,
  apiGetActiveBeautyPreset,
  apiSaveBeautyPreset,
} from "../api";
import {
  BeautyPreset,
  Capture,
  CaptureType,
  DEFAULT_BEAUTY,
  Lens,
  LensCategory,
} from "./types";

const KEY_BEAUTY = "replica.beautyPreset.active";
const KEY_CAPTURES = "replica.captures";

function uuid(): string {
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function getLenses(category?: LensCategory): Promise<Lens[]> {
  if (!category) return SEED_LENSES;
  return SEED_LENSES.filter((l) => l.category === category);
}

export async function getLensById(id: string): Promise<Lens | null> {
  return SEED_LENSES.find((l) => l.id === id) ?? null;
}

function fromApiPreset(p: {
  id: string;
  face_slim: number;
  skin_smooth: number;
  eye_size: number;
  skin_tone: number;
  blemish_removal: number;
  updated_at: string;
}): BeautyPreset {
  return {
    id: p.id,
    faceSlim: p.face_slim,
    skinSmooth: p.skin_smooth,
    eyeSize: p.eye_size,
    skinTone: p.skin_tone,
    blemishRemoval: p.blemish_removal,
    updatedAt: p.updated_at,
  };
}

export async function getActiveBeautyPreset(): Promise<BeautyPreset> {
  if (await apiAvailable()) {
    const remote = await apiGetActiveBeautyPreset();
    if (remote) {
      const preset = fromApiPreset(remote);
      await AsyncStorage.setItem(KEY_BEAUTY, JSON.stringify(preset));
      return preset;
    }
    // Signed in, reachable, but no preset saved server-side yet — fall
    // through to create a local one below, same as the signed-out path.
  }

  const raw = await AsyncStorage.getItem(KEY_BEAUTY);
  if (raw) return JSON.parse(raw) as BeautyPreset;
  const fresh: BeautyPreset = {
    id: uuid(),
    ...DEFAULT_BEAUTY,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY_BEAUTY, JSON.stringify(fresh));
  return fresh;
}

export async function saveActiveBeautyPreset(
  values: Partial<Omit<BeautyPreset, "id" | "updatedAt">>
): Promise<BeautyPreset> {
  if (await apiAvailable()) {
    const remote = await apiSaveBeautyPreset({
      faceSlim: values.faceSlim,
      skinSmooth: values.skinSmooth,
      eyeSize: values.eyeSize,
      skinTone: values.skinTone,
      blemishRemoval: values.blemishRemoval,
    });
    if (remote) {
      const preset = fromApiPreset(remote);
      await AsyncStorage.setItem(KEY_BEAUTY, JSON.stringify(preset));
      return preset;
    }
    // API reachable but the save itself failed (e.g. validation) — don't
    // silently diverge local state from what the server actually has;
    // fall through and keep the local copy as the source of truth for
    // this update instead.
  }

  const current = await getActiveBeautyPreset();
  const next: BeautyPreset = {
    ...current,
    ...values,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY_BEAUTY, JSON.stringify(next));
  return next;
}

export async function listCaptures(): Promise<Capture[]> {
  const raw = await AsyncStorage.getItem(KEY_CAPTURES);
  return raw ? (JSON.parse(raw) as Capture[]) : [];
}

export async function saveCapture(input: {
  type: CaptureType;
  uri: string;
  lensId: string | null;
  beautyPreset: BeautyPreset | null;
  durationMs: number | null;
}): Promise<Capture> {
  const capture: Capture = {
    id: uuid(),
    savedToDevice: false,
    createdAt: new Date().toISOString(),
    ...input,
  };
  const existing = await listCaptures();
  await AsyncStorage.setItem(KEY_CAPTURES, JSON.stringify([capture, ...existing]));
  return capture;
}

export async function markCaptureSaved(id: string): Promise<void> {
  const existing = await listCaptures();
  const next = existing.map((c) => (c.id === id ? { ...c, savedToDevice: true } : c));
  await AsyncStorage.setItem(KEY_CAPTURES, JSON.stringify(next));
}
