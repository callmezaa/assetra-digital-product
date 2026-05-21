import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { motion } from 'framer-motion'

import { createClient } from '@/lib/supabase/server'
import HeroCanvas from '@/components/HeroCanvas'

import HeroSocialProof from '@/components/HeroSocialProof'
import HeroFeatures from '@/components/HeroFeatures'
import HeroCTA from '@/components/HeroCTA'
import AssetMarquee from '@/components/AssetMarquee'
import TrustWall from '@/components/TrustWall'
import HeroAnimations from '@/components/HeroAnimations'
import ScrollReveal from '@/components/ScrollReveal'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  let userProfile = null
  
  if (currentUser) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single()
    userProfile = data
  }

  let products = []
  
  try {
    const { data } = await supabase
      .from('products')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false })
      .limit(3)
      
    if (data) {
      products = data
    }
  } catch {
    // Fallback handled below
  }

  // Fallback mock data with current user profile if available
  if (products.length === 0) {
    const defaultProfile = userProfile || {
      full_name: 'Assetra Creator',
      avatar_url: null,
      username: 'assetra'
    }

    products = [
      {
        id: '1',
        title: 'Nextalk Social Messaging App',
        description: 'Nextalk is a modern social messaging application designed for seamless connection.',
        price: 70.00,
        category: 'UI Kits',
        thumbnail_url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2000&auto=format&fit=crop',
        user_id: currentUser?.id || 'user-1',
        created_at: new Date().toISOString(),
        profiles: defaultProfile,
        has_pro_overlay: true
      },
      {
        id: '2',
        title: 'Finance Tracker App',
        description: 'Finance Tracker is a modern web application designed to help you track your expenses.',
        price: 50.00,
        category: 'Templates',
        thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop',
        user_id: currentUser?.id || 'user-2',
        created_at: new Date().toISOString(),
        profiles: defaultProfile,
        has_pro_overlay: true
      },
      {
        id: '3',
        title: 'Mercato Ecommerce App',
        description: 'Mercato is a modern e-commerce application template for your next online store.',
        price: 30.00,
        category: 'Templates',
        thumbnail_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2000&auto=format&fit=crop',
        user_id: currentUser?.id || 'user-3',
        created_at: new Date().toISOString(),
        profiles: defaultProfile,
        has_pro_overlay: true
      }
    ]
  }

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/30">
      {/* Hero Section with Interactive 3D Canvas */}
      <section className="relative px-4 pt-24 pb-16 md:pt-48 md:pb-32 overflow-hidden bg-background flex items-center justify-center min-h-[85vh] md:min-h-[95vh]">
        <HeroCanvas />

        <div className="container mx-auto max-w-6xl text-center space-y-12 relative z-10">
          <HeroAnimations>
            <div className="animate-badge inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/5 backdrop-blur-md text-primary font-semibold text-[12px] border border-primary/10 mb-6 opacity-0 shadow-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span>Curated digital ecosystem</span>
            </div>
            
            <h1 className="animate-title text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter text-foreground opacity-0 leading-[0.95] mb-6 md:mb-8">
              Elevate your <br />
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-indigo-600 animate-gradient-x">digital workflow.</span>
            </h1>
            
            <p className="animate-desc text-base sm:text-lg md:text-xl text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed font-medium opacity-0 mb-8 md:mb-10 px-2">
              A curated ecosystem of world-class assets designed for <br className="hidden md:block" /> modern designers and professional developers.
            </p>
            
            <div className="animate-btns flex flex-col sm:flex-row justify-center items-center gap-5 pt-4 opacity-0">
              <Link href="/marketplace">
                <Button size="lg" className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg rounded-2xl shadow-2xl shadow-primary/30 font-bold hover:scale-105 active:scale-95 transition-all group relative overflow-hidden w-full sm:w-auto">
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  Browse Assets
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard/new">
                <Button size="lg" variant="ghost" className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg rounded-2xl font-bold hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all w-full sm:w-auto">
                  Start Selling
                </Button>
              </Link>
            </div>

            <HeroSocialProof />
          </HeroAnimations>
        </div>
      </section>

      <AssetMarquee />

      {/* Features Section - Premium Bento Grid */}
      <section className="py-24 md:py-32 bg-background relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="text-center mb-16 md:mb-24 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 backdrop-blur-md text-primary font-semibold text-[12px] border border-primary/10 shadow-sm mx-auto">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Core Advantages</span>
            </div>
            <h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] max-w-3xl mx-auto">
              Engineered for <br className="hidden md:block" />
              <span className="text-primary">peak performance.</span>
            </h3>
            <p className="text-muted-foreground/70 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              A high-end ecosystem meticulously crafted for the next generation of digital commerce and creative excellence.
            </p>
          </div>

          <HeroFeatures />
        </div>
      </section>

      {/* Featured Products with Modern Layout */}
      <ScrollReveal>
        <section className="py-16 md:py-24 bg-muted/5 border-y border-border/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-4 md:gap-6">
              <div className="space-y-2">
                <span className="text-primary font-semibold text-sm tracking-tight">Curated Selections</span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Premium Assets</h2>
              </div>
              <Link href="/marketplace">
                <Button variant="outline" className="rounded-xl h-12 px-8 font-bold gap-2">
                  Explore Marketplace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {products.map(product => (
                <div key={product.id} className="reveal-item opacity-0 group">
                  <div className="relative transform transition-all duration-500 group-hover:-translate-y-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[2rem] blur opacity-0 group-hover:opacity-10 transition duration-500" />
                    <ProductCard product={product} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <TrustWall />

      {/* Bottom CTA - Elite Invitation */}
      <section className="py-20 md:py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <HeroCTA />
        </div>
      </section>
    </div>
  )
}
