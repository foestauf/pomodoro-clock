import { useRef, useState, useEffect } from "react";
import "./App.css";
import "font-awesome/css/font-awesome.min.css";
import TimerLengthControl from "./components/TimerLengthControl";
import Clock from "./components/Clock";

enum TimerState {
  Stopped = "stopped",
  Running = "running",
}

enum TimerType {
  Session = "Session",
  Break = "Break",
}

function App() {
  const [timer, setTimer] = useState(25 * 60);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Stopped);
  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [timerType, setTimerType] = useState<TimerType>(TimerType.Session);
  const intervalID = useRef<number | null>(null);
  const audioBeep = useRef<HTMLAudioElement>(null);

  const alarmColor = { color: "white" };

  useEffect(() => {
    const switchTimer = () => {
      if (timerType === TimerType.Session) {
        setTimerType(TimerType.Break);
        setTimer(breakLength * 60);
      } else {
        setTimerType(TimerType.Session);
        setTimer(sessionLength * 60);
      }
    };
    if (timer < 0) {
      audioBeep.current?.play();
      switchTimer();
    }
  }, [breakLength, sessionLength, timer, timerType]);

  function clockify(): string {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${formatWithLeadingZero(minutes)}:${formatWithLeadingZero(
      seconds
    )}`;
  }

  useEffect(() => {
    if (timerType === TimerType.Session) {
      setTimer(sessionLength * 60);
    }
  }, [sessionLength, timerType]);

  function formatWithLeadingZero(num: number): string {
    return num < 10 ? "0" + num : num.toString();
  }

  const handleReset = () => {
    clearInterval(intervalID.current!);
    intervalID.current = null;
    setTimer(sessionLength * 60);
    setBreakLength(5);
    setSessionLength(25);
    setTimerState(TimerState.Stopped);
    setTimerType(TimerType.Session);
    audioBeep.current?.pause();
    if (audioBeep.current) audioBeep.current.currentTime = 0;
  };

  const timerControl = () => {
    if (timerState === TimerState.Stopped) {
      startTimer();
      setTimerState(TimerState.Running);
    } else {
      clearInterval(intervalID.current!);
      intervalID.current = null;
      setTimerState(TimerState.Stopped);
    }
  };

  const startTimer = () => {
    const countdown = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    intervalID.current = countdown;
  };

  const controlIcon = () =>
    timerState === TimerState.Stopped
      ? "fa fa-play fa-2x"
      : "fa fa-pause fa-2x";

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
