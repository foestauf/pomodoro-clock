import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { renderWithProviders } from "../../test-utils";

describe("KeyboardShortcuts", () => {
  it("lists every supported shortcut", () => {
    renderWithProviders(<KeyboardShortcuts />, { providers: ["timer"] });

    expect(screen.getByText("Space - Start/Stop")).toBeInTheDocument();
    expect(screen.getByText("R - Reset")).toBeInTheDocument();
    expect(screen.getByText("B - Switch to Break")).toBeInTheDocument();
    expect(screen.getByText("S - Switch to Session")).toBeInTheDocument();
  });
});
