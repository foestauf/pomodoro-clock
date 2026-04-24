import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnalyticsSidebar from "./AnalyticsSidebar";
import { renderWithProviders } from "../test-utils";

describe("AnalyticsSidebar", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows zero totals when there is no session data", () => {
    renderWithProviders(<AnalyticsSidebar />, { providers: [] });

    const stats = document.querySelectorAll(".summary-stats p");
    expect(stats[0]).toHaveTextContent("0");
    expect(stats[1]).toHaveTextContent("0 min");
  });

  it("shows the empty state message when there is no data", () => {
    renderWithProviders(<AnalyticsSidebar />, { providers: [] });

    expect(
      screen.getByText(/no completed sessions available/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/start and complete a session to see analytics/i)
    ).toBeInTheDocument();
  });

  it("starts on the Daily tab", () => {
    renderWithProviders(<AnalyticsSidebar />, { providers: [] });

    const dailyTab = screen.getByTestId("daily-tab");
    const sessionsTab = screen.getByTestId("sessions-tab");
    expect(dailyTab.className).toMatch(/active/);
    expect(sessionsTab.className).not.toMatch(/active/);
  });

  it("switches to the Sessions tab on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnalyticsSidebar />, { providers: [] });

    await user.click(screen.getByTestId("sessions-tab"));

    expect(screen.getByTestId("sessions-tab").className).toMatch(/active/);
    expect(screen.getByTestId("daily-tab").className).not.toMatch(/active/);
  });
});
