import { SkeletonTableRow } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="px-4 py-6 max-w-4xl mx-auto flex flex-col gap-4">
      <div className="h-7 w-36 bg-surface-raised rounded animate-pulse" />
      <div className="rounded-card border border-border overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => <SkeletonTableRow key={i} />)}
      </div>
    </div>
  )
}
