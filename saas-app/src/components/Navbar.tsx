"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Github, Menu, Moon, Sun, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem("theme") || "dark";
    setIsDark(theme === "dark");

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", !isDark);
    localStorage.setItem("theme", newTheme);
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/reviews", label: "Reviews" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--surface-overlay)] backdrop-blur-xl border-b border-[var(--border)] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
            <Zap size={18} className="text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Zap size={18} className="text-white absolute" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text">GitRepo</span>
            <span className="text-[var(--foreground)] ml-0.5">Analyzer</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 text-sm font-medium text-[var(--muted-fg)] rounded-lg transition-all duration-200 hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              {link.label}
            </Link>
          ))}

          <div className="w-px h-5 bg-[var(--border)] mx-2" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative rounded-lg p-2.5 text-[var(--muted-fg)] transition-all duration-200 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="Toggle theme"
            suppressHydrationWarning
          >
            {mounted ? (
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Sun size={18} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Moon size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="h-[18px] w-[18px]" />
            )}
          </button>

          {/* GitHub */}
          <a
            href="https://github.com/jayramgit94/GitHub_Repo_Analyzer_Hackthon2025"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2.5 text-[var(--muted-fg)] transition-all duration-200 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label="GitHub Repository"
          >
            <Github size={18} />
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-[var(--muted-fg)] md:hidden hover:bg-[var(--muted)]"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[var(--border)] bg-[var(--card)] backdrop-blur-xl md:hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => { toggleTheme(); setIsOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--muted-fg)] hover:bg-[var(--muted)] transition-colors"
              >
                {mounted && (isDark ? <Sun size={16} /> : <Moon size={16} />)}
                {mounted ? (isDark ? "Light Mode" : "Dark Mode") : "Toggle Theme"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
