import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeMode, getThemePreference } from "../styles/theme";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize theme state with a valid value
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const preference = getThemePreference();
    // Ensure we have a valid theme value
    return preference === "light" || preference === "dark"
      ? preference
      : "light";
  });

  // Apply theme whenever it changes
  useEffect(() => {
    console.log("Theme changed to:", theme);
    // Ensure theme is a valid value before applying
    const validTheme: ThemeMode =
      theme === "light" || theme === "dark" ? theme : "light";
    document.documentElement.setAttribute("data-theme", validTheme);
    localStorage.setItem("theme", validTheme);
  }, [theme]);

  // Apply theme on mount to ensure consistency
  useEffect(() => {
    const validTheme: ThemeMode =
      theme === "light" || theme === "dark" ? theme : "light";
    document.documentElement.setAttribute("data-theme", validTheme);
  }, []);

  const toggleTheme = () => {
    console.log("Toggle theme called, current theme:", theme);
    setTheme((prevTheme) => {
      // Ensure we're toggling from a valid state
      const currentTheme =
        prevTheme === "light" || prevTheme === "dark" ? prevTheme : "light";
      const newTheme = currentTheme === "light" ? "dark" : "light";
      console.log("Setting theme to:", newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
