import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/DashboardSidebar'
import HeroAnimations from '@/components/HeroAnimations'
import MarketplaceClient from '@/components/MarketplaceClient'
import { Sparkles } from 'lucide-react'

export default async function MarketplacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: products, count } = await supabase
    .from('products')
    .select('*, profiles(id, full_name, avatar_url, username)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(12)

  let followingIds: string[] = []
  if (user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    
    if (follows) {
      followingIds = follows.map(f => f.following_id)
    }
  }

  return (
    <div className="flex bg-muted/5 min-h-[calc(100vh-64px)]">
      <DashboardSidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
        <HeroAnimations>
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
            
            {/* Header Section */}
            <div className="animate-title opacity-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 border-b border-border/20 pb-8 sm:pb-12">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 text-muted-foreground text-xs font-bold tracking-[0.2em] rounded-full w-fit border border-border/20">
                  Digital Assets
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter leading-tight">
                  Browse the <span className="text-primary">marketplace.</span>
                </h1>
                <p className="text-muted-foreground text-sm sm:text-lg font-medium leading-relaxed">
                  Premium UI kits, templates, and digital resources for modern professionals.
                </p>
              </div>
              
              <div className="hidden lg:flex items-center gap-10">
                <div className="text-center">
                  <div className="text-3xl font-semibold tracking-tighter">{count || 0}</div>
                  <div className="text-xs font-semibold text-muted-foreground ">Total Assets</div>
                </div>
                <div className="h-12 w-px bg-border/50" />
                <div className="text-center">
                  <div className="text-3xl font-semibold tracking-tighter">24/7</div>
                  <div className="text-xs font-semibold text-muted-foreground ">Global Support</div>
                </div>
              </div>
            </div>

            {/* Live Filter & Product Grid System */}
            <div className="animate-btns opacity-0">
              <MarketplaceClient 
                initialProducts={products || []}
                initialTotalCount={count || 0} 
                followingIds={followingIds}
                isLoggedIn={!!user}
              />
            </div>

          </div>
        </HeroAnimations>
      </main>
    </div>
  )
}
