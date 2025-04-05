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

  // Define mappings for timer durations and colors
  const timerDurations = {
    [TimerType.Session]: sessionLength * 60,
    [TimerType.Break]: breakLength * 60,
    [TimerType.LongBreak]: longBreakLength * 60,
  };

  const timerColors = {
    [TimerType.Session]: "#4CAF50", // Green
    [TimerType.Break]: "#FF9800", // Orange
    [TimerType.LongBreak]: "#2196F3", // Blue
  };

  return (
    <div>
      <div id="time-label" style={alarmColor}>
        <h2>{timerType === TimerType.LongBreak ? "Long Break" : timerType}</h2>
      </div>
      <div className="progress-container mobile-visible">
        <CircularProgress
          progress={timer}
          total={timerDurations[timerType]}
          color={timerColors[timerType]}
        />
        <div id="time-left" className="clock-face">
          {clockify()}
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
