"use client";

/*
 * ============================================
 * Admin Dashboard (/admin) — v2 Deep Analytics
 * ============================================
 */

import { FadeIn, FadeInUp, StaggerContainer, StaggerItem } from "@/components/Motion";
import Navbar from "@/components/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Code2,
  Eye,
  FileText,
  Globe,
  Lightbulb,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  Monitor,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Tablet,
  Trash2,
  TrendingUp,
  Users,
  XCircle
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/* ── Types ── */

interface ReviewItem {
  _id: string;
  userName: string;
  email?: string;
  rating: number;
  comment: string;
  githubUrl?: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  userAgent?: string;
}

interface AnalysisItem {
  repoFullName: string;
  language: string;
  stars: number;
  forks: number;
  overallScore: number;
  codeQuality: number;
  documentation: number;
  security: number;
  repoHealth: string;
  complexityLevel: string;
  createdAt: string;
}

interface VisitorItem {
  deviceType: string;
  page: string;
  referrer: string;
  country: string;
  browser: string;
  createdAt: string;
}

interface AdminStats {
  totalVisitors: number;
  uniqueVisitors: number;
  totalAnalyses: number;
  totalReviews: number;
  topRepos: Array<{ _id: string; count: number }>;
  reviewStats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    averageRating: number;
    overallAvgRating: number;
  };
  dailyVisitors: Array<{ _id: string; count: number }>;
  deviceBreakdown: Array<{ _id: string; count: number }>;
  pageBreakdown: Array<{ _id: string; count: number }>;
  hourlyActivity: Array<{ _id: number; count: number }>;
  referrerBreakdown: Array<{ _id: string; count: number }>;
  languageBreakdown: Array<{ _id: string; count: number; avgScore: number }>;
  scoreDistribution: { excellent: number; good: number; fair: number; poor: number };
  recentAnalyses: AnalysisItem[];
  recentVisitors: VisitorItem[];
  pendingReviews: ReviewItem[];
  allReviews: ReviewItem[];
}

/* ── Helpers ── */

const deviceIcon = (device: string) => {
  const d = (device || "").toLowerCase();
  if (d.includes("mobile") || d.includes("phone")) return <Smartphone size={14} />;
  if (d.includes("tablet")) return <Tablet size={14} />;
  return <Monitor size={14} />;
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-accent-500";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
};

const statusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-accent-500/15 text-accent-500 border-accent-500/20";
    case "rejected":
      return "bg-red-500/15 text-red-400 border-red-500/20";
    default:
      return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  }
};

const healthBadge = (h: string) => {
  const l = (h || "").toLowerCase();
  if (l.includes("excellent") || l.includes("healthy")) return "text-accent-500 bg-accent-500/10";
  if (l.includes("good")) return "text-blue-400 bg-blue-500/10";
  if (l.includes("fair") || l.includes("moderate")) return "text-amber-400 bg-amber-500/10";
  return "text-red-400 bg-red-500/10";
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  /* AI Insights */
  const [aiInsights, setAiInsights] = useState<{ summary: string; keyMetrics: string[]; recommendations: string[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  /* Tab for reviews section */
  const [reviewTab, setReviewTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (saved) setToken(saved);
  }, []);

  const fetchStats = useCallback(async (authToken: string) => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else if (res.status === 401) {
        localStorage.removeItem("admin_token");
        setToken(null);
      }
    } catch {
      // silently fail
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchAiInsights = useCallback(async (authToken: string) => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/admin-insights", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      }
    } catch {
      // silently fail
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchStats(token);
      fetchAiInsights(token);
    }
  }, [token, fetchStats, fetchAiInsights]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("admin_token", data.token);
        setToken(data.token);
      } else {
        setLoginError(data.error || "Invalid credentials");
      }
    } catch {
      setLoginError("Network error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleReviewAction = async (reviewId: string, action: "approve" | "reject" | "delete") => {
    if (!token) return;
    if (action === "delete") {
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchStats(token);
    } else {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewId, status: action === "approve" ? "approved" : "rejected" }),
      });
      if (res.ok) fetchStats(token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setStats(null);
  };

  /* ── Filtered reviews for tabs ── */
  const getFilteredReviews = (): ReviewItem[] => {
    if (!stats) return [];
    if (reviewTab === "pending") return stats.pendingReviews;
    if (reviewTab === "all") return [...stats.pendingReviews, ...stats.allReviews];
    return stats.allReviews.filter((r) => r.status === reviewTab);
  };

  /* ---------- Login Screen ---------- */
  if (!token) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="orb orb-primary w-[500px] h-[500px] -top-[150px] -right-[150px] animate-float" />
          <div className="orb orb-accent w-[400px] h-[400px] top-[60%] -left-[150px] animate-float-delayed" />
          <div className="bg-grid absolute inset-0" />
        </div>
        <main className="max-w-md mx-auto px-4 pt-32 relative z-10">
          <FadeInUp>
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Lock size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[var(--foreground)]">Admin Login</h1>
                  <p className="text-xs text-[var(--muted-fg)]">Access the admin dashboard</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                    placeholder="admin@gitrepoanalyzer.com"
                    required
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="Enter password"
                    required
                    suppressHydrationWarning
                  />
                </div>

                <AnimatePresence>
                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-400 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      {loginError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loginLoading}
                  className="btn-primary w-full py-3 text-sm"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {loginLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Shield size={16} />
                      Login
                    </span>
                  )}
                </motion.button>
              </form>
            </div>
          </FadeInUp>
        </main>
      </div>
    );
  }

  /* ---------- Dashboard ---------- */
  return (
    <div className="min-h-screen relative">
      <Navbar />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="orb orb-primary w-[500px] h-[500px] -top-[150px] -right-[150px] animate-float" />
        <div className="orb orb-accent w-[400px] h-[400px] top-[70%] -left-[150px] animate-float-delayed" />
        <div className="bg-grid absolute inset-0" />
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16 relative z-10">
        {/* Header */}
        <FadeInUp>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Admin Dashboard</h1>
                <p className="text-xs text-[var(--muted-fg)]">Deep analytics, review management & visitor insights</p>
              </div>
            </div>
            <motion.button
              onClick={handleLogout}
              className="btn-ghost px-4 py-2 text-sm text-red-400 border-red-400/30 hover:bg-red-500/10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut size={14} />
              Logout
            </motion.button>
          </div>
        </FadeInUp>

        {statsLoading && !stats ? (
          <FadeIn>
            <div className="text-center py-20">
              <Loader2 size={32} className="animate-spin text-[var(--primary)] mx-auto mb-3" />
              <p className="text-sm text-[var(--muted-fg)]">Loading dashboard...</p>
            </div>
          </FadeIn>
        ) : stats ? (
          <>
            {/* ═══════════════════ OVERVIEW CARDS ═══════════════════ */}
            <FadeInUp delay={0.05}>
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Visitors", value: stats.totalVisitors, icon: <Eye size={18} />, color: "text-primary-500 bg-primary-500/10" },
                  { label: "Unique Visitors", value: stats.uniqueVisitors, icon: <Users size={18} />, color: "text-accent-500 bg-accent-500/10" },
                  { label: "Analyses Run", value: stats.totalAnalyses, icon: <BarChart3 size={18} />, color: "text-blue-400 bg-blue-500/10" },
                  { label: "Total Reviews", value: stats.reviewStats.total, icon: <MessageSquare size={18} />, color: "text-amber-400 bg-amber-500/10" },
                ].map((s) => (
                  <StaggerItem key={s.label}>
                    <motion.div className="glass-card-static p-5" whileHover={{ y: -2 }}>
                      <div className={`h-9 w-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                        {s.icon}
                      </div>
                      <div className="text-2xl font-bold text-[var(--foreground)]">{s.value.toLocaleString()}</div>
                      <div className="text-[11px] text-[var(--muted-fg)] mt-1">{s.label}</div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </FadeInUp>

            {/* ═══════════════════ AI INSIGHTS ═══════════════════ */}
            <FadeInUp delay={0.08}>
              <div className="glass-card p-6 mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div>
                    <span className="section-label !mb-0">AI Dashboard Insights</span>
                    <p className="text-[11px] text-[var(--muted-fg)]">Powered by Gemini AI</p>
                  </div>
                  <Sparkles size={14} className="text-primary-400 ml-auto" />
                </div>

                {aiLoading ? (
                  <div className="flex items-center gap-3 py-4">
                    <Loader2 size={18} className="animate-spin text-primary-500" />
                    <span className="text-sm text-[var(--muted-fg)]">AI is analyzing your dashboard data...</span>
                  </div>
                ) : aiInsights ? (
                  <div className="space-y-5">
                    <p className="text-sm text-[var(--muted-fg)] leading-relaxed border-l-2 border-primary-500/30 pl-3">
                      {aiInsights.summary}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                        <div className="flex items-center gap-1.5 mb-3">
                          <TrendingUp size={14} className="text-primary-500" />
                          <span className="text-xs font-semibold text-primary-500">Key Metrics</span>
                        </div>
                        <ul className="space-y-2">
                          {aiInsights.keyMetrics.map((m, i) => (
                            <li key={i} className="text-xs text-[var(--muted-fg)] flex items-start gap-1.5">
                              <span className="text-primary-500 mt-0.5 flex-shrink-0">{"\u2022"}</span>{m}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-xl bg-accent-500/5 border border-accent-500/10">
                        <div className="flex items-center gap-1.5 mb-3">
                          <Lightbulb size={14} className="text-accent-500" />
                          <span className="text-xs font-semibold text-accent-500">AI Recommendations</span>
                        </div>
                        <ul className="space-y-2">
                          {aiInsights.recommendations.map((r, i) => (
                            <li key={i} className="text-xs text-[var(--muted-fg)] flex items-start gap-1.5">
                              <span className="text-accent-500 mt-0.5 flex-shrink-0">{i + 1}.</span>{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted-fg)]">AI insights are unavailable right now.</p>
                )}
              </div>
            </FadeInUp>

            {/* ═══════════════════ REVIEW STATS ROW ═══════════════════ */}
            <FadeInUp delay={0.1}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                  { label: "Approved", value: stats.reviewStats.approved, icon: <CheckCircle2 size={16} />, cls: "text-accent-500 bg-accent-500/10" },
                  { label: "Pending", value: stats.reviewStats.pending, icon: <Clock size={16} />, cls: "text-amber-400 bg-amber-500/10" },
                  { label: "Rejected", value: stats.reviewStats.rejected, icon: <XCircle size={16} />, cls: "text-red-400 bg-red-500/10" },
                  { label: "Avg Rating (Approved)", value: stats.reviewStats.averageRating ? stats.reviewStats.averageRating.toFixed(1) : "N/A", icon: <Star size={16} />, cls: "text-primary-500 bg-primary-500/10" },
                  { label: "Overall Avg Rating", value: stats.reviewStats.overallAvgRating ? stats.reviewStats.overallAvgRating.toFixed(1) : "N/A", icon: <Star size={16} />, cls: "text-blue-400 bg-blue-500/10" },
                ].map((s) => (
                  <motion.div key={s.label} className="glass-card-static p-4 flex items-center gap-3" whileHover={{ y: -1 }}>
                    <div className={`h-9 w-9 rounded-xl ${s.cls} flex items-center justify-center flex-shrink-0`}>
                      {s.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xl font-bold text-[var(--foreground)]">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                      <div className="text-[10px] text-[var(--muted-fg)] truncate">{s.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeInUp>

            {/* ═══════════════════ VISITOR ANALYTICS ═══════════════════ */}
            <FadeInUp delay={0.12}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

                {/* Page Views Breakdown */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <FileText size={14} className="text-[var(--primary)]" />
                    <span className="section-label !mb-0">Page Views</span>
                  </div>
                  {stats.pageBreakdown.length === 0 ? (
                    <p className="text-sm text-[var(--muted-fg)]">No data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.pageBreakdown.map((p, i) => {
                        const total = stats.pageBreakdown.reduce((s, x) => s + x.count, 0);
                        const pct = total > 0 ? (p.count / total * 100) : 0;
                        return (
                          <motion.div key={p._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * i }}>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-[var(--foreground)] font-mono">{p._id || "/"}</span>
                              <span className="text-[var(--muted-fg)]">{p.count} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[var(--surface-sunken)] overflow-hidden">
                              <motion.div
                                className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Device Breakdown */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Monitor size={14} className="text-[var(--primary)]" />
                    <span className="section-label !mb-0">Devices</span>
                  </div>
                  {stats.deviceBreakdown.length === 0 ? (
                    <p className="text-sm text-[var(--muted-fg)]">No data yet</p>
                  ) : (
                    <div className="space-y-4">
                      {stats.deviceBreakdown.map((d, i) => {
                        const total = stats.deviceBreakdown.reduce((s, x) => s + x.count, 0);
                        const pct = total > 0 ? (d.count / total * 100) : 0;
                        return (
                          <motion.div key={d._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * i }}>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="flex items-center gap-2 text-[var(--foreground)]">
                                {deviceIcon(d._id)}
                                <span className="capitalize">{d._id || "Unknown"}</span>
                              </span>
                              <span className="text-[var(--muted-fg)] text-xs font-mono">{d.count} ({pct.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-[var(--surface-sunken)] overflow-hidden">
                              <motion.div
                                className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Referrer Sources */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Globe size={14} className="text-[var(--primary)]" />
                    <span className="section-label !mb-0">Traffic Sources</span>
                  </div>
                  {stats.referrerBreakdown.length === 0 ? (
                    <div className="text-center py-6">
                      <Globe size={24} className="text-[var(--muted-fg)] mx-auto mb-2 opacity-40" />
                      <p className="text-xs text-[var(--muted-fg)]">No referrer data yet — all direct visits</p>
                    </div>
                  ) : (
                    <ul className="space-y-2.5">
                      {stats.referrerBreakdown.map((r, i) => (
                        <motion.li
                          key={r._id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-sunken)] transition-colors"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * i }}
                        >
                          <span className="text-xs text-[var(--foreground)] truncate max-w-[180px]">{r._id}</span>
                          <span className="badge badge-primary text-[10px]">{r.count}</span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </FadeInUp>

            {/* ═══════════════════ HOURLY ACTIVITY HEATMAP ═══════════════════ */}
            <FadeInUp delay={0.14}>
              <div className="glass-card p-6 mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={14} className="text-[var(--primary)]" />
                  <span className="section-label !mb-0">Hourly Activity (Last 7 Days)</span>
                </div>
                <div className="grid grid-cols-12 gap-1.5">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const entry = stats.hourlyActivity.find((h) => h._id === hour);
                    const count = entry?.count || 0;
                    const maxCount = Math.max(...stats.hourlyActivity.map((h) => h.count), 1);
                    const intensity = count / maxCount;
                    return (
                      <motion.div
                        key={hour}
                        className="flex flex-col items-center gap-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.02 * hour }}
                      >
                        <div
                          className="w-full aspect-square rounded-md border border-[var(--border)] transition-colors"
                          style={{
                            backgroundColor: count > 0
                              ? `rgba(99, 102, 241, ${0.15 + intensity * 0.7})`
                              : "var(--surface-sunken)",
                          }}
                          title={`${hour}:00 — ${count} visits`}
                        />
                        <span className="text-[9px] text-[var(--muted-fg)] font-mono">{hour}</span>
                      </motion.div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[var(--muted-fg)] mt-3 text-center">Hours (UTC) — darker = more visits</p>
              </div>
            </FadeInUp>

            {/* ═══════════════════ RECENT VISITORS LOG ═══════════════════ */}
            <FadeInUp delay={0.16}>
              <div className="glass-card p-6 mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <Users size={14} className="text-[var(--primary)]" />
                  <span className="section-label !mb-0">Recent Visitor Activity</span>
                  <span className="badge badge-primary ml-1">Live</span>
                </div>
                {stats.recentVisitors.length === 0 ? (
                  <p className="text-sm text-[var(--muted-fg)]">No visitor data yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table-premium text-xs">
                      <thead>
                        <tr>
                          <th className="text-left">Time</th>
                          <th className="text-left">Page</th>
                          <th className="text-center">Device</th>
                          <th className="text-center">Browser</th>
                          <th className="text-left">Referrer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentVisitors.slice(0, 25).map((v, i) => (
                          <tr key={i}>
                            <td className="text-[var(--muted-fg)] whitespace-nowrap">{timeAgo(v.createdAt)}</td>
                            <td className="text-[var(--foreground)] font-mono">{v.page}</td>
                            <td className="text-center">
                              <span className="inline-flex items-center gap-1 text-[var(--muted-fg)]">
                                {deviceIcon(v.deviceType)}
                                <span className="capitalize">{v.deviceType}</span>
                              </span>
                            </td>
                            <td className="text-center text-[var(--foreground)]">{v.browser}</td>
                            <td className="text-[var(--muted-fg)] max-w-[200px] truncate">{v.referrer || "Direct"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {stats.recentVisitors.length > 25 && (
                      <p className="text-[10px] text-[var(--muted-fg)] mt-2 text-center">
                        Showing 25 of {stats.recentVisitors.length} recent visits
                      </p>
                    )}
                  </div>
                )}
              </div>
            </FadeInUp>

            {/* ═══════════════════ ANALYSIS DEEP STATS ═══════════════════ */}
            <FadeInUp delay={0.18}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

                {/* Language Breakdown */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Code2 size={14} className="text-[var(--primary)]" />
                    <span className="section-label !mb-0">Languages Analyzed</span>
                  </div>
                  {stats.languageBreakdown.length === 0 ? (
                    <p className="text-sm text-[var(--muted-fg)]">No data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.languageBreakdown.map((lang, i) => {
                        const total = stats.languageBreakdown.reduce((s, x) => s + x.count, 0);
                        const pct = total > 0 ? (lang.count / total * 100) : 0;
                        return (
                          <motion.div
                            key={lang._id}
                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--surface-sunken)] transition-colors"
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                          >
                            <span className="text-sm text-[var(--foreground)] flex items-center gap-2.5">
                              <span className="text-[var(--muted-fg)] text-xs font-mono w-5 text-right flex-shrink-0">#{i + 1}</span>
                              <span>{lang._id}</span>
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-[var(--muted-fg)]">
                                avg <span className={`font-bold ${scoreColor(lang.avgScore)}`}>{Math.round(lang.avgScore)}</span>
                              </span>
                              <span className="badge badge-primary">{lang.count} ({pct.toFixed(0)}%)</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Score Distribution + Top Repos */}
                <div className="space-y-5">
                  {/* Score Distribution Card */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <BarChart3 size={14} className="text-[var(--primary)]" />
                      <span className="section-label !mb-0">Score Distribution</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "Excellent", sublabel: "80-100", value: stats.scoreDistribution.excellent, cls: "text-accent-500 bg-accent-500/10 border-accent-500/20" },
                        { label: "Good", sublabel: "60-79", value: stats.scoreDistribution.good, cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                        { label: "Fair", sublabel: "40-59", value: stats.scoreDistribution.fair, cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                        { label: "Poor", sublabel: "0-39", value: stats.scoreDistribution.poor, cls: "text-red-400 bg-red-500/10 border-red-500/20" },
                      ].map((b) => (
                        <motion.div
                          key={b.label}
                          className={`p-3 rounded-xl border text-center ${b.cls}`}
                          whileHover={{ scale: 1.03 }}
                        >
                          <div className="text-xl font-bold">{b.value}</div>
                          <div className="text-[10px] font-semibold mt-0.5">{b.label}</div>
                          <div className="text-[9px] opacity-60">{b.sublabel}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Top Repos */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <TrendingUp size={14} className="text-[var(--primary)]" />
                      <span className="section-label !mb-0">Most Analyzed Repos</span>
                    </div>
                    {stats.topRepos.length === 0 ? (
                      <p className="text-sm text-[var(--muted-fg)]">No data yet</p>
                    ) : (
                      <ul className="space-y-2">
                        {stats.topRepos.map((repo, i) => (
                          <motion.li
                            key={repo._id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-sunken)] transition-colors"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                          >
                            <span className="text-xs text-[var(--foreground)] flex items-center gap-2 min-w-0">
                              <span className="text-[var(--muted-fg)] font-mono w-4 text-right flex-shrink-0">#{i + 1}</span>
                              <span className="truncate">{repo._id}</span>
                            </span>
                            <span className="badge badge-primary flex-shrink-0 ml-2">{repo.count}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* ═══════════════════ RECENT ANALYSES (DEEP TABLE) ═══════════════════ */}
            <FadeInUp delay={0.2}>
              <div className="glass-card p-6 mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 size={14} className="text-[var(--primary)]" />
                  <span className="section-label !mb-0">Recent Analyses (Detailed)</span>
                  <span className="badge badge-primary ml-1">{stats.recentAnalyses.length}</span>
                </div>
                {stats.recentAnalyses.length === 0 ? (
                  <p className="text-sm text-[var(--muted-fg)]">No analyses yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table-premium text-xs">
                      <thead>
                        <tr>
                          <th className="text-left">Repository</th>
                          <th className="text-center">Language</th>
                          <th className="text-center">Stars</th>
                          <th className="text-center">Score</th>
                          <th className="text-center">Code</th>
                          <th className="text-center">Docs</th>
                          <th className="text-center">Security</th>
                          <th className="text-center">Health</th>
                          <th className="text-center">Complexity</th>
                          <th className="text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentAnalyses.map((a, i) => (
                          <tr key={i}>
                            <td className="text-[var(--foreground)] font-medium max-w-[200px] truncate">{a.repoFullName}</td>
                            <td className="text-center text-[var(--muted-fg)]">{a.language}</td>
                            <td className="text-center text-amber-400">{a.stars > 0 ? `★${a.stars.toLocaleString()}` : "—"}</td>
                            <td className="text-center">
                              <span className={`font-bold ${scoreColor(a.overallScore)}`}>{a.overallScore}</span>
                            </td>
                            <td className="text-center">
                              <span className={scoreColor(a.codeQuality)}>{a.codeQuality}</span>
                            </td>
                            <td className="text-center">
                              <span className={scoreColor(a.documentation)}>{a.documentation}</span>
                            </td>
                            <td className="text-center">
                              <span className={scoreColor(a.security)}>{a.security}</span>
                            </td>
                            <td className="text-center">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${healthBadge(a.repoHealth)}`}>
                                {a.repoHealth}
                              </span>
                            </td>
                            <td className="text-center text-[var(--muted-fg)]">{a.complexityLevel}</td>
                            <td className="text-right text-[var(--muted-fg)] whitespace-nowrap">
                              {timeAgo(a.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </FadeInUp>

            {/* ═══════════════════ ALL REVIEWS (TABBED) ═══════════════════ */}
            <FadeInUp delay={0.22}>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-[var(--primary)]" />
                    <span className="section-label !mb-0">All Reviews</span>
                  </div>
                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-[var(--surface-sunken)] rounded-xl p-1">
                    {(["pending", "approved", "rejected", "all"] as const).map((tab) => {
                      const count =
                        tab === "pending" ? stats.reviewStats.pending :
                          tab === "approved" ? stats.reviewStats.approved :
                            tab === "rejected" ? stats.reviewStats.rejected :
                              stats.reviewStats.total;
                      return (
                        <button
                          key={tab}
                          onClick={() => setReviewTab(tab)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${reviewTab === tab
                            ? "bg-[var(--surface-overlay)] text-[var(--foreground)] shadow-sm"
                            : "text-[var(--muted-fg)] hover:text-[var(--foreground)]"
                            }`}
                        >
                          {tab} {count > 0 && <span className="ml-1 opacity-60">({count})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(() => {
                  const reviews = getFilteredReviews();
                  if (reviews.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <CheckCircle2 size={28} className="text-accent-500 mx-auto mb-2" />
                        <p className="text-sm text-[var(--muted-fg)]">
                          {reviewTab === "pending" ? "No pending reviews — all caught up!" : `No ${reviewTab} reviews found.`}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      {reviews.map((review, i) => (
                        <motion.div
                          key={review._id}
                          className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-sunken)]"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + i * 0.03 }}
                        >
                          <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-[var(--foreground)]">{review.userName}</span>
                              {review.email && (
                                <span className="text-[10px] text-[var(--muted-fg)]">({review.email})</span>
                              )}
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }, (_, idx) => (
                                  <Star
                                    key={idx}
                                    size={12}
                                    className={idx < review.rating ? "fill-amber-400 text-amber-400" : "text-[var(--border)]"}
                                  />
                                ))}
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${statusBadge(review.status)}`}>
                                {review.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-[var(--muted-fg)] whitespace-nowrap">
                              {timeAgo(review.createdAt)}
                            </span>
                          </div>

                          {review.githubUrl && (
                            <a
                              href={review.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-primary-500 hover:underline mb-1 block truncate"
                            >
                              {review.githubUrl}
                            </a>
                          )}

                          <p className="text-sm text-[var(--muted-fg)] mb-3 leading-relaxed">{review.comment}</p>

                          <div className="flex gap-2 flex-wrap">
                            {review.status !== "approved" && (
                              <motion.button
                                onClick={() => handleReviewAction(review._id, "approve")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                           bg-accent-500/10 text-accent-500 hover:bg-accent-500/20 transition-colors"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <CheckCircle2 size={12} />
                                Approve
                              </motion.button>
                            )}
                            {review.status !== "rejected" && (
                              <motion.button
                                onClick={() => handleReviewAction(review._id, "reject")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                           bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <XCircle size={12} />
                                Reject
                              </motion.button>
                            )}
                            <motion.button
                              onClick={() => handleReviewAction(review._id, "delete")}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                         bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Trash2 size={12} />
                              Delete
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </FadeInUp>
          </>
        ) : null}
      </main>
    </div>
  );
}
