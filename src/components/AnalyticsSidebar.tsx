import React, { useState, useEffect, useRef } from "react";
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
  const chartContainer = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(300);

  useEffect(() => {
    const updateWidth = () => {
      if (chartContainer.current) {
        const containerWidth = chartContainer.current.clientWidth;
        setChartWidth(Math.min(300, containerWidth - 20));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  if (data.values.length === 0) {
    return (
      <div className="chart-container" ref={chartContainer}>
        <h3>{title}</h3>
        <p>No data available</p>
      </div>
    );
  }

  const min = Math.min(...data.values);
  const max = Math.max(...data.values);
  const range = max - min || 1;
  const step =
    data.values.length > 1 ? chartWidth / (data.values.length - 1) : chartWidth;

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
    <div className="chart-container" ref={chartContainer}>
      <h3>{title}</h3>
      <div style={{ position: "relative" }}>
        <svg width={chartWidth} height={height} className="chart-svg">
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
              x2={chartWidth}
              y2={height - ratio * (height - 30) - 10}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeDasharray="2,2"
            />
          ))}

          {/* X-axis labels */}
          {data.labels.map((label, i) => {
            // Adjust the visible labels based on the chart width
            const visibleLabelsCount = Math.min(7, Math.floor(chartWidth / 40));
            if (
              data.labels.length <= visibleLabelsCount ||
              i % Math.ceil(data.labels.length / visibleLabelsCount) === 0
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
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);

      if (!mobile && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const fetchData = () => {
      const data = getSessionData();
      setSessionData(data);

      if (data.some((s) => s.duration !== undefined)) {
        const durationData = getSessionDurationChart(10);
        const dailyCountData = getDailySessionCountChart(7);
        const avgDurationData = getDailyAverageDurationChart(7);
        const timeDistData = getSessionTimeDistribution();

        setDurationChart(durationData);
        setDailyCountChart(dailyCountData);
        setAvgDurationChart(avgDurationData);
        setTimeDistribution(timeDistData);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const completedSessions = sessionData.filter((s) => s.duration !== undefined);
  const totalDuration = completedSessions.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );
  const avgDuration =
    completedSessions.length > 0
      ? Math.round(totalDuration / completedSessions.length)
      : 0;

  const formatDuration = (ms: number): string => {
    if (ms === 0) return "0 min";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;
  };

  const sidebarClass = isMobile
    ? `analytics-sidebar mobile ${isMenuOpen ? "open" : ""}`
    : "analytics-sidebar";

  return (
    <>
      {isMobile && (
        <button
          className="burger-menu-button"
          onClick={toggleMenu}
          aria-label="Toggle analytics menu"
        >
          <div className={`burger-icon ${isMenuOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      )}

      {isMobile && isMenuOpen && (
        <div className="sidebar-overlay" onClick={toggleMenu}></div>
      )}

      <div className={sidebarClass}>
        <div className="sidebar-header">
          <h2>Session Analytics</h2>
        </div>

        <div className="summary-stats">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h4>Total Sessions</h4>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
                {completedSessions.length}
              </p>
            </div>
            <div>
              <h4>Avg Duration</h4>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
                {formatDuration(avgDuration)}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", marginBottom: "16px" }}>
          <button
            onClick={() => setActiveTab("daily")}
            className={`tab-button ${activeTab === "daily" ? "active" : ""}`}
            data-testid="daily-tab"
          >
            Daily
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`tab-button ${activeTab === "sessions" ? "active" : ""}`}
            data-testid="sessions-tab"
          >
            Sessions
          </button>
        </div>

        {completedSessions.length > 0 ? (
          <div className="charts-wrapper">
            {activeTab === "daily" && (
              <>
                <LineChart
                  data={dailyCountChart}
                  title="Daily Session Count"
                  color="#3b82f6"
                  yAxisLabel="Count"
                  height={isMobile ? 150 : 200}
                />
                <LineChart
                  data={avgDurationChart}
                  title="Daily Average Duration"
                  color="#10b981"
                  yAxisLabel="Duration"
                  height={isMobile ? 150 : 200}
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
                  height={isMobile ? 150 : 200}
                />
                <LineChart
                  data={timeDistribution}
                  title="Session Time Distribution"
                  color="#8b5cf6"
                  yAxisLabel="Count"
                  height={isMobile ? 150 : 200}
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
    </>
  );
};

export default AnalyticsSidebar;
