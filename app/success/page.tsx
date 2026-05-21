'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Download, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HeroAnimations from '@/components/HeroAnimations'
import { useCart } from '@/context/CartContext'
import { useSearchParams } from 'next/navigation'
import { checkPaymentStatus } from '@/app/cart/actions'
import { toast } from 'sonner'

export function SuccessPageContent() {
  const { clearCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
    clearCart()

    // Localhost Fallback: Since webhooks cannot reach localhost,
    // we manually verify the transaction with Midtrans using the order_id in the URL
    const orderId = searchParams.get('order_id')
    if (orderId) {
      checkPaymentStatus(orderId).then((res) => {
        if (res.success) {
          toast.success('Fallback: Asset verified & added to Library!')
        } else {
          toast.error(`Fallback failed: ${res.reason || res.status || res.error}`)
          console.error('Fallback error:', res)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />

      <HeroAnimations>
        <div className="relative z-10 w-full max-w-md mx-auto text-center space-y-8 animate-title opacity-0">
          
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <div className="h-24 w-24 bg-card border border-border/50 shadow-2xl rounded-3xl flex items-center justify-center relative z-10">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-semibold rounded-full uppercase tracking-wider">
              Payment Successful
            </span>
            <h1 className="text-4xl font-semibold tracking-tight">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground font-medium">
              Thank you for your purchase. We've sent a receipt to your email. Your digital assets are now ready to download.
            </p>
          </div>

          <div className="bg-card border border-border/20 p-6 rounded-[2.5rem] shadow-xl space-y-6">
            <div className="flex items-center gap-4 text-left p-4 rounded-2xl bg-muted/30">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">Assets Unlocked</p>
                <p className="text-xs text-muted-foreground">Lifetime access granted</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/library" className="block w-full">
                <Button className="w-full h-14 rounded-2xl text-base font-semibold shadow-xl shadow-primary/20 gap-2">
                  <Download className="h-5 w-5" />
                  Go to My Library
                </Button>
              </Link>
              <Link href="/marketplace" className="block w-full">
                <Button variant="ghost" className="w-full h-14 rounded-2xl text-sm font-semibold hover:bg-muted/50">
                  Continue Browsing <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          
        </div>
      </HeroAnimations>
    </div>
  )
}

import { Suspense } from 'react'

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SuccessPageContent />
    </Suspense>
  )
}
