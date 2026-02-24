/*
 * ============================================
 * /api/admin/stats — Admin Dashboard Data
 * ============================================
 *
 * Returns:
 * - Total visitors (all time)
 * - Unique visitors (by IP hash)
 * - Total analyses performed
 * - Most analyzed repos
 * - Review stats
 * - Daily visitor chart data
 * - Device breakdown
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
  // Auth check
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Parallel DB queries for speed
    const [
      totalVisitors,
      uniqueVisitors,
      totalAnalyses,
      topRepos,
      reviewStats,
      dailyVisitors,
      deviceBreakdown,
      recentAnalyses,
      pendingReviews,
    ] = await Promise.all([
      // Total visits
      Visitor.countDocuments(),

      // Unique visitors
      Visitor.distinct("ipHash").then((ips) => ips.length),

      // Total analyses
      Analysis.countDocuments(),

      // Most analyzed repos
      Analysis.find()
        .sort({ stars: -1 })
        .limit(10)
        .select("repoFullName stars forks language scores.overall analyzedAt")
        .lean(),

      // Review stats
      Promise.all([
        Review.countDocuments({ status: "approved" }),
        Review.countDocuments({ status: "pending" }),
        Review.countDocuments({ status: "rejected" }),
        Review.aggregate([
          { $match: { status: "approved" } },
          { $group: { _id: null, avg: { $avg: "$rating" } } },
        ]),
      ]),

      // Daily visitors (last 30 days)
      Visitor.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Device breakdown
      Visitor.aggregate([
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      ]),

      // Recent analyses
      Analysis.find()
        .sort({ analyzedAt: -1 })
        .limit(20)
        .select("repoFullName language scores.overall analyzedAt repoHealth")
        .lean(),

      // Pending reviews
      Review.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .select("-ipAddress")
        .lean(),
    ]);

    return NextResponse.json({
      overview: {
        totalVisitors,
        uniqueVisitors,
        totalAnalyses,
        approvedReviews: reviewStats[0],
        pendingReviews: reviewStats[1],
        rejectedReviews: reviewStats[2],
        averageRating: reviewStats[3]?.[0]?.avg?.toFixed(1) || "0",
      },
      topRepos,
      dailyVisitors,
      deviceBreakdown,
      recentAnalyses,
      pendingReviews,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
