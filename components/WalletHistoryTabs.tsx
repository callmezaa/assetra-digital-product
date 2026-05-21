'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, ShoppingBag, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import Image from 'next/image'

interface Payout {
  id: string
  created_at: string
  payment_method: string
  account_details: string
  amount: number
  status: string
}

interface Sale {
  id: string
  amount: number
  created_at: string
  products: {
    title: string
    image_url: string | null
  }
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface WalletHistoryTabsProps {
  payouts: Payout[]
  sales: any[]
  statusIcons: Record<string, React.ReactNode>
  statusColors: Record<string, string>
}

export default function WalletHistoryTabs({ payouts, sales, statusIcons, statusColors }: WalletHistoryTabsProps) {
  const [activeTab, setActiveTab] = useState<'payouts' | 'sales'>('sales')

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-2xl w-fit border border-border/50">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'sales' 
              ? 'bg-card text-foreground shadow-lg border border-border/50' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingBag className={`h-4 w-4 ${activeTab === 'sales' ? 'text-primary' : ''}`} />
          Sales Transactions
          {sales.length > 0 && (
            <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {sales.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'payouts' 
              ? 'bg-card text-foreground shadow-lg border border-border/50' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className={`h-4 w-4 ${activeTab === 'payouts' ? 'text-blue-500' : ''}`} />
          Withdrawal History
        </button>
      </div>

      {/* Tab Content */}
      <div className="rounded-[2.5rem] bg-card border border-border/50 shadow-sm overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'sales' ? (
            <motion.div
              key="sales"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="overflow-x-auto"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Buyer</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {sales.length > 0 ? sales.map((sale: Sale) => (
                    <tr key={sale.id} className="group hover:bg-emerald-500/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden border border-border/50 relative flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                            {sale.products.image_url ? (
                              <Image 
                                src={sale.products.image_url} 
                                alt={sale.products.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ShoppingBag className="h-5 w-5 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{sale.products.title}</p>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-widest">Digital Asset</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 relative overflow-hidden">
                            {sale.profiles?.avatar_url ? (
                              <Image 
                                src={sale.profiles.avatar_url} 
                                alt={sale.profiles.full_name || 'Buyer'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{sale.profiles?.full_name || 'Anonymous'}</p>
                            <p className="text-[10px] text-muted-foreground">Verified Purchase</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-lg font-black tracking-tighter text-emerald-600 dark:text-emerald-400">
                            +${Number(sale.amount).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right sm:text-left">
                        <p className="text-sm font-bold">{new Date(sale.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{new Date(sale.created_at).toLocaleTimeString()}</p>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground/20" />
                          </div>
                          <div>
                            <p className="font-bold text-muted-foreground">No sales transactions yet</p>
                            <p className="text-xs text-muted-foreground/60 max-w-[200px] mx-auto mt-1">Start selling your amazing digital products to see them here!</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div
              key="payouts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="overflow-x-auto"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Method</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {payouts.length > 0 ? payouts.map((payout) => (
                    <tr key={payout.id} className="group hover:bg-blue-500/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold">{new Date(payout.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{new Date(payout.created_at).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold">{payout.payment_method}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[150px]">{payout.account_details}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-lg font-black tracking-tighter">-${Number(payout.amount).toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[payout.status as keyof typeof statusColors]}`}>
                          {statusIcons[payout.status as keyof typeof statusIcons]}
                          {payout.status}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                            <History className="h-10 w-10 text-muted-foreground/20" />
                          </div>
                          <div>
                            <p className="font-bold text-muted-foreground">No withdrawal history yet</p>
                            <p className="text-xs text-muted-foreground/60 max-w-[200px] mx-auto mt-1">Your payout requests will appear here once you request them.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
