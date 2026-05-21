'use client'

import React from 'react'
import Image from 'next/image'
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import AddToCartButton from './AddToCartButton'
import { Product } from '@/types'

export default function QuickViewModal({ product, children }: { product: Product, children: React.ReactElement }) {
  return (
    <Dialog>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-5xl h-[85vh] md:h-[600px] p-0 overflow-hidden bg-card/95 backdrop-blur-3xl border-border/40 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* Visual Showcase (Left) */}
          <div className="w-full md:w-1/2 h-64 md:h-full relative bg-muted/20 border-b md:border-b-0 md:border-r border-border/40 overflow-hidden group">
            <Image 
              src={product.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"} 
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-8 left-8">
              <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-[0.25em] border border-white/20">
                {product.category || 'Premium Asset'}
              </span>
            </div>
          </div>

          {/* Detailed Info (Right) */}
          <div className="w-full md:w-1/2 flex flex-col h-full bg-background/40 relative">
            
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 scrollbar-hide">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Resource
                </div>
                <DialogTitle className="text-3xl md:text-4xl font-black tracking-tighter leading-[1.1] text-foreground">
                  {product.title}
                </DialogTitle>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">Overview</h4>
                <p className="text-[14px] md:text-[15px] text-muted-foreground/90 leading-relaxed font-medium">
                  {product.description || "Experience top-tier digital craftsmanship. This asset is meticulously designed to meet the highest standards of modern professional workflows."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Released</span>
                  <p className="text-xs font-bold">April 2024</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Compatibility</span>
                  <p className="text-xs font-bold">Figma, React</p>
                </div>
              </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="p-8 border-t border-border/40 bg-card/50 backdrop-blur-md flex items-center justify-between gap-6 mt-auto">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Price</span>
                <div className="text-2xl font-black tracking-tighter text-foreground">
                  ${Number(product.price).toFixed(2)}
                </div>
              </div>

              <div className="flex gap-3 flex-1 justify-end">
                <AddToCartButton 
                  product={{
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    thumbnail_url: product.thumbnail_url
                  }} 
                  className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  showText
                />
                <Link href={`/product/${product.id}`}>
                  <Button variant="outline" className="h-12 w-12 rounded-2xl border-border/50 hover:bg-muted transition-all">
                    <ArrowUpRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
