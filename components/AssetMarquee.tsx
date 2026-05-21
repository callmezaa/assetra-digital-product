'use client'

import React from 'react'
import { motion } from 'framer-motion'

const assets = [
  { src: "/assets/showcase/ui_template.png", label: "UI Kit" },
  { src: "/assets/showcase/icons.png", label: "Icons" },
  { src: "/assets/showcase/mobile_app.png", label: "Mobile" },
  { src: "/assets/showcase/landing_page.png", label: "Web App" },
  { src: "/assets/showcase/abstract.png", label: "3D Asset" },
  { src: "/assets/showcase/code.png", label: "Logic" },
  { src: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop", label: "Branding" },
  { src: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&auto=format&fit=crop", label: "Components" },
]

const MarqueeRow = ({ items, reverse = false }: { items: typeof assets, reverse?: boolean }) => {
  return (
    <div className="flex overflow-hidden select-none gap-6 py-3">
      <motion.div 
        initial={{ x: reverse ? "-50%" : "0%" }}
        animate={{ x: reverse ? "0%" : "-50%" }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex flex-nowrap gap-6 min-w-full"
      >
        {[...items, ...items].map((asset, i) => (
          <div 
            key={i}
            className="relative flex-shrink-0 w-72 h-44 rounded-[2.5rem] overflow-hidden border border-border/40 group cursor-pointer shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-primary/30 transition-all duration-700"
          >
            <img 
              src={asset.src} 
              alt={asset.label} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <span className="text-white font-bold text-[12px] tracking-tight bg-primary/80 backdrop-blur-md px-4 py-1.5 rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
                {asset.label}
              </span>
            </div>

            {/* Subtle border shine */}
            <div className="absolute inset-0 border border-white/10 rounded-[2.5rem] pointer-events-none" />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function AssetMarquee() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Decorative Title - Subtle */}
      <div className="container mx-auto px-4 mb-16 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">
          <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[12px] font-semibold text-primary">Premium ecosystem</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground/90">
          Crafted for the world's most <span className="text-primary">creative</span> teams
        </h2>
      </div>

      <div className="relative">
        {/* Fade Edges */}
        <div className="absolute inset-y-0 left-0 w-32 md:w-80 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 md:w-80 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

        <div className="space-y-6">
          <MarqueeRow items={assets.slice(0, 4)} />
          <MarqueeRow items={assets.slice(4, 8)} reverse />
        </div>
      </div>
    </section>
  )
}
