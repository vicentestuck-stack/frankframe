import { Skia } from "@shopify/react-native-skia";
import { File, Paths } from "expo-file-system";
import type { BeautyPreset, Lens } from "./data/types";
import { buildColorMatrix, isIdentityGrade } from "./colorGrading";

/**
 * Re-renders a captured photo through an offscreen Skia surface with the
 * same ColorMatrix GradedPhoto uses for the review preview, so the saved
 * and shared file genuinely reflects the beauty/filter adjustment instead
 * of only the on-screen overlay (previously a known gap — see
 * replica/build-log.md). Scoped to photos only; video keeps only the live
 * (unbaked) overlay. Returns the original uri unchanged when there's
 * nothing to grade or if any step here fails, so a capture is never lost
 * over a cosmetic step.
 */
export async function bakeGradingIntoPhoto(
  uri: string,
  beauty: BeautyPreset,
  lens: Lens | null
): Promise<string> {
  if (isIdentityGrade(beauty, lens)) return uri;

  try {
    const data = await Skia.Data.fromURI(uri);
    const image = data ? Skia.Image.MakeImageFromEncoded(data) : null;
    if (!image) return uri;

    const width = image.width();
    const height = image.height();
    const surface = Skia.Surface.MakeOffscreen(width, height);
    if (!surface) return uri;

    const canvas = surface.getCanvas();
    const paint = Skia.Paint();
    paint.setColorFilter(Skia.ColorFilter.MakeMatrix(buildColorMatrix(beauty, lens)));
    canvas.drawImage(image, 0, 0, paint);
    surface.flush();

    const snapshot = surface.makeImageSnapshot();
    const bytes = snapshot.encodeToBytes();
    if (!bytes) return uri;

    const file = new File(Paths.cache, `graded-${Date.now()}.png`);
    file.create({ overwrite: true });
    await file.write(bytes);
    return file.uri;
  } catch {
    return uri;
  }
}
