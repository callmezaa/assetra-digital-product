import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import HeroAnimations from '@/components/HeroAnimations'
import ScrollReveal from '@/components/ScrollReveal'
import { 
  BadgeCheck, 
  Package, 
  Star, 
  MapPin, 
  Calendar,
  ExternalLink,
  Globe,
  X,
  Link2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

import FollowButton from '@/components/FollowButton'

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch seller profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Fetch seller's products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  // Fetch follower count
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id)

  // Check if current user is following
  let isFollowing = false
  if (user) {
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .single()
    if (data) isFollowing = true
  }

  // Calculate Badges
  const isTopSeller = (products?.length || 0) >= 5
  const hasManyFollowers = (followersCount || 0) >= 10

  return (
    <div className="min-h-screen bg-background">
      
      <main className="pb-24">
        <HeroAnimations>
          {/* Cover Header */}
          <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-blue-600/10 to-purple-600/20" />
            <div className="absolute inset-0 backdrop-blur-[100px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-full max-w-7xl mx-auto relative px-6 flex items-end pb-12">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                   <Package className="h-96 w-96 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              
              {/* Left Side: Profile Card */}
              <div className="animate-title opacity-0 w-full lg:w-96 flex-shrink-0">
                <div className="p-8 rounded-[3rem] bg-card border border-border/50 shadow-2xl space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 -mr-6 -mt-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BadgeCheck className="h-32 w-32 text-primary" />
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                    {/* Avatar */}
                    <div className="h-32 w-32 rounded-[2.5rem] overflow-hidden border-4 border-background shadow-xl">
                      <img 
                        src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`} 
                        alt={profile.full_name} 
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-black tracking-tight">{profile.full_name}</h1>
                        <BadgeCheck className="h-6 w-6 text-primary fill-primary/20" />
                      </div>
                      <p className="text-primary font-bold text-sm tracking-widest uppercase">@{profile.username}</p>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                      {profile.bio || "Crafting premium digital experiences for creators worldwide."}
                    </p>

                    {user?.id !== profile.id && (
                      <div className="pt-2">
                        <FollowButton 
                          creatorId={profile.id} 
                          initialIsFollowing={isFollowing} 
                          isLoggedIn={!!user} 
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-2xl bg-muted/50 border border-border/50 text-center">
                        <div className="text-lg font-black">{products?.length || 0}</div>
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Products</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-muted/50 border border-border/50 text-center">
                        <div className="text-lg font-black">{followersCount || 0}</div>
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Followers</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-muted/50 border border-border/50 text-center">
                        <div className="text-lg font-black">5.0</div>
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Rating</div>
                      </div>
                    </div>

                    {/* Creator Badges */}
                    <div className="flex flex-wrap gap-2">
                      {isTopSeller && (
                        <span className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Star className="h-3 w-3 fill-orange-500" /> Pro Seller
                        </span>
                      )}
                      {hasManyFollowers && (
                        <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <BadgeCheck className="h-3 w-3 fill-blue-500 text-white" /> Rising Star
                        </span>
                      )}
                      {(!isTopSeller && !hasManyFollowers) && (
                        <span className="px-3 py-1.5 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Package className="h-3 w-3" /> New Creator
                        </span>
                      )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                        <MapPin className="h-4 w-4" />
                        <span>Remote Worldwide</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/10 hover:text-primary"><Globe className="h-5 w-5" /></Button>
                      <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/10 hover:text-primary"><X className="h-5 w-5" /></Button>
                      <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/10 hover:text-primary"><Link2 className="h-5 w-5" /></Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Store Content */}
              <div className="flex-1 w-full space-y-12">
                <div className="animate-btns opacity-0 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border/50 pb-8">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter">Product Catalog</h2>
                    <p className="text-muted-foreground font-medium mt-1">Browse all premium assets from this creator.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-black text-muted-foreground uppercase tracking-widest bg-muted/30 px-6 py-3 rounded-2xl border border-border/50">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>Top Rated Creator</span>
                  </div>
                </div>

                <ScrollReveal>
                  {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {products.map(product => (
                        <div key={product.id} className="reveal-item opacity-0">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="reveal-item opacity-0 text-center py-32 bg-muted/10 rounded-[3rem] border-2 border-dashed border-border/50 flex flex-col items-center gap-6">
                       <Package className="h-16 w-16 text-muted-foreground/20" />
                       <div className="space-y-1">
                         <h3 className="text-xl font-bold">No products yet</h3>
                         <p className="text-muted-foreground max-w-sm mx-auto font-medium">This creator hasn&apos;t published any assets to the marketplace yet.</p>
                       </div>
                    </div>
                  )}
                </ScrollReveal>
              </div>

            </div>
          </div>
        </HeroAnimations>
      </main>
    </div>
  )
}
