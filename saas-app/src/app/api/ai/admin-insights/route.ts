/*
 * ============================================
 * /api/ai/admin-insights — AI Admin Analytics
 * ============================================
 *
 * GET: Returns AI-generated insights from admin
 *      dashboard stats (requires auth)
 */

import { getAdminInsights } from "@/lib/ai-helper";
import { connectDB } from "@/lib/mongodb";
import { Analysis } from "@/models/Analysis";
import { Review } from "@/models/Review";
import { Visitor } from "@/models/Visitor";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Verify admin auth
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    await connectDB();

    // Gather stats
    const [totalVisitors, uniqueVisitors, totalAnalyses, topRepos, reviewStats, dailyVisitors] =
      await Promise.all([
        Visitor.countDocuments(),
        Visitor.distinct("ipAddress").then((ips) => ips.length),
        Analysis.countDocuments(),
        Analysis.aggregate([
          { $group: { _id: "$repoFullName", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
        Review.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
              pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
              averageRating: { $avg: "$rating" },
            },
          },
        ]),
        Visitor.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 7 },
        ]),
      ]);

    const rs = reviewStats[0] || { total: 0, approved: 0, pending: 0, averageRating: 0 };

    const insights = await getAdminInsights({
      totalVisitors,
      uniqueVisitors,
      totalAnalyses,
      topRepos,
      reviewStats: rs,
      dailyVisitors,
    });

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Failed to generate admin insights:", error);
    return NextResponse.json({
      summary: "Unable to generate insights at this time.",
      keyMetrics: [],
      recommendations: [],
    });
  }
}
