import React from "react";
import "./TimerControls.css";
import { useTimer } from "../../context/TimerContext";

const TimerControls: React.FC = () => {
  const { timerControl, handleReset, controlIcon } = useTimer();

  return (
    <div id="timer-control">
      <button id="start_stop" className="timer-button" onClick={timerControl}>
        <i className={controlIcon()} />
      </button>
      <button id="reset" className="timer-button" onClick={handleReset}>
        <i className="fa fa-refresh fa-2x" />
      </button>
    </div>
  );
};

export default TimerControls;
