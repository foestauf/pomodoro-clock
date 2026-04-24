import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";
import type * as AppModule from "../App";

// We reset the module graph between tests so analyticsService's module-level
// session array starts empty for each case. Dynamically re-importing App is
// the cheapest way to get that fresh state without refactoring the service.
let App: typeof AppModule.default;

const loadApp = async () => {
  vi.resetModules();
  ({ default: App } = await import("../App"));
};

const setup = async () => {
  await loadApp();
  render(<App />);
};

const click = (selector: string) => {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`No element matches ${selector}`);
  fireEvent.click(el);
};

const tick = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

describe("timer integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ticks down one second after pressing start", async () => {
    await setup();
    expect(document.querySelector("#time-left")).toHaveTextContent("25:00");

    click("#start_stop");
    await tick(1000);

    expect(document.querySelector("#time-left")).toHaveTextContent("24:59");
  });

  it("reflects adjusted session length before starting", async () => {
    await setup();

    click("#session-decrement");
    expect(document.querySelector("#time-left")).toHaveTextContent("24:00");

    click("#start_stop");
    await tick(1000);

    expect(document.querySelector("#time-left")).toHaveTextContent("23:59");
  });

  it("pauses when start/stop is clicked twice", async () => {
    await setup();

    click("#start_stop");
    await tick(1000);
    click("#start_stop");

    const pausedAt = document.querySelector("#time-left")?.textContent;

    await tick(3000);

    expect(document.querySelector("#time-left")).toHaveTextContent(pausedAt!);
  });

  it("resets back to 25:00 after the reset button", async () => {
    await setup();

    click("#start_stop");
    await tick(2000);
    click("#reset");

    expect(document.querySelector("#time-left")).toHaveTextContent("25:00");
    expect(document.querySelector("#time-label h2")).toHaveTextContent(
      "Session"
    );
  });
});

describe("keyboard shortcuts integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const press = (key: string) => {
    act(() => {
      fireEvent.keyDown(window, { key });
    });
  };

  it("starts/stops the timer with Space", async () => {
    await setup();

    press(" ");
    await tick(1500);
    expect(document.querySelector("#time-left")).not.toHaveTextContent("25:00");

    const running = document.querySelector("#time-left")?.textContent;
    press(" ");
    await tick(2000);
    expect(document.querySelector("#time-left")).toHaveTextContent(running!);
  });

  it("resets the timer with R", async () => {
    await setup();

    press(" ");
    await tick(1500);
    press("r");

    expect(document.querySelector("#time-left")).toHaveTextContent("25:00");
    expect(document.querySelector("#time-label h2")).toHaveTextContent(
      "Session"
    );
  });

  it("switches to break mode with B", async () => {
    await setup();

    press("b");

    expect(document.querySelector("#time-label h2")).toHaveTextContent("Break");
    expect(document.querySelector("#time-left")).toHaveTextContent("05:00");
  });

  it("switches back to session mode with S", async () => {
    await setup();

    press("b");
    press("s");

    expect(document.querySelector("#time-label h2")).toHaveTextContent(
      "Session"
    );
    expect(document.querySelector("#time-left")).toHaveTextContent("25:00");
  });
});

describe("analytics integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const completeSession = async (durationMs = 2000) => {
    click("#start_stop");
    await tick(durationMs);
    click("#start_stop");
    // Let the sidebar remount (key={sessionCount}) and re-read sessions.
    await tick(0);
  };

  it("records a session after start/stop and updates the summary", async () => {
    await setup();

    const stats = () => document.querySelectorAll(".summary-stats p");
    expect(stats()[0]).toHaveTextContent("0");

    await completeSession(2000);

    expect(stats()[0]).toHaveTextContent("1");
    expect(stats()[1].textContent).toMatch(/sec/);
  });

  it("tracks multiple completed sessions", async () => {
    await setup();

    await completeSession(1000);
    await completeSession(2000);
    await completeSession(3000);

    expect(document.querySelectorAll(".summary-stats p")[0]).toHaveTextContent(
      "3"
    );
  });

  it("shows analytics charts after a session completes", async () => {
    await setup();
    await completeSession(2000);

    expect(screen.getByText("Daily Session Count")).toBeInTheDocument();
    expect(screen.getByText("Daily Average Duration")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("sessions-tab"));
    expect(screen.getByText("Recent Session Durations")).toBeInTheDocument();
    expect(screen.getByText("Session Time Distribution")).toBeInTheDocument();
  });

  it("persists session data across remounts via localStorage", async () => {
    await setup();
    await completeSession(2000);

    // Re-import the app module to simulate a page reload — this re-runs
    // analyticsService's loadSessions() from localStorage.
    await setup();

    const stats = document.querySelectorAll(".summary-stats p");
    expect(stats[0]).toHaveTextContent("1");
  });
});
