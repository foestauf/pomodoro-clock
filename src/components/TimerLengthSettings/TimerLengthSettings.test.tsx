import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import TimerLengthSettings from "./TimerLengthSettings";
import { renderWithProviders, $el } from "../../test-utils";

describe("TimerLengthSettings", () => {
  it("renders default session and break lengths", () => {
    renderWithProviders(<TimerLengthSettings />, { providers: ["timer"] });
    expect($el("#session-length")).toHaveTextContent("25");
    expect($el("#break-length")).toHaveTextContent("5");
  });

  it("decrements session length by one", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TimerLengthSettings />, { providers: ["timer"] });

    await user.click($el("#session-decrement"));
    expect($el("#session-length")).toHaveTextContent("24");
  });

  it("increments session length by one", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TimerLengthSettings />, { providers: ["timer"] });

    await user.click($el("#session-increment"));
    expect($el("#session-length")).toHaveTextContent("26");
  });

  it("decrements break length by one", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TimerLengthSettings />, { providers: ["timer"] });

    await user.click($el("#break-decrement"));
    expect($el("#break-length")).toHaveTextContent("4");
  });

  it("increments break length by one", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TimerLengthSettings />, { providers: ["timer"] });

    await user.click($el("#break-increment"));
    expect($el("#break-length")).toHaveTextContent("6");
  });
});
