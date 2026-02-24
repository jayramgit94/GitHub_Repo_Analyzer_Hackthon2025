"use client";

import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/Motion";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  GitBranch,
  Share2,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (url: string) => {
    setIsLoading(true);
    router.push(`/analyze?repo=${encodeURIComponent(url)}`);
  };

  const features = [
    {
      icon: <Cpu size={22} />,
      title: "AI-Powered Analysis",
      description:
        "Gemini AI analyzes code quality, architecture, security, and more — with actionable suggestions.",
      gradient: "from-primary-500/10 to-primary-500/5",
      iconBg: "bg-primary-500/10 text-primary-500",
    },
    {
      icon: <BarChart3 size={22} />,
      title: "7 Score Dimensions",
      description:
        "Code Quality, Architecture, Documentation, Security, Best Practices, Community Health, and Production Readiness.",
      gradient: "from-purple-500/10 to-purple-500/5",
      iconBg: "bg-purple-500/10 text-purple-500",
    },
    {
      icon: <Shield size={22} />,
      title: "Security Scanning",
      description:
        "Detect exposed secrets, missing .gitignore patterns, and security anti-patterns automatically.",
      gradient: "from-accent-500/10 to-accent-500/5",
      iconBg: "bg-accent-500/10 text-accent-500",
    },
    {
      icon: <Share2 size={22} />,
      title: "Shareable Reports",
      description:
        "Each analysis gets a unique share link. Send it to your team, include it in your portfolio.",
      gradient: "from-cyan-500/10 to-cyan-500/5",
      iconBg: "bg-cyan-500/10 text-cyan-500",
    },
    {
      icon: <TrendingUp size={22} />,
      title: "Tech Stack Detection",
      description:
        "Automatically detects frameworks, languages, and tools used in any repository.",
      gradient: "from-amber-500/10 to-amber-500/5",
      iconBg: "bg-amber-500/10 text-amber-500",
    },
    {
      icon: <Star size={22} />,
      title: "Community Reviews",
      description:
        "Read and write reviews about repositories. Help others discover great projects.",
      gradient: "from-rose-500/10 to-rose-500/5",
      iconBg: "bg-rose-500/10 text-rose-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="orb orb-primary w-[600px] h-[600px] -top-[200px] -right-[200px] animate-float" />
        <div className="orb orb-accent w-[500px] h-[500px] top-[60%] -left-[200px] animate-float-delayed" />
        <div className="orb orb-purple w-[400px] h-[400px] top-[30%] right-[10%] animate-float" />
        <div className="bg-grid absolute inset-0" />
      </div>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-28 pb-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-14">
          {/* Badge */}
          <FadeInUp>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--muted-fg)] mb-8 shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles size={14} className="text-primary-500" />
              AI-Powered Repository Analysis
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse" />
            </motion.div>
          </FadeInUp>

          {/* Headline */}
          <FadeInUp delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-display-lg font-extrabold leading-tight mb-6 tracking-tight text-balance">
              <span className="gradient-text">Analyze</span> any GitHub
              <br className="hidden sm:block" />
              {" "}repo in{" "}
              <span className="gradient-text">seconds</span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className="text-base sm:text-lg text-[var(--muted-fg)] max-w-xl mx-auto mb-10 leading-relaxed">
              Get AI-powered insights on code quality, architecture, security,
              and more. Built for developers who care about code excellence.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </FadeInUp>
        </div>

        {/* Stats */}
        <FadeInUp delay={0.4}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-2xl w-full mb-24">
            {[
              { label: "Repos Analyzed", value: "10K+", icon: <GitBranch size={14} /> },
              { label: "Score Dimensions", value: "7", icon: <BarChart3 size={14} /> },
              { label: "AI Models", value: "Gemini", icon: <Sparkles size={14} /> },
              { label: "Free Forever", value: "100%", icon: <CheckCircle2 size={14} /> },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="text-center p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] transition-all duration-300"
                whileHover={{ y: -2 }}
              >
                <div className="flex justify-center mb-2 text-[var(--primary)]">{stat.icon}</div>
                <div className="text-xl sm:text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-[11px] text-[var(--muted-fg)] mt-1 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </FadeInUp>

        {/* Features Grid */}
        <div className="max-w-5xl w-full">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
                Everything you need to{" "}
                <span className="gradient-text">evaluate</span> a repo
              </h2>
              <p className="text-sm text-[var(--muted-fg)] max-w-md mx-auto">
                Comprehensive analysis tooling that covers every aspect of your repository
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  className="glass-card p-6 h-full group cursor-default"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div
                    className={`h-10 w-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-[15px] font-semibold text-[var(--foreground)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-fg)] leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* CTA */}
        <FadeInUp delay={0.2}>
          <div className="mt-20 text-center">
            <p className="text-sm text-[var(--muted-fg)] mb-4">
              Ready to improve your codebase?
            </p>
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="btn-primary px-8 py-3.5 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </FadeInUp>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] py-8 px-4 bg-[var(--card)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted-fg)]">
            &copy; {new Date().getFullYear()} GitRepo Analyzer. Built with Next.js & Gemini AI.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="/reviews"
              className="text-xs text-[var(--muted-fg)] hover:text-[var(--primary)] transition-colors"
            >
              Reviews
            </a>
            <a
              href="https://github.com/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--muted-fg)] hover:text-[var(--primary)] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
