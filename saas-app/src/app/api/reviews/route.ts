/*
 * ============================================
 * /api/reviews — Review CRUD Endpoints
 * ============================================
 *
 * GET: Fetch approved reviews (public)
 * POST: Submit a new review (pending approval)
 *
 * SPAM PROTECTION:
 * - Rate limit: 1 review per email per 24 hours
 * - Max comment length: 1000 chars
 * - Admin must approve before public display
 */

import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { NextRequest, NextResponse } from "next/server";

// GET — Fetch approved reviews
export async function GET() {
  try {
    await connectDB();

    const reviews = await Review.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-ipAddress -userAgent -email")
      .lean();

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "0";

    return NextResponse.json({
      reviews,
      averageRating: parseFloat(averageRating),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    // Return empty reviews if DB not available (graceful degradation)
    return NextResponse.json({
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
    });
  }
}

// POST — Submit a new review
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { userName, email, rating, comment, githubUrl } = body;

    // Validation
    if (!userName || !email || !rating || !comment) {
      return NextResponse.json(
        { error: "Name, email, rating, and comment are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment.length > 1000) {
      return NextResponse.json(
        { error: "Comment must be under 1000 characters" },
        { status: 400 }
      );
    }

    // Spam check: 1 review per email per 24 hours
    const recentReview = await Review.findOne({
      email: email.toLowerCase(),
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (recentReview) {
      return NextResponse.json(
        { error: "You can only submit one review per day" },
        { status: 429 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const review = await Review.create({
      userName: userName.trim(),
      email: email.toLowerCase().trim(),
      rating,
      comment: comment.trim(),
      githubUrl: githubUrl?.trim() || "",
      status: "pending",
      ipAddress: ip,
      userAgent: userAgent.substring(0, 200),
    });

    return NextResponse.json(
      {
        message: "Review submitted! It will appear after admin approval.",
        reviewId: review._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
