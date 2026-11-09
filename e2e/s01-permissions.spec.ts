import { test, expect } from "@playwright/test";
import { expectNoAxeViolations, failOn5xx, failOnConsoleErrors } from "./helpers";

// F01-H1 (partial): the very start of "take a filtered selfie and save it"
// — the permission gate before the live preview. This sandbox's browser
// blocks getUserMedia outright, so this spec covers only the gate, not the
// granted-permission path into S02. See replica/test-plan.md F01.
test("S01: shows the camera permission prompt on first load", async ({ page }) => {
  const checkConsole = failOnConsoleErrors(page);
  const check5xx = failOn5xx(page);

  await page.goto("/");

  await expect(page.getByText("Camera access")).toBeVisible();
  await expect(
    page.getByText("Frankframe needs your camera to show the live preview and take photos or videos.")
  ).toBeVisible();
  const allowButton = page.getByRole("button", { name: "Allow access" });
  await expect(allowButton).toBeVisible();

  await expectNoAxeViolations(page);
  checkConsole();
  check5xx();
});

// F01-E (edge): requesting permission in an environment that can't grant it
// (no camera device / blocked by sandbox policy) must not crash the app —
// it should stay on a recognizable state, not a blank screen or error boundary.
test("S01: requesting permission without a camera does not crash the app", async ({ page }) => {
  const checkConsole = failOnConsoleErrors(page);

  await page.goto("/");
  await page.getByRole("button", { name: "Allow access" }).click();

  // Still on a real screen, not a blank page or thrown error boundary.
  await expect(page.locator("body")).not.toBeEmpty();
  await expect(page.getByText("Camera access")).toBeVisible();

  checkConsole();
});
