'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Verified, Gem } from 'lucide-react'

const features = [
  {
    title: "Instant Delivery",
    desc: "Automated fulfillment ensures your digital assets are delivered the second your payment clears.",
    icon: ArrowUpRight,
    color: "from-primary/20 via-primary/10 to-transparent",
    iconColor: "text-primary",
    glow: "shadow-primary/20"
  },
  {
    title: "Quality Assured",
    desc: "Rigorous manual vetting process for every single resource to guarantee world-class quality.",
    icon: Verified,
    color: "from-blue-500/20 via-blue-500/10 to-transparent",
    iconColor: "text-blue-500",
    glow: "shadow-blue-500/20"
  },
  {
    title: "Elite Creators",
    desc: "Connect with a hand-picked community of top-tier designers and professional developers.",
    icon: Gem,
    color: "from-indigo-500/20 via-indigo-500/10 to-transparent",
    iconColor: "text-indigo-500",
    glow: "shadow-indigo-500/20"
  }
]

export default function HeroFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((f, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: i * 0.15, ease: [0.23, 1, 0.32, 1] }}
          whileHover={{ y: -12 }}
          className="group relative bg-card/30 backdrop-blur-2xl border border-border/20 p-12 rounded-[3.5rem] transition-all duration-700 hover:border-primary/40 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col items-center text-center"
        >
          {/* Animated Background Mesh */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${f.color} blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
          <div className={`absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr ${f.color} blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
          
          <div className="relative z-10 space-y-10 flex flex-col items-center">
            {/* Premium 3D Glass Icon Container */}
            <div className={`relative h-24 w-24 flex items-center justify-center group-hover:scale-110 transition-all duration-700`}>
              {/* Outer Glow */}
              <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${f.color} blur-2xl opacity-20 group-hover:opacity-60 transition-opacity duration-700`} />
              
              {/* Layered Glass Core */}
              <div className={`absolute inset-2 rounded-[1.8rem] bg-gradient-to-br ${f.color} border border-white/20 shadow-2xl ${f.glow} opacity-40 group-hover:opacity-80 transition-all duration-700 group-hover:rotate-6`} />
              <div className="absolute inset-2 rounded-[1.8rem] backdrop-blur-xl border border-white/10 shadow-inner group-hover:-rotate-3 transition-transform duration-700" />
              
              {/* Icon with Inner Glow */}
              <div className="relative">
                <f.icon className={`h-10 w-10 ${f.iconColor} filter drop-shadow-[0_0_8px_rgba(0,0,0,0.3)] group-hover:drop-shadow-[0_0_15px_currentColor] transition-all duration-500`} strokeWidth={1.5} />
              </div>
            </div>
            
            <div className="space-y-4 max-w-[240px]">
              <h4 className="text-2xl font-black tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">{f.title}</h4>
              <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                {f.desc}
              </p>
            </div>

            {/* Interactive Progress Indicator */}
            <div className="pt-4 w-full flex justify-center">
              <div className="h-1.5 w-12 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full w-0 group-hover:w-full bg-primary transition-all duration-700 ease-in-out" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
