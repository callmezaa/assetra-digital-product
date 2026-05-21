import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  PlusCircle, 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Trophy,
  Bell,
  Star,
  UserPlus,
  Clock,
  BarChart3,
  Flame,
  Eye,
  Percent,
  Share2,
  Wallet,
  Copy,
  Sparkles
} from 'lucide-react'
import DeleteProductButton from '@/app/dashboard/DeleteProductButton'
import DashboardSidebar from '@/components/DashboardSidebar'
import HeroAnimations from '@/components/HeroAnimations'
import SalesChart from '@/components/SalesChart'
import { enrichNotifications, getNotificationLink } from '@/lib/notifications'
import { cn } from '@/lib/utils'

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'Just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch sales data
  const { data: sales } = await supabase
    .from('orders')
    .select('created_at, amount, product_id, products!inner(user_id)')
    .eq('products.user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: true })

  // Fetch per-product sales for Top Seller Podium
  const { data: salesWithProduct } = await supabase
    .from('orders')
    .select('amount, product_id, products!inner(id, title, thumbnail_url, user_id, price)')
    .eq('products.user_id', user.id)
    .eq('status', 'completed')

  // Fetch recent notifications for Live Activity Feed
  const { data: rawNotifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)
  
  const notifications = await enrichNotifications(supabase, rawNotifications || [])

  // Fetch seller profile for share store link
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const storeUrl = profile?.username ? `/seller/${profile.username}` : '/marketplace'

  // Process data for the chart (Last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const chartData = last7Days.map(date => {
    const dayOrders = sales?.filter(o => o.created_at.startsWith(date)) || []
    const totalSales = dayOrders.reduce((sum, o) => sum + Number(o.amount), 0)
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      sales: totalSales
    }
  })

  const totalRevenue = sales?.reduce((sum, o) => sum + Number(o.amount), 0) || 0
  const totalSalesCount = sales?.length || 0

  // Top Seller Podium Logic
  const productRevenueMap: Record<string, { revenue: number; salesCount: number; product: any }> = {}
  salesWithProduct?.forEach((order: any) => {
    const pid = order.product_id
    if (!productRevenueMap[pid]) {
      productRevenueMap[pid] = { revenue: 0, salesCount: 0, product: order.products }
    }
    productRevenueMap[pid].revenue += Number(order.amount)
    productRevenueMap[pid].salesCount += 1
  })

  const sortedProducts = Object.values(productRevenueMap).sort((a, b) => b.revenue - a.revenue)
  const topSeller = sortedProducts[0] || null
  const topSellerContribution = topSeller && totalRevenue > 0
    ? ((topSeller.revenue / totalRevenue) * 100).toFixed(1)
    : '0'

  // Podium — top 3 products by revenue
  const podium = sortedProducts.slice(0, 3)

  // Conversion Rate: sales count / total products as a rough proxy
  // (Real conversion needs page view data; here we use sales/products ratio as an illustrative metric)
  const conversionRate = products && products.length > 0
    ? ((totalSalesCount / Math.max(totalSalesCount + products.length * 5, 1)) * 100).toFixed(1)
    : '0'

  // Creator Tier Logic
  const TIER_THRESHOLDS = [
    { name: 'Bronze', threshold: 0, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { name: 'Silver', threshold: 100, color: 'text-slate-300', bg: 'bg-slate-300/10' },
    { name: 'Gold', threshold: 500, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { name: 'Platinum', threshold: 2000, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { name: 'Diamond', threshold: 10000, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  ]

  let currentTierIndex = 0
  for (let i = 0; i < TIER_THRESHOLDS.length; i++) {
    if (totalRevenue >= TIER_THRESHOLDS[i].threshold) {
      currentTierIndex = i
    }
  }

  const currentTier = TIER_THRESHOLDS[currentTierIndex]
  const nextTier = currentTierIndex < TIER_THRESHOLDS.length - 1 ? TIER_THRESHOLDS[currentTierIndex + 1] : null

  let tierProgress = 100
  let amountNeeded = 0
  if (nextTier) {
    const tierRange = nextTier.threshold - currentTier.threshold
    const earningsInTier = totalRevenue - currentTier.threshold
    tierProgress = Math.min(100, Math.max(0, (earningsInTier / tierRange) * 100))
    amountNeeded = nextTier.threshold - totalRevenue
  }

  return (
    <div className="flex bg-muted/5 min-h-[calc(100vh-64px)]">
      <DashboardSidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
        <HeroAnimations>
          <div className="max-w-6xl mx-auto space-y-10">
            
            {/* ─── BENTO HEADER GRID ─── */}
            <div className="animate-title opacity-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 grid-rows-auto sm:grid-rows-2 gap-4 h-auto md:h-[280px]">

              {/* 1. Greeting / Create Product — Large tile (spans 2 cols × 2 rows) */}
              <Link href="/dashboard/new" className="group col-span-1 sm:col-span-2 sm:row-span-2 relative bg-primary text-primary-foreground rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 overflow-hidden flex flex-col justify-between shadow-xl shadow-primary/30 hover:-translate-y-1 hover:shadow-primary/40 transition-all duration-500">
                {/* Animated blobs */}
                <div className="absolute -top-10 -right-10 h-48 w-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                <div className="absolute -bottom-16 -left-8 h-56 w-56 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                <div className="relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-medium opacity-70 ">Welcome back,</p>
                  <h2 className="text-2xl sm:text-3xl font-semibold mt-1 tracking-tight leading-tight">
                    {profile?.full_name?.split(' ')[0] ?? 'Creator'} 👋
                  </h2>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-70 ">Click to</p>
                    <p className="text-xl font-semibold">Create New Product</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                    <PlusCircle className="h-6 w-6" />
                  </div>
                </div>
              </Link>

              {/* 2. Share Store — Top-right (spans 1 col) */}
              <div className="group col-span-1 relative bg-card border border-border/20 rounded-[2.5rem] p-5 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent pointer-events-none rounded-[2.5rem]" />
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground ">Share</p>
                  <p className="text-base font-semibold leading-tight mt-0.5">Your Store</p>
                  {profile?.username ? (
                    <div className="flex items-center gap-2 mt-3">
                      <Link
                        href={`https://twitter.com/intent/tweet?text=Check out my store on Assetra!&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}${storeUrl}`)}`}
                        target="_blank"
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/20 hover:bg-sky-500/20 transition-all tracking-wider"
                      >
                        𝕏 Tweet
                      </Link>
                      <Link
                        href={storeUrl}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-muted border border-border/20 hover:bg-muted/70 transition-all tracking-wider"
                      >
                        View →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">Set username in Settings</p>
                  )}
                </div>
              </div>

              {/* 3. Wallet / Withdraw — Bottom-right (spans 1 col) */}
              <Link href="/dashboard/wallet" className="group col-span-1 relative bg-card border border-border/20 rounded-[2.5rem] p-5 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none rounded-[2.5rem]" />
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground ">Balance</p>
                  <p className="text-2xl font-semibold tracking-tight mt-0.5">${totalRevenue.toFixed(0)}</p>
                  <p className="text-xs font-medium text-emerald-600 tracking-wider mt-1 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> Withdraw →
                  </p>
                </div>
              </Link>

            </div>

            {/* Creator Tier Gamification */}
            <div className="animate-desc opacity-0 bg-card border border-border/20 rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
              {/* Background Glow */}
              <div className={`absolute -top-20 -right-20 w-80 h-80 ${currentTier.bg} blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-700 pointer-events-none`} />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className={`h-20 w-20 rounded-3xl ${currentTier.bg} ${currentTier.color} flex items-center justify-center shadow-xl border border-border/10 group-hover:rotate-12 transition-transform duration-500`}>
                    <Trophy className="h-10 w-10 drop-shadow-md" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-muted-foreground ">Creator Status</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${currentTier.bg} ${currentTier.color} tracking-wider`}>
                        Level {currentTierIndex + 1}
                      </span>
                    </div>
                    <h2 className={`text-4xl font-semibold mt-1 ${currentTier.color} tracking-tighter drop-shadow-sm`}>
                      {currentTier.name} Tier
                    </h2>
                  </div>
                </div>

                {nextTier ? (
                  <div className="w-full lg:w-[400px] space-y-3 bg-background/50 backdrop-blur-sm p-5 rounded-2xl border border-border/20">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-muted-foreground">
                        Earn <span className="text-foreground">${amountNeeded.toFixed(2)}</span> to unlock <span className={nextTier.color}>{nextTier.name}</span>
                      </span>
                      <span>{tierProgress.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 w-full bg-muted/80 overflow-hidden rounded-full border border-border/20 shadow-inner">
                      <div 
                        className={`h-full ${nextTier.bg.replace('/10', '')} transition-all duration-1000 ease-out`}
                        style={{ '--width': `${tierProgress}%`, width: 'var(--width)' } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full lg:w-[400px] text-right bg-background/50 backdrop-blur-sm p-5 rounded-2xl border border-border/20">
                    <p className="text-xl font-semibold text-violet-400">💎 Maximum Tier Reached!</p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">You are a legendary creator.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Seller Podium & Conversion Funnel */}
            <div className="animate-desc opacity-0 grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Top Seller Podium */}
              <div className="bg-card border border-border/20 rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative group hover:shadow-xl transition-all duration-500">
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none group-hover:bg-yellow-400/10 transition-all duration-700" />

                <div className="relative z-10 space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-yellow-400/10 text-yellow-500 flex items-center justify-center">
                        <Flame className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Top Performers</h3>
                        <p className="text-xs font-medium text-muted-foreground ">Revenue Podium</p>
                      </div>
                    </div>
                    {topSeller && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-500 border border-yellow-400/20 tracking-wider">
                        #{topSellerContribution}% share
                      </span>
                    )}
                  </div>

                  {/* Podium list */}
                  {podium.length > 0 ? (
                    <div className="space-y-4">
                      {podium.map((item, idx) => {
                        const medals = ['🥇', '🥈', '🥉']
                        const barColors = ['bg-yellow-400', 'bg-slate-400', 'bg-orange-400']
                        const maxRevenue = podium[0]?.revenue || 1
                        const barWidth = Math.round((item.revenue / maxRevenue) * 100)
                        return (
                          <div key={idx} className="flex items-center gap-4 group/item">
                            <span className="text-2xl w-8 text-center flex-shrink-0">{medals[idx]}</span>
                            <div className="flex-shrink-0 h-10 w-10 rounded-xl overflow-hidden border border-border/20">
                              {item.product?.thumbnail_url
                                ? <img src={item.product.thumbnail_url} alt={item.product?.title} className="h-full w-full object-cover" />
                                : <div className="h-full w-full bg-muted flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
                              }
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">{item.product?.title ?? 'Untitled'}</p>
                                <span className="text-sm font-semibold text-foreground ml-2 flex-shrink-0">${item.revenue.toFixed(2)}</span>
                              </div>
                              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                                <div className={`h-full ${barColors[idx]} rounded-full transition-all duration-700`} style={{ '--width': `${barWidth}%`, width: 'var(--width)' } as React.CSSProperties} />
                              </div>
                              <p className="text-xs text-muted-foreground font-medium">{item.salesCount} sale{item.salesCount !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Package className="h-8 w-8 text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium">No sales yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Your podium will appear once products sell.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-card border border-border/20 rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative group hover:shadow-xl transition-all duration-500 space-y-6">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />

                {/* Header */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Conversion Analytics</h3>
                    <p className="text-xs font-medium text-muted-foreground ">Funnel Breakdown</p>
                  </div>
                </div>

                {/* Funnel Steps */}
                <div className="relative z-10 space-y-4">
                  {[
                    {
                      label: 'Total Products Listed',
                      value: products?.length ?? 0,
                      suffix: 'assets',
                      icon: Package,
                      color: 'text-blue-500',
                      bg: 'bg-blue-500/10',
                      fill: 100,
                      fillColor: 'bg-blue-500',
                    },
                    {
                      label: 'Total Sales Closed',
                      value: totalSalesCount,
                      suffix: 'orders',
                      icon: ShoppingBag,
                      color: 'text-emerald-500',
                      bg: 'bg-emerald-500/10',
                      fill: products?.length ? Math.min(100, Math.round((totalSalesCount / (products.length * 5)) * 100)) : 0,
                      fillColor: 'bg-emerald-500',
                    },
                    {
                      label: 'Avg. Revenue per Sale',
                      value: totalSalesCount > 0 ? `$${(totalRevenue / totalSalesCount).toFixed(2)}` : '$0.00',
                      suffix: '/ order',
                      icon: DollarSign,
                      color: 'text-primary',
                      bg: 'bg-primary/10',
                      fill: Math.min(100, totalSalesCount * 10),
                      fillColor: 'bg-primary',
                    },
                  ].map((step) => (
                    <div key={step.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-lg ${step.bg} ${step.color} flex items-center justify-center`}>
                            <step.icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{step.label}</span>
                        </div>
                        <span className="text-sm font-semibold">{step.value} <span className="text-xs font-medium text-muted-foreground">{step.suffix}</span></span>
                      </div>
                      <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div className={`h-full ${step.fillColor} rounded-full transition-all duration-700 ease-out opacity-70`} style={{ '--width': `${step.fill}%`, width: 'var(--width)' } as React.CSSProperties} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Conversion Rate Hero Metric */}
                <div className="relative z-10 flex items-center gap-6 p-5 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/20">
                  <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 flex-shrink-0">
                    <Percent className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground ">Est. Conversion Rate</p>
                    <p className="text-4xl font-semibold tracking-tighter mt-0.5">{conversionRate}%</p>
                    <p className="text-xs font-medium text-muted-foreground mt-1">of estimated visitors converted to buyers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats & Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sales Chart (Main Card) */}
              <div className="animate-btns opacity-0 lg:col-span-2 p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-medium">Revenue Analysis</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-1">7-Day Performance Overview</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border/20 text-xs font-medium text-muted-foreground tracking-tight">
                    <Calendar className="h-3 w-3 text-primary" />
                    Last 7 Days
                  </div>
                </div>
                <SalesChart data={chartData} />
              </div>

              {/* Quick Stats Column */}
              <div className="animate-desc opacity-0 space-y-6">
                {/* Total Earnings Card */}
                <div className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground shadow-xl shadow-primary/30 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                  <div className="relative z-10 space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium opacity-80 ">Gross Revenue</p>
                      <h2 className="text-4xl font-semibold mt-1 tracking-tighter">${totalRevenue.toFixed(2)}</h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                      <TrendingUp className="h-3 w-3" />
                      +12.5% Growth
                    </div>
                  </div>
                </div>

                {/* Total Sales Card */}
                <div className="p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-sm relative overflow-hidden group">
                  <div className="relative z-10 space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground ">Sales Volume</p>
                      <h2 className="text-4xl font-semibold mt-1 tracking-tighter">{totalSalesCount}</h2>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground tracking-tight">
                      Across {products?.length || 0} Assets
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Grid: Recent Inventory & Live Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
              
              {/* Recent Products Section (Spans 2 columns) */}
              <div className="animate-desc opacity-0 space-y-6 lg:col-span-2">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-semibold tracking-tight">Recent Inventory</h3>
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-lg tracking-wider">
                      Stock
                    </span>
                  </div>
                  <Link href="/dashboard/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    Manage All <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products && products.slice(0, 4).map((product) => (
                    <div key={product.id} className="group p-5 rounded-[2.5rem] bg-card border border-border/20 shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="aspect-video rounded-2xl overflow-hidden mb-4 border border-border/20 bg-muted">
                        <img src={product.thumbnail_url} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-lg leading-tight truncate group-hover:text-primary transition-colors">{product.title}</h4>
                        <p className="text-xs text-muted-foreground font-medium tracking-tight">{product.category}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/20">
                        <span className="text-xl font-semibold text-foreground">${Number(product.price).toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/edit/${product.id}`}>
                            <Button variant="ghost" size="sm" className="rounded-xl font-medium text-xs h-9 hover:bg-primary/5 hover:text-primary">Edit</Button>
                          </Link>
                          <DeleteProductButton productId={product.id} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Activity Feed (Spans 1 column) */}
              <div className="animate-desc opacity-0 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-semibold tracking-tight">Live Activity</h3>
                    <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                  </div>
                </div>

                <div className="bg-card border border-border/20 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden h-fit">
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

                  <div className="space-y-6 relative z-10">
                    {notifications && notifications.length > 0 ? notifications.map((notif: any, idx: number) => {
                      const isPurchase = notif.type === 'purchase'
                      const isReview = notif.type === 'review'
                      const isFollow = notif.type === 'follow'

                      let Icon = Bell
                      let iconColor = 'text-muted-foreground'
                      let bgStyle = 'bg-muted/50'

                      if (isPurchase) {
                        Icon = ShoppingBag
                        iconColor = 'text-green-500'
                        bgStyle = 'bg-green-500/10 border-green-500/20'
                      } else if (isReview) {
                        Icon = Star
                        iconColor = 'text-yellow-500'
                        bgStyle = 'bg-yellow-500/10 border-yellow-500/20'
                      } else if (isFollow) {
                        Icon = UserPlus
                        iconColor = 'text-blue-500'
                        bgStyle = 'bg-blue-500/10 border-blue-500/20'
                      }

                      return (
                        <Link 
                          key={notif.id} 
                          href={getNotificationLink(notif)}
                          className="relative pl-4 group block hover:bg-muted/50 rounded-2xl transition-all duration-300 -ml-4 py-2"
                        >
                          <div className="flex gap-4 px-4">
                            {/* Avatar / Icon Container */}
                            <div className="relative flex-shrink-0">
                              <div className={cn(
                                "h-10 w-10 rounded-xl overflow-hidden border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                                bgStyle
                              )}>
                                {notif.metadata?.product_thumbnail ? (
                                  <img src={notif.metadata.product_thumbnail} alt="" className="h-full w-full object-cover" />
                                ) : (notif.metadata?.follower_avatar || notif.metadata?.reviewer_avatar) ? (
                                  <img src={notif.metadata.follower_avatar || notif.metadata.reviewer_avatar} alt="" className="h-full w-full object-cover" />
                                ) : (notif.metadata?.follower_username || notif.metadata?.reviewer_username) ? (
                                  <img 
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${notif.metadata?.follower_username || notif.metadata?.reviewer_username}`} 
                                    alt="" 
                                    className="h-full w-full object-cover bg-background" 
                                  />
                                ) : (
                                  <Icon className={`h-4 w-4 ${iconColor}`} />
                                )}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                                  {notif.title}
                                </p>
                                <span className="text-[10px] text-muted-foreground/40 font-bold whitespace-nowrap">
                                  {timeAgo(notif.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 font-medium italic">{notif.message}</p>
                            </div>
                          </div>
                        </Link>
                      )
                    }) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Bell className="h-8 w-8 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium">No recent activity</p>
                        <p className="text-xs text-muted-foreground mt-1">Your store's heartbeat will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HeroAnimations>
      </main>
    </div>
  )
}
