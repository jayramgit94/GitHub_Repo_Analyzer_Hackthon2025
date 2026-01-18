<div align="center">

# ⚡ GitHub Repository Analyzer

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://lucent-begonia-ed248d.netlify.app)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-5.1.0-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

**Analyze GitHub Repositories Like Never Before** 🚀

A powerful web application that provides deep, visual insights into any GitHub repository. Get instant access to contributor statistics, issue breakdowns, commit patterns, and much more through beautiful, interactive visualizations.

[Live Demo](https://lucent-begonia-ed248d.netlify.app) | [Report Bug](https://github.com/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025/issues) | [Request Feature](https://github.com/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

---

## 🎯 About The Project

**GitHub Repository Analyzer** is a comprehensive analytics tool designed for developers, project managers, and teams who want to gain deeper insights into their GitHub repositories. Whether you're tracking open source contributions, monitoring project health, or making data-driven decisions, this tool provides all the metrics you need in a beautiful, easy-to-use interface.

### Why This Project?

- 📊 **Data-Driven Decisions**: Make informed choices based on real repository metrics
- 👥 **Team Collaboration**: Understand team dynamics and contribution patterns
- 🔍 **Project Health**: Monitor issues, pull requests, and overall repository activity
- 🎨 **Beautiful Visualizations**: Interactive charts and graphs make data easy to understand
- ⚡ **Fast & Efficient**: Get instant insights with our optimized API architecture

---

## ✨ Features

### Core Features

- 🔍 **Repository Overview**
  - Essential repository information (name, description, language)
  - Star count, fork count, and watcher statistics
  - Repository creation and last update dates
  - License and visibility information

- 👥 **Contributor Analysis**
  - Top contributors visualization with bar charts
  - Contribution count and commit statistics
  - Contributor ranking and comparison
  - Interactive contributor profiles

- 📈 **Issue & PR Statistics**
  - Open vs closed issues breakdown
  - Pull request frequency analysis
  - Issue categorization and labeling
  - Time-based trend analysis

- 📊 **Visual Analytics**
  - Interactive pie charts for issue distribution
  - Bar charts for contributor analysis
  - Responsive data visualizations
  - Export-ready charts

- 🎨 **Modern UI/UX**
  - Glassmorphism design with backdrop filters
  - Smooth animations and transitions
  - Responsive design for all devices
  - Interactive particle effects
  - Dark theme optimized for developers

### Technical Features

- ⚡ Real-time data fetching from GitHub API
- 🔒 CORS-enabled secure backend
- 🌐 RESTful API architecture
- 📱 Mobile-first responsive design
- 🚀 Optimized performance
- ☁️ Cloud deployment ready (Netlify + Render)

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (ES6+)** - Interactive functionality
- **Chart.js** / **Custom Visualizations** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Axios** - HTTP client for GitHub API
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### APIs & Services
- **GitHub REST API** - Repository data
- **Netlify** - Frontend hosting
- **Render** - Backend hosting

### Development Tools
- Git & GitHub - Version control
- npm - Package management
- VS Code - Development environment

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
  ```bash
  node --version
  ```
- **npm** (comes with Node.js)
  ```bash
  npm --version
  ```
- **Git**
  ```bash
  git --version
  ```

### Installation

Follow these steps to set up the project locally:

#### 1. Clone the Repository

```bash
git clone https://github.com/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025.git
cd GitHub_Repo_Analyzer_Hackthon2025
```

#### 2. Install Backend Dependencies

```bash
cd github-repo-stats/backend
npm install
```

#### 3. Install Frontend Dependencies (if any)

```bash
cd ../frontend
# No npm dependencies required for basic frontend
```

#### 4. Configure Environment Variables

Create a `.env` file in the `github-repo-stats/backend` directory:

```bash
cd github-repo-stats/backend
touch .env
```

Add the following variables (see [Environment Variables](#environment-variables) section):

```env
PORT=3000
GITHUB_TOKEN=your_github_personal_access_token_here
```

#### 5. Start the Backend Server

```bash
cd github-repo-stats/backend
npm start
```

The backend server will start on `http://localhost:3000`

#### 6. Open the Frontend

Open `github-repo-stats/frontend/index.html` in your browser, or use a local server:

```bash
# Using Python
cd github-repo-stats/frontend
python -m http.server 5500

# Using Node.js http-server
npx http-server -p 5500
```

Visit `http://localhost:5500` in your browser.

---

### Environment Variables

The backend requires the following environment variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Port number for the backend server | No | `3000` |
| `GITHUB_TOKEN` | GitHub Personal Access Token for API requests | Optional* | None |

**Note:** While the GitHub token is optional, it's **highly recommended** to avoid API rate limits. Without a token, you're limited to 60 requests per hour. With a token, you get 5,000 requests per hour.

#### How to Get a GitHub Token:

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Repo Analyzer")
4. Select scopes: `repo` (for private repos) or leave blank for public repos only
5. Click "Generate token"
6. Copy the token and add it to your `.env` file

---

## 📖 Usage

### Basic Usage

1. **Open the Application**
   - Navigate to the live demo: [https://lucent-begonia-ed248d.netlify.app](https://lucent-begonia-ed248d.netlify.app)
   - Or run locally as described in [Installation](#installation)

2. **Analyze a Repository**
   - Paste any GitHub repository URL in the input field
   - Example: `https://github.com/facebook/react`
   - Click the "Get Stats" button

3. **View Analytics**
   - Explore repository overview information
   - View contributor statistics with interactive charts
   - Analyze issue and PR trends
   - Navigate through different visualization tabs

### Example Repositories to Try

```
https://github.com/facebook/react
https://github.com/microsoft/vscode
https://github.com/nodejs/node
https://github.com/torvalds/linux
```

### Screenshots

> **Note:** The application features a modern glassmorphism UI with dark theme and interactive visualizations.

**Home Page:**
- Clean, modern landing page with gradient background
- GitHub URL input with instant analysis
- Responsive design for all screen sizes

**Dashboard:**
- Real-time repository statistics
- Interactive charts and graphs
- Contributor leaderboards
- Issue and PR analytics

---

## 🔌 API Documentation

### Base URL

**Production:** `https://git-repo-analyzer.onrender.com`  
**Local:** `http://localhost:3000`

### Endpoints

#### 1. Get Repository Stats

```http
GET /repo?url={github_repo_url}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Full GitHub repository URL |

**Example Request:**
```bash
curl "https://git-repo-analyzer.onrender.com/repo?url=https://github.com/facebook/react"
```

**Example Response:**
```json
{
  "repository": {
    "name": "react",
    "full_name": "facebook/react",
    "description": "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
    "language": "JavaScript",
    "stars": 223000,
    "forks": 45000,
    "open_issues": 1200,
    "created_at": "2013-05-24T16:15:54Z",
    "updated_at": "2024-01-18T10:30:00Z"
  },
  "contributors": [
    {
      "login": "gaearon",
      "contributions": 3500,
      "avatar_url": "https://avatars.githubusercontent.com/u/810438?v=4"
    }
  ],
  "issues": {
    "open": 1200,
    "closed": 8500
  }
}
```

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| `400` | Bad Request - Missing or invalid URL parameter |
| `404` | Not Found - Repository doesn't exist |
| `429` | Too Many Requests - GitHub API rate limit exceeded |
| `500` | Internal Server Error |

---

## 📁 Project Structure

```
GitHub_Repo_Analyzer_Hackthon2025/
│
├── github-repo-stats/
│   ├── backend/
│   │   ├── node_modules/
│   │   ├── server.js           # Express server & API routes
│   │   ├── package.json        # Backend dependencies
│   │   ├── package-lock.json
│   │   └── .env               # Environment variables (create this)
│   │
│   └── frontend/
│       ├── index.html          # Main landing page
│       ├── states.html         # Analytics dashboard
│       ├── style.css           # Landing page styles
│       ├── dash_style.css      # Dashboard styles
│       ├── main_script.js      # Landing page logic
│       ├── states_script.js    # Dashboard API calls
│       └── laptop-code.jpg     # Hero image
│
├── netlify.toml               # Netlify deployment config
├── package.json               # Root package.json
├── README.md                  # This file
└── .gitignore                # Git ignore rules
```

### Key Files Explained

- **`server.js`**: Express.js backend that proxies requests to GitHub API
- **`index.html`**: Modern landing page with URL input
- **`states.html`**: Analytics dashboard with charts and visualizations
- **`main_script.js`**: Handles form submission and navigation
- **`states_script.js`**: Fetches and displays repository analytics
- **`netlify.toml`**: Configuration for Netlify deployment

---

## 🚀 Deployment

### Frontend Deployment (Netlify)

The frontend is deployed on Netlify and automatically deploys from the main branch.

**Manual Deployment:**

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=github-repo-stats/frontend
   ```

**Configuration:**
- Build command: `npm run build`
- Publish directory: `github-repo-stats/frontend`
- Environment variables: None required for frontend

### Backend Deployment (Render)

The backend is deployed on Render.

**Deployment Steps:**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** git-repo-analyzer
   - **Environment:** Node
   - **Build Command:** `cd github-repo-stats/backend && npm install`
   - **Start Command:** `cd github-repo-stats/backend && npm start`
   - **Environment Variables:**
     - `GITHUB_TOKEN`: Your GitHub personal access token

5. Click "Create Web Service"

**Alternative: Deploy to Heroku**

```bash
# Login to Heroku
heroku login

# Create a new app
heroku create your-app-name

# Set environment variables
heroku config:set GITHUB_TOKEN=your_token_here

# Deploy
git subtree push --prefix github-repo-stats/backend heroku main
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/GitHub_Repo_Analyzer_Hackthon2025.git
   cd GitHub_Repo_Analyzer_Hackthon2025
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

4. **Make Your Changes**
   - Write clean, commented code
   - Follow existing code style
   - Test your changes thoroughly

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add some AmazingFeature"
   ```

6. **Push to Your Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

7. **Open a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch and submit

### Contribution Guidelines

- ✅ Write clear, descriptive commit messages
- ✅ Comment your code where necessary
- ✅ Update documentation if needed
- ✅ Test your changes before submitting
- ✅ Follow the existing code style
- ✅ Be respectful and constructive in discussions

### Ideas for Contributions

- 🎨 Improve UI/UX design
- 📊 Add more visualization types
- 🔍 Implement advanced search filters
- 🌐 Add internationalization (i18n)
- 📱 Enhance mobile responsiveness
- ⚡ Optimize performance
- 📝 Improve documentation
- 🐛 Fix bugs
- ✨ Add new features

---

## 📄 License

Distributed under the ISC License. See `LICENSE` file for more information.

---

## 📞 Contact

**Project Maintainer:** jayramgit94

- GitHub: [@jayramgit94](https://github.com/jayramgit94)
- Project Link: [https://github.com/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025](https://github.com/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025)
- Live Demo: [https://lucent-begonia-ed248d.netlify.app](https://lucent-begonia-ed248d.netlify.app)

### Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025/issues) page
2. Open a new issue if your problem isn't already listed
3. Provide detailed information about your issue

---

## 🙏 Acknowledgments

Special thanks to:

- **GitHub API** - For providing comprehensive repository data
- **Netlify** - For seamless frontend hosting
- **Render** - For reliable backend hosting
- **Chart.js Community** - For visualization inspiration
- **Open Source Community** - For continuous inspiration and support
- **Hackathon Team** - For collaboration and innovation
- **G.H. Raisoni College of Engineering** - For organizing the Hackathon 2025

### Resources & Inspiration

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [Express.js Documentation](https://expressjs.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Glassmorphism Design Trend](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ for the GitHub Community**

[![GitHub Stars](https://img.shields.io/github/stars/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025?style=social)](https://github.com/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025?style=social)](https://github.com/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025/network/members)

</div>
