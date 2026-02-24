/*
 * ============================================
 * POST /api/analyze — Main Analysis Endpoint
 * ============================================
 *
 * THE CORE ENDPOINT — Heart of the SaaS
 *
 * FLOW:
 * 1. Parse repo URL → owner/repo
 * 2. Check cache (memory + DB)
 * 3. Fetch GitHub data (parallel API calls)
 * 4. Run rule engine (deterministic scoring)
 * 5. Run AI engine (Gemini for insights)
 * 6. Save to MongoDB
 * 7. Return analysis result
 *
 * COST PER REQUEST:
 * - GitHub API: 5-6 calls (free with token)
 * - Gemini AI: ~2000 tokens (~$0.0001)
 * - MongoDB: 1 write ($0.00001)
 * - Total: < $0.001 per analysis
 *
 * RATE LIMITING: 100 requests per 15 min per IP
 */

import { AnalysisResult, analyzeRepository } from "@/lib/ai-engine";
import { analysisCache, getCacheKey } from "@/lib/cache";
import { fetchRepoData, parseRepoUrl } from "@/lib/github";
import { connectDB } from "@/lib/mongodb";
import { Analysis } from "@/models/Analysis";
import { Visitor } from "@/models/Visitor";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Rate limiting map (in production use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const limit = parseInt(process.env.RATE_LIMIT_MAX || "100");
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000");
  const now = Date.now();

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get client info
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 2. Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 3. Parse request body
    const body = await req.json();
    const repoUrl = body.repoUrl || body.url;

    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      );
    }

    // 4. Parse repo URL
    const { owner, repo } = parseRepoUrl(repoUrl);
    const cacheKey = getCacheKey(owner, repo);

    // 5. Check in-memory cache first (fastest)
    const cached = analysisCache.get<AnalysisResult>(cacheKey);
    if (cached) {
      return NextResponse.json({
        repoFullName: `${owner}/${repo}`,
        overallScore: cached.scores.overall,
        complexityLevel: cached.complexityLevel,
        repoHealth: cached.repoHealth,
        scores: cached.scores,
        insights: cached.insights,
        techStack: cached.techStack,
        missingFiles: cached.missingFiles,
        aiSummary: cached.aiSummary,
        aiSuggestions: cached.aiSuggestions,
        aiPowered: cached.aiPowered ?? false,
        cached: true,
      });
    }

    // 6. Check MongoDB cache (persists across deploys)
    try {
      await connectDB();
      const dbCached = await Analysis.findOne({
        repoFullName: `${owner}/${repo}`,
        analyzedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }).lean();

      if (dbCached) {
        // Reconstruct result from DB
        const result: AnalysisResult = {
          scores: dbCached.scores,
          insights: dbCached.insights,
          techStack: dbCached.techStack,
          missingFiles: dbCached.missingFiles,
          aiSummary: dbCached.aiSummary,
          aiSuggestions: dbCached.aiSuggestions,
          readmeScore: dbCached.scores.documentation,
          complexityLevel: dbCached.complexityLevel as AnalysisResult["complexityLevel"],
          estimatedTeamSize: dbCached.estimatedTeamSize,
          repoHealth: dbCached.repoHealth as AnalysisResult["repoHealth"],
          analyzedAt: dbCached.analyzedAt.toISOString(),
          aiPowered: (dbCached as Record<string, unknown>).aiPowered as boolean ?? false,
        };

        // Warm memory cache
        analysisCache.set(cacheKey, result);

        return NextResponse.json({
          repoFullName: `${owner}/${repo}`,
          overallScore: result.scores.overall,
          complexityLevel: result.complexityLevel,
          repoHealth: result.repoHealth,
          scores: result.scores,
          insights: result.insights,
          techStack: result.techStack,
          missingFiles: result.missingFiles,
          aiSummary: result.aiSummary,
          aiSuggestions: result.aiSuggestions,
          aiPowered: result.aiPowered ?? false,
          shareId: dbCached.shareId,
          cached: true,
          repoData: {
            description: dbCached.description || "",
            stars: dbCached.stars || 0,
            forks: dbCached.forks || 0,
            openIssues: 0,
            watchers: 0,
            defaultBranch: "main",
            createdAt: "",
            updatedAt: "",
            languages: {},
            contributors: [],
            license: null,
            topics: [],
          },
        });
      }
    } catch {
      // DB not available, continue without cache
      console.warn("MongoDB not available, proceeding without cache");
    }

    // 7. Fetch fresh GitHub data
    const githubData = await fetchRepoData(owner, repo);

    // 8. Run AI analysis
    const analysis = await analyzeRepository(githubData);

    // 9. Cache in memory
    analysisCache.set(cacheKey, analysis);

    // 10. Save to MongoDB (async, don't block response)
    const shareId = crypto.randomBytes(8).toString("hex");
    
    try {
      await connectDB();

      // Save analysis
      await Analysis.findOneAndUpdate(
        { repoFullName: `${owner}/${repo}` },
        {
          repoFullName: `${owner}/${repo}`,
          repoUrl: `https://github.com/${owner}/${repo}`,
          owner,
          repoName: repo,
          description: githubData.repo.description,
          language: githubData.repo.language,
          stars: githubData.repo.stars,
          forks: githubData.repo.forks,
          scores: analysis.scores,
          aiSummary: analysis.aiSummary,
          aiSuggestions: analysis.aiSuggestions,
          insights: analysis.insights,
          techStack: analysis.techStack,
          missingFiles: analysis.missingFiles,
          complexityLevel: analysis.complexityLevel,
          repoHealth: analysis.repoHealth,
          estimatedTeamSize: analysis.estimatedTeamSize,
          analyzedAt: new Date(),
          requestedBy: crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16),
          shareId,
        },
        { upsert: true, returnDocument: "after" }
      );

      // Track visitor
      const ipHash = crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
      const isMobile = /mobile|android|iphone/i.test(userAgent);
      await Visitor.create({
        ipHash,
        userAgent: userAgent.substring(0, 200),
        deviceType: isMobile ? "mobile" : "desktop",
        page: "/analyze",
        referrer: req.headers.get("referer") || "",
      });
    } catch (dbError) {
      console.error("DB save failed (non-blocking):", dbError);
    }

    // 11. Return result
    return NextResponse.json({
      repoFullName: `${owner}/${repo}`,
      overallScore: analysis.scores.overall,
      complexityLevel: analysis.complexityLevel === "very-high" ? "Enterprise" :
        analysis.complexityLevel === "high" ? "Advanced" :
        analysis.complexityLevel === "medium" ? "Intermediate" : "Starter",
      repoHealth: analysis.repoHealth,
      scores: analysis.scores,
      insights: analysis.insights.map((i) => ({
        category: i.category,
        message: i.description || i.title,
        severity: i.severity,
      })),
      techStack: analysis.techStack.map((t) => (typeof t === "string" ? t : t.name)),
      missingFiles: analysis.missingFiles.map((f) => (typeof f === "string" ? f : f.name)),
      aiSummary: analysis.aiSummary,
      aiSuggestions: analysis.aiSuggestions,
      aiPowered: analysis.aiPowered ?? false,
      shareId,
      cached: false,
      repoData: {
        description: githubData.repo.description,
        stars: githubData.repo.stars,
        forks: githubData.repo.forks,
        openIssues: githubData.repo.openIssues,
        watchers: githubData.repo.watchers,
        defaultBranch: githubData.repo.defaultBranch,
        createdAt: githubData.repo.createdAt,
        updatedAt: githubData.repo.updatedAt,
        languages: githubData.repo.languages,
        contributors: githubData.contributors.map((c) => ({
          login: c.username,
          contributions: c.contributions,
          avatar_url: c.avatar,
        })),
        license: githubData.repo.license,
        topics: githubData.repo.topics,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
