const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ Allowed Origins: Localhost (for dev), Netlify frontend, Render backend
const allowedOrigins = [
  "http://localhost:5500",
  "http://localhost:5000",
  "http://127.0.0.1:5500",
  "http://127.0.0.1:5000",
  "https://lucent-begonia-ed248d.netlify.app",
  "https://67f0c752317a985c8beacffa--lucent-begonia-ed248d.netlify.app",
  "https://git-repo-analyzer.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🔎 CORS check — Incoming origin:", origin);

      // Allow server-to-server or Postman/curl (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

app.use(express.json());

// ✅ Serve static files locally (optional)
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const GITHUB_API_BASE = "https://api.github.com/repos";

// 🟢 Main GitHub Repo Analyzer Endpoint
app.get("/repo", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url)
      return res.status(400).json({ error: "GitHub repo URL is required!" });

    const [owner, repo] = url.replace("https://github.com/", "").split("/");

    const { data: repoData } = await axios.get(
      `${GITHUB_API_BASE}/${owner}/${repo}`,
    );
    const { data: contributorsData } = await axios.get(
      `${GITHUB_API_BASE}/${owner}/${repo}/contributors`,
    );
    const { data: pullRequestsData } = await axios.get(
      `${GITHUB_API_BASE}/${owner}/${repo}/pulls?state=all`,
    );
    const { data: issuesData } = await axios.get(
      `${GITHUB_API_BASE}/${owner}/${repo}/issues?state=all`,
    );

    const topContributors = contributorsData
      .map((user) => ({
        username: user.login,
        avatar: user.avatar_url,
        profile: user.html_url,
        contributions: user.contributions,
      }))
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 5);

    const prFrequency =
      pullRequestsData.length /
      ((new Date(repoData.updated_at) - new Date(repoData.created_at)) /
        (1000 * 60 * 60 * 24));

    const issueResolutionTimes = issuesData
      .filter((issue) => issue.state === "closed" && issue.closed_at)
      .map((issue) => new Date(issue.closed_at) - new Date(issue.created_at));

    const avgIssueResolutionTime = issueResolutionTimes.length
      ? issueResolutionTimes.reduce((a, b) => a + b, 0) /
        issueResolutionTimes.length
      : 0;

    const result = {
      name: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      issues: repoData.open_issues_count,
      watchers: repoData.subscribers_count,
      language: repoData.language,
      lastUpdated: repoData.updated_at,
      owner: {
        avatar: repoData.owner.avatar_url,
        profile: repoData.owner.html_url,
      },
      topContributors,
      prFrequency,
      avgIssueResolutionTime,
    };

    console.log("📦 GitHub Repo Data Sent:", result);
    res.json(result);
  } catch (error) {
    console.error("❌ Failed to Fetch GitHub Data:", error.message);
    res.status(500).json({ error: "Failed to fetch repository details!" });
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server live at http://localhost:${PORT}`),
);
