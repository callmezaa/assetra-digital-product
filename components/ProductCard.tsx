'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Eye, Flame, Sparkles } from 'lucide-react'
import WishlistButton from './WishlistButton'
import AddToCartButton from './AddToCartButton'
import QuickViewModal from './QuickViewModal'
import { cn } from '@/lib/utils'

export default function ProductCard({ product }: { product: Product }) {
  const [activeIndex, setActiveIndex] = useState(0)
  
  // Mock additional images for premium preview feel
  const images = [
    product.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2564&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2564&auto=format&fit=crop"
  ]

  // Logic for badges
  const isNew = new Date(product.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  const isTrending = product.price > 70 // Simulated trending logic based on price for demo
  
  return (
    <div className="group relative flex flex-col h-full bg-card border border-border/20 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/11] overflow-hidden">
        {/* Status Badges (Top-Left) */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
          {isTrending && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500 text-[8px] font-semibold text-white tracking-wider">
              <Flame className="h-3 w-3" />
              Trending
            </div>
          )}
          {isNew && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500 text-[8px] font-semibold text-white tracking-wider">
              <Sparkles className="h-3 w-3" />
              New
            </div>
          )}
        </div>

        {/* Main Image Link */}
        <Link 
          href={`/product/${product.id}`} 
          className="block h-full relative"
          onMouseLeave={() => setActiveIndex(0)}
        >
          <Image
            src={images[activeIndex]}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
            priority={false}
          />

          {/* Interactive Scrubbing Zones */}
          <div className="absolute inset-0 flex z-30">
            {images.map((_, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveIndex(idx)}
                className="flex-1 h-full cursor-pointer"
              />
            ))}
          </div>

          {/* Pagination Dots (Only show on hover) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  idx === activeIndex ? "w-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "w-1.5 bg-white/40"
                )}
              />
            ))}
          </div>
        </Link>

        {/* Glass Overlay on Hover */}
        <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3 pointer-events-none group-hover:pointer-events-auto">
          <QuickViewModal product={product}>
            <button 
              type="button"
              aria-label="Quick preview"
              title="Quick preview"
              className="h-12 w-12 rounded-2xl bg-background shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto text-foreground border border-border/20 flex items-center justify-center cursor-pointer outline-none"
            >
              <Eye className="h-5 w-5" />
            </button>
          </QuickViewModal>
          
          <AddToCartButton 
            product={{
              id: product.id,
              title: product.title,
              price: product.price,
              thumbnail_url: product.thumbnail_url
            }} 
            className="h-12 w-12 rounded-2xl bg-background shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
          />
          <Link href={`/product/${product.id}`} className="pointer-events-auto">
            <Button size="sm" className="rounded-2xl h-12 px-6 font-bold bg-primary text-primary-foreground shadow-xl hover:scale-110 active:scale-95 transition-all duration-300">
              View <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Wishlist - Minimalist */}
        <div className="absolute top-4 right-4 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <WishlistButton productId={product.id} />
        </div>

        {/* Category Label (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-md text-[8px] font-semibold text-white border border-white/10">
            {product.category || 'Asset'}
          </span>
          {product.has_pro_overlay && (
            <span className="px-3 py-1 rounded-lg bg-primary/20 backdrop-blur-md text-[8px] font-semibold text-primary border border-primary/30 flex items-center gap-1">
              <Sparkles className="h-2 w-2" />
              Pro Edit
            </span>
          )}
        </div>

        {/* Pro Overlay Effects */}
        {product.has_pro_overlay && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-blue-500/10 pointer-events-none" />
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-xl">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[7px] font-semibold text-white tracking-[0.2em]">Verified Asset</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info Content */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-5">
        <div className="space-y-4">
          {/* Creator Info - New! */}
          <Link 
            href={`/profile/${product.profiles?.username || product.profiles?.id}`}
            className="flex items-center gap-2 group/creator w-fit"
          >
            <div className="h-6 w-6 rounded-lg overflow-hidden border border-border/50 group-hover/creator:border-primary/50 transition-colors relative">
              <Image 
                src={product.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${product.profiles?.full_name || 'User'}`} 
                alt={product.profiles?.full_name || 'Creator'}
                fill
                sizes="24px"
                className="object-cover transition-transform group-hover/creator:scale-110"
              />
            </div>
            <span className="text-xs font-semibold text-muted-foreground group-hover/creator:text-primary transition-colors">
              {product.profiles?.full_name || 'Creator'}
            </span>
          </Link>

          <div className="space-y-1.5">
            <Link href={`/product/${product.id}`}>
              <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
                {product.title}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground/70 line-clamp-1 font-medium italic">
              {product.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground/40 ">Price</span>
            <span className="font-bold text-xl text-foreground tracking-tighter">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
          
          <div className="h-1 w-12 rounded-full bg-border/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-primary translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  )
}
