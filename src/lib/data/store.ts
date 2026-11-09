// Fake data layer for the vertical slice (architecture.md step 1): local-only,
// backed by AsyncStorage, but with the same function signatures the real API
// will have (GET /api/lenses, GET/POST /api/beauty-presets, POST /api/captures
// in replica/architecture.md) so swapping in /replica-backend's real client
// later changes no screen code — only this file's internals.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SEED_LENSES } from "./lenses";
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

export async function getActiveBeautyPreset(): Promise<BeautyPreset> {
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
