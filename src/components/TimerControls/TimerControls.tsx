import React from "react";
import "./TimerControls.css";
import { useTimer, TimerState, TimerType } from "../../context/TimerContext";

const PlayIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M2.5 1.5 L10 6 L2.5 10.5 Z" fill="currentColor" />
  </svg>
);

const PauseIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <rect x="2.5" y="1.5" width="2.5" height="9" fill="currentColor" />
    <rect x="7" y="1.5" width="2.5" height="9" fill="currentColor" />
  </svg>
);

const ResetIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
  >
    <path d="M10 6 a4 4 0 1 1 -1.2 -2.8" />
    <path d="M10 1.5 V4 H7.5" />
  </svg>
);

const SkipIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <path d="M2 1.5 L8 6 L2 10.5 Z" fill="currentColor" />
    <rect x="8.5" y="1.5" width="1.5" height="9" fill="currentColor" />
  </svg>
);

const TimerControls: React.FC = () => {
  const { timerControl, handleReset, timerState, timerType, switchToBreak, switchToSession } =
    useTimer();

  const running = timerState === TimerState.Running;

  const handleSkip = () => {
    if (timerType === TimerType.Session) {
      switchToBreak();
    } else {
      switchToSession();
    }
  };

  return (
    <div id="timer-control">
      <button
        type="button"
        id="start_stop"
        className="btn primary timer-button"
        onClick={timerControl}
      >
        {running ? (
          <>
            <PauseIcon />
            Pause
          </>
        ) : (
          <>
            <PlayIcon />
            {timerType === TimerType.Session ? "Start focus" : "Start"}
          </>
        )}
        <span className="kbd" style={{ marginLeft: 8 }}>
          Space
        </span>
      </button>
      <button type="button" id="reset" className="btn timer-button" onClick={handleReset}>
        <ResetIcon />
        Reset
        <span className="kbd">R</span>
      </button>
      <button
        type="button"
        className="btn ghost timer-button"
        onClick={handleSkip}
        aria-label="Skip to next segment"
      >
        <SkipIcon />
        Skip
      </button>
    </div>
  );
};

export default TimerControls;
