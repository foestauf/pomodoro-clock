import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// JSDOM doesn't implement HTMLMediaElement methods; the app pokes audioBeep
// on reset and session completion, so stub them out to avoid noisy warnings.
Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});
Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: vi.fn(),
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
