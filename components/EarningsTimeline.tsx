'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Package } from 'lucide-react'

interface TimelinePoint {
  date: string
  fullDate: string
  cumulative: number
  milestone: string | null
}

interface EarningsTimelineProps {
  data: TimelinePoint[]
  totalEarnings: number
}

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload as TimelinePoint
    return (
      <div className="bg-background/90 backdrop-blur-xl border border-border/60 p-4 rounded-2xl shadow-2xl min-w-[200px]">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
          {point.fullDate}
        </p>
        <p className="text-2xl font-black tracking-tighter text-primary">
          ${point.cumulative.toFixed(2)}
        </p>
        {point.milestone && (
          <div className="mt-2 pt-2 border-t border-border/40">
            <p className="text-xs font-bold text-foreground leading-snug">{point.milestone}</p>
          </div>
        )}
      </div>
    )
  }
  return null
}

// Custom dot — milestone points get a glowing star, regular points stay minimal
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  if (payload?.milestone) {
    return (
      <g key={`milestone-dot-${cx}-${cy}`}>
        {/* Outer glow ring */}
        <circle cx={cx} cy={cy} r={14} fill="hsl(var(--primary))" opacity={0.12} />
        <circle cx={cx} cy={cy} r={9} fill="hsl(var(--primary))" opacity={0.2} />
        {/* Core dot */}
        <circle cx={cx} cy={cy} r={5} fill="hsl(var(--primary))" stroke="white" strokeWidth={2} />
        {/* Sparkle above */}
        <text x={cx} y={cy - 20} textAnchor="middle" fontSize={14} dominantBaseline="middle">✨</text>
      </g>
    )
  }
  // Regular minimal dot — invisible unless hovered (handled by tooltip)
  return (
    <circle
      key={`dot-${cx}-${cy}`}
      cx={cx}
      cy={cy}
      r={3}
      fill="hsl(var(--primary))"
      opacity={0.5}
      stroke="white"
      strokeWidth={1}
    />
  )
}

const CustomActiveDot = (props: any) => {
  const { cx, cy } = props
  return (
    <g key={`active-${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={12} fill="hsl(var(--primary))" opacity={0.15} />
      <circle cx={cx} cy={cy} r={6} fill="hsl(var(--primary))" stroke="white" strokeWidth={2} />
    </g>
  )
}

export default function EarningsTimeline({ data, totalEarnings }: EarningsTimelineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
          <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <div>
          <p className="text-sm font-bold text-muted-foreground">No earnings history yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Your lifetime earnings curve will appear here after your first sale.
          </p>
        </div>
      </div>
    )
  }

  // Milestone list for the legend below the chart
  const milestones = data.filter(d => d.milestone)

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 24, right: 16, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
              opacity={0.4}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
              dy={10}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#earningsGradient)"
              dot={<CustomDot />}
              activeDot={<CustomActiveDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Milestone Legend */}
      {milestones.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
            Milestones Achieved
          </p>
          <div className="flex flex-wrap gap-2">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-xs font-bold"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-muted-foreground">{m.date}</span>
                <span className="text-foreground">{m.milestone}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
