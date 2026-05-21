'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, MapPin, Globe, ExternalLink, ShieldCheck, X, Terminal, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MiniProfilePreviewProps {
  fullName: string
  username: string
  bio: string
  avatarUrl: string | null
  socialLinks?: {
    twitter?: string
    github?: string
    dribbble?: string
    website?: string
  }
  bannerUrl?: string | null
  accentColor?: string
}

export default function MiniProfilePreview({ fullName, username, bio, avatarUrl, socialLinks, bannerUrl, accentColor = '#4F46E5' }: MiniProfilePreviewProps) {
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${fullName || 'User'}`

  const hasSocials = socialLinks && (socialLinks.twitter || socialLinks.github || socialLinks.dribbble || socialLinks.website)

  return (
    <div className="sticky top-28 space-y-4">
      <div className="flex items-center gap-2 px-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground">Live Public Preview</span>
      </div>
      
      <motion.div 
        layout
        className="w-full bg-card border border-border/20 rounded-[2.5rem] overflow-hidden shadow-xl shadow-primary/5 group"
      >
        {/* Banner Mockup */}
        <div 
          className="h-28 bg-muted relative overflow-hidden transition-all duration-500"
          style={{ backgroundColor: bannerUrl ? 'transparent' : `${accentColor}10` }}
        >
          {bannerUrl ? (
            <img 
              src={bannerUrl} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="absolute inset-0 opacity-20"
              style={{ 
                backgroundImage: `radial-gradient(circle at 2px 2px, ${accentColor} 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-8 -mt-10 relative text-center sm:text-left">
          {/* Avatar & Social Floating Bar */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
            <div className="h-20 w-20 rounded-[1.75rem] bg-background border-4 border-card overflow-hidden shadow-lg mx-auto sm:mx-0">
              <img 
                src={avatarUrl || defaultAvatar} 
                alt={fullName} 
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Social Icons Bar */}
            <div className="flex items-center gap-1 bg-muted/50 p-1.5 rounded-2xl border border-border/20 mx-auto sm:mx-0">
              <div className={cn("p-1.5 rounded-lg transition-colors", socialLinks?.twitter ? "text-sky-500 bg-sky-500/10" : "text-muted-foreground/30")}>
                <X className="h-3.5 w-3.5" />
              </div>
              <div className={cn("p-1.5 rounded-lg transition-colors", socialLinks?.github ? "text-foreground bg-foreground/10" : "text-muted-foreground/30")}>
                <Terminal className="h-3.5 w-3.5" />
              </div>
              <div className={cn("p-1.5 rounded-lg transition-colors", socialLinks?.dribbble ? "text-pink-500 bg-pink-500/10" : "text-muted-foreground/30")}>
                <Palette className="h-3.5 w-3.5" />
              </div>
              <div className={cn("p-1.5 rounded-lg transition-colors", socialLinks?.website ? "text-primary bg-primary/10" : "text-muted-foreground/30")}>
                <Globe className="h-3.5 w-3.5" style={{ color: socialLinks?.website ? accentColor : undefined }} />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 justify-center sm:justify-start">
              <h3 className="text-lg font-semibold tracking-tight leading-none">{fullName || 'Your Name'}</h3>
              <CheckCircle2 className="h-4 w-4 text-primary fill-primary/10" />
            </div>
            <p className="text-xs font-medium tracking-wide" style={{ color: accentColor }}>@{username || 'username'}</p>
          </div>

          {/* Bio */}
          <p className="mt-4 text-xs text-muted-foreground font-medium leading-relaxed line-clamp-3">
            {bio || 'This is where your story begins. Share your expertise and what makes your digital assets special.'}
          </p>

          {/* Social Stats Mockup */}
          <div className="mt-6 pt-6 border-t border-border/20 grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-sm font-semibold leading-none">0</p>
              <p className="text-xs font-medium text-muted-foreground tracking-tighter mt-1">Products</p>
            </div>
            <div className="text-center border-x border-border/20">
              <p className="text-sm font-semibold leading-none">0</p>
              <p className="text-xs font-medium text-muted-foreground tracking-tighter mt-1">Sales</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold leading-none">5.0</p>
              <p className="text-xs font-medium text-muted-foreground tracking-tighter mt-1">Rating</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60">
              <Globe className="h-3 w-3" />
              assetra.com/{username || 'username'}
            </div>
            <div className="h-10 w-full rounded-xl flex items-center justify-center text-[11px] font-semibold transition-all" style={{ backgroundColor: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}>
              View Profile
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-4 rounded-2xl bg-muted/30 border border-border/20">
        <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
          &ldquo;Your profile is the first thing buyers see. Make it count with a clear bio and a professional avatar.&rdquo;
        </p>
      </div>
    </div>
  )
}
