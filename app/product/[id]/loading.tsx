import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 space-y-6 sm:space-y-10">
        
        {/* Back Button Skeleton */}
        <div className="inline-flex items-center text-xs font-bold text-muted-foreground gap-2 opacity-50">
          <ArrowLeft className="h-4 w-4" />
          Loading...
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Left Column: Media & Description */}
          <div className="lg:col-span-8 space-y-10">
            {/* Gallery Skeleton */}
            <Skeleton className="w-full aspect-[16/10] sm:aspect-video rounded-3xl sm:rounded-[3rem]" />

            {/* Specs Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>

            {/* Description Skeleton */}
            <Skeleton className="h-64 rounded-2xl sm:rounded-[2.5rem]" />
          </div>

          {/* Right Column: Actions & Seller */}
          <div className="lg:col-span-4 space-y-8">
            {/* Purchase Card Skeleton */}
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-card border border-border/20 shadow-xl space-y-6">
              <Skeleton className="h-8 w-24 rounded-xl" />
              <Skeleton className="h-12 w-3/4 rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <div className="pt-8 border-t border-border/20 flex flex-col items-center gap-6">
                <Skeleton className="h-16 w-32 rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
              </div>
            </div>

            {/* Creator Profile Skeleton */}
            <Skeleton className="h-48 rounded-2xl sm:rounded-[2.5rem]" />
          </div>

        </div>
      </div>
    </div>
  )
}
