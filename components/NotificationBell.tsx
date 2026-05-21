'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, ShoppingBag, UserPlus, Star, Check, X, Settings2, Sparkles, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { getNotifications, markAllAsRead } from '@/app/notifications/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Notification = {
  id: string
  user_id: string
  type: 'purchase' | 'follow' | 'review'
  title: string
  message: string
  is_read: boolean
  metadata: Record<string, unknown>
  created_at: string
}

const typeConfig = {
  purchase: {
    icon: ShoppingBag,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    label: 'Sale'
  },
  follow: {
    icon: UserPlus,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    label: 'Follow'
  },
  review: {
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    label: 'Review'
  }
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

function getNotificationLink(notif: Notification) {
  switch (notif.type) {
    case 'purchase': return '/dashboard/wallet'
    case 'follow': return notif.metadata?.follower_username ? `/seller/${notif.metadata.follower_username}` : '#'
    case 'review': return notif.metadata?.product_id ? `/product/${notif.metadata.product_id}` : '#'
    default: return '#'
  }
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'social'>('all')
  const [showSettings, setShowSettings] = useState(false)
  const [prefs, setPrefs] = useState({
    purchase: true,
    review: true,
    follow: true,
  })
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('notification_prefs')
    if (saved) {
      try {
        setPrefs(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  const handlePrefChange = (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] }
    setPrefs(newPrefs)
    localStorage.setItem('notification_prefs', JSON.stringify(newPrefs))
  }

  const filteredNotifications = notifications.filter(notif => {
    if (notif.type === 'purchase' && !prefs.purchase) return false
    if (notif.type === 'review' && !prefs.review) return false
    if (notif.type === 'follow' && !prefs.follow) return false

    if (activeTab === 'sales') return notif.type === 'purchase'
    if (activeTab === 'social') return notif.type === 'follow' || notif.type === 'review'
    return true
  })

  // Smart Aggregation Logic
  type AggregatedNotification = {
    id: string
    type: Notification['type']
    is_read: boolean
    items: Notification[]
    created_at: string
  }

  const aggregatedNotifications: AggregatedNotification[] = []
  let currentGroup: AggregatedNotification | null = null

  for (const notif of filteredNotifications) {
    if (
      currentGroup && 
      currentGroup.type === notif.type && 
      currentGroup.type === 'follow' && 
      new Date(currentGroup.created_at).getTime() - new Date(notif.created_at).getTime() < 86400000 // within 24 hours
    ) {
      currentGroup.items.push(notif)
      if (!notif.is_read) currentGroup.is_read = false
    } else {
      if (currentGroup) aggregatedNotifications.push(currentGroup)
      currentGroup = {
        id: notif.id,
        type: notif.type,
        is_read: notif.is_read,
        items: [notif],
        created_at: notif.created_at
      }
    }
  }
  if (currentGroup) aggregatedNotifications.push(currentGroup)

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    const data = await getNotifications()
    setNotifications(data as Notification[])
    setUnreadCount((data as Notification[]).filter(n => !n.is_read).length)
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Subscribe to real-time notifications
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotif = payload.new as Notification
          setNotifications(prev => [newNotif, ...prev].slice(0, 20))
          setUnreadCount(prev => prev + 1)

          // Trigger bell animation
          setIsAnimating(true)
          setTimeout(() => setIsAnimating(false), 1000)

          // Trigger In-App Toast Alerts
          if (newNotif.type === 'purchase') {
            toast.success('🎉 Cha-ching! You just made a sale!', {
              description: newNotif.title,
              duration: 5000,
            })
          } else if (newNotif.type === 'review') {
            toast('⭐ New Review Received', {
              description: newNotif.message,
              duration: 4000,
            })
          } else if (newNotif.type === 'follow') {
            toast.info('👋 New Follower!', {
              description: newNotif.title,
              duration: 4000,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl transition-all duration-300 outline-none group border",
          isOpen 
            ? "bg-primary/10 border-primary/20 text-primary" 
            : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50 hover:border-border/50"
        )}
        aria-label="Toggle notifications"
      >
        <Bell
          className={cn(
            "h-[18px] w-[18px] md:h-5 md:w-5 transition-transform duration-300",
            isAnimating ? "animate-wiggle" : "",
            isOpen ? "text-primary" : "group-hover:text-foreground"
          )}
        />

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] px-1 md:px-1.5 rounded-full bg-red-500 text-white text-[9px] md:text-[10px] font-black border-2 border-background shadow-lg"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={cn(
              "fixed inset-x-4 top-24 md:absolute md:inset-auto md:right-0 md:top-14 md:w-[400px]",
              "bg-card/98 backdrop-blur-3xl border border-border/50 rounded-[2rem] md:rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden z-[100] origin-top md:origin-top-right",
              "before:absolute before:inset-0 before:p-[1px] before:rounded-[inherit] before:bg-gradient-to-b before:from-border/50 before:to-transparent before:-z-10",
              "after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/[0.03] after:to-transparent after:pointer-events-none after:-z-10"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 md:px-6 md:py-5 border-b border-border/10 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-base tracking-tight text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    showSettings 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  title="Notification Settings"
                  aria-label="Settings"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-300"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-200px)] md:max-h-[500px] overflow-y-auto scrollbar-hide">
              {showSettings ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 md:p-6 space-y-8"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground pb-2 border-b border-border/10">
                    <Settings2 className="h-3 w-3" />
                    Delivery preferences
                  </div>
                  <div className="space-y-7">
                    {[
                      { key: 'purchase', label: 'Sales & Earnings', desc: 'Get notified when someone buys your product.', icon: ShoppingBag, color: 'text-emerald-500' },
                      { key: 'review', label: 'Product Reviews', desc: 'Get notified when a buyer leaves a review.', icon: Star, color: 'text-amber-500' },
                      { key: 'follow', label: 'New Followers', desc: 'Get notified when someone follows your store.', icon: UserPlus, color: 'text-blue-500' }
                    ].map((pref) => (
                      <div key={pref.key} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2.5 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors", pref.color)}>
                            <pref.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{pref.label}</p>
                            <p className="text-[11px] text-muted-foreground font-medium">{pref.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={prefs[pref.key as keyof typeof prefs]} 
                            onChange={() => handlePrefChange(pref.key as keyof typeof prefs)} 
                            aria-label={`Toggle ${pref.label} notifications`}
                          />
                          <div className="w-10 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full py-3 rounded-2xl bg-muted/50 hover:bg-muted text-xs font-bold transition-all mt-4 border border-border/10"
                  >
                    Back to notifications
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Filters */}
                  <div className="flex items-center gap-2 px-4 md:px-6 py-4 bg-background sticky top-0 z-10 border-b border-border/5">
                    <Filter className="h-3 w-3 text-muted-foreground mr-1 hidden sm:block" />
                    {(['all', 'sales', 'social'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "px-3 md:px-4 py-1.5 rounded-xl text-[10px] md:text-[11px] font-bold capitalize transition-all relative",
                          activeTab === tab 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="ml-auto text-[10px] font-bold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                      >
                        <Check className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        <span className="hidden xs:inline">Mark all as read</span>
                        <span className="xs:hidden">Mark all</span>
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="divide-y divide-border/5">
                    {aggregatedNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                        <div className="p-5 rounded-3xl bg-muted/30 mb-5 relative group">
                          <Bell className="h-10 w-10 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
                          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary/40 animate-pulse" />
                        </div>
                        <h4 className="font-bold text-sm text-foreground">Inbox Empty</h4>
                        <p className="text-[11px] text-muted-foreground mt-1.5 max-w-[200px]">We'll let you know when something important happens.</p>
                      </div>
                    ) : (
                      aggregatedNotifications.map((group, index) => {
                        const notif = group.items[0]
                        const count = group.items.length
                        const config = typeConfig[notif.type as keyof typeof typeConfig]
                        const Icon = config.icon

                        let title = notif.title
                        let message = notif.message

                        if (count > 1 && notif.type === 'follow') {
                          const firstFollower = notif.metadata?.follower_username || 'Someone'
                          title = `${firstFollower} and ${count - 1} others followed you`
                        }

                        return (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={group.id}
                          >
                            <Link
                              href={getNotificationLink(notif)}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-start gap-3 md:gap-4 px-4 py-4 md:px-6 md:py-5 transition-all duration-300 group relative",
                                "hover:scale-[1.01] active:scale-[0.99]",
                                !group.is_read ? "bg-primary/[0.05] hover:bg-primary/[0.08]" : "hover:bg-muted/50"
                              )}
                            >
                              {!group.is_read && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                              )}
                              
                              {/* Avatar/Thumbnail */}
                              <div className="relative flex-shrink-0">
                                <div className={cn(
                                  "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden border border-border/20 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                                  config.bg
                                )}>
                                  {notif.metadata?.product_thumbnail ? (
                                    <img src={notif.metadata.product_thumbnail as string} alt="" className="w-full h-full object-cover" />
                                  ) : (notif.metadata?.follower_avatar || notif.metadata?.reviewer_avatar) ? (
                                    <img 
                                      src={(notif.metadata?.follower_avatar || notif.metadata?.reviewer_avatar) as string} 
                                      alt="" 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : notif.metadata?.follower_username || notif.metadata?.reviewer_username ? (
                                    <img 
                                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${notif.metadata?.follower_username || notif.metadata?.reviewer_username}`} 
                                      alt="" 
                                      className="w-full h-full object-cover bg-background" 
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Icon className={cn("h-5 w-5", config.color)} />
                                    </div>
                                  )}
                                </div>
                                {count > 1 && (
                                  <div className="absolute -bottom-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-lg bg-primary text-primary-foreground text-[8px] md:text-[9px] font-black flex items-center justify-center border-2 border-background shadow-lg">
                                    +{count - 1}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={cn(
                                    "text-sm tracking-tight truncate transition-colors",
                                    !group.is_read ? "font-bold text-foreground" : "font-semibold text-foreground/80 group-hover:text-foreground"
                                  )}>
                                    {title}
                                  </p>
                                  <span className="text-[10px] text-muted-foreground/40 font-bold whitespace-nowrap">
                                    {timeAgo(notif.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-medium">
                                  {message}
                                </p>
                                
                                <div className="flex items-center gap-3 mt-3">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[9px] font-bold border",
                                    config.bg, config.color, "border-current/10"
                                  )}>
                                    {config.label}
                                  </span>
                                  {notif.type === 'follow' && !group.is_read && (
                                    <button 
                                      className="text-[9px] md:text-[10px] font-bold text-primary hover:underline"
                                      onClick={(e) => e.preventDefault()}
                                    >
                                      Follow back
                                    </button>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-4 bg-muted/5 border-t border-border/5 text-center">
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsOpen(false)}
                        className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
                      >
                        View full history
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

