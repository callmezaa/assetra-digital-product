import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { 
  X as Twitter, 
  Terminal as Github, 
  Palette as Dribbble, 
  Globe, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  MessageSquare,
  Users,
  LayoutGrid,
  Sparkles,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/ProductCard'
import HeroAnimations from '@/components/HeroAnimations'
import ContactSellerButton from '@/app/dashboard/chat/ContactSellerButton'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single()

  if (!profile) {
    return {
      title: 'Profile Not Found - Assetra',
    }
  }

  return {
    title: `${profile.full_name} (@${profile.username}) - Assetra Creator`,
    description: profile.bio || `Check out digital assets created by ${profile.full_name} on Assetra.`,
    openGraph: {
      title: `${profile.full_name} (@${profile.username}) - Assetra`,
      description: profile.bio || `Check out digital assets created by ${profile.full_name} on Assetra.`,
      images: [profile.avatar_url || ''],
    },
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const supabase = await createClient()
  const { username } = await params

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // 2. Fetch Products for this creator
  const { data: products } = await supabase
    .from('products')
    .select('*, profiles(id, full_name, avatar_url, username)')
    .eq('user_id', profile.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // 3. Check if current user follows this profile
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  let isFollowing = false
  if (currentUser) {
    const { data: follow } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .single()
    isFollowing = !!follow
  }

  const accentColor = profile.accent_color || '#4F46E5'

  return (
    <div className="min-h-screen bg-background">
      <HeroAnimations>
        {/* Banner Section */}
        <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden bg-muted">
           {profile.banner_url ? (
             <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-blue-500/10" />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
           
           <div className="absolute top-8 left-8">
              <Link href="/marketplace">
                <Button variant="ghost" className="bg-background/20 backdrop-blur-md text-white hover:bg-background/40 border-white/10 rounded-2xl gap-2 font-bold">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Marketplace
                </Button>
              </Link>
           </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="max-w-7xl mx-auto px-6 relative -mt-32 pb-20">
          <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
            {/* Avatar */}
            <div className="relative group">
              <div 
                className="h-44 w-44 rounded-[3rem] bg-background border-[8px] border-background shadow-2xl overflow-hidden relative z-10"
              >
                <img 
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`} 
                  alt={profile.full_name} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-primary to-blue-500 rounded-[3.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>

            {/* Stats & Identity */}
            <div className="flex-1 space-y-4 pb-4">
               <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black tracking-tight">{profile.full_name}</h1>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 fill-blue-500 text-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified Creator</span>
                  </div>
               </div>
               <p className="text-muted-foreground font-bold text-lg">@{profile.username}</p>
               
               <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground/60">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-black">1.2k</span> Followers
                  </div>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-black">{products?.length || 0}</span> Assets
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pb-4">
               <ContactSellerButton seller={profile} currentUser={currentUser} />
               <Button 
                size="lg" 
                variant={isFollowing ? "outline" : "default"}
                className={cn(
                  "h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95",
                  !isFollowing && "bg-primary text-primary-foreground shadow-primary/20"
                )}
               >
                 {isFollowing ? 'Following' : 'Follow Creator'}
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar Details */}
            <div className="lg:col-span-4 space-y-10">
               <div className="p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">About Creator</h3>
                  <p className="text-sm font-medium leading-relaxed text-foreground/80">
                    {profile.bio || "This creator hasn't shared a bio yet, but their work speaks for itself!"}
                  </p>
                  
                  <div className="pt-6 border-t border-border/50 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Connect & Socials</h4>
                    <div className="grid grid-cols-2 gap-3">
                       {profile.twitter_url && (
                         <a href={profile.twitter_url} target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all group">
                           <Twitter className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                           <span className="text-[10px] font-black uppercase tracking-tight">Twitter</span>
                         </a>
                       )}
                       {profile.github_url && (
                         <a href={profile.github_url} target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all group">
                           <Github className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                           <span className="text-[10px] font-black uppercase tracking-tight">GitHub</span>
                         </a>
                       )}
                       {profile.dribbble_url && (
                         <a href={profile.dribbble_url} target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all group">
                           <Dribbble className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                           <span className="text-[10px] font-black uppercase tracking-tight">Dribbble</span>
                         </a>
                       )}
                       {profile.website_url && (
                         <a href={profile.website_url} target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all group">
                           <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                           <span className="text-[10px] font-black uppercase tracking-tight">Website</span>
                         </a>
                       )}
                    </div>
                  </div>
               </div>

               {/* Achievement Badges */}
               <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-blue-500/5 border border-primary/20 space-y-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Achievements</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                     <div className="px-3 py-1.5 rounded-lg bg-card border border-border/50 text-[9px] font-black uppercase tracking-widest">Early Adopter</div>
                     <div className="px-3 py-1.5 rounded-lg bg-card border border-border/50 text-[9px] font-black uppercase tracking-widest">Top Rated</div>
                     <div className="px-3 py-1.5 rounded-lg bg-card border border-border/50 text-[9px] font-black uppercase tracking-widest">Best Seller</div>
                  </div>
               </div>
            </div>

            {/* Main Products Feed */}
            <div className="lg:col-span-8 space-y-8">
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tight">Featured Collection</h2>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{products?.length || 0} ITEMS</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {products && products.length > 0 ? (
                   products.map((product) => (
                     <ProductCard key={product.id} product={product as any} />
                   ))
                 ) : (
                   <div className="col-span-2 py-20 text-center opacity-40 space-y-4">
                     <LayoutGrid className="h-12 w-12 mx-auto" />
                     <p className="font-bold uppercase tracking-widest text-xs">No public assets found</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </HeroAnimations>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
