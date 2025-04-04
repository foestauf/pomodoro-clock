import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  // Ensure we have a valid theme value for rendering
  const currentTheme = theme === "light" || theme === "dark" ? theme : "light";

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        padding: "12px",
        borderRadius: "50%",
        backgroundColor: currentTheme === "light" ? "#2d3339" : "#f4f4f5",
        color: currentTheme === "light" ? "#f4f4f5" : "#2d3339",
        zIndex: 9999,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
      }}
      aria-label={`Switch to ${
        currentTheme === "light" ? "dark" : "light"
      } mode`}
    >
      {currentTheme === "light" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
