import { test, expect } from "@playwright/test";

test.describe("Analytics Sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Ensure the page has focus for keyboard events
    await page.click("body");
  });

  test("should show initial summary stats", async ({ page }) => {
    const totalSessions = page.locator(".summary-stats p").first();
    const avgDuration = page.locator(".summary-stats p").nth(1);
    await expect(totalSessions).toContainText("0");
    await expect(avgDuration).toContainText("0 min");
  });

  test("should update summary stats after completing a session", async ({
    page,
  }) => {
    // Find and click the start/stop button instead of using keyboard
    const startStopButton = page.locator("#start_stop");
    await startStopButton.click(); // Start the timer
    await page.waitForTimeout(2000); // Wait for 2 seconds
    await startStopButton.click(); // Stop the timer

    // Wait for analytics to update
    await page.waitForTimeout(1000);

    // Check if the session was recorded
    const totalSessions = page.locator(".summary-stats p").first();
    await expect(totalSessions).toContainText("1");

    // The duration might vary slightly, so just check if it contains "sec"
    const avgDuration = page.locator(".summary-stats p").nth(1);
    await expect(avgDuration).toContainText("sec");
  });

  test("should track multiple sessions", async ({ page }) => {
    // Find the start/stop button
    const startStopButton = page.locator("#start_stop");

    // Complete 3 sessions
    for (let i = 0; i < 3; i++) {
      await startStopButton.click(); // Start the timer
      await page.waitForTimeout(2000);
      await startStopButton.click(); // Stop the timer
      // Wait for analytics to update after each session
      await page.waitForTimeout(1000);
    }

    const totalSessions = page.locator(".summary-stats p").first();
    await expect(totalSessions).toContainText("3");

    // The duration might vary slightly, so just check if it contains "sec"
    const avgDuration = page.locator(".summary-stats p").nth(1);
    await expect(avgDuration).toContainText("sec");
  });

  test("should show daily stats tab by default", async ({ page }) => {
    const dailyTab = page.locator(".tab-button.active");
    await expect(dailyTab).toContainText("Daily");
  });

  test("should switch to sessions tab", async ({ page }) => {
    // Click the Sessions tab using the data-testid
    await page.click('[data-testid="sessions-tab"]');
    await page.waitForTimeout(500);

    // Check if the sessions tab is active
    const sessionsTab = page.locator('[data-testid="sessions-tab"]');
    await expect(sessionsTab).toHaveClass(/active/);
  });

  test("should show empty state when no data", async ({ page }) => {
    const noDataMessage = page.locator(".no-data-message");
    await expect(noDataMessage).toContainText(
      "No completed sessions available"
    );
    await expect(noDataMessage).toContainText(
      "Start and complete a session to see analytics"
    );
  });

  test("should show charts after completing sessions", async ({ page }) => {
    // Find and click the start/stop button
    const startStopButton = page.locator("#start_stop");
    await startStopButton.click(); // Start the timer
    await page.waitForTimeout(2000);
    await startStopButton.click(); // Stop the timer

    // Wait for analytics to update
    await page.waitForTimeout(1000);

    // Check for chart containers in the daily tab
    const dailyCountChart = page.locator(".chart-container h3").first();
    const avgDurationChart = page.locator(".chart-container h3").nth(1);
    await expect(dailyCountChart).toContainText("Daily Session Count");
    await expect(avgDurationChart).toContainText("Daily Average Duration");

    // Switch to sessions tab and check those charts
    await page.click('[data-testid="sessions-tab"]');
    await page.waitForTimeout(500);

    // Check for chart containers in the sessions tab
    const recentSessionsChart = page.locator(".chart-container h3").first();
    const timeDistributionChart = page.locator(".chart-container h3").nth(1);
    await expect(recentSessionsChart).toContainText("Recent Session Durations");
    await expect(timeDistributionChart).toContainText(
      "Session Time Distribution"
    );
  });

  test("should persist session data after page reload", async ({ page }) => {
    // Find and click the start/stop button
    const startStopButton = page.locator("#start_stop");
    await startStopButton.click(); // Start the timer
    await page.waitForTimeout(2000);
    await startStopButton.click(); // Stop the timer

    // Wait for analytics to update
    await page.waitForTimeout(1000);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(1000); // Wait for page to load

    // Check if the session data persisted
    const totalSessions = page.locator(".summary-stats p").first();
    await expect(totalSessions).toContainText("1");

    // The duration might vary slightly, so just check if it contains "sec"
    const avgDuration = page.locator(".summary-stats p").nth(1);
    await expect(avgDuration).toContainText("sec");
  });
});
