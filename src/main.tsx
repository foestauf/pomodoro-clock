import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Get the root element and ensure it exists before rendering
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
