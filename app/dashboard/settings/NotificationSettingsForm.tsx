'use client'

import { useActionState } from 'react'
import { Bell, ShoppingBag, Calendar, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { updateNotificationSettings } from './actions'
import { cn } from '@/lib/utils'
import { SubmitButton } from '@/components/SubmitButton'

interface NotificationSettingsFormProps {
  profile: any
}

export default function NotificationSettingsForm({ profile }: NotificationSettingsFormProps) {
  const [state, action] = useActionState(updateNotificationSettings, null)

  const PREFERENCES = [
    { 
      id: 'emailOnSale', 
      name: 'Sales Alerts', 
      desc: 'Get an instant email whenever someone purchases your assets.',
      icon: ShoppingBag,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      defaultChecked: profile?.email_on_sale
    },
    { 
      id: 'emailWeeklySummary', 
      name: 'Weekly Summary', 
      desc: 'Receive a weekly digest of your shop performance and earnings.',
      icon: Calendar,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      defaultChecked: profile?.email_weekly_summary
    },
    { 
      id: 'emailOnFollower', 
      name: 'New Followers', 
      desc: 'Be notified when a new creator or buyer follows your shop.',
      icon: UserPlus,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      defaultChecked: profile?.email_on_follower
    },
  ]

  return (
    <form action={action} className="p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-sm space-y-8">
      {state?.success && (
        <div className="bg-green-500/10 text-green-500 flex items-center gap-2 p-4 rounded-2xl text-sm font-medium border border-green-500/20">
          <CheckCircle2 className="h-5 w-5" />
          {state.message}
        </div>
      )}
      {state?.error && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-2 p-4 rounded-2xl text-sm font-medium border border-destructive/20">
          <AlertCircle className="h-5 w-5" />
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        {PREFERENCES.map((item) => (
          <label 
            key={item.id}
            className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border/20 hover:bg-muted/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110", item.bg, item.color)}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name={item.id} 
                defaultChecked={item.defaultChecked}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-muted-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <SubmitButton className="rounded-xl px-10 font-semibold text-xs shadow-xl shadow-primary/10">
          Update Preferences
        </SubmitButton>
      </div>
    </form>
  )
}
