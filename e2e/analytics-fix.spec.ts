import { test, expect } from "@playwright/test";

test.describe("Analytics Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Clear localStorage to start with a clean state
    await page.evaluate(() => localStorage.clear());
    // Reload the page to apply the cleared localStorage
    await page.reload();
    // Ensure the page has focus
    await page.click("body");
  });

  test("should record a session when timer is started and stopped", async ({
    page,
  }) => {
    // Start the timer
    await page.click("#start_stop");

    // Wait for 2 seconds
    await page.waitForTimeout(2000);

    // Stop the timer
    await page.click("#start_stop");

    // Wait for analytics to update
    await page.waitForTimeout(1000);

    // Check if the session was recorded
    const totalSessions = page.locator(".summary-stats p").first();
    await expect(totalSessions).toContainText("1");
  });

  test("should switch to sessions tab and show correct charts", async ({
    page,
  }) => {
    // First complete a session
    await page.click("#start_stop");
    await page.waitForTimeout(2000);
    await page.click("#start_stop");
    await page.waitForTimeout(1000);

    // Click on the Sessions tab
    await page.click('[data-testid="sessions-tab"]');
    await page.waitForTimeout(500);

    // Check if the sessions tab is active
    const sessionsTab = page.locator('[data-testid="sessions-tab"]');
    await expect(sessionsTab).toHaveClass(/active/);

    // Check for chart titles in the sessions tab
    const charts = await page.locator(".chart-container h3").allTextContents();
    expect(charts).toContain("Recent Session Durations");
    expect(charts).toContain("Session Time Distribution");
  });
});
