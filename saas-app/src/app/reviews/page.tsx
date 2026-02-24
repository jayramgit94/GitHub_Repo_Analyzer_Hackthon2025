"use client";

/*
 * ============================================
 * Reviews Page (/reviews) — AI-Enhanced
 * ============================================
 */

import { FadeIn, FadeInUp, StaggerContainer, StaggerItem } from "@/components/Motion";
import Navbar from "@/components/Navbar";
import ReviewCard from "@/components/ReviewCard";
import StarRating from "@/components/StarRating";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Lightbulb, Loader2, MessageSquare, Send, Sparkles, ThumbsUp, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  githubUrl?: string;
  createdAt: string;
}

interface AIInsights {
  sentiment: "positive" | "mixed" | "negative";
  summary: string;
  highlights: string[];
  commonThemes: string[];
  improvementAreas: string[];
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  /* AI State */
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);

  /* Form state */
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [formGithubUrl, setFormGithubUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
      setAvgRating(data.averageRating || 0);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAiInsights = useCallback(async () => {
    setAiInsightsLoading(true);
    try {
      const res = await fetch("/api/ai/review-insights");
      const data = await res.json();
      setAiInsights(data);
    } catch {
      // fail silently
    } finally {
      setAiInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Fetch AI insights after reviews load
  useEffect(() => {
    if (!loading) {
      fetchAiInsights();
    }
  }, [loading, fetchAiInsights]);

  const handleEnhanceComment = async () => {
    if (formComment.length < 10) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/ai/enhance-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: formComment, rating: formRating }),
      });
      const data = await res.json();
      if (data.wasEnhanced) {
        setFormComment(data.enhanced);
      }
    } catch {
      // fail silently
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRating === 0) {
      setSubmitMsg({ type: "error", text: "Please select a star rating." });
      return;
    }

    setSubmitting(true);
    setSubmitMsg(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: formName,
          email: formEmail,
          rating: formRating,
          comment: formComment,
          githubUrl: formGithubUrl || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitMsg({ type: "success", text: "Review submitted! It will appear after admin approval." });
        setFormName("");
        setFormEmail("");
        setFormRating(0);
        setFormComment("");
        setFormGithubUrl("");
      } else {
        setSubmitMsg({ type: "error", text: data.error || "Failed to submit review." });
      }
    } catch {
      setSubmitMsg({ type: "error", text: "Network error." });
    } finally {
      setSubmitting(false);
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

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16 relative z-10">
        {/* Header */}
        <FadeInUp>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--muted-fg)] mb-6">
              <MessageSquare size={12} className="text-primary-500" />
              Community Feedback
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
              Community <span className="gradient-text">Reviews</span>
            </h1>
            <p className="text-sm text-[var(--muted-fg)] max-w-lg mx-auto">
              See what developers think about GitRepo Analyzer. Share your experience too!
            </p>

            {/* Average Rating */}
            {avgRating > 0 && (
              <motion.div
                className="inline-flex items-center gap-4 mt-8 glass-card-static px-6 py-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-4xl font-bold gradient-text">{avgRating.toFixed(1)}</span>
                <div className="text-left">
                  <StarRating rating={Math.round(avgRating)} readOnly size="md" />
                  <p className="text-xs text-[var(--muted-fg)] mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                </div>
              </motion.div>
            )}
          </div>
        </FadeInUp>

        {/* AI Insights Section */}
        {(aiInsights || aiInsightsLoading) && (
          <FadeInUp delay={0.1}>
            <div className="mb-10">
              <button
                onClick={() => setShowAiInsights(!showAiInsights)}
                className="flex items-center gap-2 mx-auto mb-4 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/5 text-sm font-medium text-primary-400 hover:bg-primary-500/10 transition-colors"
              >
                <Bot size={16} className="text-primary-500" />
                {showAiInsights ? "Hide" : "Show"} AI Review Analysis
                <Sparkles size={14} className="text-primary-400" />
              </button>

              <AnimatePresence>
                {showAiInsights && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {aiInsightsLoading ? (
                      <div className="glass-card p-8 text-center">
                        <Loader2 size={24} className="animate-spin text-primary-500 mx-auto mb-3" />
                        <p className="text-sm text-[var(--muted-fg)]">AI is analyzing reviews...</p>
                      </div>
                    ) : aiInsights ? (
                      <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[var(--foreground)]">AI Review Analysis</h3>
                            <p className="text-[11px] text-[var(--muted-fg)]">Powered by Gemini AI</p>
                          </div>
                          <span className={`ml-auto badge ${
                            aiInsights.sentiment === "positive" ? "badge-success" :
                            aiInsights.sentiment === "negative" ? "badge-critical" : "badge-warning"
                          }`}>
                            {aiInsights.sentiment === "positive" ? "Positive" :
                             aiInsights.sentiment === "negative" ? "Negative" : "Mixed"} Sentiment
                          </span>
                        </div>

                        {/* Summary */}
                        <p className="text-sm text-[var(--muted-fg)] leading-relaxed mb-5 border-l-2 border-primary-500/30 pl-3">
                          {aiInsights.summary}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Highlights */}
                          <div className="p-4 rounded-xl bg-accent-500/5 border border-accent-500/10">
                            <div className="flex items-center gap-1.5 mb-3">
                              <ThumbsUp size={14} className="text-accent-500" />
                              <span className="text-xs font-semibold text-accent-500">Highlights</span>
                            </div>
                            <ul className="space-y-2">
                              {aiInsights.highlights.map((h, i) => (
                                <li key={i} className="text-xs text-[var(--muted-fg)] flex items-start gap-1.5">
                                  <span className="text-accent-500 mt-0.5 flex-shrink-0">+</span>
                                  {h}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Common Themes */}
                          <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                            <div className="flex items-center gap-1.5 mb-3">
                              <TrendingUp size={14} className="text-primary-500" />
                              <span className="text-xs font-semibold text-primary-500">Common Themes</span>
                            </div>
                            <ul className="space-y-2">
                              {aiInsights.commonThemes.map((t, i) => (
                                <li key={i} className="text-xs text-[var(--muted-fg)] flex items-start gap-1.5">
                                  <span className="text-primary-500 mt-0.5 flex-shrink-0">#</span>
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Improvement Areas */}
                          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <div className="flex items-center gap-1.5 mb-3">
                              <Lightbulb size={14} className="text-amber-400" />
                              <span className="text-xs font-semibold text-amber-400">Areas to Improve</span>
                            </div>
                            <ul className="space-y-2">
                              {aiInsights.improvementAreas.map((a, i) => (
                                <li key={i} className="text-xs text-[var(--muted-fg)] flex items-start gap-1.5">
                                  <span className="text-amber-400 mt-0.5 flex-shrink-0">!</span>
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeInUp>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card-static p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-[var(--border)]" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 rounded-lg bg-[var(--border)]" />
                        <div className="h-3 w-16 rounded-lg bg-[var(--border)]" />
                      </div>
                    </div>
                    <div className="h-4 w-full rounded-lg bg-[var(--border)]" />
                    <div className="h-4 w-3/4 rounded-lg bg-[var(--border)] mt-2" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <FadeIn>
                <div className="glass-card p-14 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={24} className="text-[var(--primary)]" />
                  </div>
                  <p className="text-[var(--muted-fg)] text-sm">
                    No reviews yet. Be the first to share your experience!
                  </p>
                </div>
              </FadeIn>
            ) : (
              <StaggerContainer className="space-y-4">
                {reviews.map((review) => (
                  <StaggerItem key={review._id}>
                    <ReviewCard review={review} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>

          {/* Submit Form */}
          <div className="lg:col-span-1">
            <FadeInUp delay={0.15}>
              <div className="glass-card p-6 sticky top-24">
                <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">Write a Review</h2>
                <p className="text-xs text-[var(--muted-fg)] mb-5">Share your experience with the community</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="input-field"
                      placeholder="Your name"
                      required
                      suppressHydrationWarning
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="input-field"
                      placeholder="you@example.com"
                      required
                      suppressHydrationWarning
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Rating</label>
                    <StarRating rating={formRating} onChange={setFormRating} size="lg" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Comment</label>
                    <textarea
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      rows={4}
                      className="input-field resize-none"
                      placeholder="What did you think?"
                      required
                      maxLength={1000}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <motion.button
                        type="button"
                        onClick={handleEnhanceComment}
                        disabled={enhancing || formComment.length < 10}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all
                          ${formComment.length >= 10
                            ? "bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 border border-primary-500/20 cursor-pointer"
                            : "bg-[var(--surface-sunken)] text-[var(--muted-fg)] cursor-not-allowed opacity-50"
                          }`}
                        whileHover={formComment.length >= 10 ? { scale: 1.02 } : {}}
                        whileTap={formComment.length >= 10 ? { scale: 0.98 } : {}}
                      >
                        {enhancing ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} />
                            AI Enhance
                          </>
                        )}
                      </motion.button>
                      <span className="text-[11px] text-[var(--muted-fg)]">
                        {formComment.length}/1000
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                      GitHub URL <span className="text-[var(--muted-fg)] font-normal">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formGithubUrl}
                      onChange={(e) => setFormGithubUrl(e.target.value)}
                      placeholder="https://github.com/owner/repo"
                      className="input-field"
                      suppressHydrationWarning
                    />
                  </div>

                  {submitMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm p-3 rounded-xl ${
                        submitMsg.type === "success"
                          ? "bg-accent-500/10 text-accent-500 border border-accent-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {submitMsg.text}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-3 text-sm"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send size={16} />
                        Submit Review
                      </span>
                    )}
                  </motion.button>
                </form>
              </div>
            </FadeInUp>
          </div>
        </div>
      </main>
    </div>
  );
}
