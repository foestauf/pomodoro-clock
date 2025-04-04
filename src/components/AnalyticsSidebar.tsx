import React, { useState, useEffect } from "react";
import {
  getSessionData,
  getDailySessionCountChart,
  getSessionDurationChart,
  getDailyAverageDurationChart,
  getSessionTimeDistribution,
  type Session,
  type ChartData,
} from "../services/analyticsService";

interface LineChartProps {
  data: ChartData;
  title: string;
  color?: string;
  yAxisLabel?: string;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  color = "#3b82f6",
  yAxisLabel = "",
  height = 200,
}) => {
  const width = 300;

  if (data.values.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <p>No data available</p>
      </div>
    );
  }

  const min = Math.min(...data.values);
  const max = Math.max(...data.values);
  const range = max - min || 1;
  const step =
    data.values.length > 1 ? width / (data.values.length - 1) : width;

  const points = data.values
    .map((value, i) => {
      const x = i * step;
      const y = height - ((value - min) / range) * (height - 30) - 10; // Leave space for labels
      return `${x},${y}`;
    })
    .join(" ");

  // Format value for display
  const formatValue = (value: number): string => {
    if (value >= 60000) {
      return `${Math.round(value / 60000)} min`;
    } else if (value >= 1000) {
      return `${Math.round(value / 1000)} sec`;
    }
    return `${value}`;
  };

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div style={{ position: "relative" }}>
        <svg width={width} height={height} className="chart-svg">
          {/* Y-axis label */}
          {yAxisLabel && (
            <text x="5" y="15" fontSize="10" fill="#666">
              {yAxisLabel}
            </text>
          )}

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={height - ratio * (height - 30) - 10}
              x2={width}
              y2={height - ratio * (height - 30) - 10}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeDasharray="2,2"
            />
          ))}

          {/* X-axis labels */}
          {data.labels.map((label, i) => {
            if (
              data.labels.length <= 7 ||
              i % Math.ceil(data.labels.length / 7) === 0
            ) {
              return (
                <text
                  key={i}
                  x={i * step}
                  y={height - 2}
                  fontSize="8"
                  textAnchor="middle"
                  fill="rgba(214, 216, 218, 0.7)"
                >
                  {label}
                </text>
              );
            }
            return null;
          })}

          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
          />

          {/* Data points */}
          {data.values.map((value, i) => (
            <circle
              key={i}
              cx={i * step}
              cy={height - ((value - min) / range) * (height - 30) - 10}
              r="3"
              fill={color}
            />
          ))}
        </svg>

        {/* Value indicators */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "5px",
          }}
        >
          <span className="chart-label">{formatValue(min)}</span>
          {max !== min && (
            <span className="chart-label">{formatValue(max)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const AnalyticsSidebar: React.FC = () => {
  const [sessionData, setSessionData] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<string>("daily");
  const [durationChart, setDurationChart] = useState<ChartData>({
    labels: [],
    values: [],
  });
  const [dailyCountChart, setDailyCountChart] = useState<ChartData>({
    labels: [],
    values: [],
  });
  const [avgDurationChart, setAvgDurationChart] = useState<ChartData>({
    labels: [],
    values: [],
  });
  const [timeDistribution, setTimeDistribution] = useState<ChartData>({
    labels: [],
    values: [],
  });

  useEffect(() => {
    // Get session data and chart data
    const fetchData = () => {
      const data = getSessionData();
      console.log("Fetching analytics data:", JSON.stringify(data, null, 2));
      setSessionData(data);

      // Only update charts if we have completed sessions
      if (data.some((s) => s.duration !== undefined)) {
        const durationData = getSessionDurationChart(10);
        const dailyCountData = getDailySessionCountChart(7);
        const avgDurationData = getDailyAverageDurationChart(7);
        const timeDistData = getSessionTimeDistribution();

        console.log("Chart data updated:", {
          durationData,
          dailyCountData,
          avgDurationData,
          timeDistData,
        });

        setDurationChart(durationData);
        setDailyCountChart(dailyCountData);
        setAvgDurationChart(avgDurationData);
        setTimeDistribution(timeDistData);
      }
    };

    // Initial fetch
    fetchData();

    // Set up an interval to refresh data every second
    const intervalId = setInterval(fetchData, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Calculate summary statistics
  const completedSessions = sessionData.filter((s) => s.duration !== undefined);
  const totalDuration = completedSessions.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );
  const avgDuration =
    completedSessions.length > 0
      ? Math.round(totalDuration / completedSessions.length)
      : 0;

  // Format duration for display
  const formatDuration = (ms: number): string => {
    if (ms === 0) return "0 min";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;
  };

  return (
    <div className="analytics-sidebar">
      <h2 className="font-bold">Session Analytics</h2>

      {/* Summary statistics */}
      <div className="summary-stats">
        <div className="flex justify-between">
          <div>
            <h4>Total Sessions</h4>
            <p className="m-0 text-2xl font-bold">
              {completedSessions.length}
            </p>
          </div>
          <div>
            <h4>Avg Duration</h4>
            <p className="m-0 text-2xl font-bold">
              {formatDuration(avgDuration)}
            </p>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab("daily")}
          className={`tab-button ${activeTab === "daily" ? "active" : ""}`}
        >
          Daily
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`tab-button ${activeTab === "sessions" ? "active" : ""}`}
        >
          Sessions
        </button>
      </div>

      {/* Chart content based on active tab */}
      {completedSessions.length > 0 ? (
        <div>
          {activeTab === "daily" && (
            <>
              <LineChart
                data={dailyCountChart}
                title="Daily Session Count"
                color="#3b82f6"
                yAxisLabel="Count"
              />
              <LineChart
                data={avgDurationChart}
                title="Daily Average Duration"
                color="#10b981"
                yAxisLabel="Duration"
              />
            </>
          )}

          {activeTab === "sessions" && (
            <>
              <LineChart
                data={durationChart}
                title="Recent Session Durations"
                color="#f59e0b"
                yAxisLabel="Duration"
              />
              <LineChart
                data={timeDistribution}
                title="Session Time Distribution"
                color="#8b5cf6"
                yAxisLabel="Count"
              />
            </>
          )}
        </div>
      ) : (
        <div className="no-data-message">
          <p>No completed sessions available.</p>
          <p>Start and complete a session to see analytics.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSidebar;
