"use client";

import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    RadialLinearScale,
    Tooltip,
} from "chart.js";
import { Bar, Doughnut, Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
);

/* ---------- Score Radar ---------- */
interface ScoreRadarProps {
  scores: {
    codeQuality: number;
    architecture: number;
    documentation: number;
    security: number;
    bestPractices: number;
    communityHealth: number;
    productionReadiness: number;
  };
}

export function ScoreRadarChart({ scores }: ScoreRadarProps) {
  const data = {
    labels: [
      "Code Quality",
      "Architecture",
      "Docs",
      "Security",
      "Best Practices",
      "Community",
      "Production",
    ],
    datasets: [
      {
        label: "Score",
        data: [
          scores.codeQuality,
          scores.architecture,
          scores.documentation,
          scores.security,
          scores.bestPractices,
          scores.communityHealth,
          scores.productionReadiness,
        ],
        backgroundColor: "rgba(99, 102, 241, 0.12)",
        borderColor: "rgba(99, 102, 241, 0.8)",
        borderWidth: 2,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "rgba(99, 102, 241, 0.3)",
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 25,
          color: "rgba(148, 163, 184, 0.4)",
          backdropColor: "transparent",
          font: { size: 10 },
        },
        grid: { color: "rgba(148, 163, 184, 0.08)", lineWidth: 1 },
        angleLines: { color: "rgba(148, 163, 184, 0.08)" },
        pointLabels: {
          color: "rgba(148, 163, 184, 0.7)",
          font: { size: 11, weight: 500 as const },
          padding: 12,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 15, 15, 0.9)",
        titleFont: { size: 12, weight: 600 as const },
        bodyFont: { size: 11 },
        padding: 12,
        cornerRadius: 8,
        borderColor: "rgba(99, 102, 241, 0.2)",
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="h-72">
      <Radar data={data} options={options} />
    </div>
  );
}

/* ---------- Language Donut ---------- */
interface LanguageDonutProps {
  languages: Record<string, number>;
}

export function LanguageDonutChart({ languages }: LanguageDonutProps) {
  const entries = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const total = entries.reduce((s, [, v]) => s + v, 0);

  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#06b6d4",
    "#10b981",
    "#34d399",
    "#f59e0b",
    "#ef4444",
  ];

  const data = {
    labels: entries.map(([lang]) => lang),
    datasets: [
      {
        data: entries.map(([, val]) => ((val / total) * 100).toFixed(1)),
        backgroundColor: colors.map((c) => c + "cc"),
        borderColor: "transparent",
        borderWidth: 0,
        hoverOffset: 6,
        hoverBackgroundColor: colors,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "rgba(148, 163, 184, 0.7)",
          font: { size: 11, weight: 500 as const },
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 15, 15, 0.9)",
        titleFont: { size: 12, weight: 600 as const },
        bodyFont: { size: 11 },
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="h-72">
      <Doughnut data={data} options={options} />
    </div>
  );
}

/* ---------- Contributor Bar ---------- */
interface ContributorBarProps {
  contributors: Array<{ login: string; contributions: number }>;
}

export function ContributorBarChart({ contributors }: ContributorBarProps) {
  const top = contributors.slice(0, 10);

  const data = {
    labels: top.map((c) => c.login),
    datasets: [
      {
        label: "Contributions",
        data: top.map((c) => c.contributions),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        hoverBackgroundColor: "rgba(99, 102, 241, 0.85)",
        borderColor: "transparent",
        borderWidth: 0,
        borderRadius: 8,
        barThickness: 22,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: {
        grid: { color: "rgba(148, 163, 184, 0.06)", lineWidth: 1 },
        ticks: { color: "rgba(148, 163, 184, 0.5)", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { color: "rgba(148, 163, 184, 0.7)", font: { size: 11, weight: 500 as const } },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 15, 15, 0.9)",
        titleFont: { size: 12, weight: 600 as const },
        bodyFont: { size: 11 },
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="h-72">
      <Bar data={data} options={options} />
    </div>
  );
}
