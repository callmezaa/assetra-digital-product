'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toggleProductStatus } from './actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface StatusToggleButtonProps {
  productId: string
  initialStatus: 'published' | 'draft'
}

export default function StatusToggleButton({ productId, initialStatus }: StatusToggleButtonProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      const result = await toggleProductStatus(productId, status)
      if (result.success) {
        setStatus(result.newStatus as 'published' | 'draft')
        toast.success(`Product is now ${result.newStatus === 'published' ? 'Live' : 'in Draft'}`)
      }
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsLoading(false)
    }
  }

  const isLive = status === 'published'

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "relative flex items-center gap-2 px-4 h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all duration-300 border overflow-hidden group",
        isLive 
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" 
          : "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20"
      )}
    >
      {/* Background Pulse for Live Status */}
      {isLive && !isLoading && (
        <span className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
      )}

      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isLive ? (
        <Eye className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      
      <span className="relative z-10">
        {isLoading ? 'Updating...' : isLive ? 'Live' : 'Draft'}
      </span>

      {/* Slide Indicator */}
      <motion.div 
        className={cn(
          "absolute right-1.5 h-1.5 w-1.5 rounded-full",
          isLive ? "bg-emerald-500" : "bg-orange-500"
        )}
        animate={{
          scale: isLoading ? 0.8 : [1, 1.2, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 2
        }}
      />
    </button>
  )
}
