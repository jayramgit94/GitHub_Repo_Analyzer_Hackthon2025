"use client";

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 overflow-hidden">
      <div className="skeleton mb-4 h-5 w-2/3 rounded-lg" />
      <div className="skeleton mb-3 h-4 w-full rounded-lg" />
      <div className="skeleton mb-3 h-4 w-5/6 rounded-lg" />
      <div className="skeleton h-4 w-3/4 rounded-lg" />
    </div>
  );
}

export function SkeletonScoreRing() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="skeleton h-[120px] w-[120px] rounded-full" />
      <div className="skeleton h-4 w-20 rounded-lg" />
      <div className="skeleton h-3 w-14 rounded-lg" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="skeleton h-8 w-1/3 rounded-lg" />
        <div className="skeleton h-5 w-2/3 rounded-lg" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="skeleton h-8 w-16 rounded-lg mx-auto mb-2" />
            <div className="skeleton h-3 w-20 rounded-lg mx-auto" />
          </div>
        ))}
      </div>

      {/* Score rings skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 flex justify-center">
          <div className="skeleton h-[160px] w-[160px] rounded-full" />
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="skeleton h-4 w-32 rounded-lg mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonScoreRing key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return <div className={`skeleton h-4 ${width} rounded-lg`} />;
}
