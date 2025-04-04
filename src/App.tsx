import { useRef, useState, useEffect, useCallback } from "react";
import "./App.css";
import "font-awesome/css/font-awesome.min.css";
import TimerLengthControl from "./components/TimerLengthControl";
import Clock from "./components/Clock";
import CircularProgress from "./components/CircularProgress";
import AnalyticsSidebar from "./components/AnalyticsSidebar";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./contexts/ThemeContext";
import { startSession, endSession } from "./services/analyticsService";

enum TimerState {
  Stopped = "stopped",
  Running = "running",
}

enum TimerType {
  Session = "Session",
  Break = "Break",
}

function AppContent() {
  const [timer, setTimer] = useState(25 * 60);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Stopped);
  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [timerType, setTimerType] = useState<TimerType>(TimerType.Session);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalID = useRef<number | null>(null);
  const audioBeep = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const switchTimer = () => {
      if (timerType === TimerType.Session) {
        setTimerType(TimerType.Break);
        setTimer(breakLength * 60);
      } else {
        setTimerType(TimerType.Session);
        setTimer(sessionLength * 60);
      }
    };
    if (timer < 0) {
      audioBeep.current?.play();
      switchTimer();
    }
  }, [breakLength, sessionLength, timer, timerType]);

  function clockify(): string {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${formatWithLeadingZero(minutes)}:${formatWithLeadingZero(
      seconds
    )}`;
  }

  useEffect(() => {
    if (timerType === TimerType.Session) {
      setTimer(sessionLength * 60);
    }
  }, [sessionLength, timerType]);

  function formatWithLeadingZero(num: number): string {
    return num < 10 ? "0" + num : num.toString();
  }

  const handleReset = useCallback(() => {
    clearInterval(intervalID.current!);
    intervalID.current = null;
    setTimer(25 * 60);
    setBreakLength(5);
    setSessionLength(25);
    setTimerState(TimerState.Stopped);
    setTimerType(TimerType.Session);
    audioBeep.current?.pause();
    if (audioBeep.current) audioBeep.current.currentTime = 0;

    if (timerState === TimerState.Running) {
      endSession();
      setSessionCount((prev) => prev + 1);
    }
  }, [timerState]);

  const timerControl = useCallback(() => {
    if (timerState === TimerState.Stopped) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      intervalID.current = countdown;
      setTimerState(TimerState.Running);
      startSession();
    } else {
      clearInterval(intervalID.current!);
      intervalID.current = null;
      setTimerState(TimerState.Stopped);
      endSession();
      setSessionCount((prev) => prev + 1);
    }
  }, [timerState]);

  const switchToBreak = useCallback(() => {
    if (timerType === TimerType.Session) {
      clearInterval(intervalID.current!);
      intervalID.current = null;
      setTimerState(TimerState.Stopped);
      setTimerType(TimerType.Break);
      setTimer(breakLength * 60);
    }
  }, [timerType, breakLength]);

  const switchToSession = useCallback(() => {
    if (timerType === TimerType.Break) {
      clearInterval(intervalID.current!);
      intervalID.current = null;
      setTimerState(TimerState.Stopped);
      setTimerType(TimerType.Session);
      setTimer(sessionLength * 60);
    }
  }, [timerType, sessionLength]);

  const controlIcon = () =>
    timerState === TimerState.Stopped
      ? "fa fa-play fa-2x"
      : "fa fa-pause fa-2x";

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          timerControl();
          break;
        case "r":
          handleReset();
          break;
        case "b":
          switchToBreak();
          break;
        case "s":
          switchToSession();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [timerControl, handleReset, switchToBreak, switchToSession]);

  return (
    <div className="App">
      <div className="app-container">
        <ThemeToggle />
        <AnalyticsSidebar key={sessionCount} />
        <div className="main-content">
          <div>Current Time</div>
          <div id="current-time" className="clock-face">
            <Clock />
          </div>
          <div id="main-display">
            <div id="crunc-supreme-wrapper">
              <div id="time-label">
                <h1>{timerType}</h1>
              </div>

              <div id="timer-wrapper">
                <div className="progress-container">
                  <CircularProgress
                    progress={timer}
                    total={
                      timerType === TimerType.Session
                        ? sessionLength * 60
                        : breakLength * 60
                    }
                    color={
                      timerType === TimerType.Session
                        ? "var(--app-session)"
                        : "var(--app-break)"
                    }
                  />
                  <div id="time-left" className="clock-face">
                    {clockify()}
                  </div>
                </div>

                <div id="break-label">
                  <TimerLengthControl
                    titleID="break-label"
                    minID="break-decrement"
                    addID="break-increment"
                    lengthID="break-length"
                    title="Break Length"
                    onClick={setBreakLength}
                    length={breakLength}
                  />
                </div>

                <TimerLengthControl
                  titleID="session-label"
                  minID="session-decrement"
                  addID="session-increment"
                  lengthID="session-length"
                  title="Session Length"
                  onClick={setSessionLength}
                  length={sessionLength}
                />

                <audio
                  id="beep"
                  preload="auto"
                  src="https://goo.gl/65cBl1"
                  ref={audioBeep}
                />
              </div>
              <div id="timer-control">
                <button
                  id="start_stop"
                  className="timer-button"
                  onClick={timerControl}
                >
                  <i className={controlIcon()} />
                </button>
                <button
                  id="reset"
                  className="timer-button"
                  onClick={handleReset}
                >
                  <i className="fa fa-refresh fa-2x" />
                </button>
              </div>
              <div className="keyboard-shortcuts">
                <p>Keyboard Shortcuts:</p>
                <ul>
                  <li>Space - Start/Stop</li>
                  <li>R - Reset</li>
                  <li>B - Switch to Break</li>
                  <li>S - Switch to Session</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
