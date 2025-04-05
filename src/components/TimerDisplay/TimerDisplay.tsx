import React from "react";
import "./TimerDisplay.css";
import CircularProgress from "../CircularProgress";
import { useTimer, TimerType } from "../../context/TimerContext";

const TimerDisplay: React.FC = () => {
  const {
    timerType,
    clockify,
    sessionLength,
    breakLength,
    longBreakLength,
    timer,
  } = useTimer();

  const alarmColor = { color: "white" };

  return (
    <div>
      <div id="time-label" style={alarmColor}>
        <h2>{timerType === TimerType.LongBreak ? "Long Break" : timerType}</h2>
      </div>
      <div className="progress-container mobile-visible">
        <CircularProgress
          progress={timer}
          total={
            timerType === TimerType.Session
              ? sessionLength * 60
              : timerType === TimerType.Break
              ? breakLength * 60
              : longBreakLength * 60
          }
          color={
            timerType === TimerType.Session
              ? "#4CAF50"
              : timerType === TimerType.Break
              ? "#FF9800"
              : "#2196F3"
          }
        />
        <div id="time-left" className="clock-face">
          {clockify()}
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
