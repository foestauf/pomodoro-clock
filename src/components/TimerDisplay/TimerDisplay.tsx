import React from "react";
import "./TimerDisplay.css";
import { useTimer, TimerState, TimerType } from "../../context/TimerContext";

const RING_SIZE = 420;
const TICK_COUNT = 60;

const modeClass = (type: TimerType): string => {
  if (type === TimerType.Break) return "mode-break";
  if (type === TimerType.LongBreak) return "mode-long";
  return "mode-session";
};

const modeLabel = (type: TimerType): string => {
  if (type === TimerType.LongBreak) return "Long Break";
  if (type === TimerType.Break) return "Short Break";
  return "Focus";
};

const Ring: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = RING_SIZE / 2 - 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const strokeWidth = 6;

  const ticks: React.ReactElement[] = [];
  for (let i = 0; i < TICK_COUNT; i++) {
    const angle = (i / TICK_COUNT) * Math.PI * 2 - Math.PI / 2;
    const major = i % 5 === 0;
    const r1 = radius + 14;
    const r2 = radius + (major ? 20 : 18);
    const x1 = RING_SIZE / 2 + Math.cos(angle) * r1;
    const y1 = RING_SIZE / 2 + Math.sin(angle) * r1;
    const x2 = RING_SIZE / 2 + Math.cos(angle) * r2;
    const y2 = RING_SIZE / 2 + Math.sin(angle) * r2;
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className={major ? "tick-maj" : "tick"}
        strokeWidth={major ? 1.4 : 0.7}
        strokeLinecap="round"
      />
    );
  }

  return (
    <svg
      className="ring-svg"
      viewBox={`0 0 ${String(RING_SIZE)} ${String(RING_SIZE)}`}
    >
      <g>{ticks}</g>
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={radius}
        className="ring-track"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={radius}
        className="ring-prog"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
};

const TimerDisplay: React.FC = () => {
  const {
    timer,
    timerType,
    timerState,
    sessionLength,
    breakLength,
    longBreakLength,
    clockify,
  } = useTimer();

  const total =
    timerType === TimerType.Session
      ? sessionLength * 60
      : timerType === TimerType.Break
        ? breakLength * 60
        : longBreakLength * 60;

  const safeTotal = total > 0 ? total : 1;
  const elapsed = Math.max(0, safeTotal - timer);
  const progress = Math.min(1, elapsed / safeTotal);
  const percentComplete = Math.round(progress * 100);

  const clock = clockify();
  const [mm, ss] = clock.split(":");

  // Wall-clock "ends at" is an impure read; mirror it into state so render
  // stays pure (react-hooks/purity). set-state-in-effect is intentional here
  // — the effect exists solely to schedule wall-clock samples.
  const [endsAt, setEndsAt] = React.useState<string>("");
  React.useEffect(() => {
    const next =
      timerState === TimerState.Running
        ? new Date(Date.now() + timer * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirror external wall-clock into render state
    setEndsAt(next);
  }, [timer, timerState]);

  return (
    <div className={`ring-holder ${modeClass(timerType)}`}>
      <Ring progress={progress} />
      <div className="ring-center">
        <div id="time-label">
          <h2>{modeLabel(timerType)}</h2>
        </div>
        <div id="time-left" aria-live="polite">
          <span className="digits">{mm}</span>
          <span className="sep" aria-hidden="true">:</span>
          <span className="digits">{ss}</span>
        </div>
        <div className="meta">
          <span>
            <b>{percentComplete}%</b> complete
          </span>
          {timerState === TimerState.Running && (
            <span>
              ends <b>{endsAt}</b>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
