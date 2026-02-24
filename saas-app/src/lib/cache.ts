/*
 * ============================================
 * In-Memory Cache with TTL
 * ============================================
 * 
 * WHY CACHE?
 * - GitHub API has rate limits (5000/hr with token)
 * - AI API calls cost money/tokens
 * - Same repo analyzed twice = wasted resources
 * - Cache lasts 24 hours, then re-analyzes
 *
 * ARCHITECTURE:
 *   Request → Check cache → HIT? Return cached → MISS? Analyze + cache
 *
 * IN PRODUCTION: Replace with Redis for multi-instance caching
 * For single Vercel deployment, in-memory + MongoDB is sufficient
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AnalysisCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  get size(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const analysisCache = new AnalysisCache();

// Generate cache key from repo identifier
export function getCacheKey(owner: string, repo: string): string {
  return `analysis:${owner}/${repo}`.toLowerCase();
}
