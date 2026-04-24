import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "./ThemeToggle";
import { renderWithProviders } from "../test-utils";

describe("ThemeToggle", () => {
  it("starts in light mode and shows the moon icon", () => {
    renderWithProviders(<ThemeToggle />, { providers: ["theme"] });

    const button = screen.getByRole("button", { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();
    // Moon icon path fragment
    expect(button.querySelector("path")?.getAttribute("d")).toMatch(
      /M20\.354 15\.354/
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("toggles to dark mode and shows the sun icon", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />, { providers: ["theme"] });

    await user.click(
      screen.getByRole("button", { name: /switch to light mode/i })
    );

    const button = screen.getByRole("button", { name: /switch to dark mode/i });
    expect(button.querySelector("path")?.getAttribute("d")).toMatch(
      /M12 3v1m0 16v1/
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("persists theme preference to localStorage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />, { providers: ["theme"] });

    await user.click(
      screen.getByRole("button", { name: /switch to light mode/i })
    );
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("restores theme from localStorage on mount", () => {
    localStorage.setItem("theme", "dark");
    renderWithProviders(<ThemeToggle />, { providers: ["theme"] });

    expect(
      screen.getByRole("button", { name: /switch to dark mode/i })
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});
