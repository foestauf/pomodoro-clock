import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { initializeTelemetry, trackAppEvent } from "./services/telemetryService";

// Initialize OpenTelemetry telemetry
initializeTelemetry();

// Track app load event
trackAppEvent('app_loaded', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  viewport: `${window.innerWidth.toString()}x${window.innerHeight.toString()}`,
});

// Get the root element and ensure it exists before rendering
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}

// Track app unload event
window.addEventListener('beforeunload', () => {
  trackAppEvent('app_unloaded', {
    timestamp: new Date().toISOString(),
  });
});

// Track focus/blur events
window.addEventListener('focus', () => {
  trackAppEvent('tab_focus', {
    timestamp: new Date().toISOString(),
  });
});

window.addEventListener('blur', () => {
  trackAppEvent('tab_blur', {
    timestamp: new Date().toISOString(),
  });
});
