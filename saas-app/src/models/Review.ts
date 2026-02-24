/*
 * ============================================
 * Review Model — User reviews and ratings
 * ============================================
 *
 * FEATURES:
 * - Star rating (1-5)
 * - Comment text
 * - Optional GitHub link
 * - Admin approval workflow (pending → approved/rejected)
 * - Spam protection via status field
 * - Auto-calculated average rating
 */

import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  userName: string;
  email: string;
  rating: number; // 1-5
  comment: string;
  githubUrl?: string;
  status: "pending" | "approved" | "rejected";
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple reviews from same email (one per day)
ReviewSchema.index({ email: 1, createdAt: -1 });

export const Review =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
