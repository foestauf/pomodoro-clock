import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { TimerProvider } from "./context/TimerContext";
import { ThemeProvider } from "./context/ThemeContext";

type Providers = "timer" | "theme";

interface Options extends Omit<RenderOptions, "wrapper"> {
  providers?: readonly Providers[];
}

export function renderWithProviders(
  ui: ReactElement,
  { providers = ["timer", "theme"], ...options }: Options = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    let tree = children;
    if (providers.includes("theme")) {
      tree = <ThemeProvider>{tree}</ThemeProvider>;
    }
    if (providers.includes("timer")) {
      tree = <TimerProvider>{tree}</TimerProvider>;
    }
    return <>{tree}</>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

/** Strict querySelector — throws if no element matches, returning a narrowed
 * HTMLElement so callers don't need a non-null assertion. */
export function $el(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`No element matches selector: ${selector}`);
  return el;
}
