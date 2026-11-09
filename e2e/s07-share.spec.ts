import { test, expect } from "@playwright/test";
import { expectNoAxeViolations, failOn5xx, failOnConsoleErrors } from "./helpers";

// F01-H5/N (negative): saving/sharing without real device permissions.
// expo-media-library and expo-sharing both fall back to web shims here —
// neither can actually succeed in this sandbox (no media-library grant, no
// Web Share API in headless Chromium), which is exactly the negative path
// this spec checks: a denied/unavailable permission must show a clear
// error, never a crash or a silent no-op. See replica/test-plan.md F01-N1.
const SHARE_URL =
  "/share?uri=https%3A%2F%2Fpicsum.photos%2F400&type=photo&lensId=&durationMs=&caption=Golden%20hour%20vibes";

test.describe("S07 save & share", () => {
  test("renders the preview, caption note and all three actions", async ({ page }) => {
    const checkConsole = failOnConsoleErrors(page);
    const check5xx = failOn5xx(page);

    await page.goto(SHARE_URL);
    await expect(page.getByRole("heading", { name: "Save & share" })).toBeVisible();
    await expect(page.getByText(/Golden hour vibes/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Save to device" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Share…" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Done" })).toBeVisible();

    await expectNoAxeViolations(page);
    checkConsole();
    check5xx();
  });

  test("F01-N1: saving without media-library access shows an error toast, not a crash", async ({
    page,
  }) => {
    const checkConsole = failOnConsoleErrors(page);

    await page.goto(SHARE_URL);
    await page.getByRole("button", { name: "Save to device" }).click();

    await expect(page.getByText("Can't save without library access.")).toBeVisible();
    // The button must return to its normal, re-clickable label — not get
    // stuck mid-spinner forever on a failed save.
    await expect(page.getByRole("button", { name: "Save to device" })).toBeEnabled();

    checkConsole();
  });

  test("Done returns to the camera screen", async ({ page }) => {
    await page.goto(SHARE_URL);
    await page.getByRole("button", { name: "Done" }).click();
    await expect(page).toHaveURL("/");
  });
});
