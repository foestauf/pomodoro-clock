import React, { useEffect, useRef, useState } from "react";
import { type ChartData } from "../services/analyticsService";

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

  // Format value for display
  const formatValue = (value: number): string => {
    if (value >= 60000) {
      return String(Math.round(value / 60000)) + " min";
    } else if (value >= 1000) {
      return String(Math.round(value / 1000)) + " sec";
    }
    return String(value);
  };

  // Calculate coordinates for each data point
  const coordsForLine = data.values.map((value, i) => {
    const x = i * step;
    const y = height - ((value - min) / range) * (height - 30) - 10;
    return [x, y];
  });

  // Create the path string manually to avoid template literals with numbers
  let linePath = "";
  coordsForLine.forEach(([x, y], i) => {
    if (i === 0) {
      linePath += "M " + String(x) + " " + String(y);
    } else {
      linePath += " L " + String(x) + " " + String(y);
    }
  });

  // Create x-axis and y-axis paths without using template literals
  const xAxisPath =
    "M 0 " + String(height) + " L " + String(chartWidth) + " " + String(height);
  const yAxisPath = "M 0 0 L 0 " + String(height);

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
          {[0.25, 0.5, 0.75].map((ratio, i) => {
            const yPosition = height - ratio * (height - 30) - 10;
            return (
              <line
                key={i}
                x1="0"
                y1={yPosition}
                x2={chartWidth}
                y2={yPosition}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeDasharray="2,2"
              />
            );
          })}

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
          <path fill="none" stroke={color} strokeWidth="2" d={linePath} />

          {/* X-axis */}
          <path
            fill="none"
            stroke="rgba(214, 216, 218, 0.7)"
            strokeWidth="1"
            d={xAxisPath}
          />

          {/* Y-axis */}
          <path
            fill="none"
            stroke="rgba(214, 216, 218, 0.7)"
            strokeWidth="1"
            d={yAxisPath}
          />

          {/* Data points */}
          {coordsForLine.map(([x, y], i) => (
            <circle key={i} cx={String(x)} cy={String(y)} r="3" fill={color} />
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

export default LineChart;
