import {
  createContext,
  use,
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { startSession, endSession } from "../services/analyticsService";

// Define enums
export enum TimerState {
  Stopped = "stopped",
  Running = "running",
}

export enum TimerType {
  Session = "Session",
  Break = "Break",
  LongBreak = "Long Break",
}

// Define context type
interface TimerContextType {
  timer: number;
  timerState: TimerState;
  breakLength: number;
  sessionLength: number;
  timerType: TimerType;
  sessionCount: number;
  longBreakLength: number;
  sessionsBeforeLongBreak: number;
  completedSessionCycleCount: number;
  audioBeep: React.RefObject<HTMLAudioElement | null>;
  clockify: () => string;
  handleReset: () => void;
  timerControl: () => void;
  switchToBreak: () => void;
  switchToSession: () => void;
  controlIcon: () => string;
  setBreakLength: (length: number) => void;
  setSessionLength: (length: number) => void;
  setLongBreakLength: (length: number) => void;
  setSessionsBeforeLongBreak: (sessions: number) => void;
}

// Create the context
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Provider component
export function TimerProvider({ children }: { children: ReactNode }) {
  const [breakLength, setBreakLength] = useState(() => {
    const stored = localStorage.getItem("breakLength");
    return stored ? parseInt(stored, 10) : 5;
  });
  const [sessionLength, setSessionLength] = useState(() => {
    const stored = localStorage.getItem("sessionLength");
    return stored ? parseInt(stored, 10) : 25;
  });
  const [longBreakLength, setLongBreakLength] = useState(() => {
    const stored = localStorage.getItem("longBreakLength");
    return stored ? parseInt(stored, 10) : 15;
  });
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(() => {
    const stored = localStorage.getItem("sessionsBeforeLongBreak");
    return stored ? parseInt(stored, 10) : 4;
  });

  const [timer, setTimer] = useState(() => {
    const stored = localStorage.getItem("sessionLength");
    return (stored ? parseInt(stored, 10) : 25) * 60;
  });
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Stopped);
  const [timerType, setTimerType] = useState<TimerType>(TimerType.Session);
  const [sessionCount, setSessionCount] = useState(0); // For analytics key
  const [completedSessionCycleCount, setCompletedSessionCycleCount] =
    useState(0); // Tracks sessions for long break cycle

  const intervalID = useRef<number | null>(null);
  const audioBeep = useRef<HTMLAudioElement>(null);

  // Save settings to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("breakLength", breakLength.toString());
  }, [breakLength]);

  useEffect(() => {
    localStorage.setItem("sessionLength", sessionLength.toString());
  }, [sessionLength]);

  useEffect(() => {
    localStorage.setItem("longBreakLength", longBreakLength.toString());
  }, [longBreakLength]);

  useEffect(() => {
    localStorage.setItem(
      "sessionsBeforeLongBreak",
      sessionsBeforeLongBreak.toString()
    );
  }, [sessionsBeforeLongBreak]);

  // Handle timer completion
  useEffect(() => {
    if (timer <= 0) {
      // Stop the timer
      if (intervalID.current !== null) {
        clearInterval(intervalID.current);
      }
      intervalID.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: handling timer completion requires state transition
      setTimerState(TimerState.Stopped);

      // Handle the promise returned by play() method
      if (audioBeep.current) {
        audioBeep.current.play().catch((err: unknown) => {
          console.error("Error playing audio:", err);
        });
      }

      if (timerType === TimerType.Session) {
        // Session ended
        endSession(); // End analytics session
        setSessionCount((prev) => prev + 1); // Increment analytics session count
        const nextSessionCount = completedSessionCycleCount + 1;
        if (nextSessionCount >= sessionsBeforeLongBreak) {
          // Start Long Break
          setTimerType(TimerType.LongBreak);
          setTimer(longBreakLength * 60);
          setCompletedSessionCycleCount(0); // Reset cycle count
        } else {
          // Start Short Break
          setTimerType(TimerType.Break);
          setTimer(breakLength * 60);
          setCompletedSessionCycleCount(nextSessionCount);
        }
      } else {
        // Break or Long Break ended, start next session
        setTimerType(TimerType.Session);
        setTimer(sessionLength * 60);
        startSession(); // Start analytics session
      }
    }
  }, [
    timer,
    timerType,
    breakLength,
    sessionLength,
    longBreakLength,
    sessionsBeforeLongBreak,
    completedSessionCycleCount,
  ]);

  // Update timer when session length changes
  useEffect(() => {
    if (timerType === TimerType.Session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: sync timer with session length changes
      setTimer(sessionLength * 60);
    }
  }, [sessionLength, timerType]);

  // Format time for display
  const clockify = useCallback((): string => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const formattedMinutes =
      minutes < 10 ? `0${minutes.toString()}` : minutes.toString();
    const formattedSeconds =
      seconds < 10 ? `0${seconds.toString()}` : seconds.toString();
    return `${formattedMinutes}:${formattedSeconds}`;
  }, [timer]);

  // Reset all timer settings
  const handleReset = useCallback(() => {
    if (intervalID.current !== null) {
      clearInterval(intervalID.current);
    }
    intervalID.current = null;
    setTimer(25 * 60);
    setBreakLength(5);
    setSessionLength(25);
    setLongBreakLength(15);
    setSessionsBeforeLongBreak(4);
    setTimerState(TimerState.Stopped);
    setTimerType(TimerType.Session);
    setCompletedSessionCycleCount(0);
    audioBeep.current?.pause();
    if (audioBeep.current) audioBeep.current.currentTime = 0;

    // End the current analytics session if timer was running when reset
    if (timerState === TimerState.Running) {
      endSession();
    }

    // Reset analytics session count display key
    setSessionCount(0);
  }, [timerState]);

  // Start/stop the timer
  const timerControl = useCallback(() => {
    if (timerState === TimerState.Stopped) {
      // Start the timer and record the session start
      const countdown = setInterval(() => {
        setTimer((prev) => {
          const newValue = prev - 1;
          return newValue;
        });
      }, 1000);
      intervalID.current = countdown as unknown as number;
      setTimerState(TimerState.Running);
      // Only start analytics session if timer is for a work session
      if (timerType === TimerType.Session) {
        startSession(); // Start tracking the session
      }
    } else {
      // Stop the timer and record the session end
      if (intervalID.current !== null) {
        clearInterval(intervalID.current);
      }
      intervalID.current = null;
      setTimerState(TimerState.Stopped);
      // Only end analytics session if timer was running for a work session
      if (timerType === TimerType.Session) {
        endSession();
        // Force a session count update to trigger UI refresh
        setSessionCount((prev) => prev + 1);
      }
    }
  }, [timerState, timerType]);

  // Switch to break mode
  const switchToBreak = useCallback(() => {
    // Clear any running timer
    if (intervalID.current !== null) {
      clearInterval(intervalID.current);
    }
    intervalID.current = null;
    setTimerState(TimerState.Stopped);
    setTimerType(TimerType.Break);
    setTimer(breakLength * 60);
  }, [breakLength]);

  // Switch to session mode
  const switchToSession = useCallback(() => {
    // Clear any running timer
    if (intervalID.current !== null) {
      clearInterval(intervalID.current);
    }
    intervalID.current = null;
    setTimerState(TimerState.Stopped);
    setTimerType(TimerType.Session);
    setTimer(sessionLength * 60);
  }, [sessionLength]);

  // Get control icon
  const controlIcon = useCallback(
    () =>
      timerState === TimerState.Stopped
        ? "fa fa-play fa-2x"
        : "fa fa-pause fa-2x",
    [timerState]
  );

  // Context value wrapped in useMemo to prevent recreating the object on every render
  const contextValue = useMemo<TimerContextType>(
    () => ({
      timer,
      timerState,
      breakLength,
      sessionLength,
      timerType,
      sessionCount,
      longBreakLength,
      sessionsBeforeLongBreak,
      completedSessionCycleCount,
      audioBeep,
      clockify,
      handleReset,
      timerControl,
      switchToBreak,
      switchToSession,
      controlIcon,
      setBreakLength,
      setSessionLength,
      setLongBreakLength,
      setSessionsBeforeLongBreak,
    }),
    [
      timer,
      timerState,
      breakLength,
      sessionLength,
      timerType,
      sessionCount,
      longBreakLength,
      sessionsBeforeLongBreak,
      completedSessionCycleCount,
      clockify,
      handleReset,
      timerControl,
      switchToBreak,
      switchToSession,
      controlIcon,
    ]
  );

  return (
    <TimerContext value={contextValue}>
      {children}
    </TimerContext>
  );
}

// Custom hook for using the timer context
export function useTimer() {
  const context = use(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
