/*
 * ============================================
 * /api/ai/enhance-review — AI Review Enhancer
 * ============================================
 *
 * POST: Takes a draft review comment and rating,
 *       returns an AI-enhanced version
 */

import { enhanceReviewComment } from "@/lib/ai-helper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { comment, rating } = body;

    if (!comment || typeof comment !== "string") {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 }
      );
    }

    if (comment.length < 10) {
      return NextResponse.json(
        { error: "Comment must be at least 10 characters for AI enhancement" },
        { status: 400 }
      );
    }

    if (comment.length > 1000) {
      return NextResponse.json(
        { error: "Comment is too long" },
        { status: 400 }
      );
    }

    const result = await enhanceReviewComment(comment.trim(), rating || 5);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to enhance review:", error);
    return NextResponse.json(
      { error: "Failed to enhance review" },
      { status: 500 }
    );
  }
}
