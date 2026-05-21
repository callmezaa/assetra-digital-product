'use client'

import { useState } from 'react'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart, CartItem } from '@/context/CartContext'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface AddToCartButtonProps {
  product: CartItem
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showText?: boolean
}

export default function AddToCartButton({ 
  product, 
  variant = 'secondary', 
  size = 'icon',
  className,
  showText = false
}: AddToCartButtonProps) {
  const { items, addItem } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [addedAnimation, setAddedAnimation] = useState(false)
  
  const isAdded = items.some(item => item.id === product.id)

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAdded || isLoading) return
    
    setIsLoading(true)
    // Simulate a small network delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 600))
    
    addItem(product)
    setIsLoading(false)
    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 2000)
  }

  return (
    <Button 
      variant={isAdded ? 'default' : variant}
      size={size}
      onClick={handleAdd}
      disabled={isAdded || isLoading}
      className={cn(
        "relative rounded-2xl font-black transition-all duration-500 overflow-hidden",
        isAdded 
          ? "bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-100 shadow-xl shadow-emerald-500/20 border-emerald-400/20" 
          : "hover:shadow-lg active:scale-95",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        ) : isAdded ? (
          <motion.div
            key="added"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4 stroke-[3px]" />
            {showText && <span className="text-[10px] uppercase tracking-widest">Added</span>}
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {showText && <span className="text-[10px] uppercase tracking-widest">Add to Cart</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}
