/*
 * ============================================
 * AI Helper — Reusable Groq AI Integration
 * ============================================
 *
 * Provides reusable functions for calling Groq AI
 * (LLaMA 3.3 70B) across the app (reviews, admin
 * insights, etc.). Ultra-fast inference via Groq LPU.
 * Always includes graceful fallback when AI is unavailable.
 */

import { callGroq, callGroqJSON } from "./groq-client";

/**
 * Generate AI-powered sentiment summary from reviews
 */
export async function getReviewInsights(
  reviews: Array<{ userName: string; rating: number; comment: string; createdAt: string }>
): Promise<{
  sentiment: "positive" | "mixed" | "negative";
  summary: string;
  highlights: string[];
  commonThemes: string[];
  improvementAreas: string[];
}> {
  // Calculate basic metrics for fallback
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  if (!process.env.GROQ_API_KEY || reviews.length === 0) {
    return generateFallbackReviewInsights(reviews, avgRating);
  }

  try {
    const reviewTexts = reviews
      .slice(0, 30)
      .map((r, i) => `Review ${i + 1} (${r.rating}/5 stars): "${r.comment}"`)
      .join("\n");

    const prompt = `You are an AI analyzing user reviews for a developer tool called "GitRepo Analyzer" — an AI-powered GitHub repository analysis platform.

Here are the reviews:
${reviewTexts}

Average Rating: ${avgRating.toFixed(1)}/5
Total Reviews: ${reviews.length}

Provide a JSON response with EXACTLY this structure (no markdown, no code fences, pure JSON):
{
  "sentiment": "positive" or "mixed" or "negative",
  "summary": "A 2-3 sentence overview of what users think about the tool, mentioning specific patterns",
  "highlights": ["3-4 specific positive things users mentioned"],
  "commonThemes": ["3-4 recurring themes across reviews"],
  "improvementAreas": ["2-3 areas where users suggest improvements"]
}

Be specific and reference actual review content. Don't be generic.`;

    const parsed = await callGroqJSON<{
      sentiment?: string;
      summary?: string;
      highlights?: string[];
      commonThemes?: string[];
      improvementAreas?: string[];
    }>([
      { role: "system", content: "You are a review analysis AI. Always respond with valid JSON only." },
      { role: "user", content: prompt },
    ]);

    if (!parsed) {
      return generateFallbackReviewInsights(reviews, avgRating);
    }

    return {
      sentiment: (parsed.sentiment as "positive" | "mixed" | "negative") || (avgRating >= 4 ? "positive" : avgRating >= 3 ? "mixed" : "negative"),
      summary: parsed.summary || "Analysis complete.",
      highlights: parsed.highlights || [],
      commonThemes: parsed.commonThemes || [],
      improvementAreas: parsed.improvementAreas || [],
    };
  } catch (error) {
    console.error("AI review insights failed, using fallback:", error);
    return generateFallbackReviewInsights(reviews, avgRating);
  }
}

function generateFallbackReviewInsights(
  reviews: Array<{ userName: string; rating: number; comment: string }>,
  avgRating: number
) {
  const sentiment: "positive" | "mixed" | "negative" =
    avgRating >= 4 ? "positive" : avgRating >= 2.5 ? "mixed" : "negative";

  const fiveStars = reviews.filter((r) => r.rating === 5).length;
  const lowRatings = reviews.filter((r) => r.rating <= 2).length;

  return {
    sentiment,
    summary: reviews.length === 0
      ? "No reviews yet. Be the first to share your experience with GitRepo Analyzer!"
      : `Based on ${reviews.length} review${reviews.length > 1 ? "s" : ""} with an average rating of ${avgRating.toFixed(1)}/5, the community sentiment is ${sentiment}. ${fiveStars > 0 ? `${fiveStars} user${fiveStars > 1 ? "s" : ""} gave a perfect 5-star rating.` : ""}`,
    highlights: reviews.length > 0
      ? [
          `${avgRating.toFixed(1)}/5 average rating across ${reviews.length} reviews`,
          fiveStars > 0 ? `${fiveStars} perfect 5-star reviews` : "Growing community feedback",
          reviews.length >= 5 ? "Active community engagement" : "Community is growing",
        ]
      : ["Be the first to review!"],
    commonThemes: reviews.length > 0
      ? ["Repository analysis quality", "AI-powered insights", "Developer experience"]
      : ["Repository analysis", "AI insights"],
    improvementAreas: lowRatings > 0
      ? ["Some users reported lower satisfaction", "Room for improvement based on feedback"]
      : ["Keep collecting feedback to identify areas for improvement"],
  };
}

/**
 * Enhance a user's review comment using AI
 */
export async function enhanceReviewComment(
  comment: string,
  rating: number
): Promise<{
  enhanced: string;
  wasEnhanced: boolean;
}> {
  if (!process.env.GROQ_API_KEY || comment.length < 10) {
    return { enhanced: comment, wasEnhanced: false };
  }

  try {
    const prompt = `You are a helpful writing assistant. A user is writing a review for a developer tool called "GitRepo Analyzer" (an AI-powered GitHub repository analysis platform).

Their draft review (${rating}/5 stars):
"${comment}"

Improve this review to be more detailed, helpful, and well-structured while keeping the user's original tone and opinion. Make it sound natural, not robotic. Keep it under 250 words. Don't add any new opinions that the user didn't express — just enhance their existing ones.

Return ONLY the enhanced review text, nothing else. No quotes, no explanation, just the enhanced review.`;

    const enhanced = await callGroq([
      { role: "system", content: "You are a writing assistant. Return only the enhanced text, no explanation." },
      { role: "user", content: prompt },
    ]);

    if (!enhanced || enhanced.length > 1000 || enhanced.length < 10) {
      return { enhanced: comment, wasEnhanced: false };
    }

    return { enhanced, wasEnhanced: true };
  } catch (error) {
    console.error("AI enhance comment failed:", error);
    return { enhanced: comment, wasEnhanced: false };
  }
}

/**
 * Generate AI-powered admin insights from dashboard stats
 */
export async function getAdminInsights(stats: {
  totalVisitors: number;
  uniqueVisitors: number;
  totalAnalyses: number;
  topRepos: Array<{ _id: string; count: number }>;
  reviewStats: { total: number; approved: number; pending: number; averageRating: number };
  dailyVisitors: Array<{ _id: string; count: number }>;
}): Promise<{
  summary: string;
  keyMetrics: string[];
  recommendations: string[];
}> {
  if (!process.env.GROQ_API_KEY) {
    return generateFallbackAdminInsights(stats);
  }

  try {
    const prompt = `You are a data analyst for "GitRepo Analyzer" — an AI-powered SaaS platform. Analyze these admin dashboard metrics:

Total Visitors: ${stats.totalVisitors}
Unique Visitors: ${stats.uniqueVisitors}
Total Analyses Run: ${stats.totalAnalyses}
Top Analyzed Repos: ${stats.topRepos.map((r) => `${r._id} (${r.count}x)`).join(", ") || "None yet"}
Reviews: ${stats.reviewStats.total} total, ${stats.reviewStats.approved} approved, ${stats.reviewStats.pending} pending
Average Rating: ${stats.reviewStats.averageRating || "N/A"}
Daily Visitor Trend: ${stats.dailyVisitors.map((d) => `${d._id}: ${d.count}`).join(", ") || "No data"}

Provide a JSON response with EXACTLY this structure (no markdown, no code fences, pure JSON):
{
  "summary": "A 2-3 sentence executive summary of platform health and growth",
  "keyMetrics": ["3-4 key metric observations with specific numbers"],
  "recommendations": ["3-4 actionable recommendations to grow the platform"]
}

Be specific with numbers. Reference actual data.`;

    const parsed = await callGroqJSON<{
      summary?: string;
      keyMetrics?: string[];
      recommendations?: string[];
    }>([
      { role: "system", content: "You are a data analyst AI. Always respond with valid JSON only." },
      { role: "user", content: prompt },
    ]);

    if (!parsed) {
      return generateFallbackAdminInsights(stats);
    }

    return {
      summary: parsed.summary || "Dashboard analysis complete.",
      keyMetrics: parsed.keyMetrics || [],
      recommendations: parsed.recommendations || [],
    };
  } catch (error) {
    console.error("AI admin insights failed, using fallback:", error);
    return generateFallbackAdminInsights(stats);
  }
}

function generateFallbackAdminInsights(stats: {
  totalVisitors: number;
  uniqueVisitors: number;
  totalAnalyses: number;
  reviewStats: { total: number; approved: number; pending: number; averageRating: number };
}) {
  const conversionRate = stats.totalVisitors > 0
    ? ((stats.totalAnalyses / stats.totalVisitors) * 100).toFixed(1)
    : "0";
  const returnRate = stats.totalVisitors > 0 && stats.uniqueVisitors > 0
    ? (((stats.totalVisitors - stats.uniqueVisitors) / stats.totalVisitors) * 100).toFixed(1)
    : "0";

  return {
    summary: `Platform has ${stats.totalVisitors} total visitors with ${stats.totalAnalyses} analyses run. ${stats.reviewStats.total > 0 ? `Community engagement shows ${stats.reviewStats.total} reviews with an average rating of ${stats.reviewStats.averageRating?.toFixed(1) || "N/A"}/5.` : "Community reviews are just getting started."}`,
    keyMetrics: [
      `${conversionRate}% visitor-to-analysis conversion rate`,
      `${returnRate}% estimated return visitor rate`,
      `${stats.uniqueVisitors} unique visitors discovered the platform`,
      stats.reviewStats.pending > 0
        ? `${stats.reviewStats.pending} reviews awaiting moderation`
        : "All reviews are moderated — great job!",
    ],
    recommendations: [
      "Share analyzed repos on social media to drive organic traffic",
      "Encourage users to leave reviews after analysis completes",
      stats.reviewStats.pending > 0
        ? "Review pending submissions to maintain community engagement"
        : "Continue monitoring for new review submissions",
      "Add more repository analysis features to increase retention",
    ],
  };
}
