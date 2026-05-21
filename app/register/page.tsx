'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Store, AlertCircle } from 'lucide-react'
import { signup } from '@/app/auth/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { SocialAuthButtons } from '@/components/SocialAuthButtons'

export default function Register() {
  const [state, formAction] = useActionState(signup, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-2xl shadow-sm border border-border/50">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Join Assetra to start buying and selling digital assets
          </p>
        </div>

        {state?.error && (
          <div className="bg-destructive/10 text-destructive flex items-center gap-2 p-3 rounded-lg text-sm font-medium">
            <AlertCircle className="h-4 w-4" />
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name"
                type="text" 
                placeholder="John Doe" 
                required 
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="name@example.com" 
                required 
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                className="h-11"
              />
            </div>
          </div>

          <SubmitButton className="w-full h-11 text-base" pendingText="Creating account...">
            Create Account
          </SubmitButton>
        </form>

        <SocialAuthButtons />

        <div className="text-center text-sm pt-4 border-t border-border/50">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
