import React from "react";
import "./AnalyticsSidebar.css";
import { useResponsive } from "../hooks/useResponsive";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import LineChart from "./LineChart";

const getSidebarClass = (isMobile: boolean, isMenuOpen: boolean): string => {
  if (isMobile) {
    return `analytics-sidebar mobile ${isMenuOpen ? "open" : ""}`;
  }
  return "analytics-sidebar";
};

const todayLabel = (): string =>
  new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

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
  const chartHeight = isMobile ? 140 : 160;

  return (
    <>
      {isMobile && (
        <button
          type="button"
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
          type="button"
          className="sidebar-overlay"
          onClick={toggleMenu}
          aria-label="Close analytics sidebar"
        ></button>
      )}

      <aside className={sidebarClass}>
        <div className="brand">
          <span className="brand-dot" aria-hidden="true"></span>
          <span>Pomodoro · v2</span>
        </div>

        <section>
          <h4 className="side-h">
            Today <em>{todayLabel()}</em>
          </h4>
          <div className="summary-stats">
            <div>
              <h4>Total Sessions</h4>
              <p>{completedSessions.length}</p>
            </div>
            <div>
              <h4>Avg Duration</h4>
              <p>{formatDuration(avgDuration)}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="tabs-row">
            <button
              type="button"
              onClick={() => {
                setActiveTab("daily");
              }}
              className={`tab-button ${activeTab === "daily" ? "active" : ""}`}
              data-testid="daily-tab"
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("sessions");
              }}
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
                    color="var(--app-accent)"
                    yAxisLabel="Count"
                    height={chartHeight}
                  />
                  <LineChart
                    data={avgDurationChart}
                    title="Daily Average Duration"
                    color="var(--app-break)"
                    yAxisLabel="Duration"
                    height={chartHeight}
                  />
                </>
              )}
              {activeTab === "sessions" && (
                <>
                  <LineChart
                    data={durationChart}
                    title="Recent Session Durations"
                    color="var(--app-accent)"
                    yAxisLabel="Duration"
                    height={chartHeight}
                  />
                  <LineChart
                    data={timeDistribution}
                    title="Session Time Distribution"
                    color="var(--app-long)"
                    yAxisLabel="Count"
                    height={chartHeight}
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
        </section>
      </aside>
    </>
  );
};

export default AnalyticsSidebar;
