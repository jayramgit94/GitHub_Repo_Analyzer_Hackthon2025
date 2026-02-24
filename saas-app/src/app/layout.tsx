/*
 * ============================================
 * Root Layout — The shell of the entire app
 * ============================================
 *
 * WHAT THIS DOES:
 * - Sets up HTML structure, fonts, metadata
 * - Wraps all pages with consistent navbar/footer
 * - Handles dark/light theme
 * - Provides global context
 *
 * IN NEXT.JS APP ROUTER:
 * layout.tsx wraps every page. It's like the <html> shell.
 * page.tsx is the content for each route.
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitRepo Analyzer — AI-Powered Repository Insights",
  description:
    "Get deep AI-powered insights into any GitHub repository. Code quality scores, architecture analysis, security hints, and more.",
  keywords: [
    "GitHub",
    "repository analyzer",
    "code quality",
    "AI analysis",
    "open source",
  ],
  openGraph: {
    title: "GitRepo Analyzer — AI-Powered Repository Insights",
    description: "Analyze any GitHub repo with AI. Get scores, insights, and actionable suggestions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Theme initialization script — prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased custom-scrollbar">
        {children}
      </body>
    </html>
  );
}
