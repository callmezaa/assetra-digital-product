'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingBag, 
  Heart, 
  ExternalLink, 
  Package, 
  Calendar, 
  DollarSign,
  User as UserIcon,
  ShieldCheck,
  TrendingUp,
  History
} from 'lucide-react'
import { getChatContext } from './actions'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatContextSidebarProps {
  roomId: string
  otherUser: any
}

export default function ChatContextSidebar({ roomId, otherUser }: ChatContextSidebarProps) {
  const [context, setContext] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadContext() {
      setLoading(true)
      const data = await getChatContext(roomId, otherUser.id)
      setContext(data)
      setLoading(false)
    }
    loadContext()
  }, [roomId, otherUser.id])

  if (loading) {
    return (
      <div className="w-80 h-full bg-muted/5 border-l border-white/5 p-6 animate-pulse space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-3xl bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-24 w-full bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 h-full bg-background/20 backdrop-blur-3xl border-l border-white/5 flex flex-col overflow-y-auto scrollbar-hide">
      {/* Profile Summary */}
      <div className="p-8 flex flex-col items-center text-center border-b border-white/5 bg-gradient-to-b from-primary/[0.03] to-transparent">
        <div className="relative mb-4 group">
          <div className="h-24 w-24 rounded-[2rem] bg-muted border-2 border-white/10 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            <img src={otherUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser.username}`} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-2xl bg-background border border-white/5 flex items-center justify-center shadow-xl">
             <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-black tracking-tight">{otherUser.full_name || 'User'}</h3>
        <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">@{otherUser.username}</p>
        
        <div className="flex items-center gap-2 mt-6">
           <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center min-w-[80px]">
              <span className="text-sm font-black">12</span>
              <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">Sales</span>
           </div>
           <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center min-w-[80px]">
              <span className="text-sm font-black">4.9</span>
              <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">Rating</span>
           </div>
        </div>
      </div>

      <div className="p-6 space-y-10">
        {/* Product of Interest */}
        {context?.productInterest && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Discussed Asset
            </h4>
            <div className="group p-4 rounded-3xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all duration-300">
               <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-xl overflow-hidden border border-white/10 bg-muted">
                    <img src={context.productInterest.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{context.productInterest.title}</p>
                    <p className="text-[11px] font-black text-primary mt-0.5">${context.productInterest.price}</p>
                  </div>
               </div>
               <a 
                href={`/product/${context.productInterest.id}`} 
                target="_blank"
                className="mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold hover:bg-white/10 transition-all"
               >
                 View Product <ExternalLink className="h-3 w-3" />
               </a>
            </div>
          </div>
        )}

        {/* Purchase History */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
            <History className="h-3.5 w-3.5" />
            Transaction History
          </h4>
          {context?.orders && context.orders.length > 0 ? (
            <div className="space-y-3">
              {context.orders.map((order: any) => (
                <div key={order.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-all">
                   <div className="h-10 w-10 rounded-xl bg-muted/50 border border-white/5 flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground/30" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{order.products?.title || 'Unknown Product'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-green-500/80">${order.amount}</span>
                        <span className="text-[10px] text-muted-foreground/30">•</span>
                        <span className="text-[10px] text-muted-foreground/40 font-medium">
                          {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-[2rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-30">
               <Package className="h-8 w-8 mb-3" />
               <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">No previous<br/>transactions</p>
            </div>
          )}
        </div>

        {/* Wishlist Activity */}
        {context?.wishlist && context.wishlist.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 text-red-500/50" />
              Wishlist Items
            </h4>
            <div className="grid grid-cols-2 gap-3">
               {context.wishlist.map((item: any) => (
                 <div key={item.id} className="group aspect-square rounded-2xl overflow-hidden border border-white/5 relative">
                    <img src={item.products?.thumbnail_url} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2 right-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                       <p className="text-[9px] font-bold text-white truncate">{item.products?.title}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
         <div className="p-4 rounded-2xl bg-primary/10 border border-primary/10 space-y-2">
            <div className="flex items-center gap-2 text-primary">
               <ShieldCheck className="h-4 w-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Safety Tips</span>
            </div>
            <p className="text-[10px] text-muted-foreground/80 font-medium leading-relaxed">
              Never share your credentials. Use Assetra for all payments to stay protected by our Buyer Guarantee.
            </p>
         </div>
      </div>
    </div>
  )
}
