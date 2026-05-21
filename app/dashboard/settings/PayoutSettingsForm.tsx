'use client'

import { useState, useActionState } from 'react'
import { CreditCard, Landmark, Mail, AlertCircle, CheckCircle2, Wallet, ArrowRight, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updatePayoutSettings } from './actions'
import { cn } from '@/lib/utils'
import { SubmitButton } from '@/components/SubmitButton'

interface PayoutSettingsFormProps {
  profile: any
}

export default function PayoutSettingsForm({ profile }: PayoutSettingsFormProps) {
  const [state, action] = useActionState(updatePayoutSettings, null)
  const [method, setMethod] = useState(profile?.payout_method || 'none')

  const METHODS = [
    { id: 'stripe', name: 'Stripe', icon: CreditCard, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'paypal', name: 'PayPal', icon: Mail, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'bank', name: 'Bank Transfer', icon: Landmark, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ]

  const statusColors = {
    verified: 'bg-green-500/10 text-green-500 border-green-500/20',
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    unconfigured: 'bg-muted text-muted-foreground border-border/20'
  }

  return (
    <div className="p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-sm space-y-8">
      {/* Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-muted/20 border border-border/20">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-background flex items-center justify-center shadow-xl shadow-primary/5 text-primary border border-primary/10">
            <Wallet className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-semibold text-lg tracking-tight">Payout Status</h3>
            <p className="text-xs text-muted-foreground font-medium">Manage where you receive your earnings.</p>
          </div>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 self-start md:self-center",
          statusColors[profile?.payout_status as keyof typeof statusColors] || statusColors.unconfigured
        )}>
          {profile?.payout_status === 'verified' && <CheckCircle2 className="h-3 w-3" />}
          {profile?.payout_status === 'pending' && <AlertCircle className="h-3 w-3" />}
          {profile?.payout_status || 'Unconfigured'}
        </div>
      </div>

      <form action={action} className="space-y-8">
        {state?.success && (
          <div className="bg-green-500/10 text-green-500 flex items-center gap-2 p-4 rounded-2xl text-sm font-medium border border-green-500/20 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="h-5 w-5" />
            {state.message}
          </div>
        )}
        {state?.error && (
          <div className="bg-destructive/10 text-destructive flex items-center gap-2 p-4 rounded-2xl text-sm font-medium border border-destructive/20 animate-in fade-in zoom-in-95">
            <AlertCircle className="h-5 w-5" />
            {state.error}
          </div>
        )}

        {/* Method Selection */}
        <div className="space-y-4">
          <label className="text-xs font-semibold text-muted-foreground ml-1 ">Select Payout Method</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="hidden" name="payoutMethod" value={method} />
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden group",
                  method === m.id 
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                    : "border-border/20 hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", m.bg, m.color)}>
                  <m.icon className="h-6 w-6" />
                </div>
                <span className="font-medium text-sm">{m.name}</span>
                {method === m.id && (
                  <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields Based on Method */}
        {method !== 'none' && (
          <div className="space-y-6 p-8 rounded-[2.5rem] bg-muted/30 border border-border/20 animate-in fade-in slide-in-from-top-4 duration-500">
            {method === 'bank' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground ml-1 ">Bank Name</label>
                  <Input 
                    name="bankName"
                    placeholder="e.g. Bank Central Asia" 
                    defaultValue={profile?.bank_name}
                    className="h-12 rounded-xl bg-background border-border/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground ml-1 ">Account Number</label>
                  <Input 
                    name="accountNumber"
                    placeholder="0000 0000 0000" 
                    defaultValue={profile?.account_number}
                    className="h-12 rounded-xl bg-background border-border/20"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground ml-1 ">{method === 'stripe' ? 'Stripe Connect Email' : 'PayPal Email'}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    name="payoutEmail"
                    type="email"
                    placeholder="email@example.com" 
                    defaultValue={profile?.payout_email}
                    className="h-12 rounded-xl bg-background border-border/20 pl-11"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-xs text-primary/80 leading-relaxed font-medium">
                Your payout information is encrypted and securely stored. We only use these details to process your earnings. Verification usually takes 1-2 business days.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <SubmitButton className="rounded-xl px-10 h-12 font-semibold shadow-xl shadow-primary/10 transition-all hover:scale-105 active:scale-95">
            Save Payout Settings
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
