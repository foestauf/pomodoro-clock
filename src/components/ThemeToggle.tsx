import React from "react";
import { useTheme } from "../context/ThemeContext";
import MoonIcon from "./MoonIcon/MoonIcon";
import SunIcon from "./SunIcon/SunIcon";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const buttonStyles = {
    position: "fixed",
    top: "16px",
    right: "16px",
    padding: "12px",
    borderRadius: "50%",
    backgroundColor: theme === "light" ? "#2d3339" : "#f4f4f5",
    color: theme === "light" ? "#f4f4f5" : "#2d3339",
    zIndex: 9999,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  } as React.CSSProperties;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      style={buttonStyles}
      aria-label={`Switch to ${theme} mode`}
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

export default ThemeToggle;
