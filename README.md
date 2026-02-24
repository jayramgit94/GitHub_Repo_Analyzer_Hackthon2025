<div align="center">

# ��� GitRepo Analyzer — AI-Powered Repository Analysis Platform

**Analyze any GitHub repository with AI-driven insights, scoring, and recommendations.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](#deployment) · [Features](#-features) · [Screenshots](#-screenshots) · [Getting Started](#-getting-started)

</div>

---

## ��� About

GitRepo Analyzer is a full-stack SaaS platform that performs deep analysis of any public GitHub repository. It combines **deterministic rule-engine scoring** with **Google Gemini AI** to provide actionable insights on code quality, security, architecture, documentation, and more.

Paste any GitHub repo URL → get an instant, comprehensive analysis with scores, visualizations, AI-powered suggestions, and community reviews.

---

## ✨ Features

### ��� AI-Powered Analysis
- **Gemini 2.0 Flash** integration for intelligent repo insights
- Smart fallback to rule-engine analysis when AI is unavailable
- AI-enhanced review comments with one-click enhancement
- AI sentiment analysis of community reviews
- AI-powered admin dashboard insights

### ��� Comprehensive Scoring (7 Dimensions)
| Metric | What It Measures |
|--------|-----------------|
| Code Quality | File organization, linting, type safety, tests |
| Architecture | Project structure, modularity, separation of concerns |
| Documentation | README quality, contributing guide, changelog |
| Security | .gitignore, .env.example, security policy, secrets |
| Best Practices | CI/CD, Docker, license, dependency management |
| Community Health | Contributors, stars, forks, issue management |
| Production Readiness | Overall deployment readiness |

### ��� Premium UI/UX
- Glassmorphism design system with dark/light theme
- Smooth animations powered by Framer Motion
- Interactive charts (Radar, Donut, Bar) via Chart.js
- Responsive design for all screen sizes
- AI typing effect for analysis summaries

### ��� Community Reviews
- Star rating system (1-5)
- AI-enhanced comment writing
- Spam protection (1 review/email/24hrs)
- Admin moderation (approve/reject)
- AI sentiment analysis of all reviews

### ���️ Admin Dashboard
- Secure JWT authentication
- Review moderation (approve/reject/delete)
- Analytics: visitor stats, top repos, device breakdown
- AI-powered dashboard insights
- Recent analyses overview

---

## ��� Screenshots

<div align="center">

### Landing Page
<img src="saas-app/images/repoanalyzer1.png" alt="Landing Page" width="800"/>

### Repository Analysis Dashboard
<img src="saas-app/images/repoanalzyer2.png" alt="Analysis Dashboard" width="800"/>

### Score Breakdown & AI Insights
<img src="saas-app/images/repoanalyzer3.png" alt="Score Breakdown" width="800"/>

### Tech Stack & Insights
<img src="saas-app/images/repoanalyzer4.png" alt="Tech Stack" width="800"/>

### Community Reviews
<img src="saas-app/images/repoanalyzer5.png" alt="Reviews" width="800"/>

</div>

---

## ���️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.1 (App Router, Turbopack) |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS 4.2, Custom Glassmorphism Design System |
| **Animations** | Framer Motion 12 |
| **Charts** | Chart.js + react-chartjs-2 |
| **Database** | MongoDB Atlas (Mongoose 9) |
| **AI** | Google Gemini 2.0 Flash |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **API** | GitHub REST API v3 |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## ��� Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- GitHub Personal Access Token
- Google Gemini API Key (free tier: 60 req/min)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025.git
cd GitHub_Repo_Analyzer_Hackthon2025/saas-app

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see below)

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the `saas-app/` directory:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/git_repo_analyzer

# GitHub Token (raises rate limit from 60 to 5000 req/hr)
# Generate at: https://github.com/settings/tokens
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Gemini AI API Key (free tier)
# Get one at: https://aistudio.google.com/apikey
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key

# Admin Credentials
ADMIN_EMAIL=admin@gitrepoanalyzer.com
ADMIN_PASSWORD=your-secure-password

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ��� Admin Access

1. Navigate to `/admin`
2. Login with:
   - **Email:** The value of `ADMIN_EMAIL` in your `.env.local` (default: `admin@gitrepoanalyzer.com`)
   - **Password:** The value of `ADMIN_PASSWORD` in your `.env.local`
3. From the admin dashboard you can:
   - Approve, reject, or delete pending reviews
   - View analytics (visitors, top repos, device breakdown)
   - Get AI-powered dashboard insights

---

## ��� How AI Is Implemented

### Architecture: Two-Phase Analysis

```
GitHub Repo URL
      |
      v
+-------------------+
|  Phase 1: Rule    |  Deterministic scoring
|     Engine        |  (always runs)
+---------+---------+
          |
          v
+-------------------+
|  Phase 2: AI      |  Gemini 2.0 Flash
|   Enhancement     |  (with smart fallback)
+---------+---------+
          |
          v
   Analysis Result
   (scores + insights + suggestions)
```

**Phase 1 — Rule Engine** (deterministic, always works):
- Analyzes file structure, config files, README, license, tests, CI/CD, Docker, etc.
- Calculates 7 dimension scores (0-100) using weighted algorithms
- Detects tech stack and missing files

**Phase 2 — AI Enhancement** (Gemini or smart fallback):
- If Gemini API is available: sends comprehensive prompt with repo data and gets personalized summary, suggestions, and insights
- If unavailable: generates dynamic, repo-specific insights using rule-engine data (language-specific recommendations, contributor analysis, file composition analysis)

### Additional AI Features
| Feature | Endpoint | Description |
|---------|----------|-------------|
| Review Insights | `/api/ai/review-insights` | AI sentiment analysis of community reviews |
| Enhance Review | `/api/ai/enhance-review` | One-click AI enhancement of draft comments |
| Admin Insights | `/api/ai/admin-insights` | AI-powered analytics for admin dashboard |

---

## ��� Project Structure

```
saas-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout (theme, fonts)
│   │   ├── analyze/page.tsx      # Analysis dashboard
│   │   ├── reviews/page.tsx      # Community reviews
│   │   ├── admin/page.tsx        # Admin dashboard
│   │   └── api/
│   │       ├── analyze/          # Repo analysis endpoint
│   │       ├── reviews/          # Review CRUD endpoints
│   │       ├── admin/            # Auth + admin management
│   │       └── ai/               # AI helper endpoints
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation with theme toggle
│   │   ├── SearchBar.tsx         # Repo URL input
│   │   ├── ScoreRing.tsx         # Animated circular scores
│   │   ├── ScoreRadarChart.tsx   # Radar chart
│   │   ├── ReviewCard.tsx        # Review display card
│   │   ├── StarRating.tsx        # Interactive star rating
│   │   └── Motion.tsx            # Framer Motion wrappers
│   ├── lib/
│   │   ├── ai-engine.ts          # Core analysis engine
│   │   ├── ai-helper.ts          # Reusable AI functions
│   │   ├── github.ts             # GitHub API integration
│   │   └── mongodb.ts            # Database connection
│   └── models/
│       ├── Analysis.ts           # Analysis result schema
│       ├── Review.ts             # User review schema
│       └── Visitor.ts            # Visitor tracking schema
├── images/                       # Screenshots
├── .env.example                  # Environment template
├── next.config.js                # Next.js configuration
├── vercel.json                   # Vercel deployment config
└── package.json
```

---

## ��� Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Set **Root Directory** to `saas-app`
4. Add all environment variables from `.env.local`
5. Deploy!

The `vercel.json` is already configured. Make sure to:
- Use your production MongoDB URI
- Set `NEXT_PUBLIC_APP_URL` to your Vercel domain
- Use a strong `JWT_SECRET` and `ADMIN_PASSWORD`

---

## ��� API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Analyze a GitHub repo |
| `GET` | `/api/reviews` | Get approved reviews |
| `POST` | `/api/reviews` | Submit a review (pending approval) |
| `POST` | `/api/admin/login` | Admin authentication |
| `GET` | `/api/admin/stats` | Admin statistics |
| `PUT` | `/api/admin/reviews` | Approve/reject reviews |
| `DELETE` | `/api/admin/reviews` | Delete a review |
| `GET` | `/api/ai/review-insights` | AI review sentiment |
| `POST` | `/api/ai/enhance-review` | AI comment enhancement |
| `GET` | `/api/ai/admin-insights` | AI admin analytics |

---

## ��� Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ��� License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built for GitHub Hackathon 2025**

Made with ❤️ by [Jayram](https://github.com/jayramgit94)

</div>
