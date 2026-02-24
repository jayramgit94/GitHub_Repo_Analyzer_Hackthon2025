/*
 * ============================================
 * AI Analysis Engine — The Brain of the SaaS
 * ============================================
 *
 * ARCHITECTURE:
 * ┌────────────────┐     ┌──────────────┐     ┌─────────────────┐
 * │ GitHub Raw Data │ ──→ │ Rule Engine  │ ──→ │ AI Enhancement  │
 * │ (repo, files,  │     │ (deterministic│     │ (Gemini API for │
 * │  issues, etc.) │     │  scoring)     │     │  insights &     │
 * └────────────────┘     └──────────────┘     │  suggestions)   │
 *                                              └─────────────────┘
 *                                                      ↓
 *                                              ┌─────────────────┐
 *                                              │ Final Report    │
 *                                              │ (scores + AI    │
 *                                              │  suggestions)   │
 *                                              └─────────────────┘
 *
 * WHY TWO-PHASE SCORING?
 * 1. Rule Engine (free, instant): Calculates scores from data patterns
 *    - Always works, even without AI API key
 *    - Deterministic, reproducible scores
 *
 * 2. AI Enhancement (costs tokens, slower): Adds human-like insights
 *    - Code quality suggestions
 *    - Architecture recommendations
 *    - README improvements
 *    - Falls back gracefully if API is unavailable
 *
 * COST OPTIMIZATION:
 * - Gemini Free Tier: 60 requests/min, 1M tokens/day
 * - We send ONE prompt with all data (not multiple)
 * - Cache results in MongoDB (same repo = no re-analysis for 24hrs)
 * - Rule engine handles ~70% of scoring without AI
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GitHubAnalysisInput } from "./github";

// ===================== TYPES =====================

export interface ScoreBreakdown {
  codeQuality: number;        // 0-100: Overall code quality
  architecture: number;       // 0-100: Project structure & organization
  documentation: number;      // 0-100: README, comments, docs
  security: number;           // 0-100: Security practices
  bestPractices: number;      // 0-100: Industry best practices
  communityHealth: number;    // 0-100: Issues, PRs, contributors
  productionReadiness: number;// 0-100: CI/CD, tests, deployment
  overall: number;            // 0-100: Weighted average
}

export interface AIInsight {
  category: string;
  severity: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  suggestion?: string;
}

export interface TechStackItem {
  name: string;
  category: "language" | "framework" | "tool" | "database" | "cloud" | "testing" | "ci-cd";
  confidence: number; // 0-1
}

export interface MissingFile {
  name: string;
  importance: "critical" | "recommended" | "nice-to-have";
  description: string;
}

export interface AnalysisResult {
  scores: ScoreBreakdown;
  insights: AIInsight[];
  techStack: TechStackItem[];
  missingFiles: MissingFile[];
  aiSummary: string;
  aiSuggestions: string[];
  readmeScore: number;
  complexityLevel: "low" | "medium" | "high" | "very-high";
  estimatedTeamSize: string;
  repoHealth: "excellent" | "good" | "fair" | "needs-work" | "critical";
  analyzedAt: string;
}

// ===================== RULE ENGINE =====================
// Phase 1: Deterministic scoring based on data patterns

function calculateCodeQualityScore(input: GitHubAnalysisInput): number {
  let score = 50; // Base score

  // File organization
  const hasSrcDir = input.fileTree.some((f) => f.path.startsWith("src/"));
  const hasLibDir = input.fileTree.some((f) => f.path.startsWith("lib/"));
  if (hasSrcDir || hasLibDir) score += 10;

  // Tests presence
  if (input.hasTests) score += 15;

  // Linting config
  const hasLinting = input.fileTree.some((f) =>
    [".eslintrc", ".prettierrc", "eslint.config", ".flake8", "pyproject.toml", "rubocop"].some((lint) =>
      f.path.toLowerCase().includes(lint)
    )
  );
  if (hasLinting) score += 10;

  // Type safety
  const hasTypeScript = input.fileTree.some((f) => f.path.endsWith(".ts") || f.path.endsWith(".tsx"));
  const hasTypeHints = input.fileTree.some((f) => f.path.includes("py.typed") || f.path.endsWith(".pyi"));
  if (hasTypeScript || hasTypeHints) score += 10;

  // Too many files in root (bad organization)
  const rootFiles = input.fileTree.filter((f) => !f.path.includes("/") && f.type === "file");
  if (rootFiles.length > 15) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function calculateArchitectureScore(input: GitHubAnalysisInput): number {
  let score = 40;

  const dirs = input.fileTree.filter((f) => f.type === "dir").map((f) => f.path.split("/")[0]);
  const uniqueDirs = new Set(dirs);

  // Good structure indicators
  const goodDirs = ["src", "lib", "utils", "components", "services", "models", "controllers", "middleware", "config", "tests", "docs", "scripts", "public", "assets"];
  const foundGoodDirs = goodDirs.filter((d) => uniqueDirs.has(d));
  score += foundGoodDirs.length * 5;

  // Separation of concerns
  const hasSeparation = uniqueDirs.has("src") || (uniqueDirs.has("frontend") && uniqueDirs.has("backend"));
  if (hasSeparation) score += 15;

  // Config files properly placed
  if (input.hasGitignore) score += 5;

  return Math.max(0, Math.min(100, score));
}

function calculateDocumentationScore(input: GitHubAnalysisInput): number {
  let score = 0;

  // README quality
  if (input.readme) {
    const readmeLength = input.readme.length;
    if (readmeLength > 2000) score += 30;
    else if (readmeLength > 500) score += 20;
    else if (readmeLength > 100) score += 10;

    // Check for common good sections
    const readme = input.readme.toLowerCase();
    if (readme.includes("installation") || readme.includes("getting started")) score += 10;
    if (readme.includes("usage") || readme.includes("example")) score += 10;
    if (readme.includes("api") || readme.includes("documentation")) score += 5;
    if (readme.includes("contributing")) score += 5;
    if (readme.includes("license")) score += 5;
    if (readme.includes("badge") || readme.includes("shield")) score += 5;
  }

  // Additional docs
  if (input.hasContributing) score += 10;
  if (input.hasChangelog) score += 10;

  const hasDocs = input.fileTree.some((f) => f.path.startsWith("docs/"));
  if (hasDocs) score += 10;

  return Math.max(0, Math.min(100, score));
}

function calculateSecurityScore(input: GitHubAnalysisInput): number {
  let score = 50;

  if (input.hasGitignore) score += 10;
  if (!input.hasEnvExample && input.fileTree.some((f) => f.path.includes(".env"))) score -= 20;
  if (input.hasEnvExample) score += 15;

  // Security policy
  const hasSecurityPolicy = input.fileTree.some((f) => f.path.toLowerCase().includes("security"));
  if (hasSecurityPolicy) score += 10;

  // Dependency lock files
  const hasLockFile = input.fileTree.some((f) =>
    ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Pipfile.lock", "Gemfile.lock", "poetry.lock"].some(
      (lock) => f.path === lock
    )
  );
  if (hasLockFile) score += 10;

  // No secrets in visible files
  if (input.hasGitignore) score += 5;

  return Math.max(0, Math.min(100, score));
}

function calculateBestPracticesScore(input: GitHubAnalysisInput): number {
  let score = 30;

  if (input.hasLicense) score += 15;
  if (input.hasGitignore) score += 10;
  if (input.hasTests) score += 15;
  if (input.hasCICD) score += 15;
  if (input.hasEnvExample) score += 5;
  if (input.hasDockerfile) score += 5;
  if (input.hasContributing) score += 5;

  return Math.max(0, Math.min(100, score));
}

function calculateCommunityHealthScore(input: GitHubAnalysisInput): number {
  let score = 30;

  // Contributors
  if (input.contributors.length >= 5) score += 20;
  else if (input.contributors.length >= 2) score += 10;

  // Stars as social proof
  if (input.repo.stars >= 100) score += 15;
  else if (input.repo.stars >= 10) score += 10;
  else if (input.repo.stars >= 1) score += 5;

  // Issue management
  const closedIssues = input.issues.filter((i) => i.state === "closed" && !i.isPR);
  const openIssues = input.issues.filter((i) => i.state === "open" && !i.isPR);
  if (closedIssues.length > openIssues.length) score += 10;

  // Recent activity
  const daysSinceUpdate = (Date.now() - new Date(input.repo.pushedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 7) score += 15;
  else if (daysSinceUpdate < 30) score += 10;
  else if (daysSinceUpdate < 90) score += 5;

  // Topics/tags
  if (input.repo.topics.length > 0) score += 5;

  return Math.max(0, Math.min(100, score));
}

function calculateProductionReadinessScore(input: GitHubAnalysisInput): number {
  let score = 20;

  if (input.hasCICD) score += 20;
  if (input.hasTests) score += 15;
  if (input.hasDockerfile) score += 10;
  if (input.hasEnvExample) score += 10;
  if (input.hasGitignore) score += 5;
  if (input.hasLicense) score += 5;

  // Version management
  const hasVersioning = input.fileTree.some(
    (f) => f.path === "package.json" || f.path === "setup.py" || f.path === "Cargo.toml"
  );
  if (hasVersioning) score += 5;

  // Error handling indicators
  const hasErrorHandling = input.fileTree.some(
    (f) =>
      f.path.includes("error") || f.path.includes("exception") || f.path.includes("middleware")
  );
  if (hasErrorHandling) score += 5;

  // Monitoring/logging
  const hasMonitoring = input.fileTree.some(
    (f) => f.path.includes("log") || f.path.includes("monitor") || f.path.includes("sentry")
  );
  if (hasMonitoring) score += 5;

  return Math.max(0, Math.min(100, score));
}

// ===================== TECH STACK DETECTION =====================

function detectTechStack(input: GitHubAnalysisInput): TechStackItem[] {
  const stack: TechStackItem[] = [];
  const files = input.fileTree.map((f) => f.path.toLowerCase());
  const languages = Object.keys(input.repo.languages);

  // Languages
  languages.forEach((lang) => {
    stack.push({ name: lang, category: "language", confidence: 0.9 });
  });

  // Frameworks
  const frameworkDetectors: { pattern: string; name: string; category: TechStackItem["category"] }[] = [
    { pattern: "next.config", name: "Next.js", category: "framework" },
    { pattern: "nuxt.config", name: "Nuxt.js", category: "framework" },
    { pattern: "angular.json", name: "Angular", category: "framework" },
    { pattern: "svelte.config", name: "Svelte", category: "framework" },
    { pattern: "vite.config", name: "Vite", category: "tool" },
    { pattern: "webpack.config", name: "Webpack", category: "tool" },
    { pattern: "tailwind.config", name: "Tailwind CSS", category: "framework" },
    { pattern: "django", name: "Django", category: "framework" },
    { pattern: "flask", name: "Flask", category: "framework" },
    { pattern: "fastapi", name: "FastAPI", category: "framework" },
    { pattern: "express", name: "Express.js", category: "framework" },
    { pattern: "rails", name: "Ruby on Rails", category: "framework" },
    { pattern: "spring", name: "Spring", category: "framework" },
    { pattern: "dockerfile", name: "Docker", category: "tool" },
    { pattern: "docker-compose", name: "Docker Compose", category: "tool" },
    { pattern: ".github/workflows", name: "GitHub Actions", category: "ci-cd" },
    { pattern: "jest.config", name: "Jest", category: "testing" },
    { pattern: "vitest", name: "Vitest", category: "testing" },
    { pattern: "cypress", name: "Cypress", category: "testing" },
    { pattern: "pytest", name: "Pytest", category: "testing" },
    { pattern: "prisma", name: "Prisma", category: "database" },
    { pattern: "mongoose", name: "MongoDB/Mongoose", category: "database" },
    { pattern: ".env", name: "dotenv", category: "tool" },
  ];

  frameworkDetectors.forEach(({ pattern, name, category }) => {
    if (files.some((f) => f.includes(pattern))) {
      stack.push({ name, category, confidence: 0.8 });
    }
  });

  // Check README for additional tech mentions
  if (input.readme) {
    const readme = input.readme.toLowerCase();
    const readmeDetectors = [
      { keyword: "react", name: "React", category: "framework" as const },
      { keyword: "vue", name: "Vue.js", category: "framework" as const },
      { keyword: "postgresql", name: "PostgreSQL", category: "database" as const },
      { keyword: "mongodb", name: "MongoDB", category: "database" as const },
      { keyword: "redis", name: "Redis", category: "database" as const },
      { keyword: "aws", name: "AWS", category: "cloud" as const },
      { keyword: "vercel", name: "Vercel", category: "cloud" as const },
      { keyword: "netlify", name: "Netlify", category: "cloud" as const },
    ];

    readmeDetectors.forEach(({ keyword, name, category }) => {
      if (readme.includes(keyword) && !stack.some((s) => s.name === name)) {
        stack.push({ name, category, confidence: 0.6 });
      }
    });
  }

  // Deduplicate
  const seen = new Set<string>();
  return stack.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

// ===================== MISSING FILES DETECTION =====================

function detectMissingFiles(input: GitHubAnalysisInput): MissingFile[] {
  const missing: MissingFile[] = [];

  if (!input.hasLicense) {
    missing.push({
      name: "LICENSE",
      importance: "critical",
      description: "No license file found. Without a license, your code is not legally open-source.",
    });
  }

  if (!input.readme) {
    missing.push({
      name: "README.md",
      importance: "critical",
      description: "No README found. This is the first thing visitors see.",
    });
  }

  if (!input.hasGitignore) {
    missing.push({
      name: ".gitignore",
      importance: "critical",
      description: "No .gitignore found. Sensitive files may be committed.",
    });
  }

  if (!input.hasTests) {
    missing.push({
      name: "tests/",
      importance: "critical",
      description: "No test directory found. Tests are essential for code reliability.",
    });
  }

  if (!input.hasCICD) {
    missing.push({
      name: ".github/workflows/",
      importance: "recommended",
      description: "No CI/CD configuration found. Automate testing and deployment.",
    });
  }

  if (!input.hasEnvExample) {
    missing.push({
      name: ".env.example",
      importance: "recommended",
      description: "No environment variable template. Helps new developers onboard.",
    });
  }

  if (!input.hasContributing) {
    missing.push({
      name: "CONTRIBUTING.md",
      importance: "recommended",
      description: "No contributing guide. Helps the community contribute properly.",
    });
  }

  if (!input.hasChangelog) {
    missing.push({
      name: "CHANGELOG.md",
      importance: "nice-to-have",
      description: "No changelog. Track version history for users.",
    });
  }

  if (!input.hasDockerfile) {
    missing.push({
      name: "Dockerfile",
      importance: "nice-to-have",
      description: "No Dockerfile. Containerization ensures consistent environments.",
    });
  }

  return missing;
}

// ===================== AI ENHANCEMENT (Gemini) =====================
// Phase 2: AI-powered insights

async function getAIInsights(input: GitHubAnalysisInput, scores: ScoreBreakdown): Promise<{
  summary: string;
  suggestions: string[];
  insights: AIInsight[];
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if no API key
  if (!apiKey) {
    return generateFallbackInsights(input, scores);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // PROMPT ENGINEERING — Single comprehensive prompt to minimize API calls
    const prompt = `You are a senior software engineer performing a code repository analysis.

REPOSITORY: ${input.repo.fullName}
DESCRIPTION: ${input.repo.description || "No description"}
PRIMARY LANGUAGE: ${input.repo.language || "Unknown"}
LANGUAGES: ${Object.keys(input.repo.languages).join(", ")}
STARS: ${input.repo.stars} | FORKS: ${input.repo.forks} | ISSUES: ${input.repo.openIssues}
LICENSE: ${input.repo.license || "None"}
LAST UPDATED: ${input.repo.updatedAt}

FILE STRUCTURE (top-level):
${input.fileTree
  .filter((f) => f.path.split("/").length <= 2)
  .map((f) => `  ${f.type === "dir" ? "📁" : "📄"} ${f.path}`)
  .slice(0, 50)
  .join("\n")}

TOTAL FILES: ${input.fileTree.filter((f) => f.type === "file").length}
TOTAL DIRECTORIES: ${input.fileTree.filter((f) => f.type === "dir").length}

HAS: License=${input.hasLicense}, Tests=${input.hasTests}, CI/CD=${input.hasCICD}, Docker=${input.hasDockerfile}, .gitignore=${input.hasGitignore}, .env.example=${input.hasEnvExample}

CURRENT SCORES:
- Code Quality: ${scores.codeQuality}/100
- Architecture: ${scores.architecture}/100
- Documentation: ${scores.documentation}/100
- Security: ${scores.security}/100
- Best Practices: ${scores.bestPractices}/100
- Community Health: ${scores.communityHealth}/100
- Production Readiness: ${scores.productionReadiness}/100
- Overall: ${scores.overall}/100

README (first 1000 chars):
${input.readme ? input.readme.substring(0, 1000) : "No README found"}

Provide a JSON response with EXACTLY this structure (no markdown, no code fences, just pure JSON):
{
  "summary": "A 2-3 sentence professional summary of the repository's quality and purpose",
  "suggestions": [
    "5 specific, actionable improvement suggestions (each 1-2 sentences)"
  ],
  "insights": [
    {
      "category": "one of: architecture|security|performance|documentation|testing|dependencies",
      "severity": "one of: critical|warning|info|success",
      "title": "Short insight title",
      "description": "Detailed explanation",
      "suggestion": "How to fix or improve"
    }
  ]
}

Provide exactly 5 suggestions and 5-8 insights. Be specific to THIS repository, not generic advice.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateFallbackInsights(input, scores);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: parsed.summary || "Analysis complete.",
      suggestions: parsed.suggestions || [],
      insights: (parsed.insights || []).map((i: AIInsight) => ({
        category: i.category,
        severity: i.severity,
        title: i.title,
        description: i.description,
        suggestion: i.suggestion,
      })),
    };
  } catch (error) {
    console.error("AI analysis failed, using fallback:", error);
    return generateFallbackInsights(input, scores);
  }
}

// Fallback when AI is unavailable — still provides useful insights
function generateFallbackInsights(
  input: GitHubAnalysisInput,
  scores: ScoreBreakdown
): { summary: string; suggestions: string[]; insights: AIInsight[] } {
  const insights: AIInsight[] = [];
  const suggestions: string[] = [];

  // Generate insights based on actual data
  if (!input.hasTests) {
    insights.push({
      category: "testing",
      severity: "critical",
      title: "No Tests Detected",
      description: "No test files or test directories were found in this repository.",
      suggestion: "Add unit tests using a framework like Jest (JS), Pytest (Python), or JUnit (Java).",
    });
    suggestions.push("Add automated tests to improve code reliability and catch bugs early.");
  }

  if (!input.hasCICD) {
    insights.push({
      category: "architecture",
      severity: "warning",
      title: "No CI/CD Pipeline",
      description: "No continuous integration or deployment configuration was found.",
      suggestion: "Set up GitHub Actions for automated testing and deployment.",
    });
    suggestions.push("Configure CI/CD with GitHub Actions to automate testing on every push.");
  }

  if (!input.hasLicense) {
    insights.push({
      category: "documentation",
      severity: "critical",
      title: "Missing License",
      description: "Without a license, the code cannot legally be used or contributed to by others.",
      suggestion: "Add an MIT, Apache 2.0, or GPL license depending on your intended use.",
    });
  }

  if (scores.documentation < 50) {
    insights.push({
      category: "documentation",
      severity: "warning",
      title: "Documentation Needs Improvement",
      description: `Documentation score is ${scores.documentation}/100. Key sections may be missing from your README.`,
      suggestion: "Add installation instructions, usage examples, API documentation, and contributing guidelines.",
    });
    suggestions.push("Improve README with installation steps, usage examples, and API reference.");
  }

  if (scores.security < 60) {
    insights.push({
      category: "security",
      severity: "warning",
      title: "Security Practices Need Attention",
      description: `Security score is ${scores.security}/100.`,
      suggestion: "Add .env.example, security policy, and ensure sensitive files are gitignored.",
    });
  }

  if (input.contributors.length < 2) {
    insights.push({
      category: "architecture",
      severity: "info",
      title: "Single Developer Project",
      description: "This project has a single contributor. Bus factor is 1.",
      suggestion: "Consider documenting architecture decisions and onboarding guides for future contributors.",
    });
  }

  if (scores.overall >= 80) {
    insights.push({
      category: "architecture",
      severity: "success",
      title: "Well-Maintained Repository",
      description: "This repository follows many best practices and is well-maintained.",
    });
  }

  if (suggestions.length < 5) {
    const defaults = [
      "Add comprehensive error handling and input validation.",
      "Consider adding TypeScript for type safety.",
      "Set up code coverage reporting to track test quality.",
      "Add pre-commit hooks for linting and formatting.",
      "Create a CONTRIBUTING.md to guide open-source contributors.",
    ];
    suggestions.push(...defaults.slice(0, 5 - suggestions.length));
  }

  const summary = `${input.repo.fullName} is a ${input.repo.language || "multi-language"} project with an overall score of ${scores.overall}/100. ${
    scores.overall >= 70
      ? "The project demonstrates good engineering practices."
      : "There are several areas that could be improved for production readiness."
  }`;

  return { summary, suggestions: suggestions.slice(0, 5), insights };
}

// ===================== MAIN ANALYSIS FUNCTION =====================

export async function analyzeRepository(input: GitHubAnalysisInput): Promise<AnalysisResult> {
  // Phase 1: Deterministic scoring
  const codeQuality = calculateCodeQualityScore(input);
  const architecture = calculateArchitectureScore(input);
  const documentation = calculateDocumentationScore(input);
  const security = calculateSecurityScore(input);
  const bestPractices = calculateBestPracticesScore(input);
  const communityHealth = calculateCommunityHealthScore(input);
  const productionReadiness = calculateProductionReadinessScore(input);

  // Weighted average for overall score
  const overall = Math.round(
    codeQuality * 0.2 +
    architecture * 0.15 +
    documentation * 0.15 +
    security * 0.15 +
    bestPractices * 0.1 +
    communityHealth * 0.1 +
    productionReadiness * 0.15
  );

  const scores: ScoreBreakdown = {
    codeQuality,
    architecture,
    documentation,
    security,
    bestPractices,
    communityHealth,
    productionReadiness,
    overall,
  };

  // Phase 2: AI enhancement
  const aiResults = await getAIInsights(input, scores);

  // Phase 3: Additional analysis
  const techStack = detectTechStack(input);
  const missingFiles = detectMissingFiles(input);

  // Complexity estimation
  const totalFiles = input.fileTree.filter((f) => f.type === "file").length;
  const complexityLevel: AnalysisResult["complexityLevel"] =
    totalFiles > 500 ? "very-high" : totalFiles > 100 ? "high" : totalFiles > 30 ? "medium" : "low";

  // Team size estimation
  const estimatedTeamSize =
    input.contributors.length >= 10
      ? "Large team (10+)"
      : input.contributors.length >= 5
      ? "Medium team (5-10)"
      : input.contributors.length >= 2
      ? "Small team (2-4)"
      : "Solo developer";

  // Health assessment
  const repoHealth: AnalysisResult["repoHealth"] =
    overall >= 85
      ? "excellent"
      : overall >= 70
      ? "good"
      : overall >= 50
      ? "fair"
      : overall >= 30
      ? "needs-work"
      : "critical";

  return {
    scores,
    insights: aiResults.insights,
    techStack,
    missingFiles,
    aiSummary: aiResults.summary,
    aiSuggestions: aiResults.suggestions,
    readmeScore: documentation,
    complexityLevel,
    estimatedTeamSize,
    repoHealth,
    analyzedAt: new Date().toISOString(),
  };
}
