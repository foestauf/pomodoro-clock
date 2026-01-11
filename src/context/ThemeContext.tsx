import { createContext, use, useEffect, useMemo, useState } from "react";
import { ThemeMode, getThemePreference } from "../styles/theme";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to validate theme value
const validateTheme = (theme: string): ThemeMode => {
  return theme === "light" || theme === "dark" ? theme : "light";
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize theme state with a valid value
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const preference = getThemePreference();
    return validateTheme(preference);
  });

  // Apply theme whenever it changes
  useEffect(() => {
    console.log("Theme changed to:", theme);
    const validTheme = validateTheme(theme);
    document.documentElement.setAttribute("data-theme", validTheme);
    localStorage.setItem("theme", validTheme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const currentTheme = validateTheme(prevTheme);
      return currentTheme === "light" ? "dark" : "light";
    });
  };

  const contextValue = useMemo(
    () => ({ theme, toggleTheme }),
    [theme]
  );

  return (
    <ThemeContext value={contextValue}>
      {children}
    </ThemeContext>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
