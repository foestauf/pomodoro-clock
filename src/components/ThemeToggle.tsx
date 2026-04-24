import React from "react";
import { useTheme } from "../context/ThemeContext";
import MoonIcon from "./MoonIcon/MoonIcon";
import SunIcon from "./SunIcon/SunIcon";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="icon-btn theme-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme} mode`}
      title={`Switch to ${theme} mode`}
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

export default ThemeToggle;
