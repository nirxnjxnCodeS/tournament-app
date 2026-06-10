import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-6">
      <Skeleton className="h-24 rounded-card" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-card" />)}
      </div>
      <Skeleton className="h-5 w-24" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-card" />)}
      </div>
    </div>
  )
}
