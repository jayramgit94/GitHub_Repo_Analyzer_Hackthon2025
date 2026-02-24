/*
 * ============================================
 * GitHub API Client
 * ============================================
 *
 * WHAT THIS DOES:
 * Wraps all GitHub API calls with authentication, error handling, and data shaping.
 *
 * RATE LIMITING:
 * - Without token: 60 requests/hour (useless for production)
 * - With token: 5,000 requests/hour (essential!)
 *
 * HOW IT WORKS:
 *   Input: "facebook/react"
 *   → Parallel API calls to GitHub (repo, contributors, issues, pulls, languages, contents)
 *   → Shaped into our analysis-ready data structure
 *   → Fed to AI engine for scoring
 *
 * COST: Free (GitHub API is free with token)
 */

import axios, { AxiosInstance } from "axios";

const GITHUB_API = "https://api.github.com";

// Create authenticated axios instance
function createGitHubClient(): AxiosInstance {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitRepo-Analyzer-SaaS",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return axios.create({
    baseURL: GITHUB_API,
    headers,
    timeout: 15000,
  });
}

// Types for our shaped data
export interface RepoData {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  language: string | null;
  languages: Record<string, number>;
  size: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  license: string | null;
  hasWiki: boolean;
  hasPages: boolean;
  archived: boolean;
  owner: {
    login: string;
    avatar: string;
    profile: string;
  };
  topics: string[];
}

export interface ContributorData {
  username: string;
  avatar: string;
  profile: string;
  contributions: number;
}

export interface IssueData {
  title: string;
  state: string;
  createdAt: string;
  closedAt: string | null;
  labels: string[];
  isPR: boolean;
}

export interface FileTreeItem {
  path: string;
  type: "file" | "dir";
  size?: number;
}

export interface GitHubAnalysisInput {
  repo: RepoData;
  contributors: ContributorData[];
  issues: IssueData[];
  fileTree: FileTreeItem[];
  readme: string | null;
  hasLicense: boolean;
  hasContributing: boolean;
  hasChangelog: boolean;
  hasCICD: boolean;
  hasTests: boolean;
  hasEnvExample: boolean;
  hasDockerfile: boolean;
  hasGitignore: boolean;
}

/**
 * Fetch complete repository data for AI analysis
 * Makes parallel API calls for speed, then shapes data
 */
export async function fetchRepoData(owner: string, repo: string): Promise<GitHubAnalysisInput> {
  const client = createGitHubClient();

  // PARALLEL REQUESTS — This is key for performance!
  // Instead of sequential calls (slow), we fire all at once
  const [
    repoRes,
    contributorsRes,
    issuesRes,
    pullsRes,
    languagesRes,
    contentsRes,
    readmeRes,
  ] = await Promise.allSettled([
    client.get(`/repos/${owner}/${repo}`),
    client.get(`/repos/${owner}/${repo}/contributors?per_page=10`),
    client.get(`/repos/${owner}/${repo}/issues?state=all&per_page=50`),
    client.get(`/repos/${owner}/${repo}/pulls?state=all&per_page=30`),
    client.get(`/repos/${owner}/${repo}/languages`),
    client.get(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent("main")}?recursive=1`).catch(() =>
      client.get(`/repos/${owner}/${repo}/git/trees/master?recursive=1`)
    ),
    client.get(`/repos/${owner}/${repo}/readme`, {
      headers: { Accept: "application/vnd.github.v3.raw" },
    }),
  ]);

  // Extract data with fallbacks
  const repoData = repoRes.status === "fulfilled" ? repoRes.value.data : null;
  if (!repoData) {
    // Provide helpful error based on actual failure reason
    if (repoRes.status === "rejected") {
      const err = repoRes.reason;
      const status = err?.response?.status;
      if (status === 403) {
        const resetHeader = err?.response?.headers?.["x-ratelimit-reset"];
        const resetTime = resetHeader ? new Date(parseInt(resetHeader) * 1000).toLocaleTimeString() : "soon";
        throw new Error(
          `GitHub API rate limit exceeded. ${process.env.GITHUB_TOKEN ? "Your token's limit is exhausted." : "Add a GITHUB_TOKEN in .env.local to get 5,000 requests/hour instead of 60."} Resets at ${resetTime}.`
        );
      }
      if (status === 404) {
        throw new Error(`Repository "${owner}/${repo}" not found. Check that it exists and is public.`);
      }
      throw new Error(`GitHub API error (${status || "unknown"}): ${err?.message || "Failed to fetch repository"}`);
    }
    throw new Error("Repository not found or inaccessible");
  }

  const contributors = contributorsRes.status === "fulfilled" ? contributorsRes.value.data : [];
  const issues = issuesRes.status === "fulfilled" ? issuesRes.value.data : [];
  const pulls = pullsRes.status === "fulfilled" ? pullsRes.value.data : [];
  const languages = languagesRes.status === "fulfilled" ? languagesRes.value.data : {};
  const contents = contentsRes.status === "fulfilled" ? contentsRes.value.data : { tree: [] };
  const readme = readmeRes.status === "fulfilled" ? readmeRes.value.data : null;

  // Shape file tree
  const fileTree: FileTreeItem[] = (contents.tree || []).map((item: { path: string; type: string; size?: number }) => ({
    path: item.path,
    type: item.type === "tree" ? "dir" : "file",
    size: item.size,
  }));

  // Detect important files
  const filePaths = fileTree.map((f) => f.path.toLowerCase());
  const hasLicense = filePaths.some((p) => p.includes("license"));
  const hasContributing = filePaths.some((p) => p.includes("contributing"));
  const hasChangelog = filePaths.some((p) => p.includes("changelog"));
  const hasCICD = filePaths.some(
    (p) => p.includes(".github/workflows") || p.includes(".gitlab-ci") || p.includes("jenkinsfile")
  );
  const hasTests = filePaths.some(
    (p) => p.includes("test") || p.includes("spec") || p.includes("__tests__")
  );
  const hasEnvExample = filePaths.some((p) => p.includes(".env.example") || p.includes(".env.sample"));
  const hasDockerfile = filePaths.some((p) => p.includes("dockerfile"));
  const hasGitignore = filePaths.some((p) => p === ".gitignore");

  // Shape contributors
  const shapedContributors: ContributorData[] = contributors.map(
    (c: { login: string; avatar_url: string; html_url: string; contributions: number }) => ({
      username: c.login,
      avatar: c.avatar_url,
      profile: c.html_url,
      contributions: c.contributions,
    })
  );

  // Shape issues (GitHub returns PRs in issues endpoint too)
  const allIssues = [...issues, ...pulls];
  const shapedIssues: IssueData[] = allIssues.map(
    (i: {
      title: string;
      state: string;
      created_at: string;
      closed_at: string | null;
      labels: { name: string }[];
      pull_request?: unknown;
    }) => ({
      title: i.title,
      state: i.state,
      createdAt: i.created_at,
      closedAt: i.closed_at,
      labels: i.labels.map((l) => l.name),
      isPR: !!i.pull_request,
    })
  );

  return {
    repo: {
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count,
      watchers: repoData.subscribers_count,
      language: repoData.language,
      languages,
      size: repoData.size,
      defaultBranch: repoData.default_branch,
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at,
      pushedAt: repoData.pushed_at,
      license: repoData.license?.spdx_id || null,
      hasWiki: repoData.has_wiki,
      hasPages: repoData.has_pages,
      archived: repoData.archived,
      owner: {
        login: repoData.owner.login,
        avatar: repoData.owner.avatar_url,
        profile: repoData.owner.html_url,
      },
      topics: repoData.topics || [],
    },
    contributors: shapedContributors,
    issues: shapedIssues,
    fileTree,
    readme: typeof readme === "string" ? readme : null,
    hasLicense,
    hasContributing,
    hasChangelog,
    hasCICD,
    hasTests,
    hasEnvExample,
    hasDockerfile,
    hasGitignore,
  };
}

/**
 * Parse "owner/repo" from various URL formats
 * Handles: https://github.com/owner/repo, github.com/owner/repo, owner/repo
 */
export function parseRepoUrl(input: string): { owner: string; repo: string } {
  const cleaned = input.trim().replace(/\/+$/, ""); // Remove trailing slashes
  
  // Try URL format
  const urlMatch = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(".git", "") };
  }

  // Try owner/repo format
  const parts = cleaned.split("/");
  if (parts.length === 2) {
    return { owner: parts[0], repo: parts[1] };
  }

  throw new Error("Invalid repository format. Use: owner/repo or https://github.com/owner/repo");
}
