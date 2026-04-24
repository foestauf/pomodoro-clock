import React from "react";
import "./TimerLengthSettings.css";
import { useTimer } from "../../context/TimerContext";

interface LenCardProps {
  label: string;
  valueId: string;
  decId: string;
  incId: string;
  value: number;
  unit?: string;
  min?: number;
  max?: number;
  onStep: (dir: 1 | -1) => void;
}

const LenCard: React.FC<LenCardProps> = ({
  label,
  valueId,
  decId,
  incId,
  value,
  unit = "min",
  min = 1,
  max = 90,
  onStep,
}) => {
  const canDec = value > min;
  const canInc = value < max;
  return (
    <div className="len">
      <div className="len-l">{label}</div>
      <div className="len-v">
        <span id={valueId}>{value}</span>
        <span className="u">{unit}</span>
      </div>
      <div className="len-ctrls">
        <button
          type="button"
          id={decId}
          className="step"
          onClick={() => {
            onStep(-1);
          }}
          disabled={!canDec}
          aria-label={`decrease ${label.toLowerCase()} length`}
        >
          –
        </button>
        <button
          type="button"
          id={incId}
          className="step"
          onClick={() => {
            onStep(1);
          }}
          disabled={!canInc}
          aria-label={`increase ${label.toLowerCase()} length`}
        >
          +
        </button>
      </div>
    </div>
  );
};

const TimerLengthSettings: React.FC = () => {
  const {
    breakLength,
    sessionLength,
    longBreakLength,
    sessionsBeforeLongBreak,
    setBreakLength,
    setSessionLength,
    setLongBreakLength,
    setSessionsBeforeLongBreak,
  } = useTimer();

  const step =
    (value: number, setter: (n: number) => void, min: number, max: number) =>
    (dir: 1 | -1) => {
      const next = Math.min(max, Math.max(min, value + dir));
      setter(next);
    };

  return (
    <div className="lens">
      <LenCard
        label="Focus"
        valueId="session-length"
        decId="session-decrement"
        incId="session-increment"
        value={sessionLength}
        onStep={step(sessionLength, setSessionLength, 1, 60)}
      />
      <LenCard
        label="Break"
        valueId="break-length"
        decId="break-decrement"
        incId="break-increment"
        value={breakLength}
        onStep={step(breakLength, setBreakLength, 1, 30)}
      />
      <LenCard
        label="Long"
        valueId="long-break-length"
        decId="long-break-decrement"
        incId="long-break-increment"
        value={longBreakLength}
        onStep={step(longBreakLength, setLongBreakLength, 1, 60)}
      />
      <LenCard
        label="Cycle"
        valueId="sessions-length"
        decId="sessions-decrement"
        incId="sessions-increment"
        value={sessionsBeforeLongBreak}
        unit="× focus"
        min={2}
        max={10}
        onStep={step(sessionsBeforeLongBreak, setSessionsBeforeLongBreak, 2, 10)}
      />
    </div>
  );
};

export default TimerLengthSettings;
