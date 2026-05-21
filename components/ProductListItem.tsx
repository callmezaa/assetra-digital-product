'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Eye, Package, Calendar, Tag, Flame, Sparkles } from 'lucide-react'
import AddToCartButton from './AddToCartButton'
import QuickViewModal from './QuickViewModal'

export default function ProductListItem({ product }: { product: Product }) {
  // Logic for badges
  const isNew = new Date(product.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  const isTrending = product.price > 70 // Simulated trending logic
  
  return (
    <div className="group relative bg-card border border-border/20 rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:border-primary/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col md:flex-row items-center p-4 gap-6">
        
        {/* Left: Image Preview */}
        <div className="relative h-40 w-full md:w-64 shrink-0 rounded-xl overflow-hidden bg-muted">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {isTrending && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/90 backdrop-blur-md text-[8px] font-semibold text-white tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Flame className="h-2.5 w-2.5" />
                Trending
              </div>
            )}
            {isNew && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/90 backdrop-blur-md text-[8px] font-semibold text-white tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Sparkles className="h-2.5 w-2.5" />
                New
              </div>
            )}
          </div>
          <Link href={`/product/${product.id}`} className="block h-full w-full relative">
            <Image
              src={product.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </Link>
          <div className="absolute top-3 left-3">
             <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-xs font-semibold text-white tracking-wider border border-white/10">
              {product.category}
            </span>
          </div>
        </div>

        {/* Center: Details */}
        <div className="flex-1 space-y-4 py-2">
          <div className="space-y-1">
            <Link href={`/product/${product.id}`}>
              <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                {product.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed max-w-2xl">
              {product.description || "No description available for this premium digital asset."}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-bold text-muted-foreground ">
            <div className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-primary" />
              <span>Source Files Inc.</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Updated 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <span>Commercial License</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 w-full md:w-auto md:min-w-[140px] md:pl-6 md:border-l border-border/20">
          <div className="text-center">
            <span className="text-xs font-semibold text-muted-foreground/60 block mb-1">Price</span>
            <div className="text-2xl font-semibold tracking-tighter">
              ${Number(product.price).toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <QuickViewModal product={product}>
              <button 
                type="button"
                aria-label="Quick preview"
                title="Quick preview"
                className="h-10 w-10 rounded-xl bg-muted/50 hover:bg-muted text-foreground flex items-center justify-center transition-all border border-border/20"
              >
                <Eye className="h-4 w-4" />
              </button>
            </QuickViewModal>
            
            <AddToCartButton 
              product={{
                id: product.id,
                title: product.title,
                price: product.price,
                thumbnail_url: product.thumbnail_url
              }} 
              className="h-10 px-4 rounded-xl"
              showText={false}
            />
            
            <Link href={`/product/${product.id}`}>
              <Button size="sm" variant="outline" className="h-10 w-10 p-0 rounded-xl border-border/20">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
