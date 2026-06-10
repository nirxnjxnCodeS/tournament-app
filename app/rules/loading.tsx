import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-8">
      <Skeleton className="h-7 w-36" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 rounded-card" />
        </div>
      ))}
    </div>
  )
}
