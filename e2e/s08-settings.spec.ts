import { test, expect } from "@playwright/test";
import { expectNoAxeViolations, failOn5xx, failOnConsoleErrors } from "./helpers";

test("S08: settings lists every row as a stub, honestly labelled", async ({ page }) => {
  const checkConsole = failOnConsoleErrors(page);
  const check5xx = failOn5xx(page);

  await page.goto("/settings");

  for (const row of [
    "Camera & microphone permissions",
    "Output quality",
    "Watermark",
    "Account",
  ]) {
    await expect(page.getByText(row)).toBeVisible();
  }
  // All four say "Coming soon" — nothing here pretends to be wired up.
  await expect(page.getByText("Coming soon")).toHaveCount(4);

  await expectNoAxeViolations(page);
  checkConsole();
  check5xx();
});
