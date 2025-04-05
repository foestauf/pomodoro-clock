import { useState, useEffect } from "react";
import {
  getSessionData,
  getDailySessionCountChart,
  getSessionDurationChart,
  getDailyAverageDurationChart,
  getSessionTimeDistribution,
  type Session,
  type ChartData,
} from "../services/analyticsService";

interface AnalyticsData {
  sessionData: Session[];
  durationChart: ChartData;
  dailyCountChart: ChartData;
  avgDurationChart: ChartData;
  timeDistribution: ChartData;
  completedSessions: Session[];
  totalDuration: number;
  avgDuration: number;
}

export const useAnalyticsData = (refreshInterval = 30000) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    sessionData: [],
    durationChart: { labels: [], values: [] },
    dailyCountChart: { labels: [], values: [] },
    avgDurationChart: { labels: [], values: [] },
    timeDistribution: { labels: [], values: [] },
    completedSessions: [],
    totalDuration: 0,
    avgDuration: 0,
  });

  useEffect(() => {
    const fetchData = () => {
      const data = getSessionData();
      const completedSessions = data.filter((s) => s.duration !== undefined);
      const totalDuration = completedSessions.reduce(
        (sum, s) => sum + (s.duration || 0),
        0
      );
      const avgDuration =
        completedSessions.length > 0
          ? Math.round(totalDuration / completedSessions.length)
          : 0;

      // Only fetch chart data if we have completed sessions with durations
      if (data.some((s) => s.duration !== undefined)) {
        const durationChart = getSessionDurationChart(10);
        const dailyCountChart = getDailySessionCountChart(7);
        const avgDurationChart = getDailyAverageDurationChart(7);
        const timeDistribution = getSessionTimeDistribution();

        setAnalyticsData({
          sessionData: data,
          durationChart,
          dailyCountChart,
          avgDurationChart,
          timeDistribution,
          completedSessions,
          totalDuration,
          avgDuration,
        });
      } else {
        setAnalyticsData({
          sessionData: data,
          durationChart: { labels: [], values: [] },
          dailyCountChart: { labels: [], values: [] },
          avgDurationChart: { labels: [], values: [] },
          timeDistribution: { labels: [], values: [] },
          completedSessions,
          totalDuration,
          avgDuration,
        });
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval with more reasonable refresh rate (30 seconds by default)
    const intervalId = setInterval(fetchData, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  const formatDuration = (ms: number): string => {
    if (ms === 0) return "0 min";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;
  };

  return { ...analyticsData, formatDuration };
};
