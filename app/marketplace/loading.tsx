import DashboardSidebar from '@/components/DashboardSidebar'
import { Skeleton } from '@/components/ui/skeleton'

export default function MarketplaceLoading() {
  return (
    <div className="flex bg-muted/5 min-h-[calc(100vh-64px)]">
      <DashboardSidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border/50 pb-12">
            <div className="space-y-4 max-w-2xl w-full">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-8 w-3/4 rounded-xl" />
            </div>
            
            <div className="hidden lg:flex items-center gap-10">
              <Skeleton className="h-16 w-24 rounded-2xl" />
              <div className="h-12 w-px bg-border/50" />
              <Skeleton className="h-16 w-24 rounded-2xl" />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="space-y-8">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-video w-full rounded-[2rem]" />
                  <Skeleton className="h-6 w-3/4 rounded-xl" />
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
