'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HeroCTA() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-slate-950 rounded-[3rem] p-12 md:p-24 text-center overflow-hidden border border-white/5 shadow-2xl"
    >
      {/* Ambient Background Elements */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 h-96 w-96 bg-primary/20 rounded-full blur-[100px] group-hover:bg-primary/30 transition-all duration-1000 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 h-96 w-96 bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-600/20 transition-all duration-1000 pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mx-auto">
          <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Creator Network</span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary animate-gradient-x">creator economy.</span>
        </h2>
        
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
          Monetize your digital expertise and join an elite community <br className="hidden md:block" /> of thousands of creators on Assetra.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-5 pt-8">
          <Link href="/register">
            <Button size="lg" className="h-16 px-12 text-lg rounded-2xl font-bold bg-white text-black hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">
              Get Started
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button size="lg" variant="ghost" className="h-16 px-12 text-lg rounded-2xl font-bold text-white hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
    </motion.div>
  )
}
