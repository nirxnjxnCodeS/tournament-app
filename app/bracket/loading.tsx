import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="px-4 py-6 max-w-3xl mx-auto flex flex-col gap-4">
      <Skeleton className="h-7 w-24" />
      <div className="flex gap-16 items-center">
        <div className="flex flex-col gap-8">
          <Skeleton className="h-24 w-52" />
          <Skeleton className="h-24 w-52" />
        </div>
        <Skeleton className="h-24 w-52" />
      </div>
    </div>
  )
}
