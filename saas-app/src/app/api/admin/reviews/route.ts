/*
 * ============================================
 * /api/admin/reviews — Review Moderation
 * ============================================
 *
 * PATCH: Approve or reject a review
 * DELETE: Delete a review
 */

import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";
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

// PATCH — Approve or reject a review
export async function PATCH(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { reviewId, status } = await req.json();

    if (!reviewId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Valid reviewId and status (approved/rejected) required" },
        { status: 400 }
      );
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ message: `Review ${status}`, review });
  } catch (error) {
    console.error("Review moderation error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE — Remove a review
export async function DELETE(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    await Review.findByIdAndDelete(reviewId);
    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Review delete error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
