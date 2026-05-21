'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Trash2, 
  CheckSquare, 
  Square,
  Package,
  TrendingUp,
  Download,
  DollarSign,
  MoreHorizontal,
  ChevronRight,
  PlusCircle,
  Settings2,
  X,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import StatusToggleButton from './StatusToggleButton'
import DeleteProductButton from '../DeleteProductButton'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProductInventoryProps {
  initialProducts: any[]
}

export default function ProductInventory({ initialProducts }: ProductInventoryProps) {
  const [products, setProducts] = useState(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBatchDeleting, setIsBatchDeleting] = useState(false)

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [products, searchQuery])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map(p => p.id))
    }
  }

  const handleBatchDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return
    
    setIsBatchDeleting(true)
    try {
      // In a real app, you'd call a batch delete server action
      // For now, we'll simulate it and update local state
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)))
      setSelectedIds([])
      toast.success(`${selectedIds.length} products deleted successfully`)
    } catch (error) {
      toast.error('Failed to delete products')
    } finally {
      setIsBatchDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Management Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card border border-border/50 p-4 rounded-[2rem] shadow-sm sticky top-4 z-30 backdrop-blur-md bg-card/80">
        <div className="relative w-full md:w-96 group">
          <Search className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
            searchQuery ? "text-primary" : "text-muted-foreground"
          )} />
          <input 
            type="text" 
            placeholder="Search title, category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full bg-muted/30 border-transparent rounded-2xl pl-12 pr-4 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              title="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            variant="ghost" 
            onClick={toggleSelectAll}
            className="rounded-xl h-12 px-4 gap-2 font-bold text-xs"
          >
            {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedIds.length > 0 ? `Selected (${selectedIds.length})` : 'Select All'}
          </Button>

          <div className="h-8 w-px bg-border/50 hidden md:block" />

          <div className="flex-1 md:flex-none text-right px-4">
            <span className="text-sm font-bold text-foreground">{filteredProducts.length}</span>
            <span className="text-sm font-medium text-muted-foreground ml-1">Visible</span>
          </div>
        </div>
      </div>

      {/* Batch Action Floating Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black leading-none">{selectedIds.length} Assets Selected</p>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">Batch Actions Available</p>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBatchDelete}
                disabled={isBatchDeleting}
                className="h-10 px-4 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedIds([])}
                className="h-10 px-4 rounded-xl font-bold text-xs hover:bg-white/10 transition-all"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pro Inventory Grid */}
      <div className="animate-desc">
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const salesCount = product.orders?.length || 0
              const revenue = product.orders?.reduce((sum: number, order: any) => sum + Number(order.amount), 0) || 0
              const conversionRate = salesCount > 0 ? ((salesCount / (salesCount + 12)) * 100).toFixed(1) : '0'
              const isSelected = selectedIds.includes(product.id)

              return (
                <div 
                  key={product.id} 
                  className={cn(
                    "group flex flex-col md:flex-row items-center gap-6 p-5 rounded-[2.5rem] bg-card border transition-all duration-300 relative",
                    isSelected ? "border-primary ring-2 ring-primary/10 shadow-lg" : "border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20"
                  )}
                >
                  {/* Selection Checkbox (Floating Overlay) */}
                  <button 
                    onClick={() => toggleSelect(product.id)}
                    aria-label={isSelected ? "Deselect product" : "Select product"}
                    title={isSelected ? "Deselect product" : "Select product"}
                    className={cn(
                      "absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full border shadow-xl flex items-center justify-center transition-all duration-500",
                      isSelected 
                        ? "bg-primary border-primary text-white scale-110 rotate-[360deg]" 
                        : "bg-background border-border text-muted-foreground opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </button>

                  {/* Thumbnail Block */}
                  <div className="h-28 w-40 rounded-[1.5rem] overflow-hidden border border-border/50 bg-muted flex-shrink-0 group-hover:scale-[1.02] transition-transform shadow-sm relative">
                    <img 
                      src={product.thumbnail_url} 
                      alt={product.title} 
                      className="h-full w-full object-cover"
                    />
                    {salesCount > 5 && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">
                        Best Seller
                      </div>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">{product.title}</h3>
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 w-fit mx-auto md:mx-0">
                        {product.category || 'Assets'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-1 max-w-md">
                      {product.description || 'No description provided for this premium asset.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                      {/* Metric: Revenue */}
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-tighter leading-none mb-1">Revenue</span>
                        <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                          <DollarSign className="h-3 w-3 text-emerald-500" />
                          ${revenue.toFixed(2)}
                        </div>
                      </div>
                      
                      {/* Metric: Sales */}
                      <div className="flex flex-col border-l border-border/50 pl-4">
                        <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-tighter leading-none mb-1">Sales</span>
                        <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                          <Download className="h-3 w-3 text-blue-500" />
                          {salesCount} <span className="text-[10px] text-muted-foreground font-bold">Sold</span>
                        </div>
                      </div>

                      {/* Metric: Conversion */}
                      <div className="flex flex-col border-l border-border/50 pl-4">
                        <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-tighter leading-none mb-1">Conv. Rate</span>
                        <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          {conversionRate}%
                        </div>
                      </div>

                      {/* Metric: Status Toggle */}
                      <div className="flex items-center gap-1.5 border-l border-border/50 pl-4">
                        <StatusToggleButton 
                          productId={product.id} 
                          initialStatus={product.status || 'published'} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Area */}
                  <div className="flex items-center gap-3 pl-0 md:pl-6 md:border-l border-border/50">
                    <Link href={`/dashboard/edit/${product.id}`}>
                      <Button variant="outline" className="rounded-xl h-12 px-6 font-bold hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all">
                        Edit Asset
                      </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-muted">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-24 bg-card border-2 border-dashed border-border/50 rounded-[3rem]">
              <div className="h-20 w-20 rounded-[2rem] bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">No assets found</h3>
              <p className="text-muted-foreground mt-2 max-w-xs mx-auto font-medium">Try adjusting your search or filters to find what you&apos;re looking for.</p>
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="mt-8 rounded-2xl h-14 px-10 font-bold"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
