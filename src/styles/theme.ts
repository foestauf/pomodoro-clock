export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  "app-bg": string;
  "app-sidebar": string;
  "app-text": string;
  "app-accent": string;
  "app-break": string;
  "app-session": string;
}

export interface Theme {
  light: ThemeColors;
  dark: ThemeColors;
}

export const theme: Theme = {
  light: {
    "app-bg": "#ffffff",
    "app-sidebar": "#f4f4f5",
    "app-text": "#18181b",
    "app-accent": "#3b82f6",
    "app-break": "#FF9800",
    "app-session": "#4CAF50",
  },
  dark: {
    "app-bg": "#24292e",
    "app-sidebar": "#2d3339",
    "app-text": "rgb(214, 216, 218)",
    "app-accent": "#3b82f6",
    "app-break": "#FF9800",
    "app-session": "#4CAF50",
  },
};

export const getThemePreference = (): ThemeMode => {
  try {
    const savedTheme = localStorage.getItem("theme");
    // Validate the saved theme
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch (error) {
    // In case of any errors (e.g., localStorage not available)
    console.error("Error getting theme preference:", error);
    return "light"; // Default fallback
  }
};
