import { test, expect } from "@playwright/test";

// Intentionally small: unit and integration coverage lives in Vitest.
// This suite only verifies the wiring between a real browser, real
// localStorage, and the built React tree. Anything that can be verified
// in JSDOM belongs under src/**, not here.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
});

test("loads the app with the default 25:00 session timer", async ({ page }) => {
  await expect(page.locator("#time-left")).toHaveText("25:00");
  await expect(page.locator("#time-label h2")).toHaveText("Focus");
  await expect(page.locator("#session-length")).toHaveText("25");
  await expect(page.locator("#break-length")).toHaveText("5");
});

test("start -> stop records a session the analytics sidebar shows", async ({
  page,
}) => {
  const totalSessions = page.locator(".summary-stats p").first();
  await expect(totalSessions).toHaveText("0");

  await page.locator("#start_stop").click();
  // Wait for the timer to visibly tick rather than sleeping a fixed duration.
  await expect(page.locator("#time-left")).not.toHaveText("25:00");
  await page.locator("#start_stop").click();

  await expect(totalSessions).toHaveText("1");
});

test("theme toggle persists across a real page reload", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByRole("button", { name: /switch to light mode/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
