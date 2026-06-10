import { SkeletonFixtureCard } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-4">
      <div className="h-7 w-28 bg-surface-raised rounded animate-pulse" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-surface-raised rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonFixtureCard key={i} />)}
      </div>
    </div>
  )
}
