"use client";

/*
 * ============================================
 * Analysis Dashboard (/analyze?repo=...)
 * ============================================
 */

import AITypingEffect from "@/components/AITypingEffect";
import {
  ContributorBarChart,
  LanguageDonutChart,
  ScoreRadarChart,
} from "@/components/Charts";
import { FadeIn, FadeInUp, StaggerContainer, StaggerItem } from "@/components/Motion";
import Navbar from "@/components/Navbar";
import ScoreRing from "@/components/ScoreRing";
import { SkeletonDashboard } from "@/components/SkeletonLoader";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Bug,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  FileWarning,
  GitFork,
  Hash,
  Info,
  Layers,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Star,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/* ---------- Types ---------- */
interface AnalysisResult {
  repoFullName: string;
  overallScore: number;
  complexityLevel: string;
  repoHealth: string;
  scores: {
    codeQuality: number;
    architecture: number;
    documentation: number;
    security: number;
    bestPractices: number;
    communityHealth: number;
    productionReadiness: number;
    overall?: number;
  };
  insights: Array<{ category: string; message?: string; title?: string; description?: string; severity: string }>;
  techStack: string[];
  missingFiles: string[];
  aiSummary: string;
  aiSuggestions: string[];
  shareId?: string;
  repoData?: {
    description: string;
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
    defaultBranch: string;
    createdAt: string;
    updatedAt: string;
    languages: Record<string, number>;
    contributors: Array<{ login: string; contributions: number; avatar_url: string }>;
    license: string | null;
    topics: string[];
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResult(data: any): AnalysisResult {
  const complexityMap: Record<string, string> = {
    "very-high": "Enterprise", "high": "Advanced",
    "medium": "Intermediate", "low": "Starter",
  };
  return {
    ...data,
    overallScore: data.overallScore ?? data.scores?.overall ?? 0,
    complexityLevel: complexityMap[data.complexityLevel] || data.complexityLevel,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    techStack: (data.techStack || []).map((t: any) => (typeof t === "string" ? t : t.name)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    missingFiles: (data.missingFiles || []).map((f: any) => (typeof f === "string" ? f : f.name)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insights: (data.insights || []).map((i: any) => ({
      ...i,
      message: i.message || i.description || i.title || "",
    })),
  } as AnalysisResult;
}

/* ---------- Severity helpers ---------- */
function severityBadge(severity: string) {
  switch (severity) {
    case "critical": return "badge badge-danger";
    case "warning": return "badge badge-warning";
    case "info": return "badge badge-info";
    default: return "badge badge-success";
  }
}

function severityIcon(severity: string) {
  switch (severity) {
    case "critical": return <ShieldAlert size={14} />;
    case "warning": return <AlertTriangle size={14} />;
    case "info": return <Info size={14} />;
    default: return <CheckCircle2 size={14} />;
  }
}

/* ---------- Inner component ---------- */
function AnalyzeDashboard() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo") || "";

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!repoUrl) {
      setError("No repository URL provided.");
      setLoading(false);
      return;
    }

    const analyze = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Analysis failed");
        }
        const data = await res.json();
        setResult(normalizeResult(data));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    analyze();
  }, [repoUrl]);

  const handleShare = async () => {
    if (!result) return;
    const url = `${window.location.origin}/analyze?repo=${encodeURIComponent(repoUrl)}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreLabels: Record<string, string> = {
    codeQuality: "Code Quality",
    architecture: "Architecture",
    documentation: "Documentation",
    security: "Security",
    bestPractices: "Best Practices",
    communityHealth: "Community",
    productionReadiness: "Production",
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="orb orb-primary w-[500px] h-[500px] -top-[150px] -right-[150px] animate-float" />
          <div className="orb orb-accent w-[400px] h-[400px] top-[60%] -left-[150px] animate-float-delayed" />
        </div>
        <main className="max-w-7xl mx-auto px-4 pt-24 pb-16 relative z-10">
          <SkeletonDashboard />
        </main>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="orb orb-primary w-[500px] h-[500px] -top-[150px] -right-[150px] animate-float" />
        </div>
        <main className="max-w-7xl mx-auto px-4 pt-24 pb-16 flex items-center justify-center relative z-10">
          <FadeInUp>
            <div className="glass-card p-10 text-center max-w-md">
              <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={28} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Analysis Failed</h2>
              <p className="text-sm text-[var(--muted-fg)] mb-8">{error}</p>
              <a href="/" className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2">
                <ArrowLeft size={16} />
                Try Another Repo
              </a>
            </div>
          </FadeInUp>
        </main>
      </div>
    );
  }

  if (!result) return null;

  const complexityBadge = () => {
    switch (result.complexityLevel) {
      case "Enterprise": return "badge badge-primary";
      case "Advanced": return "badge badge-info";
      case "Intermediate": return "badge badge-warning";
      default: return "badge badge-success";
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navbar />

      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="orb orb-primary w-[500px] h-[500px] -top-[150px] -right-[150px] animate-float" />
        <div className="orb orb-accent w-[400px] h-[400px] top-[60%] -left-[150px] animate-float-delayed" />
        <div className="bg-grid absolute inset-0" />
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16 relative z-10">
        {/* Header */}
        <FadeInUp>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] truncate">
                  {result.repoFullName}
                </h1>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-[var(--muted-fg)] hover:text-[var(--primary)] transition-colors"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
              <p className="text-sm text-[var(--muted-fg)] line-clamp-2">
                {result.repoData?.description || "No description"}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={complexityBadge()}>{result.complexityLevel}</span>
              <motion.button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm
                           hover:border-[var(--primary)] transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5 text-accent-500">
                      <Check size={14} /> Copied!
                    </motion.span>
                  ) : (
                    <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                      <Copy size={14} /> Share
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </FadeInUp>

        {/* Quick Stats */}
        {result.repoData && (
          <FadeInUp delay={0.05}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Stars", value: result.repoData.stars.toLocaleString(), icon: <Star size={16} /> },
                { label: "Forks", value: result.repoData.forks.toLocaleString(), icon: <GitFork size={16} /> },
                { label: "Issues", value: result.repoData.openIssues.toLocaleString(), icon: <Bug size={16} /> },
                { label: "Health", value: result.repoHealth, icon: <Eye size={16} /> },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="glass-card-static p-4 flex items-center gap-3"
                  whileHover={{ y: -2 }}
                >
                  <div className="h-9 w-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[var(--foreground)]">{stat.value}</div>
                    <div className="text-[11px] text-[var(--muted-fg)]">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeInUp>
        )}

        {/* Overall Score + Score Rings */}
        <FadeInUp delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            <div className="glass-card p-8 flex flex-col items-center justify-center">
              <span className="section-label mb-4">Overall Score</span>
              <ScoreRing score={result.overallScore} size={160} strokeWidth={10} />
            </div>

            <div className="lg:col-span-2 glass-card p-6">
              <span className="section-label mb-6">Score Breakdown</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-6">
                {Object.entries(result.scores)
                  .filter(([key]) => key !== "overall")
                  .map(([key, value], i) => (
                    <motion.div
                      key={key}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                    >
                      <ScoreRing score={value} size={76} strokeWidth={5} />
                      <span className="text-[11px] text-[var(--muted-fg)] mt-2 text-center font-medium">
                        {scoreLabels[key] || key}
                      </span>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* AI Summary + Radar */}
        <FadeInUp delay={0.15}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Sparkles size={12} className="text-white" />
                </div>
                <span className="section-label !mb-0">AI Analysis</span>
              </div>
              <AITypingEffect text={result.aiSummary} speed={15} />

              {result.aiSuggestions && result.aiSuggestions.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={14} className="text-amber-400" />
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Suggestions</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {result.aiSuggestions.map((s, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-[var(--muted-fg)]"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                      >
                        <span className="text-[var(--primary)] mt-0.5 flex-shrink-0">→</span>
                        <span>{s}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="glass-card p-6">
              <span className="section-label mb-4">Score Radar</span>
              <div className="mt-4">
                <ScoreRadarChart scores={result.scores} />
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Languages + Contributors */}
        <FadeInUp delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {result.repoData?.languages && Object.keys(result.repoData.languages).length > 0 && (
              <div className="glass-card p-6">
                <span className="section-label mb-4">Languages</span>
                <div className="mt-4">
                  <LanguageDonutChart languages={result.repoData.languages} />
                </div>
              </div>
            )}

            {result.repoData?.contributors && result.repoData.contributors.length > 0 && (
              <div className="glass-card p-6">
                <span className="section-label mb-4">Top Contributors</span>
                <div className="mt-4">
                  <ContributorBarChart contributors={result.repoData.contributors} />
                </div>
              </div>
            )}
          </div>
        </FadeInUp>

        {/* Tech Stack + Missing Files */}
        <FadeInUp delay={0.25}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {result.techStack.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Layers size={14} className="text-[var(--primary)]" />
                  <span className="section-label !mb-0">Tech Stack Detected</span>
                </div>
                <StaggerContainer className="flex flex-wrap gap-2 mt-4">
                  {result.techStack.map((tech) => (
                    <StaggerItem key={tech}>
                      <span className="badge badge-primary">{tech}</span>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            )}

            {result.missingFiles.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileWarning size={14} className="text-amber-400" />
                  <span className="section-label !mb-0">Missing Files</span>
                </div>
                <ul className="space-y-2 mt-4">
                  {result.missingFiles.map((file, i) => (
                    <motion.li
                      key={file}
                      className="flex items-center gap-2.5 text-sm text-amber-400"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <AlertTriangle size={14} className="flex-shrink-0" />
                      <span className="font-mono text-xs">{file}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </FadeInUp>

        {/* Insights */}
        {result.insights.length > 0 && (
          <FadeInUp delay={0.3}>
            <div className="glass-card p-6 mb-8">
              <span className="section-label mb-5">Detailed Insights</span>
              <div className="space-y-3 mt-5">
                {result.insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-sunken)]"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {severityIcon(insight.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={severityBadge(insight.severity)}>
                          {insight.severity}
                        </span>
                        <span className="text-[11px] text-[var(--muted-fg)] font-mono uppercase">
                          {insight.category}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--foreground)]">{insight.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Topics */}
        {result.repoData?.topics && result.repoData.topics.length > 0 && (
          <FadeIn>
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Hash size={14} className="text-[var(--muted-fg)]" />
                <span className="section-label !mb-0">Topics</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {result.repoData.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--muted-fg)]
                               hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors cursor-default"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  );
}

/* ---------- Page export ---------- */
export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
            <SkeletonDashboard />
          </main>
        </div>
      }
    >
      <AnalyzeDashboard />
    </Suspense>
  );
}
