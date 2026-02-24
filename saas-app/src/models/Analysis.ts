/*
 * ============================================
 * Analysis Model — Stores repo analysis history
 * ============================================
 *
 * WHY STORE IN DB?
 * 1. Cache: Avoid re-analyzing the same repo
 * 2. Analytics: Track what repos people analyze
 * 3. Admin: View analysis history, popular repos
 * 4. Shareable: Generate shareable report links
 *
 * SCHEMA DESIGN:
 * - Indexed on repoFullName for fast lookups
 * - TTL index on analyzedAt for auto-cleanup (optional)
 * - Stores full analysis result as nested document
 */

import mongoose, { Document, Schema } from "mongoose";

export interface IAnalysis extends Document {
  repoFullName: string;
  repoUrl: string;
  owner: string;
  repoName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  scores: {
    codeQuality: number;
    architecture: number;
    documentation: number;
    security: number;
    bestPractices: number;
    communityHealth: number;
    productionReadiness: number;
    overall: number;
  };
  aiSummary: string;
  aiSuggestions: string[];
  insights: {
    category: string;
    severity: string;
    title: string;
    description: string;
    suggestion?: string;
  }[];
  techStack: {
    name: string;
    category: string;
    confidence: number;
  }[];
  missingFiles: {
    name: string;
    importance: string;
    description: string;
  }[];
  complexityLevel: string;
  repoHealth: string;
  estimatedTeamSize: string;
  analyzedAt: Date;
  requestedBy: string | null; // IP or user ID
  shareId: string; // Unique ID for shareable links
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    repoFullName: { type: String, required: true, index: true },
    repoUrl: { type: String, required: true },
    owner: { type: String, required: true },
    repoName: { type: String, required: true },
    description: { type: String, default: null },
    language: { type: String, default: null },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    scores: {
      codeQuality: { type: Number, default: 0 },
      architecture: { type: Number, default: 0 },
      documentation: { type: Number, default: 0 },
      security: { type: Number, default: 0 },
      bestPractices: { type: Number, default: 0 },
      communityHealth: { type: Number, default: 0 },
      productionReadiness: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },
    aiSummary: { type: String, default: "" },
    aiSuggestions: [{ type: String }],
    insights: [
      {
        category: String,
        severity: String,
        title: String,
        description: String,
        suggestion: String,
      },
    ],
    techStack: [
      {
        name: String,
        category: String,
        confidence: Number,
      },
    ],
    missingFiles: [
      {
        name: String,
        importance: String,
        description: String,
      },
    ],
    complexityLevel: { type: String, default: "medium" },
    repoHealth: { type: String, default: "fair" },
    estimatedTeamSize: { type: String, default: "Unknown" },
    analyzedAt: { type: Date, default: Date.now },
    requestedBy: { type: String, default: null },
    shareId: { type: String, unique: true, index: true },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt
  }
);

// Don't re-compile model in dev (hot reload)
export const Analysis =
  mongoose.models.Analysis || mongoose.model<IAnalysis>("Analysis", AnalysisSchema);
