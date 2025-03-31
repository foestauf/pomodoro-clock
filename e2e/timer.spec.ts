import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
});

test.describe("Timer", () => {
  test("it should display current time", async ({ page }) => {
    const time = await page.$eval("#time-left", (el) => el.textContent);
    expect(time).toBe("25:00");
  });

  test("session length default should be 25 minutes", async ({ page }) => {
    const sessionLength = await page.$eval(
      "#session-length",
      (el) => el.textContent
    );
    expect(sessionLength).toBe("25");
  });

  test("session should decrement by one", async ({ page }) => {
    await page.click("#session-decrement");
    const sessionLength = await page.$eval(
      "#session-length",
      (el) => el.textContent
    );
    expect(sessionLength).toBe("24");
  });

  test("adjusting session length then pressing start should change time", async ({
    page,
  }) => {
    await page.click("#session-decrement");
    await page.click("#start_stop");
    await page.waitForTimeout(1000);
    const time = await page.$eval("#time-left", (el) => el.textContent);
    expect(time).toBe("23:59");
  });

  test("session should increment by one", async ({ page }) => {
    await page.click("#session-increment");
    const sessionLength = await page.$eval(
      "#session-length",
      (el) => el.textContent
    );
    expect(sessionLength).toBe("26");
  });

  test("break length default should be 5 minutes", async ({ page }) => {
    const breakLength = await page.$eval(
      "#break-length",
      (el) => el.textContent
    );
    expect(breakLength).toBe("5");
  });

  test("break should decrement by one", async ({ page }) => {
    await page.click("#break-decrement");
    const breakLength = await page.$eval(
      "#break-length",
      (el) => el.textContent
    );
    expect(breakLength).toBe("4");
  });

  test("break should increment by one", async ({ page }) => {
    await page.click("#break-increment");
    const breakLength = await page.$eval(
      "#break-length",
      (el) => el.textContent
    );
    expect(breakLength).toBe("6");
  });

  test("timer should start", async ({ page }) => {
    await page.click("#start_stop");
    await page.waitForTimeout(1000);
    const time = await page.$eval("#time-left", (el) => el.textContent);
    expect(time).not.toBe("25:00");
  });

  test("timer should stop", async ({ page }) => {
    await page.click("#start_stop");
    await page.waitForTimeout(1000);
    await page.click("#start_stop");
    const time = await page.$eval("#time-left", (el) => el.textContent);
    expect(time).toBe("24:59");
  });

  test("timer should reset", async ({ page }) => {
    await page.click("#start_stop");
    await page.click("#reset");
    const time = await page.$eval("#time-left", (el) => el.textContent);
    expect(time).toBe("25:00");
  });
});

test.describe("Keyboard Shortcuts", () => {
  test("space should start/stop timer", async ({ page }) => {
    // Ensure page has focus
    await page.click("body");
    
    // Get initial time
    const initialTime = await page.$eval("#time-left", (el) => el.textContent);
    
    // Start timer
    await page.keyboard.press("Space");
    await page.waitForTimeout(1500);
    
    // Check that time has changed from initial
    const timeAfterStart = await page.$eval("#time-left", (el) => el.textContent);
    expect(timeAfterStart).not.toBe(initialTime);
    
    // Store the time when stopped
    const stoppedTime = timeAfterStart;
    
    // Stop timer
    await page.keyboard.press("Space");
    await page.waitForTimeout(500);
    
    // Verify timer has stopped by checking time hasn't changed
    const timeAfterStop = await page.$eval("#time-left", (el) => el.textContent);
    expect(timeAfterStop).toBe(stoppedTime);
  });

  test("r should reset timer", async ({ page }) => {
    // Ensure page has focus
    await page.click("body");
    
    // Start timer and wait
    await page.keyboard.press("Space");
    await page.waitForTimeout(1500);
    
    // Reset with keyboard
    await page.keyboard.press("r");
    await page.waitForTimeout(500);
    
    // Check timer has reset
    const time = await page.$eval("#time-left", (el) => el.textContent);
    expect(time).toBe("25:00");
    
    // Check timer state has reset
    const timerType = await page.$eval("#time-label h1", (el) => el.textContent);
    expect(timerType).toBe("Session");
  });

  test("b should switch to break mode", async ({ page }) => {
    // Ensure page has focus
    await page.click("body");
    
    // Switch to break mode
    await page.keyboard.press("b");
    
    // Use waitForSelector with state: "attached" to ensure element is present
    await page.waitForSelector('#time-label h1:has-text("Break")', { state: 'attached' });
    
    const timerType = await page.$eval("#time-label h1", (el) => el.textContent);
    expect(timerType).toBe("Break");
    
    const time = await page.$eval("#time-left", (el) => el.textContent);
    expect(time).toBe("05:00");
  });

  test("s should switch back to session mode from break", async ({ page }) => {
    // Ensure page has focus
    await page.click("body");
    
    // First switch to break mode
    await page.keyboard.press("b");
    await page.waitForSelector('#time-label h1:has-text("Break")', { state: 'attached' });
    
    // Then switch back to session mode
    await page.keyboard.press("s");
    await page.waitForSelector('#time-label h1:has-text("Session")', { state: 'attached' });
    
    const timerType = await page.$eval("#time-label h1", (el) => el.textContent);
    expect(timerType).toBe("Session");
    
    const time = await page.$eval("#time-left", (el) => el.textContent);
    expect(time).toBe("25:00");
  });

  test("keyboard shortcuts should be displayed", async ({ page }) => {
    const shortcuts = await page.locator(".keyboard-shortcuts ul li").allTextContents();
    expect(shortcuts).toContain("Space - Start/Stop");
    expect(shortcuts).toContain("R - Reset");
    expect(shortcuts).toContain("B - Switch to Break");
    expect(shortcuts).toContain("S - Switch to Session");
  });
});
