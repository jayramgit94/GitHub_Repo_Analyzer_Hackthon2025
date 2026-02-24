"use client";

import { motion } from "framer-motion";
import { Loader2, Search, Zap } from "lucide-react";
import { FormEvent, useState } from "react";

interface SearchBarProps {
  onSearch: (url: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [url, setUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSearch(url.trim());
    }
  };

  const exampleRepos = [
    "facebook/react",
    "vercel/next.js",
    "tailwindlabs/tailwindcss",
    "microsoft/vscode",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div
          className={`relative flex items-center gap-2 p-1.5 rounded-2xl border transition-all duration-300 ${
            isFocused
              ? "border-[var(--primary)] shadow-glow bg-[var(--card)]"
              : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted-fg)]"
          }`}
        >
          {/* Search Icon */}
          <div className={`pl-4 transition-colors duration-200 ${isFocused ? "text-[var(--primary)]" : "text-[var(--muted-fg)]"}`}>
            <Search size={20} />
          </div>

          {/* Input */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Paste GitHub repo URL or owner/repo..."
            className="flex-1 bg-transparent border-none outline-none text-[var(--foreground)] placeholder:text-[var(--muted-fg)] text-[15px] py-3 px-2"
            disabled={isLoading}
            suppressHydrationWarning
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="btn-primary py-3 px-6 rounded-xl text-sm whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>
      </motion.form>

      {/* Example Repos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-4 flex flex-wrap items-center gap-2 justify-center"
      >
        <span className="text-xs text-[var(--muted-fg)]">Try:</span>
        {exampleRepos.map((repo, i) => (
          <motion.button
            key={repo}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
            onClick={() => {
              setUrl(repo);
              onSearch(repo);
            }}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)]
                       text-[var(--muted-fg)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5
                       transition-all duration-200 disabled:opacity-50"
          >
            {repo}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
