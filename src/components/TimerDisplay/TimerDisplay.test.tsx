import { describe, it, expect } from "vitest";
import TimerDisplay from "./TimerDisplay";
import { renderWithProviders } from "../../test-utils";

describe("TimerDisplay", () => {
  it("renders the default 25:00 session clock", () => {
    renderWithProviders(<TimerDisplay />, { providers: ["timer"] });
    expect(document.querySelector("#time-left")).toHaveTextContent("25:00");
    expect(document.querySelector("#time-label h2")).toHaveTextContent(
      "Session"
    );
  });
});
