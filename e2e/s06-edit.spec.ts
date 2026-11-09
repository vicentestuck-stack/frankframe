import { test, expect } from "@playwright/test";
import { expectNoAxeViolations, failOn5xx, failOnConsoleErrors } from "./helpers";

// Navigates straight to /edit with query params, bypassing S02-S05 (camera
// capture), since no camera is available in this sandbox. Exercises the one
// edit tool that's actually implemented this slice (text caption) plus the
// "coming soon" stub path for the rest. See replica/test-plan.md F01 step
// after review, and replica/build-log.md for why only Text works.
const EDIT_URL =
  "/edit?uri=https%3A%2F%2Fpicsum.photos%2F400&type=photo&lensId=&durationMs=";

test.describe("S06 edit", () => {
  test("F01-H4: typing a caption shows it live over the photo", async ({ page }) => {
    const checkConsole = failOnConsoleErrors(page);
    const check5xx = failOn5xx(page);

    await page.goto(EDIT_URL);
    await expect(page.getByRole("heading", { name: "Edit" })).toBeVisible();

    const captionInput = page.getByLabel("Caption text");
    await captionInput.fill("Golden hour vibes");
    await expect(page.getByText("Golden hour vibes").first()).toBeVisible();

    await expectNoAxeViolations(page);
    checkConsole();
    check5xx();
  });

  test("F01-E1: no caption typed means the input starts empty and no caption is forwarded", async ({
    page,
  }) => {
    await page.goto(EDIT_URL);
    await expect(page.getByLabel("Caption text")).toHaveValue("");
    await page.getByRole("button", { name: "Done" }).click();
    await expect(page).toHaveURL(/caption=(&|$)/); // empty caption param, not omitted or "undefined"
  });

  // F01-E8 (very long input): captions are capped at 80 chars (maxLength on
  // the TextInput) — confirms the cap actually applies on web, not just
  // declared.
  test("F01-E8: a caption longer than 80 characters is truncated by the input", async ({
    page,
  }) => {
    await page.goto(EDIT_URL);
    const longCaption = "x".repeat(120);
    const captionInput = page.getByLabel("Caption text");
    await captionInput.fill(longCaption);
    await expect(captionInput).toHaveValue("x".repeat(80));
  });

  // F01-E (emoji/accents): the caption field must accept non-ASCII text
  // without garbling it or crashing the overlay render.
  test("F01-E: caption accepts accented text and emoji", async ({ page }) => {
    const checkConsole = failOnConsoleErrors(page);
    await page.goto(EDIT_URL);
    const text = "¡Año nuevo! 🎉❄️";
    await page.getByLabel("Caption text").fill(text);
    await expect(page.getByText(text).first()).toBeVisible();
    checkConsole();
  });

  test("stub tools (Crop/Sticker/Draw/Trim) show a 'coming soon' notice instead of silently doing nothing", async ({
    page,
  }) => {
    const checkConsole = failOnConsoleErrors(page);
    await page.goto(EDIT_URL);

    for (const tool of ["Crop", "Sticker", "Draw", "Trim"]) {
      await page.getByRole("button", { name: tool, exact: true }).click();
      await expect(page.getByText(`${tool} is coming soon.`)).toBeVisible();
    }

    checkConsole();
  });

  test("Done navigates to the share screen carrying the caption along", async ({ page }) => {
    await page.goto(EDIT_URL);
    await page.getByLabel("Caption text").fill("Test caption");
    await page.getByRole("button", { name: "Done" }).click();

    await expect(page).toHaveURL(/\/share/);
    await expect(page.getByRole("heading", { name: "Save & share" })).toBeVisible();
    // Matched narrowly: the Stack navigator keeps the previous (edit)
    // screen mounted for back-gesture support, so a loose "Test caption"
    // text match would also hit edit.tsx's own caption overlay underneath.
    await expect(page.getByText("is shown in-app only")).toBeVisible();
  });

  test("Back returns to the previous screen without crashing", async ({ page }) => {
    const checkConsole = failOnConsoleErrors(page);
    await page.goto(EDIT_URL);
    await page.getByRole("button", { name: "Back" }).click();
    // No specific destination asserted (there's no history in a direct
    // nav), only that the app is still alive and rendering a real screen.
    await expect(page.locator("body")).not.toBeEmpty();
    checkConsole();
  });
});
