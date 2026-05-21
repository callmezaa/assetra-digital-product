import { Skeleton } from "@/components/ui/skeleton"

export default function ProductSkeleton({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  if (view === 'list') {
    return (
      <div className="flex flex-col md:flex-row items-center p-4 gap-6 bg-card border border-border/40 rounded-[1.5rem] overflow-hidden">
        <Skeleton className="h-40 w-full md:w-64 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-4 py-2 w-full">
          <div className="space-y-2">
            <Skeleton className="h-7 w-1/3 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3 rounded-lg" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex md:flex-col items-center gap-4 w-full md:w-32 md:pl-6 md:border-l border-border/40">
          <Skeleton className="h-8 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-card border border-border/40 rounded-[2rem] overflow-hidden">
      {/* Image Placeholder */}
      <div className="relative aspect-[16/11]">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Content Placeholder */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Title and Category */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-7 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
        </div>

        {/* Price and Action */}
        <div className="pt-4 flex items-center justify-between border-t border-border/40">
          <div className="space-y-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
