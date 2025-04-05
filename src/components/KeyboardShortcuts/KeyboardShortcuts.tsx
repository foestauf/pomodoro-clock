import React, { useEffect } from "react";
import "./KeyboardShortcuts.css";
import { useTimer } from "../../context/TimerContext";

const KeyboardShortcuts: React.FC = () => {
  const { timerControl, handleReset, switchToBreak, switchToSession } =
    useTimer();

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
    return () => { window.removeEventListener("keydown", handleKeyPress); };
  }, [timerControl, handleReset, switchToBreak, switchToSession]);

  return (
    <div className="keyboard-shortcuts">
      <p>Keyboard Shortcuts:</p>
      <ul>
        <li>Space - Start/Stop</li>
        <li>R - Reset</li>
        <li>B - Switch to Break</li>
        <li>S - Switch to Session</li>
      </ul>
    </div>
  );
};

export default KeyboardShortcuts;
