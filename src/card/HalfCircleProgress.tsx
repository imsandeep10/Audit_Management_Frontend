import type { HalfCircleGradientProgressProps } from "../lib/types";

// Extend the props interface to include task data
interface DynamicHalfCircleProgressProps
  extends HalfCircleGradientProgressProps {
  taskData?: {
    counts: {
      todo: number;
      "in-progress": number;
      completed: number;
      cancelled: number;
      total: number;
    };
    percentages: {
      todo: number;
      "in-progress": number;
      completed: number;
      cancelled: number;
    };
  };
}

export function HalfCircleProgress({
  size = 300,
  strokeWidth = 18,
  progress,
  taskData,
}: DynamicHalfCircleProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Define colors matching your task status colors
  const colors = {
    todo: "#B90101",
    inProgress: "#664DA8",
    completed: "#3A75FF",
    cancelled: "#098552",
  };

  // Approach 1: Create gradient based on task percentages
  const createDynamicGradient = () => {
    if (!taskData) {
      // Fallback to default gradient
      return (
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B90101" />
          <stop offset="33%" stopColor="#3A75FF" />
          <stop offset="66%" stopColor="#3A75FF" />
          <stop offset="80%" stopColor="#068548" />
        </linearGradient>
      );
    }

    // Calculate cumulative percentages for gradient stops
    let cumulative = 0;
    const stops = [];

    if (taskData.percentages.todo > 0) {
      stops.push({ offset: cumulative, color: colors.todo });
      cumulative += taskData.percentages.todo;
      stops.push({ offset: cumulative, color: colors.todo });
    }

    if (taskData.percentages["in-progress"] > 0) {
      stops.push({ offset: cumulative, color: colors.inProgress });
      cumulative += taskData.percentages["in-progress"];
      stops.push({ offset: cumulative, color: colors.inProgress });
    }

    if (taskData.percentages.completed > 0) {
      stops.push({ offset: cumulative, color: colors.completed });
      cumulative += taskData.percentages.completed;
      stops.push({ offset: cumulative, color: colors.completed });
    }

    if (taskData.percentages.cancelled > 0) {
      stops.push({ offset: cumulative, color: colors.cancelled });
      cumulative += taskData.percentages.cancelled;
      stops.push({ offset: cumulative, color: colors.cancelled });
    }

    return (
      <linearGradient id="dynamicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        {stops.map((stop, index) => (
          <stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} />
        ))}
      </linearGradient>
    );
  };

  // Approach 2: Single color based on dominant task status
  const getDominantColor = () => {
    if (!taskData) return colors.completed;

    const percentages = taskData.percentages;
    const max = Math.max(
      percentages.todo,
      percentages["in-progress"],
      percentages.completed,
      percentages.cancelled
    );

    if (percentages.completed === max) return colors.completed;
    if (percentages["in-progress"] === max) return colors.inProgress;
    if (percentages.todo === max) return colors.todo;
    if (percentages.cancelled === max) return colors.cancelled;
  };

  // Approach 3: Color based on overall progress thresholds
  const getProgressColor = () => {
    if (progress >= 80) return colors.completed;
    if (progress >= 50) return colors.inProgress;
    if (progress >= 20) return colors.todo;
    return colors.cancelled;
  };

  return (
    <div className="relative">
      <svg
        width={size}
        height={size / 2}
        viewBox={`0 0 ${size} ${size / 2}`}
        className="overflow-visible"
      >
        <defs>
          {/* Dynamic gradient approach */}
          {createDynamicGradient()}

          {/* Single color gradients for other approaches */}
          <linearGradient id="dominantGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={getDominantColor()} />
            <stop offset="100%" stopColor={getDominantColor()} />
          </linearGradient>

          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={getProgressColor()} />
            <stop offset="100%" stopColor={getProgressColor()} />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={`
            M ${strokeWidth / 2},${size / 2 - strokeWidth / 2}
            A ${radius},${radius} 0 0 1 ${size - strokeWidth / 2},${
            size / 2 - strokeWidth / 2
          }
          `}
          fill="none"
          stroke="#D4CFCF"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress arc with dynamic color */}
        <path
          d={`
            M ${strokeWidth / 2},${size / 2 - strokeWidth / 2}
            A ${radius},${radius} 0 0 1 ${size - strokeWidth / 2},${
            size / 2 - strokeWidth / 2
          }
          `}
          fill="none"
          stroke={taskData ? "url(#dynamicGrad)" : "url(#progressGrad)"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>

      {/* Progress percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold mt-8">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

// Alternative: Segmented progress component
export function SegmentedHalfCircleProgress({
  size = 300,
  strokeWidth = 18,
  taskData,
}: {
  size?: number;
  strokeWidth?: number;
  taskData: {
    percentages: {
      todo: number;
      "in-progress": number;
      completed: number;
      cancelled: number;
    };
  };
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;

  const colors = {
    todo: "#B90101",
    inProgress: "#664DA8",
    completed: "#3A75FF",
    cancelled: "#098552",
  };

  const segments = [
    { key: "todo", percentage: taskData.percentages.todo, color: colors.todo },
    {
      key: "in-progress",
      percentage: taskData.percentages["in-progress"],
      color: colors.inProgress,
    },
    {
      key: "completed",
      percentage: taskData.percentages.completed,
      color: colors.completed,
    },
    {
      key: "cancelled",
      percentage: taskData.percentages.cancelled,
      color: colors.cancelled,
    },
  ].filter((segment) => segment.percentage > 0);

  let cumulativePercentage = 0;

  return (
    <svg
      width={size}
      height={size / 2}
      viewBox={`0 0 ${size} ${size / 2}`}
      className="overflow-visible"
    >
      {/* Background arc */}
      <path
        d={`
          M ${strokeWidth / 2},${size / 2 - strokeWidth / 2}
          A ${radius},${radius} 0 0 1 ${size - strokeWidth / 2},${
          size / 2 - strokeWidth / 2
        }
        `}
        fill="none"
        stroke="#D4CFCF"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Render each segment */}
      {segments.map((segment) => {
        const segmentOffset =
          circumference - (cumulativePercentage / 100) * circumference;
        const segmentLength = (segment.percentage / 100) * circumference;
        cumulativePercentage += segment.percentage;

        return (
          <path
            key={segment.key}
            d={`
              M ${strokeWidth / 2},${size / 2 - strokeWidth / 2}
              A ${radius},${radius} 0 0 1 ${size - strokeWidth / 2},${
              size / 2 - strokeWidth / 2
            }
            `}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${segmentLength} ${
              circumference - segmentLength
            }`}
            strokeDashoffset={segmentOffset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        );
      })}
    </svg>
  );
}
