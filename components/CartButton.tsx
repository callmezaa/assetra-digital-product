'use client'

import { useCart } from '@/context/CartContext'
import { ShoppingCart } from 'lucide-react'

export default function CartButton() {
  const { items, setIsCartOpen } = useCart()
  const itemCount = items.length

  return (
    <div className="relative">
      <button 
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/10 hover:text-primary transition-all group outline-none"
        onClick={() => setIsCartOpen(true)}
        title="Open Cart"
      >
        <ShoppingCart className="h-5 w-5" />
      </button>
      
      {itemCount > 0 && (
        <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border border-background shadow-sm animate-in zoom-in">
          {itemCount}
        </div>
      )}
    </div>
  )
}
