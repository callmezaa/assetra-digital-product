'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Store, AlertCircle } from 'lucide-react'
import { login } from '@/app/auth/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { SocialAuthButtons } from '@/components/SocialAuthButtons'

export default function Login() {
  const [state, formAction] = useActionState(login, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-2xl shadow-sm border border-border/50">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your credentials to access your account
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                className="h-11"
              />
            </div>
          </div>

          <SubmitButton className="w-full h-11 text-base" pendingText="Signing in...">
            Sign In
          </SubmitButton>
        </form>

        <SocialAuthButtons />

        <div className="text-center text-sm pt-4 border-t border-border/50">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
