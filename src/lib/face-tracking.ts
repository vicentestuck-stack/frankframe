/**
 * Real-time face detection integration point for AR sticker anchoring.
 *
 * NOT implemented in this environment. A real implementation needs a native
 * frame-processor module — e.g. `react-native-vision-camera` +
 * `vision-camera-face-detector` (wraps Apple's Vision framework on iOS,
 * ML Kit Face Detection on Android) or ARKit/ARCore directly — all of which
 * require a custom dev build (`npx expo run:ios|android` or an EAS dev
 * build) and a real device or simulator to build and verify against.
 * Neither exists in this sandboxed session, so rather than fake it, this
 * hook defines the real shape every consumer (ArStickerOverlay today) is
 * written against, and always returns face: null — the same "no face
 * found" state a real detector reports between frames, so consumers
 * already have a correct fallback path. Swapping in a real detector later
 * means implementing this one function; no consumer changes.
 */
export interface TrackedFace {
  /** Centre of the detected face, in the camera preview's own coordinate space. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceTrackingState {
  /** true once a native detector is wired in; always false here. */
  available: boolean;
  face: TrackedFace | null;
}

export function useFaceTracking(): FaceTrackingState {
  return { available: false, face: null };
}
