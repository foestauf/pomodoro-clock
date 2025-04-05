import React from "react";
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

  return (
    <div className="timer-controls-container">
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
      <div id="session-label">
        <TimerLengthControl
          titleID="session-label"
          minID="session-decrement"
          addID="session-increment"
          lengthID="session-length"
          title="Session Length"
          onClick={setSessionLength}
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
          onClick={setLongBreakLength}
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
          onClick={setSessionsBeforeLongBreak}
          length={sessionsBeforeLongBreak}
        />
      </div>
    </div>
  );
};

export default TimerLengthSettings;
