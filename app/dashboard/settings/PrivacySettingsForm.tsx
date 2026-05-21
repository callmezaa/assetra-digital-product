'use client'

import { useActionState } from 'react'
import { EyeOff, Search, BadgeCheck, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import { updatePrivacySettings } from './actions'
import { cn } from '@/lib/utils'
import { SubmitButton } from '@/components/SubmitButton'

interface PrivacySettingsFormProps {
  profile: any
}

export default function PrivacySettingsForm({ profile }: PrivacySettingsFormProps) {
  const [state, action] = useActionState(updatePrivacySettings, null)

  const SETTINGS = [
    { 
      id: 'hideSales', 
      name: 'Hide Total Sales', 
      desc: 'Do not show the total number of sales on your public profile.',
      icon: EyeOff,
      defaultChecked: profile?.hide_sales
    },
    { 
      id: 'isPrivateProfile', 
      name: 'Private Profile (SEO)', 
      desc: 'Tell search engines not to index your profile page.',
      icon: Search,
      defaultChecked: profile?.is_private_profile
    },
    { 
      id: 'showVerifiedBadge', 
      name: 'Show Verified Badge', 
      desc: 'Display your verification status to build trust with buyers.',
      icon: BadgeCheck,
      defaultChecked: profile?.show_verified_badge
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SETTINGS.map((item) => (
          <label 
            key={item.id}
            className="flex items-start justify-between p-6 rounded-3xl bg-muted/20 border border-border/20 hover:bg-muted/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            </div>
            <div className="relative inline-flex items-center cursor-pointer mt-1">
              <input 
                type="checkbox" 
                name={item.id} 
                defaultChecked={item.defaultChecked}
                className="sr-only peer" 
              />
              <div className="w-10 h-5 bg-muted-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-medium ">Privacy Protected</span>
        </div>
        <SubmitButton className="rounded-xl px-8 font-semibold text-xs shadow-xl shadow-primary/10">
          Save Privacy Settings
        </SubmitButton>
      </div>
    </form>
  )
}
