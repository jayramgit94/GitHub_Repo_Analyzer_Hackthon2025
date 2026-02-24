"use client";

import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export default function ScoreRing({
  score,
  label,
  size = 120,
  strokeWidth = 8,
  color,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * score) / 100;

  const scoreColor =
    color ||
    (score >= 80
      ? "#10b981"
      : score >= 60
      ? "#6366f1"
      : score >= 40
      ? "#f59e0b"
      : "#ef4444");

  const healthLabel =
    score >= 80
      ? "Excellent"
      : score >= 60
      ? "Good"
      : score >= 40
      ? "Fair"
      : "Needs Work";

  const bgGlow =
    score >= 80
      ? "rgba(16, 185, 129, 0.08)"
      : score >= 60
      ? "rgba(99, 102, 241, 0.08)"
      : score >= 40
      ? "rgba(245, 158, 11, 0.08)"
      : "rgba(239, 68, 68, 0.08)";

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Subtle glow behind ring */}
        <div
          className="absolute inset-2 rounded-full"
          style={{ background: bgGlow, filter: "blur(8px)" }}
        />

        <svg className="score-ring" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            strokeOpacity={0.5}
          />
          {/* Progress circle */}
          <circle
            className="progress"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={
              {
                "--score-offset": offset.toString(),
                strokeDasharray: circumference,
                strokeDashoffset: circumference,
                animation: "score-fill 1.5s ease-out forwards",
                filter: `drop-shadow(0 0 6px ${scoreColor}40)`,
              } as React.CSSProperties
            }
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-bold tabular-nums"
            style={{ color: scoreColor, fontSize: size > 100 ? "1.75rem" : "1.25rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-[var(--muted-fg)] font-medium">/100</span>
        </div>
      </motion.div>

      <div className="text-center">
        {label && (
          <div className="text-sm font-semibold text-[var(--foreground)]">{label}</div>
        )}
        <div
          className="text-xs font-medium mt-0.5"
          style={{ color: scoreColor }}
        >
          {healthLabel}
        </div>
      </div>
    </div>
  );
}
