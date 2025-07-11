import React from "react";
import "./TimerControls.css";
import { useTimer } from "../../context/TimerContext";
import { trackUserInteraction } from "../../services/telemetryService";

const TimerControls: React.FC = () => {
  const { timerControl, handleReset, controlIcon, timerState, timerType } = useTimer();

  const handleTimerControl = () => {
    trackUserInteraction('timer_control', 'start_stop_button', `${timerState}_${timerType}`);
    timerControl();
  };

  const handleResetClick = () => {
    trackUserInteraction('timer_reset', 'reset_button', timerType);
    handleReset();
  };

  return (
    <div id="timer-control">
      <button id="start_stop" className="timer-button" onClick={handleTimerControl}>
        <i className={controlIcon()} />
      </button>
      <button id="reset" className="timer-button" onClick={handleResetClick}>
        <i className="fa fa-refresh fa-2x" />
      </button>
    </div>
  );
};

export default TimerControls;
