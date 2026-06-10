import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="px-4 py-6 max-w-4xl mx-auto flex flex-col gap-4">
      <Skeleton className="h-7 w-24" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-card" />
        ))}
      </div>
    </div>
  )
}
