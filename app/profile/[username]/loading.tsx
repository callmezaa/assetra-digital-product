import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Banner Section */}
      <Skeleton className="h-[300px] md:h-[400px] w-full rounded-none" />

      {/* Profile Info Overlay */}
      <div className="max-w-7xl mx-auto px-6 relative -mt-32 pb-20">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
          {/* Avatar */}
          <Skeleton className="h-44 w-44 rounded-[3rem] border-[8px] border-background relative z-10" />

          {/* Stats & Identity */}
          <div className="flex-1 space-y-4 pb-4 w-full">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-6 w-32 rounded-md" />
            <div className="flex gap-6 pt-2">
               <Skeleton className="h-5 w-24 rounded-md" />
               <Skeleton className="h-5 w-24 rounded-md" />
               <Skeleton className="h-5 w-32 rounded-md" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pb-4">
             <Skeleton className="h-14 w-14 rounded-2xl" />
             <Skeleton className="h-14 w-40 rounded-2xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Details */}
          <div className="lg:col-span-4 space-y-10">
             <Skeleton className="h-64 rounded-[2.5rem]" />
             <Skeleton className="h-32 rounded-[2.5rem]" />
          </div>

          {/* Main Products Feed */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex justify-between items-center">
               <Skeleton className="h-8 w-48 rounded-xl" />
               <Skeleton className="h-8 w-20 rounded-full" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="space-y-4">
                   <Skeleton className="aspect-video w-full rounded-[2rem]" />
                   <Skeleton className="h-6 w-3/4 rounded-xl" />
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
