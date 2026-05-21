'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { CreditCard, DollarSign, Loader2, AlertCircle } from 'lucide-react'
import { requestPayout } from '@/app/dashboard/wallet/actions'

export default function PayoutRequestModal({ availableBalance }: { availableBalance: number }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(requestPayout, null)

  // Close dialog on success
  if (state?.success && open) {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button 
            disabled={availableBalance < 10}
            className="rounded-2xl h-12 px-6 shadow-xl shadow-primary/25 gap-2 font-medium transition-all hover:scale-105 active:scale-95"
          />
        }
      >
        <DollarSign className="h-5 w-5" />
        Request Payout
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-border/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">Request Payout</DialogTitle>
          <DialogDescription className="font-medium">
            Withdraw your earnings to your preferred payment method.
          </DialogDescription>
        </DialogHeader>

        {state?.error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-xl flex items-center gap-2 text-xs font-medium">
            <AlertCircle className="h-4 w-4" />
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-medium text-xs text-muted-foreground">Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  min="10" 
                  max={availableBalance}
                  placeholder="0.00"
                  className="pl-10 h-12 rounded-xl border-border/20 bg-muted/30 font-medium"
                  required
                />
              </div>
              <p className="text-xs font-medium text-muted-foreground px-1">
                Available: ${availableBalance.toFixed(2)} (Min. $10.00)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method" className="font-medium text-xs text-muted-foreground">Payment Method</Label>
              <select 
                id="method" 
                name="method"
                title="Select Payment Method"
                className="w-full h-12 rounded-xl border border-border/20 bg-muted/30 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="Paypal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="GoPay">GoPay / E-Wallet</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details" className="font-medium text-xs text-muted-foreground">Account Details</Label>
              <Input 
                id="details" 
                name="details" 
                placeholder="Email or Account Number" 
                className="h-12 rounded-xl border-border/20 bg-muted/30 font-medium"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-12 rounded-xl font-medium shadow-lg shadow-primary/20 gap-2"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CreditCard className="h-5 w-5" />
            )}
            Confirm Withdrawal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
