/**
 * Analytics Service for tracking session data.
 * This service provides functionalities to start a session, end a session,
 * and retrieve historical session data including session start time, end time, and duration.
 * It also provides analytics functions for generating chart data.
 */

export interface Session {
  id: number;
  startTime: Date;
  endTime?: Date; // Optional until session is ended
  duration?: number; // Duration in milliseconds (calculated on endSession)
}

export interface DailyStats {
  date: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
}

export interface ChartData {
  labels: string[];
  values: number[];
}

// Load sessions from localStorage or initialize empty array
const loadSessions = (): Session[] => {
  const storedSessions = localStorage.getItem("pomodoro_sessions");
  if (storedSessions) {
    try {
      // Parse dates properly from JSON
      const parsedSessions = JSON.parse(
        storedSessions,
        (key: string, value: unknown): unknown => {
          if (key === "startTime" || key === "endTime") {
            return value ? new Date(value as string) : null;
          }
          return value;
        }
      ) as Session[];
      return parsedSessions;
    } catch (e) {
      console.error("Error parsing sessions from localStorage:", e);
      return [];
    }
  }
  return [];
};

// Save sessions to localStorage
const saveSessions = (sessions: Session[]): void => {
  console.log(
    "Saving sessions to localStorage:",
    JSON.stringify(sessions, null, 2)
  );
  localStorage.setItem("pomodoro_sessions", JSON.stringify(sessions));
};

// Array to store historical session data
const sessions: Session[] = loadSessions();

// Variable to store the current active session
let currentSession: Session | null = null;

// Unique session id counter - initialize from existing sessions
let sessionIdCounter: number =
  sessions.length > 0 ? Math.max(...sessions.map((s) => s.id)) : 0;

/**
 * Starts a new session.
 * Creates a new session object with a unique ID and start time.
 * Returns the session id.
 */
export function startSession(): number {
  if (currentSession !== null) {
    console.warn(
      "A session is already running. End the current session before starting a new one."
    );
    return currentSession.id;
  }
  console.log("Starting new session");

  const session: Session = {
    id: ++sessionIdCounter,
    startTime: new Date(),
  };
  currentSession = session;
  return session.id;
}

/**
 * Ends the current session.
 * Updates the current session with the end time and duration.
 * Stores it in the historical sessions array.
 */
export function endSession(): void {
  if (currentSession === null) {
    console.warn("No active session to end.");
    return;
  }

  const endTime = new Date();
  currentSession.endTime = endTime;
  currentSession.duration =
    endTime.getTime() - currentSession.startTime.getTime();

  console.debug(
    "Session completed with duration:",
    currentSession.duration,
    "ms"
  );

  sessions.push(currentSession);
  console.debug("Total sessions now:", sessions.length);
  currentSession = null;

  // Save sessions to localStorage
  saveSessions(sessions);

  console.debug("Sessions saved to localStorage");
}

/**
 * Retrieves historical session data.
 * Returns an array of past session objects with their start time, end time, and duration.
 */
export function getSessionData(): Session[] {
  return sessions;
}

/**
 * Formats a date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Gets daily session statistics
 * Returns an array of daily stats with count, total duration, and average duration
 */
export function getDailyStats(days = 7): DailyStats[] {
  const completedSessions = sessions.filter((s) => s.duration !== undefined);
  if (completedSessions.length === 0) return [];

  // Generate dates for the last 'days' days
  const today = new Date();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(formatDate(date));
  }

  // Initialize stats for each date
  const statsMap = new Map<string, DailyStats>();
  dates.forEach((date) => {
    statsMap.set(date, {
      date,
      count: 0,
      totalDuration: 0,
      averageDuration: 0,
    });
  });

  // Populate stats with session data
  completedSessions.forEach((session) => {
    const date = formatDate(session.startTime);
    if (statsMap.has(date)) {
      const stats = statsMap.get(date);
      if (stats) {
        stats.count++;
        stats.totalDuration += session.duration ?? 0;
      }
    }
  });

  // Calculate average durations
  statsMap.forEach((stats) => {
    if (stats.count > 0) {
      stats.averageDuration = Math.round(stats.totalDuration / stats.count);
    }
  });

  return Array.from(statsMap.values());
}

/**
 * Gets session duration chart data
 * Returns labels and values for the last n sessions
 */
export function getSessionDurationChart(limit = 10): ChartData {
  const completedSessions = sessions
    .filter((s) => s.duration !== undefined)
    .slice(-limit);

  return {
    labels: completedSessions.map(
      (_, index) => `Session ${(index + 1).toString()}`
    ),
    values: completedSessions.map((s) => s.duration ?? 0),
  };
}

/**
 * Gets daily session count chart data
 * Returns labels and values for the last n days
 */
export function getDailySessionCountChart(days = 7): ChartData {
  const stats = getDailyStats(days);

  return {
    labels: stats.map((s) => {
      const date = new Date(s.date);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }),
    values: stats.map((s) => s.count),
  };
}

/**
 * Gets daily average duration chart data
 * Returns labels and values for the last n days
 */
export function getDailyAverageDurationChart(days = 7): ChartData {
  const stats = getDailyStats(days);

  return {
    labels: stats.map((s) => {
      const date = new Date(s.date);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }),
    values: stats.map((s) => s.averageDuration),
  };
}

/**
 * Gets session completion time distribution
 * Returns data showing what times of day sessions are completed
 */
export function getSessionTimeDistribution(): ChartData {
  const completedSessions = sessions.filter((s) => s.endTime !== undefined);
  if (completedSessions.length === 0) return { labels: [], values: [] };

  // Group by hour of day (0-23)
  const hourCounts = new Array<number>(24);
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }

  completedSessions.forEach((session) => {
    if (session.endTime) {
      const hour = session.endTime.getHours();
      hourCounts[hour]++;
    }
  });

  return {
    labels: hourCounts.map((_, hour) => `${hour.toString()}:00`),
    values: hourCounts,
  };
}
