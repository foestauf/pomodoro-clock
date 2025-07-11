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
import { 
  trackTimerEvent, 
  trackSettingsChange, 
  trackSessionAnalytics,
  trackError 
} from "../services/telemetryService";

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
  const [timer, setTimer] = useState(25 * 60);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Stopped);
  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [timerType, setTimerType] = useState<TimerType>(TimerType.Session);
  const [sessionCount, setSessionCount] = useState(0); // For analytics key
  const [longBreakLength, setLongBreakLength] = useState(15);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4);
  const [completedSessionCycleCount, setCompletedSessionCycleCount] =
    useState(0); // Tracks sessions for long break cycle

  const intervalID = useRef<number | null>(null);
  const audioBeep = useRef<HTMLAudioElement>(null);

  // Load settings from local storage on initial mount
  useEffect(() => {
    const storedBreakLength = localStorage.getItem("breakLength");
    if (storedBreakLength) setBreakLength(parseInt(storedBreakLength, 10));

    const storedSessionLength = localStorage.getItem("sessionLength");
    if (storedSessionLength)
      setSessionLength(parseInt(storedSessionLength, 10));

    const storedLongBreakLength = localStorage.getItem("longBreakLength");
    if (storedLongBreakLength)
      setLongBreakLength(parseInt(storedLongBreakLength, 10));

    const storedSessionsBeforeLongBreak = localStorage.getItem(
      "sessionsBeforeLongBreak"
    );
    if (storedSessionsBeforeLongBreak)
      setSessionsBeforeLongBreak(parseInt(storedSessionsBeforeLongBreak, 10));
  }, []);

  // Save settings to local storage whenever they change
  useEffect(() => {
    const oldValue = localStorage.getItem("breakLength");
    localStorage.setItem("breakLength", breakLength.toString());
    if (oldValue && oldValue !== breakLength.toString()) {
      trackSettingsChange("break_length", oldValue, breakLength);
    }
  }, [breakLength]);

  useEffect(() => {
    const oldValue = localStorage.getItem("sessionLength");
    localStorage.setItem("sessionLength", sessionLength.toString());
    if (oldValue && oldValue !== sessionLength.toString()) {
      trackSettingsChange("session_length", oldValue, sessionLength);
    }
  }, [sessionLength]);

  useEffect(() => {
    const oldValue = localStorage.getItem("longBreakLength");
    localStorage.setItem("longBreakLength", longBreakLength.toString());
    if (oldValue && oldValue !== longBreakLength.toString()) {
      trackSettingsChange("long_break_length", oldValue, longBreakLength);
    }
  }, [longBreakLength]);

  useEffect(() => {
    const oldValue = localStorage.getItem("sessionsBeforeLongBreak");
    localStorage.setItem(
      "sessionsBeforeLongBreak",
      sessionsBeforeLongBreak.toString()
    );
    if (oldValue && oldValue !== sessionsBeforeLongBreak.toString()) {
      trackSettingsChange("sessions_before_long_break", oldValue, sessionsBeforeLongBreak);
    }
  }, [sessionsBeforeLongBreak]);

  // Handle timer completion
  useEffect(() => {
    if (timer <= 0) {
      // Stop the timer
      if (intervalID.current !== null) {
        clearInterval(intervalID.current);
      }
      intervalID.current = null;
      setTimerState(TimerState.Stopped);

      // Handle the promise returned by play() method
      if (audioBeep.current) {
        audioBeep.current.play().catch((err: unknown) => {
          console.error("Error playing audio:", err);
          trackError(new Error("Audio playback failed"), "timer_completion", {
            error: err instanceof Error ? err.message : String(err),
          });
        });
      }

      if (timerType === TimerType.Session) {
        // Session ended
        endSession(); // End analytics session
        trackTimerEvent('complete', 'session', undefined, sessionLength, breakLength);
        trackSessionAnalytics('session_completed', {
          session_length_minutes: sessionLength,
          break_length_minutes: breakLength,
        });
        setSessionCount((prev) => prev + 1); // Increment analytics session count
        const nextSessionCount = completedSessionCycleCount + 1;
        if (nextSessionCount >= sessionsBeforeLongBreak) {
          // Start Long Break
          setTimerType(TimerType.LongBreak);
          setTimer(longBreakLength * 60);
          setCompletedSessionCycleCount(0); // Reset cycle count
          trackTimerEvent('start', 'long_break', longBreakLength * 60, sessionLength, breakLength);
        } else {
          // Start Short Break
          setTimerType(TimerType.Break);
          setTimer(breakLength * 60);
          setCompletedSessionCycleCount(nextSessionCount);
          trackTimerEvent('start', 'break', breakLength * 60, sessionLength, breakLength);
        }
      } else {
        // Break or Long Break ended, start next session
        const breakType = timerType === TimerType.LongBreak ? 'long_break' : 'break';
        trackTimerEvent('complete', breakType, undefined, sessionLength, breakLength);
        setTimerType(TimerType.Session);
        setTimer(sessionLength * 60);
        startSession(); // Start analytics session
        trackTimerEvent('start', 'session', sessionLength * 60, sessionLength, breakLength);
        trackSessionAnalytics('session_started', {
          session_length_minutes: sessionLength,
          break_length_minutes: breakLength,
        });
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

    // Track reset event
    trackTimerEvent('reset', 'session', undefined, sessionLength, breakLength);

    // End the current analytics session if timer was running when reset
    if (timerState === TimerState.Running) {
      endSession();
      trackSessionAnalytics('session_interrupted', {
        reason: 'reset',
        remaining_time_seconds: timer,
      });
    }

    // Reset analytics session count display key
    setSessionCount(0);
  }, [timerState, timer, sessionLength, breakLength]);

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
      
      // Track timer start event
      const timerTypeString = timerType === TimerType.Session ? 'session' : 
                            timerType === TimerType.LongBreak ? 'long_break' : 'break';
      trackTimerEvent('start', timerTypeString, timer, sessionLength, breakLength);
      
      // Only start analytics session if timer is for a work session
      if (timerType === TimerType.Session) {
        startSession(); // Start tracking the session
        trackSessionAnalytics('session_started', {
          session_length_minutes: sessionLength,
          break_length_minutes: breakLength,
        });
      }
    } else {
      // Stop the timer and record the session end
      if (intervalID.current !== null) {
        clearInterval(intervalID.current);
      }
      intervalID.current = null;
      setTimerState(TimerState.Stopped);
      
      // Track timer stop event
      const timerTypeString = timerType === TimerType.Session ? 'session' : 
                            timerType === TimerType.LongBreak ? 'long_break' : 'break';
      trackTimerEvent('stop', timerTypeString, timer, sessionLength, breakLength);
      
      // Only end analytics session if timer was running for a work session
      if (timerType === TimerType.Session) {
        endSession();
        trackSessionAnalytics('session_interrupted', {
          reason: 'user_stopped',
          remaining_time_seconds: timer,
        });
        // Force a session count update to trigger UI refresh
        setSessionCount((prev) => prev + 1);
      }
    }
  }, [timerState, timerType, timer, sessionLength, breakLength]);

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
    
    // Track mode switch
    trackTimerEvent('start', 'break', breakLength * 60, sessionLength, breakLength);
  }, [breakLength, sessionLength]);

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
    
    // Track mode switch
    trackTimerEvent('start', 'session', sessionLength * 60, sessionLength, breakLength);
  }, [sessionLength, breakLength]);

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
