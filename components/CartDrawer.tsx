'use client'

import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { X, Trash2, ShoppingCart, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { toast } from 'sonner'
import { processCheckout, createMidtransTransaction } from '@/app/cart/actions'
import { cn } from '@/lib/utils'

export default function CartDrawer() {
  const { items, addItem, removeItem, isCartOpen, setIsCartOpen, totalPrice, clearCart } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
      if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, display: 'block' })
      if (drawerRef.current) {
        gsap.fromTo(drawerRef.current, 
          { x: '100%' }, 
          { x: '0%', duration: 0.5, ease: 'power3.out' }
        )
      }
    } else {
      document.body.style.overflow = 'auto'
      if (drawerRef.current) {
        gsap.to(drawerRef.current, { 
          x: '100%', 
          duration: 0.4, 
          ease: 'power3.in',
          onComplete: () => {
            if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, display: 'none' })
          }
        })
      }
    }
  }, [isCartOpen])

  const handleCheckout = async () => {
    if (items.length === 0) return
    setIsProcessing(true)

    try {
      // Initialize Midtrans Payment
      const productIds = items.map(item => item.id)
      const result = await createMidtransTransaction(productIds)

      if (result.success && result.redirect_url) {
        setIsCartOpen(false)
        window.location.href = result.redirect_url
      } else {
        throw new Error(result.error || 'Failed to open payment gateway')
      }
    } catch (error: any) {
      toast.error(error.message || 'Checkout failed. Please ensure you are logged in.')
      if (error.message.includes('logged in')) {
        setIsCartOpen(false)
        router.push('/login')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Gamification & Fees Logic
  const subtotal = totalPrice
  const MILESTONE_TARGET = 30.00
  const isMilestoneReached = subtotal >= MILESTONE_TARGET
  const amountNeeded = Math.max(0, MILESTONE_TARGET - subtotal)
  const progressPercentage = Math.min(100, (subtotal / MILESTONE_TARGET) * 100)
  
  const platformFee = items.length > 0 && !isMilestoneReached ? 2.50 : 0
  const finalTotal = subtotal + platformFee

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] hidden opacity-0"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-card border-l border-border/50 shadow-2xl z-[101] translate-x-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Your Cart</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{items.length} Items</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsCartOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Gamification Progress Bar */}
        {items.length > 0 && (
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest mb-3">
              <span className={cn("transition-colors duration-500", isMilestoneReached ? "text-green-500" : "text-muted-foreground")}>
                {isMilestoneReached 
                  ? "🎉 Platform Fee Waived!" 
                  : `Add $${amountNeeded.toFixed(2)} more to waive fee`}
              </span>
              <span className="text-foreground">{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full bg-muted/50 overflow-hidden rounded-full border border-border/50">
              <div 
                className={cn(
                  "h-full transition-all duration-700 ease-out",
                  isMilestoneReached 
                    ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                    : "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                )}
                style={{ '--width': `${progressPercentage}%`, width: 'var(--width)' } as React.CSSProperties}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-8 opacity-70">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-bold text-lg text-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground">Discover premium assets to start your project.</p>
                </div>
              </div>
              
              {/* Trending Assets Discovery */}
              <div className="mt-4 flex-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <span className="h-[1px] flex-1 bg-border/50" />
                  Trending Assets
                  <span className="h-[1px] flex-1 bg-border/50" />
                </h4>
                
                <div className="space-y-4">
                  {[
                    {
                      id: 'trending-1-mock',
                      title: 'SaaS Dashboard UI Kit',
                      price: 29.00,
                      thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80',
                      category: 'UI Kits'
                    },
                    {
                      id: 'trending-2-mock',
                      title: 'Modern Abstract 3D Shapes',
                      price: 15.50,
                      thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80',
                      category: '3D Assets'
                    }
                  ].map(trending => (
                    <div key={trending.id} className="flex gap-4 p-3 rounded-2xl border border-border/50 hover:border-primary/30 bg-muted/10 transition-all group">
                      <div className="h-16 w-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <img src={trending.thumbnail_url} alt={trending.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm truncate">{trending.title}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">{trending.category}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-black text-sm">${trending.price.toFixed(2)}</span>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-7 text-[10px] font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => addItem(trending)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-muted/30 border border-border/50 group">
                <div className="h-20 w-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
                  <h3 className="font-bold text-sm truncate pr-4">{item.title}</h3>
                  <div className="flex items-end justify-between">
                    <span className="font-black text-lg">${Number(item.price).toFixed(2)}</span>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upsell Section */}
        {items.length > 0 && (
          <div className="px-6 pb-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <span className="h-[1px] flex-1 bg-border/50" />
              Frequently Bought Together
              <span className="h-[1px] flex-1 bg-border/50" />
            </h4>
            <div className="space-y-3">
              {[
                {
                  id: 'upsell-1-mock',
                  title: 'Premium Vector Icon Pack',
                  price: 4.99,
                  thumbnail_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80',
                  category: 'Icons'
                }
              ].filter(u => !items.some(i => i.id === u.id)).map(upsell => (
                <div key={upsell.id} className="flex gap-3 p-3 rounded-2xl bg-card border border-border/50 shadow-sm items-center">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={upsell.thumbnail_url} alt={upsell.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs truncate">{upsell.title}</h3>
                    <span className="font-black text-sm text-primary">${upsell.price.toFixed(2)}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 rounded-lg font-bold text-xs border-primary/20 hover:bg-primary/10 hover:text-primary"
                    onClick={() => addItem(upsell)}
                  >
                    + Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border/50 bg-muted/10 space-y-6">
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Platform Fee</span>
                <div className="flex items-center gap-2">
                  {isMilestoneReached && (
                    <span className="text-muted-foreground line-through decoration-destructive/50 text-xs">$2.50</span>
                  )}
                  <span className={cn(isMilestoneReached ? "text-green-500 font-bold" : "")}>
                    ${platformFee.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-border/50 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-3xl tracking-tighter">${finalTotal.toFixed(2)}</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase">USD</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-2"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : (
                <>Checkout <ArrowRight className="h-5 w-5" /></>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Secure transaction
            </div>
          </div>
        )}
      </div>
    </>
  )
}
