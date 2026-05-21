import DashboardSidebar from '@/components/DashboardSidebar'
import HeroAnimations from '@/components/HeroAnimations'
import { getWalletData } from './actions'
import { 
  Wallet, 
  TrendingUp, 
  ArrowDownCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  History,
  DollarSign,
  Lightbulb,
  Rocket,
  AlertCircle
} from 'lucide-react'
import PayoutRequestModal from '@/components/PayoutRequestModal'
import IncomeDonutChart from '@/components/IncomeDonutChart'
import EarningsTimeline from '@/components/EarningsTimeline'
import EarningsHeatmap from '@/components/EarningsHeatmap'
import WalletHistoryTabs from '@/components/WalletHistoryTabs'
import { PieChart, LineChart, Calendar } from 'lucide-react'
import WalletExportButton from './WalletExportButton'

export default async function WalletPage() {
  const data = await getWalletData()

  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-amber-500" />,
    completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    rejected: <XCircle className="h-4 w-4 text-destructive" />
  }

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    rejected: 'bg-destructive/10 text-destructive'
  }

  // ── Smart Payout Intelligence ──────────────────────────────────────────────
  const MIN_PAYOUT = 10

  type IntelligenceType = 'pending' | 'no-balance' | 'below-minimum' | 'all-time-high' | 'ready'

  interface IntelligenceConfig {
    type: IntelligenceType
    emoji: string
    label: string
    message: string
    card: string
    badge: string
    border: string
    glow: string
    showProgress?: boolean
    progressValue?: number
  }

  let intelligence: IntelligenceConfig

  if (data.pendingPayouts > 0) {
    intelligence = {
      type: 'pending',
      emoji: '⏳',
      label: 'Processing',
      message: `You have $${data.pendingPayouts.toFixed(2)} currently being processed. Please wait for it to complete before submitting a new request.`,
      card: 'bg-amber-500/5',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/25',
      glow: 'bg-amber-500/10',
    }
  } else if (data.availableBalance <= 0) {
    intelligence = {
      type: 'no-balance',
      emoji: '💰',
      label: 'No Balance',
      message: `You have no balance to withdraw yet. Keep creating and selling — your earnings will appear here!`,
      card: 'bg-muted/30',
      badge: 'bg-muted text-muted-foreground',
      border: 'border-border/20',
      glow: 'bg-muted/30',
    }
  } else if (data.availableBalance < MIN_PAYOUT) {
    const needed = (MIN_PAYOUT - data.availableBalance).toFixed(2)
    intelligence = {
      type: 'below-minimum',
      emoji: '💡',
      label: 'Almost There!',
      message: `You're only $${needed} away from the $${MIN_PAYOUT} minimum payout. One more sale and you're ready to withdraw!`,
      card: 'bg-blue-500/5',
      badge: 'bg-blue-500/10 text-blue-600',
      border: 'border-blue-500/20',
      glow: 'bg-blue-500/10',
      showProgress: true,
      progressValue: Math.round((data.availableBalance / MIN_PAYOUT) * 100),
    }
  } else if (data.totalEarnings > 0 && (data.availableBalance / data.totalEarnings) >= 0.75) {
    const pct = ((data.availableBalance / data.totalEarnings) * 100).toFixed(0)
    intelligence = {
      type: 'all-time-high',
      emoji: '🚀',
      label: 'All-Time High!',
      message: `Great time to withdraw! Your balance of $${data.availableBalance.toFixed(2)} represents ${pct}% of your lifetime earnings — the highest it's ever been. Don't let it sit idle!`,
      card: 'bg-emerald-500/5',
      badge: 'bg-emerald-500/10 text-emerald-600',
      border: 'border-emerald-500/25',
      glow: 'bg-emerald-500/10',
    }
  } else {
    intelligence = {
      type: 'ready',
      emoji: '✅',
      label: 'Ready to Withdraw',
      message: `Your balance of $${data.availableBalance.toFixed(2)} is looking great. You can request a payout anytime — funds typically arrive within 1–3 business days.`,
      card: 'bg-primary/5',
      badge: 'bg-primary/10 text-primary',
      border: 'border-primary/20',
      glow: 'bg-primary/10',
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex bg-muted/5 min-h-[calc(100vh-64px)]">
      <DashboardSidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
        <HeroAnimations>
          <div className="max-w-6xl mx-auto space-y-10">
            
            {/* Header Section */}
            <div className="animate-title opacity-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
                  <Wallet className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight">Earnings</h1>
                  <p className="text-muted-foreground text-sm font-medium">Manage your balance and payout requests.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <WalletExportButton
                  sales={data.salesTransactions}
                  payouts={data.payouts}
                  totalEarnings={data.totalEarnings}
                  availableBalance={data.availableBalance}
                />
                <PayoutRequestModal availableBalance={data.availableBalance} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Total Revenue */}
              <div className="animate-btns opacity-0 p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-sm space-y-4 group">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground ">Total Earnings</p>
                  <h2 className="text-3xl font-semibold mt-1 tracking-tighter">${data.totalEarnings.toFixed(2)}</h2>
                </div>
                <p className="text-xs font-medium text-muted-foreground opacity-60">Gross revenue from all sales</p>
              </div>

              {/* Withdrawn */}
              <div className="animate-desc opacity-0 p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-sm space-y-4 group">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <ArrowDownCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground ">Withdrawn</p>
                  <h2 className="text-3xl font-semibold mt-1 tracking-tighter">${data.withdrawnAmount.toFixed(2)}</h2>
                </div>
                <p className="text-xs font-medium text-muted-foreground opacity-60">Funds already sent to you</p>
              </div>

              {/* Available Balance */}
              <div className="animate-desc opacity-0 p-8 rounded-[2.5rem] bg-primary text-primary-foreground shadow-xl shadow-primary/30 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                <div className="relative z-10 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium opacity-80 ">Available for Payout</p>
                    <h2 className="text-4xl font-semibold mt-1 tracking-tighter">${data.availableBalance.toFixed(2)}</h2>
                  </div>
                  {data.pendingPayouts > 0 && (
                    <div className="flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                      <Clock className="h-3 w-3" />
                      ${data.pendingPayouts.toFixed(2)} Processing
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ── Smart Payout Intelligence Banner ── */}
            <div className={`animate-btns opacity-0 relative overflow-hidden rounded-[2.5rem] border ${intelligence.border} ${intelligence.card} p-6 shadow-sm group hover:shadow-lg transition-all duration-400`}>
              {/* Ambient glow */}
              <div className={`absolute -top-10 -right-10 w-40 h-40 ${intelligence.glow} rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700`} />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Emoji & label */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <span className="text-4xl leading-none select-none">{intelligence.emoji}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full tracking-wider ${intelligence.badge}`}>
                    {intelligence.label}
                  </span>
                </div>

                {/* Message */}
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {intelligence.message}
                  </p>

                  {/* Progress bar — only for below-minimum state */}
                  {intelligence.showProgress && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground ">Progress to minimum payout</span>
                        <span className="text-xs font-semibold text-foreground">{intelligence.progressValue}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${intelligence.progressValue}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Icon on the far right */}
                <div className={`hidden sm:flex flex-shrink-0 h-12 w-12 rounded-2xl ${intelligence.badge} items-center justify-center`}>
                  {intelligence.type === 'pending'       && <Clock className="h-6 w-6" />}
                  {intelligence.type === 'no-balance'    && <DollarSign className="h-6 w-6" />}
                  {intelligence.type === 'below-minimum' && <Lightbulb className="h-6 w-6" />}
                  {intelligence.type === 'all-time-high' && <Rocket className="h-6 w-6" />}
                  {intelligence.type === 'ready'         && <CheckCircle2 className="h-6 w-6" />}
                </div>
              </div>
            </div>

            {/* Income Breakdown Section */}
            <div className="animate-btns opacity-0 bg-card border border-border/20 rounded-[2.5rem] p-8 shadow-sm space-y-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              {/* Decorative glow */}
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">Income Breakdown</h3>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">Revenue contribution per product</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border/20 text-xs font-medium text-muted-foreground tracking-tight">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  All Time
                </div>
              </div>

              <div className="relative z-10">
                <IncomeDonutChart
                  data={data.productBreakdown}
                  totalRevenue={data.totalEarnings}
                />
              </div>
            </div>

            {/* Lifetime Earnings Timeline */}
            <div className="animate-desc opacity-0 bg-card border border-border/20 rounded-[2.5rem] p-8 shadow-sm space-y-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              {/* Decorative glow */}
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <LineChart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">Lifetime Earnings</h3>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">Cumulative growth &amp; milestone achievements</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-xl border border-border/20 text-xs font-medium text-muted-foreground">
                    <span className="text-base leading-none">✨</span>
                    <span className="tracking-tight">Milestone markers enabled</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <EarningsTimeline
                  data={data.earningsTimeline}
                  totalEarnings={data.totalEarnings}
                />
              </div>
            </div>

            {/* Earnings Activity (Heatmap) */}
            <div className="animate-desc opacity-0 bg-card border border-border/20 rounded-[2.5rem] p-8 shadow-sm space-y-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              {/* Decorative glow */}
              <div className="absolute -top-16 -left-16 w-56 h-56 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">Earnings Activity</h3>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">Daily sales intensity heatmap</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border/20 text-xs font-medium text-muted-foreground tracking-tight">
                  Last 6 Months
                </div>
              </div>

              <div className="relative z-10">
                <EarningsHeatmap data={data.heatmapData} />
              </div>
            </div>

            {/* History Tabs Section */}
            <div className="animate-desc opacity-0 space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-xl bg-card border border-border/20 flex items-center justify-center">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">Financial Records</h3>
              </div>

              <WalletHistoryTabs 
                payouts={data.payouts} 
                sales={data.salesTransactions}
                statusIcons={statusIcons}
                statusColors={statusColors}
              />
            </div>

          </div>
        </HeroAnimations>
      </main>
    </div>
  )
}

