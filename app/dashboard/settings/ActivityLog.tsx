'use client'

import React from 'react'
import { History, Shield, Clock, Globe, Laptop, Smartphone, CheckCircle2, AlertCircle, Trash2, Key, Bell, Palette, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatTimeAgo(date: Date) {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface ActivityLogProps {
  logs: any[]
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'PASSWORD_CHANGED': return { icon: Key, color: 'text-amber-500', bg: 'bg-amber-500/10' }
      case 'MFA_ENABLED': return { icon: Shield, color: 'text-green-500', bg: 'bg-green-500/10' }
      case 'MFA_DISABLED': return { icon: Shield, color: 'text-destructive', bg: 'bg-destructive/10' }
      case 'PROFILE_UPDATED': return { icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' }
      case 'PAYOUT_UPDATED': return { icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
      case 'PRIVACY_UPDATED': return { icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
      case 'NOTIFICATIONS_UPDATED': return { icon: Bell, color: 'text-orange-500', bg: 'bg-orange-500/10' }
      default: return { icon: History, color: 'text-muted-foreground', bg: 'bg-muted' }
    }
  }

  const formatActionName = (action: string) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="p-12 rounded-[2.5rem] bg-card border border-border/20 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-[2.5rem] bg-muted flex items-center justify-center text-muted-foreground/30">
          <History className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium">No Activity Recorded</h3>
          <p className="text-xs text-muted-foreground max-w-[200px]">Your account activity will appear here as you make changes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-sm space-y-6">
      <div className="space-y-4">
        {logs.map((log, i) => {
          const { icon: Icon, color, bg } = getActionIcon(log.action)
          return (
            <div 
              key={log.id} 
              className={cn(
                "flex items-start justify-between p-5 rounded-3xl bg-muted/20 border border-border/20 hover:bg-muted/30 transition-all group",
                i === 0 && "border-primary/20 bg-primary/5"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 transition-transform group-hover:scale-110", bg, color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm leading-none">{formatActionName(log.action)}</h4>
                    {i === 0 && <span className="text-[8px] font-semibold px-1.5 py-0.5 bg-primary text-white rounded-md ">New</span>}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                    <Globe className="h-3 w-3" /> {log.ip_address} 
                    <span className="opacity-30">•</span> 
                    <Clock className="h-3 w-3" /> {isMounted ? formatTimeAgo(new Date(log.created_at)) : 'Loading...'}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                {log.user_agent.toLowerCase().includes('mobile') ? <Smartphone className="h-3.5 w-3.5" /> : <Laptop className="h-3.5 w-3.5" />}
                <span className="text-xs font-medium tracking-tighter">Verified</span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-center text-xs font-medium text-muted-foreground/40 pt-2">
        Showing last {logs.length} activities
      </p>
    </div>
  )
}
