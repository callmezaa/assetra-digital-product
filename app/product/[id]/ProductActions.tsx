'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Download, Loader2 } from 'lucide-react'
import { getDownloadUrl } from './actions'
import { createMidtransTransaction } from '@/app/cart/actions'
import { toast } from 'sonner'

import AddToCartButton from '@/components/AddToCartButton'

interface ProductActionsProps {
  product: {
    id: string
    title: string
    price: number
    thumbnail_url: string
  }
  isPurchased: boolean
  isLoggedIn: boolean
}

export default function ProductActions({ product, isPurchased, isLoggedIn }: ProductActionsProps) {
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    try {
      const result = await createMidtransTransaction([product.id])
      if (result.success && result.redirect_url) {
        window.location.href = result.redirect_url
      } else {
        throw new Error(result.error || 'Failed to initialize payment gateway')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    setLoading(true)
    try {
      const url = await getDownloadUrl(product.id)
      window.open(url, '_blank')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (isPurchased) {
    return (
      <Button 
        onClick={handleDownload} 
        disabled={loading}
        size="lg" 
        className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 bg-green-600 hover:bg-green-700"
      >
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
        Download Asset
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <AddToCartButton 
        product={product} 
        className="h-14 w-16" 
      />
      <Button 
        onClick={handlePurchase} 
        disabled={loading}
        size="lg" 
        className="flex-1 h-14 text-lg rounded-xl shadow-lg shadow-primary/20"
      >
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
        {isLoggedIn ? 'Buy Now' : 'Login to Buy'}
      </Button>
    </div>
  )
}
