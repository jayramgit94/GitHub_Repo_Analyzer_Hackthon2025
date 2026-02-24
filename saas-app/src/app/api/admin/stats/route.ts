/*
 * ============================================
 * /api/admin/stats — Admin Dashboard Data (v2)
 * ============================================
 *
 * Returns comprehensive admin analytics:
 * - Visitor counts, recent visitors, page/hour breakdowns
 * - Analysis stats with language & score distributions
 * - All reviews (pending + approved + rejected)
 * - Device breakdown, daily traffic chart
 */

import { connectDB } from "@/lib/mongodb";
import { Analysis } from "@/models/Analysis";
import { Review } from "@/models/Review";
import { Visitor } from "@/models/Visitor";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function verifyAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  try {
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET) as { role: string };
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const [
      totalVisitors,
      uniqueVisitorIps,
      totalAnalyses,
      topReposAgg,
      approvedCount,
      pendingCount,
      rejectedCount,
      avgRatingAgg,
      allAvgRatingAgg,
      dailyVisitors,
      deviceBreakdown,
      recentAnalysesRaw,
      pendingReviewsRaw,
      allReviewsRaw,
      recentVisitorsRaw,
      pageBreakdown,
      hourlyActivity,
      languageBreakdown,
      scoreDistributionRaw,
      referrerBreakdown,
    ] = await Promise.all([
      // ── Visitor Counts ──
      Visitor.countDocuments(),
      Visitor.distinct("ipHash"),

      // ── Analysis Counts ──
      Analysis.countDocuments(),

      // Top repos by analysis count
      Analysis.aggregate([
        { $group: { _id: "$repoFullName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // ── Review Counts ──
      Review.countDocuments({ status: "approved" }),
      Review.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "rejected" }),

      // Average rating (approved only)
      Review.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),

      // Average rating (all reviews)
      Review.aggregate([
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),

      // ── Daily Visitors (30 days) ──
      Visitor.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // ── Device Breakdown ──
      Visitor.aggregate([
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      ]),

      // ── Recent Analyses (more detail) ──
      Analysis.find()
        .sort({ analyzedAt: -1 })
        .limit(30)
        .select("repoFullName language stars forks scores repoHealth complexityLevel analyzedAt")
        .lean(),

      // ── Pending Reviews ──
      Review.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .select("-ipAddress")
        .lean(),

      // ── ALL Reviews (approved + rejected) ──
      Review.find({ status: { $in: ["approved", "rejected"] } })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("-ipAddress")
        .lean(),

      // ── Recent Visitors (last 100) ──
      Visitor.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .select("deviceType page referrer createdAt country userAgent")
        .lean(),

      // ── Page View Breakdown ──
      Visitor.aggregate([
        { $group: { _id: "$page", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // ── Hourly Activity (last 7 days) ──
      Visitor.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // ── Language Breakdown (from analyses) ──
      Analysis.aggregate([
        { $match: { language: { $ne: null } } },
        { $group: { _id: "$language", count: { $sum: 1 }, avgScore: { $avg: "$scores.overall" } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),

      // ── Score Distribution ──
      Analysis.aggregate([
        {
          $bucket: {
            groupBy: "$scores.overall",
            boundaries: [0, 40, 60, 80, 101],
            default: "unknown",
            output: { count: { $sum: 1 } },
          },
        },
      ]),

      // ── Referrer Breakdown ──
      Visitor.aggregate([
        { $match: { referrer: { $ne: "" } } },
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const uniqueVisitors = uniqueVisitorIps.length;
    const averageRating = avgRatingAgg?.[0]?.avg || 0;
    const overallAvgRating = allAvgRatingAgg?.[0]?.avg || 0;

    // Map recent analyses
    const recentAnalyses = recentAnalysesRaw.map((a: Record<string, unknown>) => {
      const scores = a.scores as Record<string, number> | undefined;
      return {
        repoFullName: a.repoFullName as string,
        language: (a.language as string) || "Unknown",
        stars: (a.stars as number) || 0,
        forks: (a.forks as number) || 0,
        overallScore: scores?.overall ?? 0,
        codeQuality: scores?.codeQuality ?? 0,
        documentation: scores?.documentation ?? 0,
        security: scores?.security ?? 0,
        repoHealth: (a.repoHealth as string) || "Unknown",
        complexityLevel: (a.complexityLevel as string) || "Unknown",
        createdAt: (a.analyzedAt as Date)?.toISOString?.() ?? new Date().toISOString(),
      };
    });

    // Map recent visitors — extract browser from user agent
    const recentVisitors = recentVisitorsRaw.map((v: Record<string, unknown>) => {
      const ua = (v.userAgent as string) || "";
      let browser = "Unknown";
      if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
      else if (ua.includes("Edg")) browser = "Edge";
      else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

      return {
        deviceType: (v.deviceType as string) || "desktop",
        page: (v.page as string) || "/",
        referrer: (v.referrer as string) || "",
        country: (v.country as string) || "",
        browser,
        createdAt: (v.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
      };
    });

    // Score distribution labels
    const scoreDist = { excellent: 0, good: 0, fair: 0, poor: 0 };
    for (const bucket of scoreDistributionRaw) {
      const id = bucket._id as number | string;
      if (id === 80) scoreDist.excellent = bucket.count;
      else if (id === 60) scoreDist.good = bucket.count;
      else if (id === 40) scoreDist.fair = bucket.count;
      else if (id === 0) scoreDist.poor = bucket.count;
    }

    return NextResponse.json({
      // ── Overview Cards ──
      totalVisitors,
      uniqueVisitors,
      totalAnalyses,
      totalReviews: approvedCount + pendingCount + rejectedCount,

      // ── Review Stats ──
      reviewStats: {
        total: approvedCount + pendingCount + rejectedCount,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
        averageRating,
        overallAvgRating,
      },

      // ── Repos ──
      topRepos: topReposAgg,
      languageBreakdown,
      scoreDistribution: scoreDist,

      // ── Visitor Detail ──
      dailyVisitors,
      deviceBreakdown,
      pageBreakdown,
      hourlyActivity,
      referrerBreakdown,
      recentVisitors,

      // ── Analyses ──
      recentAnalyses,

      // ── Reviews ──
      pendingReviews: pendingReviewsRaw,
      allReviews: allReviewsRaw,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
