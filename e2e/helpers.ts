import { Page, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Fails the test if the page logs a console error after this is attached. */
export function failOnConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return () => expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
}

/** Fails the test if any response in this page session comes back 5xx. */
export function failOn5xx(page: Page) {
  const failures: string[] = [];
  page.on("response", (res) => {
    if (res.status() >= 500) failures.push(`${res.status()} ${res.url()}`);
  });
  return () => expect(failures, `5xx responses: ${failures.join("\n")}`).toEqual([]);
}

/** Runs an axe scan and asserts there are zero violations. */
export async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations,
    results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join("\n")
  ).toEqual([]);
}
