interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-surface-raised rounded animate-pulse ${className}`}
      aria-hidden
    />
  )
}

// ── Preset skeleton layouts ───────────────────────────────────────────

export function SkeletonFixtureCard() {
  return (
    <div className="flex items-center gap-3 p-3 bg-surface rounded-card border border-border">
      <Skeleton className="size-9 rounded-full shrink-0" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-6 w-14 shrink-0" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="size-9 rounded-full shrink-0" />
    </div>
  )
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
      <Skeleton className="h-4 w-5 shrink-0" />
      <Skeleton className="size-7 rounded-full shrink-0" />
      <Skeleton className="h-4 w-28" />
      <div className="ml-auto flex gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-6" />
        ))}
      </div>
    </div>
  )
}

export function SkeletonPlayerCard() {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-surface rounded-card border border-border">
      <Skeleton className="size-16 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-12" />
    </div>
  )
}
