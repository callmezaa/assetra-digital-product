'use client'

import { useState, useMemo } from 'react'
import { Search, Package, Clock, ExternalLink, LayoutGrid, Zap, HardDrive, Heart, X, ShieldCheck, Cloud, Loader2, Tag, Edit3, Save, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '@/components/ScrollReveal'
import ProductActions from '@/app/product/[id]/ProductActions'
import ProductCard from '@/components/ProductCard'
import { toast } from 'sonner'
import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

interface LibraryClientProps {
  initialOrders: any[]
  initialWishlist: any[]
  currentTab: string
  stats: {
    totalAssets: number
    favCategory: string
    lastPurchase: string
    estimatedStorage: string
  }
}

export default function LibraryClient({ 
  initialOrders, 
  initialWishlist, 
  currentTab,
  stats 
}: LibraryClientProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [lightboxProduct, setLightboxProduct] = useState<any | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('assetra-library-notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  const handleSaveNote = (id: string, text: string) => {
    const newNotes = { ...notes, [id]: text }
    setNotes(newNotes)
    localStorage.setItem('assetra-library-notes', JSON.stringify(newNotes))
    setEditingId(null)
    toast.success('Project tag saved!', {
      description: `Asset tagged as "${text}"`,
    })
  }

  const handleCloudSync = (id: string, platform: string) => {
    setSyncingId(`${id}-${platform}`)
    setTimeout(() => {
      setSyncingId(null)
      toast.success(`Successfully synced to ${platform}!`, {
        description: "Your asset is now available in your cloud storage.",
      })
    }, 2500)
  }

  // Extract unique categories from owned assets
  const ownedCategories = useMemo(() => {
    const cats = new Set<string>(['All'])
    initialOrders.forEach(o => {
      if (o.products?.category) cats.add(o.products.category)
    })
    return Array.from(cats)
  }, [initialOrders])

  // Filter Logic for Purchased Assets
  const filteredOrders = useMemo(() => {
    return initialOrders.filter(order => {
      const matchesSearch = order.products?.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = activeCategory === 'All' || order.products?.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory, initialOrders])

  // Filter Logic for Wishlist
  const filteredWishlist = useMemo(() => {
    return initialWishlist.filter(item => {
      const matchesSearch = item.products?.title.toLowerCase().includes(search.toLowerCase())
      return matchesSearch
    })
  }, [search, initialWishlist])

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
            <LayoutGrid className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Library & Collection</h1>
            <p className="text-muted-foreground text-sm font-medium">Manage your assets and saved inspirations.</p>
          </div>
        </div>
        
        <div className="flex p-1.5 bg-card border border-border/20 rounded-2xl shadow-sm">
          <Link href="/library?tab=purchased">
            <Button 
              variant={currentTab === 'purchased' ? 'default' : 'ghost'} 
              className="rounded-xl h-10 px-4 sm:px-6 font-bold text-xs gap-2"
            >
              <Package className="h-3.5 w-3.5" />
              My Assets
            </Button>
          </Link>
          <Link href="/library?tab=saved">
            <Button 
              variant={currentTab === 'saved' ? 'default' : 'ghost'} 
              className="rounded-xl h-10 px-4 sm:px-6 font-bold text-xs gap-2"
            >
              <Heart className={currentTab === 'saved' ? 'fill-current h-3.5 w-3.5' : 'h-3.5 w-3.5'} />
              Saved Items
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: stats.totalAssets, icon: Package, color: 'text-blue-500' },
          { label: 'Top Category', value: stats.favCategory, icon: Zap, color: 'text-primary' },
          { label: 'Last Acquired', value: stats.lastPurchase, icon: Clock, color: 'text-orange-400' },
          { label: 'Cloud Storage', value: `${stats.estimatedStorage} GB`, icon: HardDrive, color: 'text-emerald-500' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-[1.5rem] bg-card border border-border/20 shadow-sm">
            <div className={cn("h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center", stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-xs font-bold text-muted-foreground ">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Local Filter Bar */}
      <div className="space-y-6">
        <div className="relative max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder={`Search in ${currentTab === 'purchased' ? 'assets' : 'wishlist'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 pl-12 pr-4 rounded-xl bg-card border-border/20 shadow-sm focus:ring-primary/20 transition-all font-medium"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground hover:text-white transition-all" aria-label="Clear search" title="Clear search">
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>

        {currentTab === 'purchased' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {ownedCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-semibold border transition-all",
                  activeCategory === cat 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "bg-card border-border/20 text-muted-foreground hover:border-primary/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <ScrollReveal key={`${currentTab}-${search}-${activeCategory}`}>
        {currentTab === 'purchased' ? (
          filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {filteredOrders.map((order: any) => (
                <div key={order.id} className="reveal-item opacity-0 group bg-card border border-border/20 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img 
                      src={order.products.thumbnail_url} 
                      alt={order.products.title} 
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in" 
                      onClick={() => {
                        setLightboxProduct(order.products)
                        setActiveImageIndex(0)
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                      <Maximize2 className="h-10 w-10 text-white/50" />
                    </div>
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="px-3 py-1 rounded-xl bg-black/40 backdrop-blur-md text-xs font-semibold text-white border border-white/10">
                        {order.products.category || 'Assets'}
                      </span>
                      {/* Project Tag Label */}
                      {notes[order.id] && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/90 backdrop-blur-md text-xs font-semibold text-white shadow-lg">
                          <Tag className="h-3 w-3 fill-current" />
                          {notes[order.id]}
                        </div>
                      )}
                      {/* Simulated Update Badge */}
                      {order.id.length % 3 === 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary text-xs font-semibold text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] animate-pulse">
                          <Zap className="h-3 w-3 fill-current" />
                          Update Available
                        </div>
                      )}
                    </div>
                    <Link href={`/product/${order.products.id}`} className="absolute bottom-4 right-4 h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white/40">
                      <ExternalLink className="h-5 w-5" />
                    </Link>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-xl leading-tight truncate">{order.products.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold ">
                          <Clock className="h-3.5 w-3.5" />
                          <span suppressHydrationWarning>Purchased {new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-md bg-muted text-[8px] font-semibold tracking-tighter text-muted-foreground border border-border/20">
                        Standard License
                      </div>
                    </div>

                    {/* Project Tag / Note Editor */}
                    <div className="bg-muted/30 rounded-xl p-3 border border-border/20 group/note relative min-h-[48px] flex items-center">
                      {editingId === order.id ? (
                        <div className="flex w-full gap-2">
                          <Input 
                            autoFocus
                            defaultValue={notes[order.id] || ''}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNote(order.id, e.currentTarget.value)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            className="h-8 text-xs font-bold bg-background border-primary/20"
                            placeholder="Type project name..."
                          />
                          <Button 
                            size="sm" 
                            className="h-8 w-8 rounded-lg"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement
                              handleSaveNote(order.id, input.value)
                            }}
                          >
                            <Save className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-[11px] font-bold text-muted-foreground truncate">
                              {notes[order.id] || 'Add project tag...'}
                            </span>
                          </div>
                          <button 
                            onClick={() => setEditingId(order.id)}
                            className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground opacity-0 group-hover/note:opacity-100 transition-all"
                            aria-label="Edit project tag"
                            title="Edit project tag"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                      <ProductActions 
                        product={order.products} 
                        isPurchased={true} 
                        isLoggedIn={true} 
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-10 rounded-xl border-border/20 text-xs font-semibold gap-2 hover:bg-primary/5 transition-all"
                        onClick={() => {
                          navigator.clipboard.writeText(`ASSETRA-${order.id.substring(0, 8).toUpperCase()}`)
                          alert('License Key copied to clipboard!')
                        }}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Copy License Key
                      </Button>
                      
                      {/* Cloud Sync Section */}
                      <div className="pt-2 border-t border-border/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cloud className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-semibold text-muted-foreground">Quick Sync</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {['GoogleDrive', 'Dropbox'].map((platform) => {
                            const isSyncing = syncingId === `${order.id}-${platform}`
                            return (
                              <button
                                key={platform}
                                onClick={() => handleCloudSync(order.id, platform)}
                                disabled={!!syncingId}
                                className={cn(
                                  "h-8 w-8 rounded-lg border border-border/20 flex items-center justify-center transition-all hover:bg-muted group relative",
                                  isSyncing && "bg-primary border-primary"
                                )}
                                title={`Sync to ${platform}`}
                              >
                                {isSyncing ? (
                                  <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                                ) : (
                                  <img 
                                    src={platform === 'GoogleDrive' 
                                      ? 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg' 
                                      : 'https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg'
                                    } 
                                    className="h-3.5 w-3.5 grayscale group-hover:grayscale-0 transition-all"
                                    alt={platform}
                                  />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No assets found" desc="Try adjusting your search or filters." icon={Package} />
          )
        ) : (
          filteredWishlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredWishlist.map((item: any) => (
                <div key={item.id} className="reveal-item opacity-0">
                  <ProductCard product={item.products} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No saved items" desc="Start saving items you love to find them here later." icon={Heart} />
          )
        )}
      </ScrollReveal>

      {/* Quick Gallery Lightbox */}
      <Dialog open={!!lightboxProduct} onOpenChange={(open) => !open && setLightboxProduct(null)}>
        <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden bg-black/90 border-none rounded-[2rem] shadow-xl flex flex-col items-center justify-center">
          {lightboxProduct && (
            <div className="relative h-full w-full flex items-center justify-center p-4 md:p-12">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  src={lightboxProduct.thumbnail_url} // In real app, this would be an array of screenshots
                  className="max-h-full max-w-full object-contain shadow-xl rounded-xl"
                  alt={lightboxProduct.title}
                />
              </AnimatePresence>

              {/* Navigation Arrows (Simulated for multiple images) */}
              <div className="absolute inset-x-4 md:inset-x-10 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-14 w-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white pointer-events-auto hover:bg-white/20 transition-all"
                  onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : 0))}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-14 w-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white pointer-events-auto hover:bg-white/20 transition-all"
                  onClick={() => setActiveImageIndex(prev => prev + 1)}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </div>

              {/* Top Info Bar */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white">
                <p className="text-sm font-semibold tracking-tight">{lightboxProduct.title}</p>
                <div className="h-4 w-[1px] bg-white/20" />
                <span className="text-xs font-bold text-white/60 ">Preview Mode</span>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-6 flex gap-3">
                <Button 
                  className="rounded-full px-8 h-12 bg-primary text-white font-bold"
                  onClick={() => setLightboxProduct(null)}
                >
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({ title, desc, icon: Icon }: any) {
  return (
    <div className="reveal-item opacity-0 text-center py-32 bg-card border border-dashed border-border/20 rounded-[3rem] flex flex-col items-center gap-8 shadow-sm">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative h-28 w-28 rounded-[2.5rem] bg-muted/50 flex items-center justify-center border-2 border-dashed border-border/20">
          <Icon className="h-14 w-14 text-muted-foreground/20" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed">{desc}</p>
      </div>
      <Link href="/marketplace">
        <Button className="rounded-2xl h-16 px-10 text-lg font-bold shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
          Explore Marketplace
        </Button>
      </Link>
    </div>
  )
}
