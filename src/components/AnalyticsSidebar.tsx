import React from "react";
import { useResponsive } from "../hooks/useResponsive";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import LineChart from "./LineChart";

const getSidebarClass = (isMobile: boolean, isMenuOpen: boolean): string => {
  if (isMobile) {
    return `analytics-sidebar mobile ${isMenuOpen ? "open" : ""}`;
  }
  return "analytics-sidebar";
};

const AnalyticsSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<string>("daily");
  const { isMobile, isMenuOpen, toggleMenu } = useResponsive();
  const {
    completedSessions,
    avgDuration,
    formatDuration,
    durationChart,
    dailyCountChart,
    avgDurationChart,
    timeDistribution,
  } = useAnalyticsData();

  const sidebarClass = getSidebarClass(isMobile, isMenuOpen);

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
        <button
          className="sidebar-overlay"
          onClick={toggleMenu}
          aria-label="Close analytics sidebar"
        ></button>
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
            onClick={() => { setActiveTab("daily"); }}
            className={`tab-button ${activeTab === "daily" ? "active" : ""}`}
            data-testid="daily-tab"
          >
            Daily
          </button>
          <button
            onClick={() => { setActiveTab("sessions"); }}
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
