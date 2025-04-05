import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
});

test.describe("Theme Toggle", () => {
  test("should toggle between light and dark mode", async ({ page }) => {
    // Get the theme toggle button
    const themeToggle = page.locator('button[aria-label^="Switch to"]');
    
    // Check initial theme (should be light by default)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    
    // Click to switch to dark mode
    await themeToggle.click();
    
    // Verify dark mode is applied
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // Click again to switch back to light mode
    await themeToggle.click();
    
    // Verify light mode is applied
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test("should persist theme preference in localStorage", async ({ page }) => {
    // Get the theme toggle button
    const themeToggle = page.locator('button[aria-label^="Switch to"]');
    
    // Switch to dark mode
    await themeToggle.click();
    
    // Verify theme is saved in localStorage
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');
    
    // Reload the page
    await page.reload();
    
    // Verify dark mode persists after reload
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test("should have correct button styling based on theme", async ({ page }) => {
    // Get the theme toggle button
    const themeToggle = page.locator('button[aria-label^="Switch to"]');
    
    // Check initial button styling (light mode)
    await expect(themeToggle).toHaveCSS('background-color', 'rgb(45, 51, 57)');
    await expect(themeToggle).toHaveCSS('color', 'rgb(244, 244, 245)');
    
    // Switch to dark mode
    await themeToggle.click();
    
    // Check button styling in dark mode
    await expect(themeToggle).toHaveCSS('background-color', 'rgb(244, 244, 245)');
    await expect(themeToggle).toHaveCSS('color', 'rgb(45, 51, 57)');
  });

  test("should have correct icon based on theme", async ({ page }) => {
    // Get the theme toggle button
    const themeToggle = page.locator('button[aria-label^="Switch to"]');
    
    // Check initial icon (light mode - moon icon)
    await expect(themeToggle.locator('svg')).toHaveAttribute('viewBox', '0 0 24 24');
    await expect(themeToggle.locator('path')).toHaveAttribute('d', /M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z/);
    
    // Switch to dark mode
    await themeToggle.click();
    
    // Check icon in dark mode (sun icon)
    await expect(themeToggle.locator('svg')).toHaveAttribute('viewBox', '0 0 24 24');
    await expect(themeToggle.locator('path')).toHaveAttribute('d', /M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707/);
  });
}); 