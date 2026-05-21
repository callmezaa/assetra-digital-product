'use client'

import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Package } from 'lucide-react'

interface ProductBreakdown {
  name: string
  revenue: number
  salesCount: number
}

interface IncomeDonutChartProps {
  data: ProductBreakdown[]
  totalRevenue: number
}

// Premium curated palette
const PALETTE = [
  'hsl(var(--primary))',
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#6b7280', // gray-500 — for "Other"
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload as ProductBreakdown & { percentage: string }
    return (
      <div className="bg-background/90 backdrop-blur-xl border border-border/60 p-4 rounded-2xl shadow-2xl min-w-[200px]">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 truncate">
          {d.name}
        </p>
        <p className="text-2xl font-black tracking-tighter text-foreground">
          ${d.revenue.toFixed(2)}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[11px] font-bold text-muted-foreground">
            {d.salesCount} sale{d.salesCount !== 1 ? 's' : ''}
          </span>
          <span className="h-3 w-[1px] bg-border" />
          <span className="text-[11px] font-black text-primary">
            {d.percentage}% of total
          </span>
        </div>
      </div>
    )
  }
  return null
}

export default function IncomeDonutChart({ data, totalRevenue }: IncomeDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
          <Package className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <div>
          <p className="text-sm font-bold text-muted-foreground">No sales data yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Your income breakdown will appear here once products sell.
          </p>
        </div>
      </div>
    )
  }

  // Enrich data with percentage
  const enriched = data.map((d) => ({
    ...d,
    percentage: totalRevenue > 0 ? ((d.revenue / totalRevenue) * 100).toFixed(1) : '0',
  }))

  // Central label: active item or total
  const centerLabel = activeIndex !== null ? enriched[activeIndex] : null

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
      {/* Donut chart */}
      <div className="relative flex-shrink-0 h-[260px] w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={enriched}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={110}
              dataKey="revenue"
              paddingAngle={3}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              strokeWidth={0}
            >
              {enriched.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PALETTE[index % PALETTE.length]}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                  className="transition-opacity duration-200"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerLabel ? (
            <>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center px-6 line-clamp-1">
                {centerLabel.name}
              </p>
              <p className="text-2xl font-black tracking-tighter mt-1">
                {centerLabel.percentage}%
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Total
              </p>
              <p className="text-2xl font-black tracking-tighter mt-1">
                ${totalRevenue.toFixed(0)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Legend + breakdown table */}
      <div className="flex-1 w-full space-y-3">
        {enriched.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 group cursor-default"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {/* Color dot */}
            <div
              className="flex-shrink-0 h-3 w-3 rounded-full transition-transform duration-200 group-hover:scale-125"
              style={{ '--bg': PALETTE[index % PALETTE.length], backgroundColor: 'var(--bg)' } as React.CSSProperties}
            />

            {/* Name */}
            <p className="flex-1 text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
              {item.name}
            </p>

            {/* Sales count */}
            <span className="text-[10px] font-bold text-muted-foreground">
              {item.salesCount}x
            </span>

            {/* Percentage pill */}
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{
                '--bg': `${PALETTE[index % PALETTE.length]}20`,
                '--color': PALETTE[index % PALETTE.length],
                backgroundColor: 'var(--bg)',
                color: 'var(--color)',
              } as React.CSSProperties}
            >
              {item.percentage}%
            </span>

            {/* Revenue */}
            <span className="text-sm font-black w-20 text-right">
              ${item.revenue.toFixed(2)}
            </span>
          </div>
        ))}

        {/* Total row */}
        <div className="flex items-center gap-3 pt-3 border-t border-border/50 mt-3">
          <div className="flex-shrink-0 h-3 w-3" />
          <p className="flex-1 text-sm font-black text-foreground uppercase tracking-tight">Total</p>
          <span className="text-sm font-black">${totalRevenue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
