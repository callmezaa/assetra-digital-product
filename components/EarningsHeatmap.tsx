'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeatmapDay {
  date: string
  amount: number
}

interface EarningsHeatmapProps {
  data: HeatmapDay[]
}

export default function EarningsHeatmap({ data }: EarningsHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Find max amount to determine color intensity
  const maxAmount = useMemo(() => {
    return Math.max(...data.map((d) => d.amount), 1)
  }, [data])

  const getColorClass = (amount: number) => {
    if (amount === 0) return 'bg-muted/30 dark:bg-muted/10'
    const percentage = amount / maxAmount
    if (percentage < 0.25) return 'bg-emerald-500/20'
    if (percentage < 0.5) return 'bg-emerald-500/40'
    if (percentage < 0.75) return 'bg-emerald-500/70'
    return 'bg-emerald-500'
  }

  // Group data into weeks (7 days each)
  const weeks = useMemo(() => {
    const result = []
    for (let i = 0; i < data.length; i += 7) {
      result.push(data.slice(i, i + 7))
    }
    return result
  }, [data])

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Calculate month labels position
  const monthLabels = useMemo(() => {
    const labels: { month: string; index: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, i) => {
      const firstDay = new Date(week[0].date)
      const currentMonth = firstDay.getMonth()
      if (currentMonth !== lastMonth) {
        labels.push({ month: months[currentMonth], index: i })
        lastMonth = currentMonth
      }
    })
    return labels
  }, [weeks, months])

  const handleMouseEnter = (e: React.MouseEvent, day: HeatmapDay) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
    setHoveredDay(day)
  }

  return (
    <div className="w-full space-y-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {monthLabels.map((label, i) => (
            <span 
              key={i} 
              className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest min-w-[40px]"
              style={{ 
                '--ml': i === 0 ? '0px' : `${(label.index - monthLabels[i-1].index) * 14}px`,
                marginLeft: 'var(--ml)'
              } as React.CSSProperties}
            >
              {label.month}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-4 scrollbar-hide">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                onMouseEnter={(e) => handleMouseEnter(e, day)}
                onMouseLeave={() => setHoveredDay(null)}
                className={cn(
                  "h-3 w-3 rounded-[2px] transition-all duration-200 hover:scale-150 cursor-pointer relative z-10",
                  getColorClass(day.amount)
                )}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Custom Tooltip */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="fixed z-[100] pointer-events-none -translate-x-1/2 -translate-y-full"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
            }}
          >
            <div className="bg-background/95 backdrop-blur-md border border-border/50 p-3 rounded-xl shadow-2xl text-center min-w-[140px]">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                {new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs font-black text-primary">
                ${hoveredDay.amount.toFixed(2)} Earned
              </p>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-background border-r border-b border-border/50 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-[2px] bg-muted/30 dark:bg-muted/10" />
          <div className="h-3 w-3 rounded-[2px] bg-emerald-500/20" />
          <div className="h-3 w-3 rounded-[2px] bg-emerald-500/40" />
          <div className="h-3 w-3 rounded-[2px] bg-emerald-500/70" />
          <div className="h-3 w-3 rounded-[2px] bg-emerald-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

