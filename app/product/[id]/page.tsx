import { createClient } from '@/lib/supabase/server'
import { 
  Check, 
  ShieldCheck, 
  BadgeCheck, 
  ArrowLeft, 
  Clock, 
  Package, 
  LayoutDashboard,
  ExternalLink,
  Users,
  Star,
  CheckCircle2,
  Download
} from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductActions from './ProductActions'
import HeroAnimations from '@/components/HeroAnimations'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import ProductGallery from '@/components/ProductGallery'
import ProductSpecs from '@/components/ProductSpecs'
import ProductFeatures from '@/components/ProductFeatures'
import ReviewSection from '@/components/ReviewSection'
import StickyActionBar from '@/components/StickyActionBar'
import LivePreviewModal from '@/components/LivePreviewModal'
import ProductCard from '@/components/ProductCard'
import ProductFAQ from '@/components/ProductFAQ'
import ContactSellerButton from '@/app/dashboard/chat/ContactSellerButton'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single()

  if (!product) {
    return {
      title: 'Product Not Found - Assetra',
    }
  }

  return {
    title: `${product.title} - Assetra`,
    description: product.description?.substring(0, 160) || 'Buy premium digital assets on Assetra.',
    openGraph: {
      title: `${product.title} - Assetra`,
      description: product.description?.substring(0, 160),
      images: [product.thumbnail_url || ''],
    },
  }
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch product and reviews
  const [productRes, reviewsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('reviews')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
  ])

  const product = productRes.data
  const reviews = reviewsRes.data || []

  if (productRes.error || !product) {
    notFound()
  }

  // Fetch more products from the same creator
  const { data: moreProducts } = await supabase
    .from('products')
    .select(`
      id,
      title,
      price,
      thumbnail_url,
      category,
      profiles (
        full_name,
        username,
        avatar_url
      )
    `)
    .eq('user_id', product.user_id)
    .neq('id', product.id)
    .limit(3)

  // Fetch profiles manually to bypass schema cache foreign key issues
  const userIdsToFetch = new Set<string>()
  if (product.user_id) userIdsToFetch.add(product.user_id)
  reviews.forEach(r => userIdsToFetch.add(r.user_id))

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('*')
    .in('id', Array.from(userIdsToFetch))

  const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || [])

  product.profiles = profilesMap.get(product.user_id)
  reviews.forEach(r => {
    r.profiles = profilesMap.get(r.user_id)
  })

  let isPurchased = false
  if (user) {
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .eq('status', 'completed')
      .single()
    
    if (order) isPurchased = true
  }

  const seller = product.profiles
  const ratingValue = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : 0

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.thumbnail_url,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "url": `https://assetra.com/product/${product.id}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": "https://schema.org/InStock"
    },
    ...(ratingValue > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": ratingValue.toFixed(1),
        "reviewCount": reviews.length
      }
    })
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroAnimations>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 space-y-6 sm:space-y-10">
          
          {/* Back Button */}
          <div className="animate-title opacity-0">
            <Link 
              href="/marketplace" 
              className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors gap-2 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Marketplace
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
            
            {/* Left Column: Media & Description */}
            <div className="lg:col-span-8 space-y-10">
              {/* Main Image Gallery */}
              <ProductGallery title={product.title} mainImage={product.thumbnail_url} />

              {/* Tech Stack & Specs */}
              <ProductSpecs category={product.category || 'Other'} />

              {/* Description Card */}
              <div className="animate-desc opacity-0 p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-card border border-border/20 shadow-sm space-y-6 sm:space-y-8">
                <div className="flex items-center gap-2 pb-6 border-b border-border/20">
                   <LayoutDashboard className="h-5 w-5 text-primary" />
                   <h2 className="text-xl font-bold tracking-tight">Product Description</h2>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line font-medium">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Visual Checklist */}
              <ProductFeatures category={product.category || 'Other'} />
            </div>

            {/* Right Column: Actions & Seller */}
            <div className="lg:col-span-4 space-y-8">
              {/* Purchase Card */}
              <div className="animate-btns opacity-0 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-card border border-border/20 shadow-xl space-y-6 sm:space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 -mr-6 -mt-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Package className="h-32 w-32 text-primary" />
                </div>
                
                <div className="relative z-10 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold ">
                      {product.category || 'Digital Asset'}
                    </span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      <span className="text-sm font-bold">
                        {ratingValue > 0 ? ratingValue.toFixed(1) : 'New'}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight mb-4">{product.title}</h1>
                  <p className="text-muted-foreground leading-relaxed font-medium text-sm sm:text-lg">{product.description}</p>
                </div>

                <div className="pt-8 border-t border-border/20 flex flex-col items-center justify-between gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-muted-foreground mb-1">Total Price</span>
                    <span className="text-4xl sm:text-5xl font-semibold tracking-tighter">
                      ${Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  <ProductActions 
                    product={{
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      thumbnail_url: product.thumbnail_url
                    }} 
                    isPurchased={isPurchased} 
                    isLoggedIn={!!user} 
                  />

                  {/* Secondary Action: Live Preview */}
                  <div className="w-full pt-2">
                    <LivePreviewModal title={product.title} />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-border/20">
                  <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5 text-green-500" /> Lifetime access
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                    <Download className="h-5 w-5 text-blue-500" /> Instant download
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Profile Mini */}
              <div className="animate-desc opacity-0 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-muted/30 border border-border/20 shadow-sm space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-border/20 text-muted-foreground">
                   <Users className="h-4 w-4" />
                   <h3 className="text-xs font-semibold ">About Creator</h3>
                </div>
                
                <Link href={`/seller/${seller?.username}`} className="flex items-center gap-4 group">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-background shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={seller?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${seller?.full_name}`} 
                      alt={seller?.full_name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-lg group-hover:text-primary transition-colors">{seller?.full_name}</p>
                      <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground">@{seller?.username}</p>
                  </div>
                </Link>

                <p className="text-sm font-medium leading-relaxed text-muted-foreground/80 line-clamp-3 italic">
                  &quot;{seller?.bio || 'Passionate creator sharing high-quality digital assets for the community.'}&quot;
                </p>
                <Link href={`/seller/${seller?.username}`} className="block">
                  <Button variant="outline" className="w-full h-12 rounded-2xl font-bold text-xs gap-2 hover:bg-primary/5 hover:text-primary border-border/20">
                    View Full Storefront
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>

                <div className="pt-2">
                  <ContactSellerButton 
                    seller={seller} 
                    currentUser={user} 
                  />
                </div>
              </div>
            </div>

          </div>

          {/* FAQ Section */}
          <div className="pt-8 border-t border-border/20">
            <ProductFAQ category={product.category || 'Other'} />
          </div>

          {/* Reviews Section */}
          <div className="animate-fade-in-up mt-16 max-w-4xl pt-8 border-t border-border/20">
            <ReviewSection 
              productId={product.id} 
              reviews={reviews} 
              isPurchased={isPurchased} 
            />
          </div>

          {/* Cross-Selling: More by this Creator */}
          {moreProducts && moreProducts.length > 0 && (
            <div className="animate-fade-in-up mt-12 sm:mt-24 pt-10 sm:pt-16 border-t border-border/20">
              <div className="flex flex-col items-center text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold ">
                  <BadgeCheck className="h-4 w-4" />
                  More Masterpieces
                </div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  More by <span className="text-primary">{seller?.full_name}</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {moreProducts.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Bar */}
        <StickyActionBar 
          product={{
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail_url: product.thumbnail_url,
            category: product.category || 'Asset'
          }}
          isPurchased={isPurchased}
          isLoggedIn={!!user}
          rating={ratingValue}
          reviewsCount={reviews.length}
        />
      </HeroAnimations>
    </div>
  )
}
