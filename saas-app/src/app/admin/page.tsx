"use client";

/*
 * ============================================
 * Admin Dashboard (/admin)
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

interface AdminStats {
  totalVisitors: number;
  uniqueVisitors: number;
  totalAnalyses: number;
  topRepos: Array<{ _id: string; count: number }>;
  reviewStats: { total: number; approved: number; pending: number; averageRating: number };
  dailyVisitors: Array<{ _id: string; count: number }>;
  deviceBreakdown: Array<{ _id: string; count: number }>;
  recentAnalyses: Array<{ repoFullName: string; overallScore: number; createdAt: string }>;
  pendingReviews: Array<{
    _id: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
    status: string;
  }>;
}

const deviceIcon = (device: string) => {
  const d = device.toLowerCase();
  if (d.includes("mobile") || d.includes("phone")) return <Smartphone size={14} />;
  if (d.includes("tablet")) return <Tablet size={14} />;
  return <Monitor size={14} />;
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
        body: JSON.stringify({ username, password }),
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

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-accent-500";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
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
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                    placeholder="Enter username"
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
                <p className="text-xs text-[var(--muted-fg)]">Manage reviews, analytics & more</p>
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
              <p className="text-sm text-[var(--muted-fg)]">Loading stats...</p>
            </div>
          </FadeIn>
        ) : stats ? (
          <>
            {/* Stat Cards */}
            <FadeInUp delay={0.05}>
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Visitors", value: stats.totalVisitors, icon: <Users size={18} />, color: "text-primary-500 bg-primary-500/10" },
                  { label: "Unique Visitors", value: stats.uniqueVisitors, icon: <Users size={18} />, color: "text-accent-500 bg-accent-500/10" },
                  { label: "Analyses Run", value: stats.totalAnalyses, icon: <BarChart3 size={18} />, color: "text-blue-400 bg-blue-500/10" },
                  { label: "Total Reviews", value: stats.reviewStats.total, icon: <MessageSquare size={18} />, color: "text-amber-400 bg-amber-500/10" },
                ].map((s) => (
                  <StaggerItem key={s.label}>
                    <motion.div
                      className="glass-card-static p-5"
                      whileHover={{ y: -2 }}
                    >
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

            {/* AI Dashboard Insights */}
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
                    {/* Executive Summary */}
                    <p className="text-sm text-[var(--muted-fg)] leading-relaxed border-l-2 border-primary-500/30 pl-3">
                      {aiInsights.summary}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Key Metrics */}
                      <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                        <div className="flex items-center gap-1.5 mb-3">
                          <TrendingUp size={14} className="text-primary-500" />
                          <span className="text-xs font-semibold text-primary-500">Key Metrics</span>
                        </div>
                        <ul className="space-y-2">
                          {aiInsights.keyMetrics.map((m, i) => (
                            <li key={i} className="text-xs text-[var(--muted-fg)] flex items-start gap-1.5">
                              <span className="text-primary-500 mt-0.5 flex-shrink-0">{'\u2022'}</span>
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div className="p-4 rounded-xl bg-accent-500/5 border border-accent-500/10">
                        <div className="flex items-center gap-1.5 mb-3">
                          <Lightbulb size={14} className="text-accent-500" />
                          <span className="text-xs font-semibold text-accent-500">AI Recommendations</span>
                        </div>
                        <ul className="space-y-2">
                          {aiInsights.recommendations.map((r, i) => (
                            <li key={i} className="text-xs text-[var(--muted-fg)] flex items-start gap-1.5">
                              <span className="text-accent-500 mt-0.5 flex-shrink-0">{i + 1}.</span>
                              {r}
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

            {/* Review Stats */}
            <FadeInUp delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="glass-card-static p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
                    <CheckCircle2 size={18} className="text-accent-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent-500">{stats.reviewStats.approved}</div>
                    <div className="text-[11px] text-[var(--muted-fg)]">Approved Reviews</div>
                  </div>
                </div>
                <div className="glass-card-static p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Clock size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-400">{stats.reviewStats.pending}</div>
                    <div className="text-[11px] text-[var(--muted-fg)]">Pending Reviews</div>
                  </div>
                </div>
                <div className="glass-card-static p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Star size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--primary)]">
                      {stats.reviewStats.averageRating ? stats.reviewStats.averageRating.toFixed(1) : "N/A"}
                    </div>
                    <div className="text-[11px] text-[var(--muted-fg)]">Avg Rating</div>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Top Repos + Device Breakdown */}
            <FadeInUp delay={0.15}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                {/* Top Repos */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <TrendingUp size={14} className="text-[var(--primary)]" />
                    <span className="section-label !mb-0">Most Analyzed Repos</span>
                  </div>
                  {stats.topRepos.length === 0 ? (
                    <p className="text-sm text-[var(--muted-fg)]">No data yet</p>
                  ) : (
                    <ul className="space-y-3">
                      {stats.topRepos.map((repo, i) => (
                        <motion.li
                          key={repo._id}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--surface-sunken)] transition-colors"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                        >
                          <span className="text-sm text-[var(--foreground)] flex items-center gap-2.5 min-w-0">
                            <span className="text-[var(--muted-fg)] text-xs font-mono w-5 text-right flex-shrink-0">#{i + 1}</span>
                            <span className="truncate">{repo._id}</span>
                          </span>
                          <span className="badge badge-primary flex-shrink-0 ml-2">
                            {repo.count}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Device Breakdown */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Monitor size={14} className="text-[var(--primary)]" />
                    <span className="section-label !mb-0">Device Breakdown</span>
                  </div>
                  {stats.deviceBreakdown.length === 0 ? (
                    <p className="text-sm text-[var(--muted-fg)]">No data yet</p>
                  ) : (
                    <div className="space-y-4">
                      {stats.deviceBreakdown.map((d, i) => {
                        const total = stats.deviceBreakdown.reduce((s, x) => s + x.count, 0);
                        const pct = total > 0 ? (d.count / total * 100) : 0;
                        return (
                          <motion.div
                            key={d._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                          >
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="flex items-center gap-2 text-[var(--foreground)]">
                                {deviceIcon(d._id)}
                                <span className="capitalize">{d._id || "Unknown"}</span>
                              </span>
                              <span className="text-[var(--muted-fg)] text-xs font-mono">{pct.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-[var(--surface-sunken)] overflow-hidden">
                              <motion.div
                                className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </FadeInUp>

            {/* Recent Analyses */}
            <FadeInUp delay={0.2}>
              <div className="glass-card p-6 mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 size={14} className="text-[var(--primary)]" />
                  <span className="section-label !mb-0">Recent Analyses</span>
                </div>
                {stats.recentAnalyses.length === 0 ? (
                  <p className="text-sm text-[var(--muted-fg)]">No analyses yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table-premium">
                      <thead>
                        <tr>
                          <th className="text-left">Repository</th>
                          <th className="text-center">Score</th>
                          <th className="text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentAnalyses.map((a, i) => (
                          <tr key={i}>
                            <td className="text-[var(--foreground)] font-medium">{a.repoFullName}</td>
                            <td className="text-center">
                              <span className={`font-bold ${scoreColor(a.overallScore)}`}>
                                {a.overallScore}
                              </span>
                            </td>
                            <td className="text-right text-[var(--muted-fg)]">
                              {new Date(a.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </FadeInUp>

            {/* Pending Reviews */}
            <FadeInUp delay={0.25}>
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={14} className="text-amber-400" />
                  <span className="section-label !mb-0">Pending Reviews</span>
                  {stats.pendingReviews.length > 0 && (
                    <span className="badge badge-warning ml-1">{stats.pendingReviews.length}</span>
                  )}
                </div>
                {stats.pendingReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 size={28} className="text-accent-500 mx-auto mb-2" />
                    <p className="text-sm text-[var(--muted-fg)]">No pending reviews — all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.pendingReviews.map((review, i) => (
                      <motion.div
                        key={review._id}
                        className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-sunken)]"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[var(--foreground)]">{review.userName}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }, (_, idx) => (
                                <Star
                                  key={idx}
                                  size={12}
                                  className={idx < review.rating ? "fill-amber-400 text-amber-400" : "text-[var(--border)]"}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-[11px] text-[var(--muted-fg)]">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted-fg)] mb-4 line-clamp-3">{review.comment}</p>
                        <div className="flex gap-2">
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
                )}
              </div>
            </FadeInUp>
          </>
        ) : null}
      </main>
    </div>
  );
}
