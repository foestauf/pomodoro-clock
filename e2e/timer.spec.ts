import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://foestauf.me/pomodoro-clock/");
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
