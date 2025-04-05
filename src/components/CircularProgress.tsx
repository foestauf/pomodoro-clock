import React, { useState, useEffect } from "react";

interface CircularProgressProps {
  progress: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  total,
  size = 200,
  strokeWidth = 10,
  color = "#4CAF50",
}) => {
  const [displaySize, setDisplaySize] = useState(size);

  useEffect(() => {
    const updateSize = () => {
      const isMobile = window.innerWidth <= 480;
      const isTablet = window.innerWidth <= 768 && window.innerWidth > 480;

      if (isMobile) {
        // Ensure the circle is visible on mobile by using a minimum size
        setDisplaySize(Math.max(Math.min(size, 180), 150));
      } else if (isTablet) {
        setDisplaySize(Math.min(size, 220));
      } else {
        setDisplaySize(size);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [size]);

  const radius = (displaySize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / total) * circumference;

  // Convert the percentage to a position along the circle for the stroke-dasharray
  const progressStyle = {
    strokeDashoffset: offset.toString(),
    strokeDasharray: `${circumference.toString()} ${circumference.toString()}`,
  };

  return (
    <div
      className="circular-progress"
      style={{
        width: displaySize,
        height: displaySize,
        minWidth: "150px",
        minHeight: "150px",
        visibility: "visible",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg width={displaySize} height={displaySize}>
        {/* Background circle */}
        <circle
          cx={displaySize / 2}
          cy={displaySize / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={displaySize / 2}
          cy={displaySize / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={progressStyle.strokeDasharray}
          strokeDashoffset={progressStyle.strokeDashoffset}
          transform={`rotate(-90 ${(displaySize / 2).toString()} ${(
            displaySize / 2
          ).toString()})`}
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </svg>
    </div>
  );
};

export default CircularProgress;
