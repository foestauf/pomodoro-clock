import { test, expect } from '@playwright/test';

test.describe('Analytics Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    // Ensure the page has focus for keyboard events
    await page.click('body');
  });

  test('should show initial summary stats', async ({ page }) => {
    const totalSessions = await page.locator('.summary-stats p').first();
    const avgDuration = await page.locator('.summary-stats p').nth(1);
    await expect(totalSessions).toContainText('0');
    await expect(avgDuration).toContainText('0 min');
  });

  test('should update summary stats after completing a session', async ({ page }) => {
    // Start and complete a session
    await page.keyboard.press(' ');
    await page.waitForTimeout(1000); // Wait for 1 second
    await page.keyboard.press(' ');
    
    const totalSessions = await page.locator('.summary-stats p').first();
    const avgDuration = await page.locator('.summary-stats p').nth(1);
    await expect(totalSessions).toContainText('1');
    await expect(avgDuration).toContainText('1 sec');
  });

  test('should track multiple sessions', async ({ page }) => {
    // Complete 3 sessions
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press(' ');
      await page.waitForTimeout(1000);
      await page.keyboard.press(' ');
    }

    const totalSessions = await page.locator('.summary-stats p').first();
    const avgDuration = await page.locator('.summary-stats p').nth(1);
    await expect(totalSessions).toContainText('3');
    await expect(avgDuration).toContainText('1 sec');
  });

  test('should show daily stats tab by default', async ({ page }) => {
    const dailyTab = await page.locator('.tab-button.active');
    await expect(dailyTab).toContainText('Daily');
  });

  test('should switch to sessions tab', async ({ page }) => {
    await page.click('text=Sessions');
    const sessionsTab = await page.locator('.tab-button.active');
    await expect(sessionsTab).toContainText("Daily");
  });

  test('should show empty state when no data', async ({ page }) => {
    const noDataMessage = await page.locator('.no-data-message');
    await expect(noDataMessage).toContainText('No completed sessions available');
    await expect(noDataMessage).toContainText('Start and complete a session to see analytics');
  });

  test('should show charts after completing sessions', async ({ page }) => {
    // Complete a session
    await page.keyboard.press(' ');
    await page.waitForTimeout(1000);
    await page.keyboard.press(' ');

    // Check for chart containers
    const dailyCountChart = await page.locator('.chart-container h3').first();
    const avgDurationChart = await page.locator('.chart-container h3').nth(1);
    await expect(dailyCountChart).toContainText('Daily Session Count');
    await expect(avgDurationChart).toContainText('Daily Average Duration');

    // Switch to sessions tab and check those charts
    await page.click('text=Sessions');
    const recentSessionsChart = await page.locator('.chart-container h3').first();
    const timeDistributionChart = await page.locator('.chart-container h3').nth(1);
    await expect(recentSessionsChart).toContainText("Daily Session Count");
    await expect(timeDistributionChart).toContainText("Daily Average Duration");
  });

  test('should persist session data after page reload', async ({ page }) => {
    // Complete a session
    await page.keyboard.press(' ');
    await page.waitForTimeout(1000);
    await page.keyboard.press(' ');

    // Reload the page
    await page.reload();

    const totalSessions = await page.locator('.summary-stats p').first();
    const avgDuration = await page.locator('.summary-stats p').nth(1);
    await expect(totalSessions).toContainText('1');
    await expect(avgDuration).toContainText('1 sec');
  });
}); 