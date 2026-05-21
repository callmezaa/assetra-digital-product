'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Search, SlidersHorizontal, ArrowUpDown, X, Clock, 
  TrendingDown, TrendingUp, LayoutGrid, List, ArrowUpRight,
  Component, Smile, Layout, Wrench, MoreHorizontal, Sparkles,
  Users, Star, ShieldCheck, Package, Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import ProductSkeleton from './ProductSkeleton'
import ProductCard from './ProductCard'
import ProductListItem from './ProductListItem'
import ScrollReveal from './ScrollReveal'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from '@/components/ui/slider'

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  thumbnail_url: string
  file_url: string
  user_id: string
  status: 'published' | 'draft'
  created_at: string
  profiles?: {
    id: string
    full_name: string
    avatar_url: string
    username: string
  }
}

export default function MarketplaceClient({ 
  initialProducts, 
  initialTotalCount,
  followingIds = [],
  isLoggedIn = false
}: { 
  initialProducts: Product[],
  initialTotalCount: number,
  followingIds?: string[],
  isLoggedIn?: boolean
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [feedMode, setFeedMode] = useState<'all' | 'following'>('all')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)

  // Pagination & Server State
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(initialProducts)
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialProducts.length < initialTotalCount)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  
  // Flag to avoid fetching on initial mount since we already have SSR data
  const [isInitialMount, setIsInitialMount] = useState(true)

  useEffect(() => {
    // Simulate initial loading for the skeleton transition if needed, 
    // but since we have SSR data, we can just turn it off quickly.
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsInitialMount(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const categories = [
    { name: 'All', icon: LayoutGrid },
    { name: 'UI Kits', icon: Component },
    { name: 'Icons', icon: Smile },
    { name: 'Templates', icon: Layout },
    { name: 'Tools', icon: Wrench },
    { name: 'Other', icon: MoreHorizontal },
  ]

  // Smart Search Suggestions Logic
  const suggestions = useMemo(() => {
    if (search.length < 2) return []
    return initialProducts
      .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5) // Show top 5 suggestions
  }, [search, initialProducts])

  // Live Filtering Logic (Server-Side)
  useEffect(() => {
    if (isInitialMount) return

    const fetchFilters = async () => {
      setIsFiltering(true)
      
      const queryParams = new URLSearchParams({
        search,
        category,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        sortBy,
        feedMode,
        followingIds: followingIds.join(','),
        page: '1',
        limit: '12'
      })

      try {
        const response = await fetch(`/api/marketplace?${queryParams.toString()}`)
        const json = await response.json()
        
        if (json.success) {
          setDisplayedProducts(json.data as Product[])
          setTotalCount(json.count)
          setPage(1)
          setHasMore(json.data.length < json.count)
        } else {
          console.error("Filter API error:", json.error)
        }
      } catch (error) {
        console.error("Filter fetch error:", error)
      } finally {
        setIsFiltering(false)
      }
    }

    // Debounce the search input
    const timeoutId = setTimeout(() => {
      fetchFilters()
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [search, category, sortBy, priceRange[0], priceRange[1], feedMode, followingIds?.join(','), isInitialMount])

  const handleLoadMore = async () => {
    if (!hasMore || isFetchingMore) return
    setIsFetchingMore(true)
    
    const nextPage = page + 1
    const queryParams = new URLSearchParams({
      search,
      category,
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
      sortBy,
      feedMode,
      followingIds: followingIds.join(','),
      page: nextPage.toString(),
      limit: '12'
    })

    try {
      const response = await fetch(`/api/marketplace?${queryParams.toString()}`)
      const json = await response.json()
      
      if (json.success) {
        setDisplayedProducts(prev => [...prev, ...(json.data as Product[])])
        setTotalCount(json.count)
        setPage(nextPage)
        setHasMore(displayedProducts.length + json.data.length < json.count)
      } else {
        console.error("Load more API error:", json.error)
      }
    } catch (error) {
      console.error("Load more fetch error:", error)
    } finally {
      setIsFetchingMore(false)
    }
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Marketplace Mini-Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl sm:rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/10 shadow-xl shadow-primary/5"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
        
        <div className="relative p-6 sm:p-10 md:p-16 flex flex-col md:flex-row items-center gap-6 sm:gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-[0.3em]">
              <Sparkles className="h-4 w-4" />
              Featured Collection
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tighter leading-none text-foreground">
              Level Up Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Digital Craft.</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-lg font-medium max-w-lg leading-relaxed">
              Explore our curated selection of high-end UI kits, templates, and digital assets designed for world-class professionals.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-10 rounded-2xl bg-primary text-primary-foreground font-semibold text-xs shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                Explore Collection
              </Button>
              <Button size="lg" variant="outline" className="h-12 sm:h-14 px-6 sm:px-10 rounded-2xl border-border/20 font-semibold text-xs hover:bg-muted transition-all w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Abstract Hero Visual */}
          <div className="hidden lg:block relative w-72 h-72">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-500 rounded-[3rem] rotate-12 opacity-20 animate-blob" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-500 rounded-[3rem] -rotate-6 opacity-20 animate-blob animation-delay-2000" />
            <div className="relative h-full w-full bg-card/40 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-xl flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              <Layout className="h-24 w-24 text-primary group-hover:scale-110 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats & Trust Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Premium Assets', value: '5,000+', icon: Package, color: 'text-blue-500' },
          { label: 'Active Creators', value: '1,200+', icon: Users, color: 'text-primary' },
          { label: 'Average Rating', value: '4.9/5.0', icon: Star, color: 'text-orange-400' },
          { label: 'Secure Payments', value: 'Verified', icon: ShieldCheck, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/20 shadow-sm hover:border-primary/20 transition-colors"
          >
            <div className={cn("h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center", stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-xs font-bold text-muted-foreground ">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Category Bar */}
      <div className="relative group">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = category === cat.name
            
            return (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-[1.5rem] transition-all duration-500 whitespace-nowrap border-2",
                  isActive 
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_10px_25px_rgba(var(--primary-rgb),0.2)] scale-105" 
                    : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50 hover:border-border/20"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "animate-pulse" : "opacity-70")} />
                <span className="text-sm font-semibold ">{cat.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeCategory"
                    className="absolute inset-0 rounded-[1.5rem] bg-primary/20 blur-xl -z-10"
                  />
                )}
              </button>
            )
          })}
        </div>
        {/* Subtle Fade Indicators */}
        <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* Search & Main Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            type="text" 
            placeholder="Search for premium assets..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setIsSuggestionsOpen(true)
            }}
            onFocus={() => setIsSuggestionsOpen(true)}
            onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 200)}
            className="h-12 sm:h-16 pl-12 sm:pl-14 pr-12 sm:pr-14 rounded-2xl sm:rounded-[2rem] bg-card border-border/20 shadow-sm focus:ring-primary/20 focus:border-primary text-base sm:text-lg transition-all"
          />
          
          {search && (
            <button 
              onClick={() => {
                setSearch('')
                setIsSuggestionsOpen(false)
              }}
              title="Clear search"
              aria-label="Clear search"
              className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground hover:text-white transition-all"
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {/* Smart Suggestions Dropdown */}
          <AnimatePresence>
            {isSuggestionsOpen && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-4 p-3 bg-card/90 backdrop-blur-3xl border border-border/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-border/20 mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground ">Recommended Results</span>
                  <span className="text-xs font-bold text-primary/40 ">{suggestions.length} Found</span>
                </div>
                <div className="space-y-1">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSearch(p.title)
                        setIsSuggestionsOpen(false)
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/5 transition-all text-left group/item"
                    >
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/20">
                        <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover transition-transform group-hover/item:scale-110" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover/item:text-primary transition-colors">{p.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground font-semibold px-1.5 py-0.5 bg-muted/50 rounded-md">{p.category}</span>
                          <span className="text-xs text-primary font-bold tracking-tighter">${p.price}</span>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary/0 group-hover/item:bg-primary/10 flex items-center justify-center transition-all">
                        <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover/item:opacity-100 -translate-x-1 translate-y-1 group-hover/item:translate-x-0 group-hover/item:translate-y-0 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
          {isLoggedIn && (
            <div className="flex p-1.5 bg-muted/50 border border-border/20 rounded-[2rem]">
              <Button 
                variant={feedMode === 'all' ? 'default' : 'ghost'} 
                onClick={() => setFeedMode('all')}
                className="rounded-[1.5rem] h-12 px-6 font-bold text-xs"
              >
                All Assets
              </Button>
              <Button 
                variant={feedMode === 'following' ? 'default' : 'ghost'} 
                onClick={() => setFeedMode('following')}
                className="rounded-[1.5rem] h-12 px-6 font-bold text-xs"
              >
                My Feed
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-muted/50 border border-border/20 rounded-[2rem] p-1.5">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-12 w-12 rounded-[1.5rem]"
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-12 w-12 rounded-[1.5rem]"
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            variant={isFilterOpen ? "default" : "outline"}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-16 px-8 rounded-[2rem] gap-3 font-bold border-border/20 shadow-sm transition-all flex-1 lg:flex-none"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button 
                variant="outline" 
                className="h-16 px-8 rounded-[2rem] gap-3 font-bold border-border/20 shadow-sm transition-all flex-1 lg:flex-none justify-between lg:min-w-[200px]"
              >
                <div className="flex items-center gap-3">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {sortBy === 'newest' && 'Newest First'}
                    {sortBy === 'price-low' && 'Lowest Price'}
                    {sortBy === 'price-high' && 'Highest Price'}
                  </span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 backdrop-blur-xl bg-card/90 border-border/20">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground pb-2 px-3">
                  Sort Assets By
                </DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => setSortBy('newest')}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-3 rounded-xl cursor-pointer transition-all",
                    sortBy === 'newest' ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-bold">Newest First</span>
                  </div>
                  {sortBy === 'newest' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setSortBy('price-low')}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-3 rounded-xl cursor-pointer transition-all",
                    sortBy === 'price-low' ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm font-bold">Lowest Price</span>
                  </div>
                  {sortBy === 'price-low' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setSortBy('price-high')}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-3 rounded-xl cursor-pointer transition-all",
                    sortBy === 'price-high' ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-bold">Highest Price</span>
                  </div>
                  {sortBy === 'price-high' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {isFilterOpen && (
        <div className="p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Category Filter */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Category</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-xs font-bold border transition-all",
                      category === cat.name 
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                        : "bg-muted/30 border-transparent hover:border-primary/50"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-muted-foreground">Price Range</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-md text-muted-foreground">${priceRange[0]}</span>
                  <span className="text-xs font-semibold text-muted-foreground/30">—</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-primary/10 rounded-md text-primary">${priceRange[1]}</span>
                </div>
              </div>
              <div className="px-2 pt-4">
                <Slider 
                  defaultValue={priceRange} 
                  max={1000} 
                  step={10} 
                  minStepsBetweenValues={1}
                  onValueChange={(value) => setPriceRange(value as number[])}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground opacity-50">
                <span>Min Budget</span>
                <span>Max Budget</span>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="flex flex-col justify-center items-center lg:items-end p-6 rounded-[1.5rem] bg-muted/20 border border-border/20">
              <div className="text-3xl font-semibold text-foreground">{totalCount}</div>
              <div className="text-xs font-bold text-muted-foreground ">Assets Found</div>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearch('');
                  setCategory('All');
                  setPriceRange([0, 1000]);
                  setSortBy('newest');
                }}
                className="mt-4 text-xs font-bold text-primary hover:bg-primary/5"
              >
                Reset Semua Filter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <ScrollReveal key={`${search}-${category}-${sortBy}-${priceRange.join('-')}-${isLoading}-${viewMode}`}>
        {isLoading || isFiltering ? (
          <div className={cn(
            "grid gap-8",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} view={viewMode} />
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="space-y-12">
            <div className={cn(
              "grid gap-8",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            )}>
              {displayedProducts.map(product => (
                <div key={product.id} className="reveal-item opacity-0">
                  {viewMode === 'grid' ? (
                    <ProductCard product={product} />
                  ) : (
                    <ProductListItem product={product} />
                  )}
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-8">
                <Button 
                  onClick={handleLoadMore} 
                  disabled={isFetchingMore}
                  variant="outline"
                  size="lg"
                  className="rounded-2xl h-14 px-8 border-border/50 hover:bg-muted font-bold text-sm gap-3 transition-all"
                >
                  {isFetchingMore ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Assets
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="reveal-item opacity-0 flex flex-col items-center gap-16 py-20">
            <div className="text-center space-y-6">
              <div className="h-24 w-24 rounded-[2.5rem] bg-muted/50 flex items-center justify-center mx-auto shadow-inner">
                <Search className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-semibold tracking-tight">No results for &quot;{search}&quot;</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                  We couldn&apos;t find what you&apos;re looking for, but don&apos;t stop now!
                </p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearch('');
                    setCategory('All');
                    setPriceRange([0, 1000]);
                  }}
                  className="text-primary font-bold text-xs"
                >
                  Clear all filters
                </Button>
              </div>
            </div>

            {/* AI Recommendations Section */}
            <div className="w-full space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border" />
                <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-border/20 bg-muted/20">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">Recommended for you</span>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {initialProducts.slice(0, 4).map(product => (
                  <ProductCard key={`rec-${product.id}`} product={product} />
                ))}
              </div>
            </div>
          </div>
        )}
      </ScrollReveal>
    </div>
  )
}
