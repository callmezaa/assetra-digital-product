'use client'

import { useState, useActionState } from 'react'
import { Lock, Shield, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, Loader2, Trash2, Monitor, Smartphone, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updatePassword, deleteAccount, getMFAStatus, enrollMFA, verifyMFA, unenrollMFA, signOutOthers } from './actions'
import { cn } from '@/lib/utils'
import { SubmitButton } from '@/components/SubmitButton'
import { useEffect } from 'react'

export default function SecuritySettingsForm() {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordState, passwordAction] = useActionState(updatePassword, null)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // MFA States
  const [mfaStatus, setMfaStatus] = useState<{ enabled: boolean, factorId?: string } | null>(null)
  const [isEnrollingMfa, setIsEnrollingMfa] = useState(false)
  const [mfaEnrollData, setMfaEnrollData] = useState<{ id: string, totp: { qr_code: string, secret: string } } | null>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaError, setMfaError] = useState<string | null>(null)

  // Session States
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchMfaStatus()
  }, [])

  const fetchMfaStatus = async () => {
    const status = await getMFAStatus()
    if (status && 'enabled' in status) {
      setMfaStatus({ 
        enabled: status.enabled as boolean, 
        factorId: status.factorId as string | undefined 
      })
    } else if (status && 'error' in status) {
      setMfaError(status.error as string)
    }
  }

  const handleEnroll = async () => {
    setMfaLoading(true)
    setMfaError(null)
    const data = await enrollMFA()
    if ('error' in data) {
      setMfaError(data.error as string)
    } else {
      setMfaEnrollData(data as any)
      setIsEnrollingMfa(true)
    }
    setMfaLoading(false)
  }

  const handleVerify = async () => {
    if (!mfaEnrollData) return
    setMfaLoading(true)
    setMfaError(null)
    const result = await verifyMFA(mfaEnrollData.id, mfaCode)
    if ('error' in result) {
      setMfaError(result.error as string)
    } else {
      setIsEnrollingMfa(false)
      setMfaEnrollData(null)
      setMfaCode('')
      fetchMfaStatus()
    }
    setMfaLoading(false)
  }

  const handleUnenroll = async () => {
    if (!mfaStatus?.factorId) return
    if (!confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) return
    setMfaLoading(true)
    const result = await unenrollMFA(mfaStatus.factorId)
    if ('error' in result) {
      setMfaError(result.error as string)
    } else {
      fetchMfaStatus()
    }
    setMfaLoading(false)
  }

  const handleSignOutOthers = async () => {
    setSessionLoading(true)
    setSessionMessage(null)
    const result = await signOutOthers()
    if ('error' in result) {
      setSessionMessage(result.error as string)
    } else {
      setSessionMessage(result.message as string)
      setTimeout(() => setSessionMessage(null), 5000)
    }
    setSessionLoading(false)
  }

  return (
    <div className="space-y-12">
      {/* Account Security Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-medium tracking-tight">Account Security</h2>
        </div>
        
        <div className="p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-sm space-y-6">
          {/* Password Management */}
          <div className="space-y-4">
            <div 
              className={cn(
                "flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border/20 group transition-all cursor-pointer",
                isChangingPassword ? "bg-muted/40 border-primary/20" : "hover:bg-muted/30"
              )}
              onClick={() => !isChangingPassword && setIsChangingPassword(true)}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Password Management</h3>
                  <p className="text-xs text-muted-foreground">Update your password to keep your account safe.</p>
                </div>
              </div>
              <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isChangingPassword && "rotate-90")} />
            </div>

            {isChangingPassword && (
              <div className="p-8 rounded-3xl bg-muted/10 border border-border/30 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <form action={passwordAction} className="space-y-6">
                  {passwordState?.success && (
                    <div className="bg-green-500/10 text-green-500 flex items-center gap-2 p-4 rounded-2xl text-sm font-medium border border-green-500/20">
                      <CheckCircle2 className="h-5 w-5" />
                      {passwordState.message}
                    </div>
                  )}
                  {passwordState?.error && (
                    <div className="bg-destructive/10 text-destructive flex items-center gap-2 p-4 rounded-2xl text-sm font-medium border border-destructive/20">
                      <AlertCircle className="h-5 w-5" />
                      {passwordState.error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground ml-1 ">New Password</label>
                      <Input 
                        name="password"
                        type="password"
                        placeholder="••••••••" 
                        className="h-12 rounded-xl bg-background border-border/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground ml-1 ">Confirm Password</label>
                      <Input 
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••" 
                        className="h-12 rounded-xl bg-background border-border/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="rounded-xl font-medium"
                      onClick={() => setIsChangingPassword(false)}
                    >
                      Cancel
                    </Button>
                    <SubmitButton className="rounded-xl px-8 font-medium" pendingText="Updating...">
                      Update Password
                    </SubmitButton>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <div 
              className={cn(
                "flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border/20 group transition-all",
                mfaStatus?.enabled ? "border-green-500/20" : "hover:bg-muted/30 cursor-pointer"
              )}
              onClick={() => !mfaStatus?.enabled && !isEnrollingMfa && handleEnroll()}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors",
                  mfaStatus?.enabled ? "bg-green-500/10 text-green-500" : "bg-white text-muted-foreground group-hover:text-primary"
                )}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-xs text-muted-foreground">
                    {mfaStatus?.enabled 
                      ? "Your account is protected with an additional security layer." 
                      : "Add an extra layer of security via Authenticator app."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {mfaStatus?.enabled ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive font-medium text-xs hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnenroll()
                    }}
                    disabled={mfaLoading}
                  >
                    Disable 2FA
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    {mfaLoading && !isEnrollingMfa ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : (
                      <>
                        <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-lg tracking-wider">RECOMMENDED</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEnrollingMfa && mfaEnrollData && (
              <div className="p-8 rounded-3xl bg-muted/10 border border-border/30 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="bg-white p-4 rounded-2xl shadow-xl border border-border/20 flex-shrink-0">
                    <img 
                      src={mfaEnrollData.totp.qr_code} 
                      alt="MFA QR Code" 
                      className="h-40 w-40"
                    />
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm tracking-tight">Scan QR Code</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        Open your authenticator app (like Google Authenticator or Authy) and scan the QR code. 
                        If you can't scan, enter the secret key manually.
                      </p>
                      <div className="mt-4 p-3 bg-background rounded-xl border border-border/20 font-mono text-xs select-all cursor-copy break-all">
                        {mfaEnrollData.totp.secret}
                      </div>
                    </div>

                    {mfaError && (
                      <div className="bg-destructive/10 text-destructive flex items-center gap-2 p-4 rounded-2xl text-sm font-medium border border-destructive/20">
                        <AlertCircle className="h-5 w-5" />
                        {mfaError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground ml-1 ">Verification Code</label>
                        <Input 
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          placeholder="000000" 
                          className="h-12 rounded-xl bg-background border-border/20 text-center text-lg font-semibold tracking-[0.5em]"
                          maxLength={6}
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="rounded-xl font-medium flex-1"
                          onClick={() => {
                            setIsEnrollingMfa(false)
                            setMfaEnrollData(null)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="rounded-xl px-8 font-medium flex-1"
                          onClick={handleVerify}
                          disabled={mfaCode.length !== 6 || mfaLoading}
                        >
                          {mfaLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Verify & Enable
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Session Management Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Smartphone className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-medium tracking-tight">Active Sessions</h2>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 rounded-3xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-primary">
                  <Monitor className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">Current Session</h3>
                    <span className="px-1.5 py-0.5 rounded-md bg-primary text-[8px] font-semibold text-white tracking-wider">Active Now</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Your current device and browser.</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-muted/20 border border-border/20 space-y-6">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Other Devices</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If you think your account is being used on another device, you can sign out of all other active sessions here.
                </p>
              </div>

              {sessionMessage && (
                <div className={cn(
                  "p-4 rounded-2xl text-xs font-medium border animate-in fade-in zoom-in-95",
                  sessionMessage.includes('Successfully') ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                )}>
                  {sessionMessage}
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl font-medium gap-2 border-border/20 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all"
                onClick={handleSignOutOthers}
                disabled={sessionLoading}
              >
                {sessionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Sign Out from All Other Devices
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-6 pb-12">
        <div className="flex items-center gap-3 px-2">
          <Trash2 className="h-5 w-5 text-destructive" />
          <h2 className="text-xl font-medium tracking-tight">Danger Zone</h2>
        </div>
        
        <div className="p-8 rounded-[2.5rem] bg-destructive/5 border border-destructive/20 space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium text-destructive">Delete Account</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Once you delete your account, there is no going back. All your products, earnings history, and assets will be permanently removed. 
              Please download your data before proceeding.
            </p>
          </div>

          {!isDeletingAccount ? (
            <Button 
              variant="destructive" 
              className="rounded-xl px-8 font-medium shadow-lg shadow-destructive/10 hover:scale-105 transition-all"
              onClick={() => setIsDeletingAccount(true)}
            >
              Delete Permanently
            </Button>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-destructive/20 space-y-4 animate-in zoom-in-95 duration-300">
              <p className="text-sm font-medium text-destructive">Are you absolutely sure? This action cannot be undone.</p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="rounded-xl px-6 font-medium flex-1"
                  onClick={() => setIsDeletingAccount(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="rounded-xl px-6 font-medium flex-1"
                  onClick={() => deleteAccount()}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
