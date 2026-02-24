/*
 * ============================================
 * /api/ai/review-insights — AI Review Analysis
 * ============================================
 *
 * GET: Returns AI-generated sentiment analysis
 *      and insights from approved reviews
 */

import { getReviewInsights } from "@/lib/ai-helper";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const reviews = await Review.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("userName rating comment createdAt")
      .lean();

    const insights = await getReviewInsights(
      reviews.map((r) => ({
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt?.toString() || "",
      }))
    );

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Failed to generate review insights:", error);
    return NextResponse.json({
      sentiment: "mixed",
      summary: "Unable to analyze reviews at this time.",
      highlights: [],
      commonThemes: [],
      improvementAreas: [],
    });
  }
}
