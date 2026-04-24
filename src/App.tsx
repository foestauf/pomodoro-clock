import React from "react";
import "./App.css";
import AnalyticsSidebar from "./components/AnalyticsSidebar";
import TimerDisplay from "./components/TimerDisplay/TimerDisplay";
import TimerControls from "./components/TimerControls/TimerControls";
import TimerLengthSettings from "./components/TimerLengthSettings/TimerLengthSettings";
import KeyboardShortcuts from "./components/KeyboardShortcuts/KeyboardShortcuts";
import ThemeToggle from "./components/ThemeToggle";
import {
  TimerProvider,
  TimerState,
  TimerType,
  useTimer,
} from "./context/TimerContext";
import { ThemeProvider } from "./context/ThemeContext";

type SequenceNode = {
  kind: "session" | "break" | "long";
  done: boolean;
  current: boolean;
};

const buildSequence = (
  cycleSize: number,
  completed: number,
  mode: TimerType
): SequenceNode[] => {
  const seq: SequenceNode[] = [];
  const safeCycle = Math.max(2, cycleSize);

  for (let i = 0; i < safeCycle; i++) {
    const done = i < completed;
    const current = !done && mode === TimerType.Session && i === completed;
    seq.push({ kind: "session", done, current });

    if (i < safeCycle - 1) {
      seq.push({
        kind: "break",
        done: i < completed - 1,
        current: !done && mode === TimerType.Break && i === completed - 1,
      });
    }
  }

  seq.push({
    kind: "long",
    done: false,
    current: mode === TimerType.LongBreak,
  });

  return seq;
};

const AppContent: React.FC = () => {
  const {
    sessionCount,
    audioBeep,
    timerType,
    timerState,
    switchToSession,
    switchToBreak,
    switchToLongBreak,
    sessionsBeforeLongBreak,
    completedSessionCycleCount,
  } = useTimer();

  const running = timerState === TimerState.Running;
  const mode =
    timerType === TimerType.Break
      ? "break"
      : timerType === TimerType.LongBreak
        ? "long"
        : "session";

  const sequence = buildSequence(
    sessionsBeforeLongBreak,
    completedSessionCycleCount,
    timerType
  );

  const [task, setTask] = React.useState<string>(() => {
    return localStorage.getItem("currentTask") ?? "";
  });

  React.useEffect(() => {
    localStorage.setItem("currentTask", task);
  }, [task]);

  return (
    <div
      className={`App is-${mode} ${running ? "is-running" : "is-paused"}`}
    >
      <div className="app-container">
        <AnalyticsSidebar key={sessionCount} />

        <main className="main-content">
          <div className="topbar">
            <div className="mode-switch" role="tablist" aria-label="Timer mode">
              <button
                type="button"
                role="tab"
                aria-selected={timerType === TimerType.Session}
                className={timerType === TimerType.Session ? "on" : ""}
                onClick={switchToSession}
              >
                <span>Focus</span>
                <span className="ix">S</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={timerType === TimerType.Break}
                className={timerType === TimerType.Break ? "on" : ""}
                onClick={switchToBreak}
              >
                <span>Short Break</span>
                <span className="ix">B</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={timerType === TimerType.LongBreak}
                className={timerType === TimerType.LongBreak ? "on" : ""}
                onClick={switchToLongBreak}
              >
                <span>Long Break</span>
                <span className="ix">L</span>
              </button>
            </div>

            <div className="top-tools">
              <span className="kbd-hint">
                <span className="kbd">Space</span> start/pause ·{" "}
                <span className="kbd">R</span> reset
              </span>
              <ThemeToggle />
            </div>
          </div>

          <div className="timer-wrap">
            <TimerDisplay />

            <aside className="panel" aria-label="Session settings">
              <section>
                <h3>Current task</h3>
                <div className="task">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => {
                      setTask(e.target.value);
                    }}
                    placeholder="What are you focusing on?"
                    aria-label="Current task"
                  />
                  <div className="task-row">
                    <span>
                      Pomodoro #{completedSessionCycleCount + 1} of{" "}
                      {sessionsBeforeLongBreak}
                    </span>
                    <span className="pips" aria-hidden="true">
                      {Array.from({ length: sessionsBeforeLongBreak }).map(
                        (_, i) => {
                          const done = i < completedSessionCycleCount;
                          const current =
                            !done &&
                            i === completedSessionCycleCount &&
                            timerType === TimerType.Session;
                          return (
                            <span
                              key={i}
                              className={`pip ${done ? "done" : ""} ${current ? "current" : ""}`}
                            />
                          );
                        }
                      )}
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <h3>Lengths</h3>
                <TimerLengthSettings />
              </section>
            </aside>
          </div>

          <div className="controls">
            <TimerControls />
            <div className="footer" aria-label="Cycle progress">
              <div className="seq" aria-hidden="true">
                {sequence.map((n, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="seq-sep">→</span>}
                    <span
                      className={`seq-node ${n.kind}`}
                      title={`${n.kind}${n.current ? " (current)" : n.done ? " (done)" : ""}`}
                    >
                      <span
                        className="sq"
                        style={{
                          opacity: n.done || n.current ? 1 : 0.35,
                        }}
                      />
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <audio
            id="beep"
            preload="auto"
            src="https://goo.gl/65cBl1"
            ref={audioBeep}
          />

          <KeyboardShortcuts />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TimerProvider>
        <AppContent />
      </TimerProvider>
    </ThemeProvider>
  );
};

export default App;
