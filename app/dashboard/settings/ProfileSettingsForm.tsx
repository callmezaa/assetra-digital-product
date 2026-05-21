'use client'

import { useState, useRef, useActionState, useEffect } from 'react'
import { Camera, Mail, AlertCircle, CheckCircle2, X, Terminal, Palette, Globe, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateProfile } from './actions'
import { SubmitButton } from '@/components/SubmitButton'
import { cn } from '@/lib/utils'
import MiniProfilePreview from './MiniProfilePreview'

export default function ProfileSettingsForm({ user, profile }: { user: any, profile: any }) {
  const [state, formAction] = useActionState(updateProfile, null)
  
  // Live states for preview
  const [fullName, setFullName] = useState(profile?.full_name || user.user_metadata?.full_name || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [twitter, setTwitter] = useState(profile?.twitter_url || '')
  const [github, setGithub] = useState(profile?.github_url || '')
  const [dribbble, setDribbble] = useState(profile?.dribbble_url || '')
  const [website, setWebsite] = useState(profile?.website_url || '')
  const [accentColor, setAccentColor] = useState(profile?.accent_color || '#4F46E5')
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null)
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(profile?.banner_url || null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const ACCENT_PRESETS = [
    { name: 'Indigo', value: '#4F46E5' },
    { name: 'Rose', value: '#E11D48' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Violet', value: '#8B5CF6' },
    { name: 'Sky', value: '#0EA5E9' },
  ]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
        return
      }
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Banner size must be less than 5MB')
        return
      }
      const url = URL.createObjectURL(file)
      setBannerPreviewUrl(url)
    }
  }

  // Fallback avatar URL if none exists
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${fullName || user.email}`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
      {/* Form Side */}
      <div className="lg:col-span-2 space-y-10">
        <form action={formAction} className="p-8 rounded-[2.5rem] bg-card border border-border/20 shadow-sm space-y-8">
          
          {/* Success/Error Alerts */}
          {state?.success && (
            <div className="bg-green-500/10 text-green-500 flex items-center gap-2 p-4 rounded-2xl text-sm font-medium border border-green-500/20 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-5 w-5" />
              {state.message}
            </div>
          )}
          {state?.error && (
            <div className="bg-destructive/10 text-destructive flex items-center gap-2 p-4 rounded-2xl text-sm font-medium border border-destructive/20 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5" />
              {state.error}
            </div>
          )}

          {/* Banner & Avatar Section */}
          <div className="space-y-6">
            <div className="relative group">
              <div 
                className="h-48 w-full rounded-[2.5rem] bg-muted border-2 border-dashed border-border/20 flex items-center justify-center overflow-hidden relative shadow-inner group-hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => bannerInputRef.current?.click()}
              >
                {bannerPreviewUrl ? (
                  <img 
                    src={bannerPreviewUrl} 
                    alt="Banner Preview" 
                    className="h-full w-full object-cover transition-opacity group-hover:opacity-60"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs font-semibold ">Upload Cover Banner</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <div className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold shadow-xl">
                    Change Banner
                  </div>
                </div>
              </div>
              <input 
                type="file" 
                name="banner"
                accept="image/*" 
                className="hidden" 
                ref={bannerInputRef}
                onChange={handleBannerChange}
                title="Upload cover banner"
                aria-label="Upload cover banner"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 px-8 relative z-10">
              <div className="relative group flex-shrink-0">
                <div className="h-32 w-32 rounded-[2.5rem] bg-background border-[6px] border-card overflow-hidden relative shadow-xl">
                  <img 
                    src={previewUrl || defaultAvatar} 
                    alt="Avatar Preview" 
                    className="h-full w-full object-cover transition-opacity group-hover:opacity-50"
                  />
                  <div 
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  name="avatar"
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  title="Upload profile picture"
                  aria-label="Upload profile picture"
                />
              </div>
              <div className="pb-2 text-center sm:text-left">
                <h3 className="font-semibold text-xl tracking-tight">Identity & Visuals</h3>
                <p className="text-xs font-semibold text-muted-foreground ">Avatar & Banner</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2 group">
              <label className="text-xs font-medium text-muted-foreground ml-1 ">Full Name</label>
              <Input 
                name="fullName"
                placeholder="e.g. John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-14 rounded-2xl bg-muted/20 border-border/20 focus:bg-background transition-all px-5 font-medium focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground ml-1 ">Username</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">@</span>
                <Input 
                  name="username"
                  placeholder="johndoe" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="h-14 rounded-2xl bg-muted/20 border-border/20 focus:bg-background transition-all pl-10 pr-5 font-medium focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground ml-1 ">Bio / About You</label>
              <textarea 
                name="bio"
                rows={4}
                placeholder="Tell your story and what you create..." 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-2xl bg-muted/20 border border-border/20 focus:bg-background transition-all p-5 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
              />
              <div className="flex justify-between items-center px-1">
                <p className="text-xs font-medium text-muted-foreground italic leading-relaxed">
                  Max 200 characters. Keep it punchy!
                </p>
                <span className={cn(
                  "text-xs font-medium",
                  bio.length > 180 ? "text-orange-500" : "text-muted-foreground/50"
                )}>
                  {bio.length}/200
                </span>
              </div>
            </div>
            
            {/* Social Presence Hub */}
            <div className="md:col-span-2 pt-6 border-t border-border/20 space-y-6">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold ">Social Presence Hub</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground ml-1 tracking-tighter">X / Twitter</label>
                  <div className="relative">
                    <X className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      name="twitterUrl"
                      placeholder="twitter.com/johndoe" 
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="h-12 rounded-xl bg-muted/20 border-border/20 pl-10 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground ml-1 tracking-tighter">GitHub Portfolio</label>
                  <div className="relative">
                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      name="githubUrl"
                      placeholder="github.com/johndoe" 
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="h-12 rounded-xl bg-muted/20 border-border/20 pl-10 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground ml-1 tracking-tighter">Dribbble / Showcase</label>
                  <div className="relative">
                    <Palette className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      name="dribbbleUrl"
                      placeholder="dribbble.com/johndoe" 
                      value={dribbble}
                      onChange={(e) => setDribbble(e.target.value)}
                      className="h-12 rounded-xl bg-muted/20 border-border/20 pl-10 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground ml-1 tracking-tighter">Personal Website</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      name="websiteUrl"
                      placeholder="www.johndoe.com" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="h-12 rounded-xl bg-muted/20 border-border/20 pl-10 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Accent Color Customization */}
            <div className="md:col-span-2 pt-6 border-t border-border/20 space-y-6">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold ">Shop Accent Color</h3>
              </div>

              <div className="flex flex-wrap gap-4 p-6 rounded-[2.5rem] bg-muted/30 border border-border/20">
                <input type="hidden" name="accentColor" value={accentColor} />
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setAccentColor(preset.value)}
                    className={cn(
                      "group relative h-12 w-12 rounded-2xl transition-all duration-300 active:scale-90",
                      accentColor === preset.value ? "ring-4 ring-offset-4 ring-offset-background" : "hover:scale-110"
                    )}
                    style={{ 
                      '--accent-bg': preset.value,
                      '--accent-shadow': accentColor === preset.value ? `0 10px 25px -5px ${preset.value}80` : 'none',
                      '--ring-color': preset.value,
                      backgroundColor: 'var(--accent-bg)',
                      boxShadow: 'var(--accent-shadow)'
                    } as React.CSSProperties}
                    title={preset.name}
                    aria-label={`Select ${preset.name} color`}
                  >
                    {accentColor === preset.value && (
                      <CheckCircle2 className="h-5 w-5 text-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
                
                {/* Custom Color Input */}
                <div className="h-12 flex-1 min-w-[120px] rounded-2xl bg-background border border-border/20 flex items-center px-4 gap-3">
                  <div className="h-6 w-6 rounded-lg border border-border/20 overflow-hidden relative">
                    <input 
                      type="color" 
                      value={accentColor} 
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="absolute -inset-2 w-12 h-12 cursor-pointer"
                      title="Custom accent color"
                      aria-label="Pick a custom accent color"
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground/60">Custom Hex</span>
                  <span className="text-xs font-medium ml-auto ">{accentColor}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2 opacity-60 pt-6 border-t border-border/20">
              <label className="text-xs font-medium text-muted-foreground ml-1 ">Contact Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input 
                  disabled
                  value={user.email}
                  className="h-14 rounded-2xl bg-muted/50 border-border/20 pl-12 font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border/20 flex justify-end">
            <SubmitButton className="rounded-2xl h-12 px-8 font-medium shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95" pendingText="Saving Changes...">
              Save Profile
            </SubmitButton>
          </div>
        </form>
      </div>

      {/* Preview Side */}
      <div className="hidden lg:block">
        <MiniProfilePreview 
          fullName={fullName}
          username={username}
          bio={bio}
          avatarUrl={previewUrl}
          socialLinks={{
            twitter,
            github,
            dribbble,
            website
          }}
          bannerUrl={bannerPreviewUrl}
          accentColor={accentColor}
        />
      </div>
    </div>
  )
}
