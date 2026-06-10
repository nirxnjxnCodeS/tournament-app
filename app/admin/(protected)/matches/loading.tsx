import { SkeletonFixtureCard } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-7 w-32 bg-surface-raised rounded animate-pulse" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonFixtureCard key={i} />)}
      </div>
    </div>
  )
}
