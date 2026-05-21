'use client'

import React from 'react'
import { motion } from 'framer-motion'

const avatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
]

export default function HeroSocialProof() {
  return (
    <div className="animate-btns opacity-0 flex flex-col items-center gap-5 pt-16">
      <div className="flex -space-x-3">
        {avatars.map((src, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8, scale: 1.1, zIndex: 10 }}
            className="h-11 w-11 rounded-full border-2 border-background bg-muted overflow-hidden ring-1 ring-border/20 cursor-pointer shadow-xl transition-all duration-300"
          >
            <img 
              src={src} 
              alt={`Expert ${i + 1}`} 
              className="h-full w-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all"
            />
          </motion.div>
        ))}
        <div className="h-11 w-11 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-black text-white shadow-xl z-10">
          10K+
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-muted-foreground/60 tracking-[0.3em] uppercase">
          Empowering <span className="text-foreground/90 font-black">world-class</span> creators
        </p>
        <div className="h-[1px] w-12 bg-primary/30 mx-auto" />
      </div>
    </div>
  )
}
