import React from "react";
import "./App.css";
import "font-awesome/css/font-awesome.min.css";
import Clock from "./components/Clock";
import AnalyticsSidebar from "./components/AnalyticsSidebar";
import TimerDisplay from "./components/TimerDisplay/TimerDisplay";
import TimerControls from "./components/TimerControls/TimerControls";
import TimerLengthSettings from "./components/TimerLengthSettings/TimerLengthSettings";
import KeyboardShortcuts from "./components/KeyboardShortcuts/KeyboardShortcuts";
import { TimerProvider, useTimer } from "./context/TimerContext";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./context/ThemeContext";

const AppContent: React.FC = () => {
  const { sessionCount, audioBeep } = useTimer();

  return (
    <div className="App">
      <div className="app-container">
        <ThemeProvider>
          <ThemeToggle />
          <AnalyticsSidebar key={sessionCount} />
          <div className="main-content">
            <div className="mobile-layout">
              <h1 className="page-title">Pomodoro Clock</h1>

              <TimerDisplay />

              <div className="current-time-container">
                <div>Current Time</div>
                <div id="current-time" className="clock-face">
                  <Clock />
                </div>
              </div>

              <TimerControls />
              <TimerLengthSettings />

              <audio
                id="beep"
                preload="auto"
                src="https://goo.gl/65cBl1"
                ref={audioBeep}
              />

              <KeyboardShortcuts />
            </div>
          </div>
        </ThemeProvider>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TimerProvider>
      <AppContent />
    </TimerProvider>
  );
};

export default App;
