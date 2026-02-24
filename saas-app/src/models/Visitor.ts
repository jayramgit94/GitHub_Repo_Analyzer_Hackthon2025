/*
 * ============================================
 * Visitor Model — Track site visits for admin
 * ============================================
 *
 * TRACKS:
 * - Total page views
 * - Unique visitors (by IP fingerprint)
 * - Device type (mobile/desktop)
 * - Pages visited
 * - Timestamp for daily/weekly graphs
 *
 * PRIVACY: Only stores hashed IP, not raw IP
 */

import mongoose, { Document, Schema } from "mongoose";

export interface IVisitor extends Document {
  ipHash: string; // Hashed IP for privacy
  userAgent: string;
  deviceType: "mobile" | "desktop" | "tablet";
  page: string;
  referrer: string;
  country?: string;
  createdAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    ipHash: { type: String, required: true, index: true },
    userAgent: { type: String, default: "" },
    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "tablet"],
      default: "desktop",
    },
    page: { type: String, default: "/" },
    referrer: { type: String, default: "" },
    country: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // Manual createdAt for better control
  }
);

// TTL index: auto-delete visits older than 90 days for GDPR
VisitorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const Visitor =
  mongoose.models.Visitor || mongoose.model<IVisitor>("Visitor", VisitorSchema);
