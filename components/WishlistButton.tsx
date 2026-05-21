'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleWishlist, isProductSaved } from '@/app/marketplace/wishlist-actions'
import { cn } from '@/lib/utils'
import gsap from 'gsap'

interface WishlistButtonProps {
  productId: string
  initialSaved?: boolean
  className?: string
}

export default function WishlistButton({ 
  productId, 
  initialSaved = false,
  className 
}: WishlistButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const heartRef = useRef(null)

  useEffect(() => {
    // Sync status on mount
    const checkStatus = async () => {
      const saved = await isProductSaved(productId)
      setIsSaved(saved)
    }
    checkStatus()
  }, [productId])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (loading) return
    setLoading(true)

    try {
      const result = await toggleWishlist(productId)
      setIsSaved(result.isSaved)

      // GSAP "Pop" Animation
      if (result.isSaved) {
        gsap.fromTo(heartRef.current, 
          { scale: 1 }, 
          { 
            scale: 1.4, 
            duration: 0.2, 
            ease: "back.out(2)", 
            onComplete: () => gsap.to(heartRef.current, { scale: 1, duration: 0.2 }) 
          }
        )
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      alert('You must be logged in to save items')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn(
        "rounded-full h-10 w-10 transition-all duration-300 backdrop-blur-md border border-white/10",
        isSaved 
          ? "bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30" 
          : "bg-black/20 text-white hover:bg-black/40",
        className
      )}
    >
      <div ref={heartRef}>
        <Heart 
          className={cn(
            "h-5 w-5 transition-colors",
            isSaved ? "fill-current" : "fill-none"
          )} 
        />
      </div>
    </Button>
  )
}
