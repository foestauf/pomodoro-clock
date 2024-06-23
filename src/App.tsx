import { useRef, useState } from "react";
import "./App.css";
import "font-awesome/css/font-awesome.min.css";
import TimerLengthControl from "./components/TimerLengthControl";
import Clock from "./components/Clock";

function App() {
  const [timer, setTimer] = useState(25 * 60);
  const [timerState, setTimerState] = useState("stopped");
  const [breakLength, setBreakLength] = useState(5);
  const [alarmColor] = useState({ color: "white" });
  const [sessionLength, setSessionLength] = useState(25);
  const [intervalID, setIntervalID] = useState<number | null>(null);
  const [timerType, setTimerType] = useState("Session");
  const audioBeep = useRef<HTMLAudioElement>(null);

  function clockify() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer - minutes * 60;
    return (
      formatWithLeadingZero(minutes) + ":" + formatWithLeadingZero(seconds)
    );
  }

  function formatWithLeadingZero(num: number) {
    return num < 10 ? "0" + num : num.toString();
  }

  const handleReset = () => {
    setTimer(25 * 60);
    setBreakLength(5);
    setSessionLength(25);
    setTimerState("stopped");
    setTimerType("Session");
    clearInterval(intervalID!);
    setIntervalID(null);
    audioBeep.current!.pause();
    audioBeep.current!.currentTime = 0;
  };

  const timerControl = () => {
    if (timerState === "stopped") {
      setTimer(sessionLength * 60);
      startTimer();
      setTimerState("running");
    } else {
      clearInterval(intervalID!);
      setIntervalID(null);
      setTimerState("stopped");
    }
  };

  const startTimer = () => {
    // setTimer((timer) => timer - 1);
    const countdown = setInterval(() => {
      setTimer((timer) => timer - 1);
      if (timer === 0) {
        audioBeep.current!.play();
        switchTimer();
      }
    }, 1000);
    setIntervalID(countdown);
  };

  const switchTimer = () => {
    if (timerType === "Session") {
      setTimer(breakLength * 60);
      setTimerType("Break");
    } else {
      setTimer(sessionLength * 60);
      setTimerType("Session");
    }
  };

  const controlIcon = () =>
    timerState === "stopped" ? "fa fa-play fa-2x" : "fa fa-pause fa-2x";

  return (
    <div className="App">
      <div>Current Time</div>
      <div id="current-time" className="clock-face">
        <Clock />
      </div>
      <div id="main-display">
        <div id="crunc-supreme-wrapper">
          <div id="time-label" style={alarmColor}>
            <h1>{timerType}</h1>
          </div>

          <div id="timer-wrapper">
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
            <div id="time-left" className="clock-face">
              {clockify()}
            </div>
            <TimerLengthControl
              titleID="session-label"
              minID="session-decrement"
              addID="session-increment"
              lengthID="session-length"
              title="Session Length"
              onClick={setSessionLength}
              length={sessionLength}
            />

            <audio
              id="beep"
              preload="auto"
              src="https://goo.gl/65cBl1"
              ref={audioBeep}
            />
          </div>
          <div id="timer-control">
            <button
              id="start_stop"
              className="timer-button"
              onClick={timerControl}
            >
              <i className={controlIcon()} />
            </button>
            <button id="reset" className="timer-button" onClick={handleReset}>
              <i className="fa fa-refresh fa-2x" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
