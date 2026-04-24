import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type * as AnalyticsModule from "./analyticsService";

// analyticsService.ts holds module-level state (sessions array, currentSession,
// sessionIdCounter) initialized at import time from localStorage. Reset the
// module between tests so each test gets a clean slate.
const loadFresh = async (): Promise<typeof AnalyticsModule> => {
  vi.resetModules();
  return import("./analyticsService");
};

describe("analyticsService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    // Pin system time to a known point so date-bucketing is deterministic.
    vi.setSystemTime(new Date("2026-04-15T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("startSession / endSession", () => {
    it("records a completed session with duration", async () => {
      const svc = await loadFresh();
      const id = svc.startSession();
      vi.advanceTimersByTime(30_000);
      svc.endSession();

      const data = svc.getSessionData();
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(id);
      expect(data[0].duration).toBe(30_000);
      expect(data[0].endTime).toBeInstanceOf(Date);
    });

    it("returns the existing id when a session is already running", async () => {
      const svc = await loadFresh();
      const first = svc.startSession();
      const second = svc.startSession();
      expect(second).toBe(first);
      expect(svc.getSessionData()).toHaveLength(0);
    });

    it("is a no-op when ending without an active session", async () => {
      const svc = await loadFresh();
      expect(() => { svc.endSession(); }).not.toThrow();
      expect(svc.getSessionData()).toHaveLength(0);
    });

    it("persists sessions to localStorage", async () => {
      const svc = await loadFresh();
      svc.startSession();
      vi.advanceTimersByTime(1_000);
      svc.endSession();

      const stored = localStorage.getItem("pomodoro_sessions");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as unknown[];
      expect(parsed).toHaveLength(1);
    });

    it("rehydrates sessions from localStorage on import", async () => {
      const seed = [
        {
          id: 7,
          startTime: new Date("2026-04-15T09:00:00Z").toISOString(),
          endTime: new Date("2026-04-15T09:25:00Z").toISOString(),
          duration: 25 * 60 * 1000,
        },
      ];
      localStorage.setItem("pomodoro_sessions", JSON.stringify(seed));

      const svc = await loadFresh();
      const data = svc.getSessionData();
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(7);
      expect(data[0].startTime).toBeInstanceOf(Date);
      expect(data[0].endTime).toBeInstanceOf(Date);
      expect(data[0].duration).toBe(25 * 60 * 1000);
    });

    it("continues the id sequence from the last stored session", async () => {
      localStorage.setItem(
        "pomodoro_sessions",
        JSON.stringify([
          {
            id: 42,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 1000,
          },
        ])
      );

      const svc = await loadFresh();
      const newId = svc.startSession();
      expect(newId).toBe(43);
    });

    it("recovers gracefully from corrupt localStorage", async () => {
      localStorage.setItem("pomodoro_sessions", "{not valid json");
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const svc = await loadFresh();
      expect(svc.getSessionData()).toEqual([]);
      errSpy.mockRestore();
    });
  });

  describe("getDailyStats", () => {
    it("returns empty array when no sessions exist", async () => {
      const svc = await loadFresh();
      expect(svc.getDailyStats()).toEqual([]);
    });

    it("buckets completed sessions into the correct day", async () => {
      const svc = await loadFresh();
      svc.startSession();
      vi.advanceTimersByTime(1000);
      svc.endSession();
      vi.advanceTimersByTime(5000);
      svc.startSession();
      vi.advanceTimersByTime(3000);
      svc.endSession();

      const stats = svc.getDailyStats(7);
      expect(stats).toHaveLength(7);

      const today = stats.find((s) => s.date === "2026-04-15");
      expect(today).toBeDefined();
      expect(today!.count).toBe(2);
      expect(today!.totalDuration).toBe(4000);
      expect(today!.averageDuration).toBe(2000);
    });

    it("leaves days without sessions at zero", async () => {
      const svc = await loadFresh();
      svc.startSession();
      vi.advanceTimersByTime(1000);
      svc.endSession();

      const stats = svc.getDailyStats(7);
      const empty = stats.filter((s) => s.count === 0);
      expect(empty).toHaveLength(6);
      empty.forEach((s) => {
        expect(s.totalDuration).toBe(0);
        expect(s.averageDuration).toBe(0);
      });
    });
  });

  describe("getSessionDurationChart", () => {
    it("returns empty arrays with no sessions", async () => {
      const svc = await loadFresh();
      const chart = svc.getSessionDurationChart();
      expect(chart).toEqual({ labels: [], values: [] });
    });

    it("returns labels and values for the last N sessions", async () => {
      const svc = await loadFresh();
      for (let i = 0; i < 12; i++) {
        svc.startSession();
        vi.advanceTimersByTime((i + 1) * 1000);
        svc.endSession();
      }

      const chart = svc.getSessionDurationChart(10);
      expect(chart.labels).toHaveLength(10);
      expect(chart.values).toHaveLength(10);
      // Last 10 sessions had durations 3000..12000
      expect(chart.values[0]).toBe(3000);
      expect(chart.values[9]).toBe(12000);
      expect(chart.labels[0]).toBe("Session 1");
    });
  });

  describe("getDailySessionCountChart / getDailyAverageDurationChart", () => {
    it("produces human-readable date labels and aligned values", async () => {
      const svc = await loadFresh();
      svc.startSession();
      vi.advanceTimersByTime(60_000);
      svc.endSession();

      const count = svc.getDailySessionCountChart(7);
      const avg = svc.getDailyAverageDurationChart(7);

      expect(count.labels).toHaveLength(7);
      expect(avg.labels).toHaveLength(7);
      expect(count.labels).toEqual(avg.labels);

      const todayIndex = count.values.findIndex((v) => v > 0);
      expect(todayIndex).toBeGreaterThanOrEqual(0);
      expect(count.values[todayIndex]).toBe(1);
      expect(avg.values[todayIndex]).toBe(60_000);
    });
  });

  describe("getSessionTimeDistribution", () => {
    it("returns empty when no completed sessions exist", async () => {
      const svc = await loadFresh();
      expect(svc.getSessionTimeDistribution()).toEqual({
        labels: [],
        values: [],
      });
    });

    it("counts sessions by end-hour (0-23)", async () => {
      const svc = await loadFresh();
      // 10:00 UTC + 30s = still in the 10:00 UTC hour
      svc.startSession();
      vi.advanceTimersByTime(30_000);
      svc.endSession();

      const dist = svc.getSessionTimeDistribution();
      expect(dist.labels).toHaveLength(24);
      expect(dist.values).toHaveLength(24);
      // Use the session's locally-interpreted end hour so the test doesn't
      // depend on the runner's timezone.
      const endHour = svc.getSessionData()[0].endTime!.getHours();
      expect(dist.values[endHour]).toBe(1);
      expect(dist.values.reduce((a, b) => a + b, 0)).toBe(1);
    });
  });
});
