import React, { Dispatch, SetStateAction } from "react";
import "./TimerLengthSettings.css";
import TimerLengthControl from "../TimerLengthControl";
import { useTimer } from "../../context/TimerContext";

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

  // Create wrapper functions that match the expected Dispatch<SetStateAction<number>> type
  const handleBreakLengthChange: Dispatch<SetStateAction<number>> = (value) => {
    const newValue = typeof value === "function" ? value(breakLength) : value;
    setBreakLength(newValue);
  };

  const handleSessionLengthChange: Dispatch<SetStateAction<number>> = (
    value
  ) => {
    const newValue = typeof value === "function" ? value(sessionLength) : value;
    setSessionLength(newValue);
  };

  const handleLongBreakLengthChange: Dispatch<SetStateAction<number>> = (
    value
  ) => {
    const newValue =
      typeof value === "function" ? value(longBreakLength) : value;
    setLongBreakLength(newValue);
  };

  const handleSessionsBeforeLongBreakChange: Dispatch<
    SetStateAction<number>
  > = (value) => {
    const newValue =
      typeof value === "function" ? value(sessionsBeforeLongBreak) : value;
    setSessionsBeforeLongBreak(newValue);
  };

  return (
    <div className="timer-controls-container">
      <div id="break-label">
        <TimerLengthControl
          titleID="break-label"
          minID="break-decrement"
          addID="break-increment"
          lengthID="break-length"
          title="Break Length"
          onClick={handleBreakLengthChange}
          length={breakLength}
        />
      </div>
      <div id="session-label">
        <TimerLengthControl
          titleID="session-label"
          minID="session-decrement"
          addID="session-increment"
          lengthID="session-length"
          title="Session Length"
          onClick={handleSessionLengthChange}
          length={sessionLength}
        />
      </div>
      <div id="long-break-label">
        <TimerLengthControl
          titleID="long-break-label"
          minID="long-break-decrement"
          addID="long-break-increment"
          lengthID="long-break-length"
          title="Long Break Length"
          onClick={handleLongBreakLengthChange}
          length={longBreakLength}
        />
      </div>
      <div id="sessions-label">
        <TimerLengthControl
          titleID="sessions-label"
          minID="sessions-decrement"
          addID="sessions-increment"
          lengthID="sessions-length"
          title="Sessions Before Long Break"
          onClick={handleSessionsBeforeLongBreakChange}
          length={sessionsBeforeLongBreak}
        />
      </div>
    </div>
  );
};

export default TimerLengthSettings;
