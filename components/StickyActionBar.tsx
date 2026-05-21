'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import ProductActions from '@/app/product/[id]/ProductActions'

interface StickyActionBarProps {
  product: {
    id: string
    title: string
    price: number
    thumbnail_url: string
    category: string
  }
  isPurchased: boolean
  isLoggedIn: boolean
  rating: number
  reviewsCount: number
}

export default function StickyActionBar({ product, isPurchased, isLoggedIn, rating, reviewsCount }: StickyActionBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show the sticky bar when scrolled past 600px (roughly past the main purchase card)
      setIsVisible(window.scrollY > 600)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4"
        >
          <div className="flex items-center justify-between p-4 rounded-3xl bg-background/80 backdrop-blur-2xl border border-border/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
            
            {/* Left: Product Info */}
            <div className="hidden sm:flex items-center gap-4">
              <img 
                src={product.thumbnail_url} 
                alt={product.title} 
                className="h-14 w-20 object-cover rounded-xl shadow-sm"
              />
              <div className="space-y-1">
                <h3 className="font-bold text-base leading-none truncate max-w-[200px] md:max-w-[300px]">
                  {product.title}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-3 w-3 fill-yellow-500" />
                    <span className="text-[11px] font-bold">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground ">
                    {product.category || 'Asset'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions & Price */}
            <div className="flex items-center gap-6 w-full sm:w-auto">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-semibold text-muted-foreground leading-none mb-1">
                  Total
                </span>
                <span className="text-2xl font-semibold leading-none">
                  ${Number(product.price).toFixed(2)}
                </span>
              </div>
              
              <div className="w-full sm:w-[280px]">
                <ProductActions 
                  product={product} 
                  isPurchased={isPurchased} 
                  isLoggedIn={isLoggedIn} 
                />
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
