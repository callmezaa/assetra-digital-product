'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

const testimonials = [
  { 
    name: "Alex Rivers", 
    role: "UI Designer", 
    text: "Assetra changed my workflow completely. The quality of UI kits here is just unmatched.", 
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
  },
  { 
    name: "Sarah Chen", 
    role: "Fullstack Dev", 
    text: "Finally a marketplace that cares about code quality. Instant delivery is a lifesaver.", 
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
  },
  { 
    name: "Marcus Thorne", 
    role: "Creative Director", 
    text: "Clean, elegant, and professional. The only place I trust for my agency assets.", 
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
  },
  { 
    name: "Elena Frost", 
    role: "Product Manager", 
    text: "The curation here is elite. Every asset feels like it was made for high-end projects.", 
    rating: 5,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
  },
  { 
    name: "Julian Day", 
    role: "Freelancer", 
    text: "Pricing is fair and the assets are top-tier. Highly recommended for any digital creator.", 
    rating: 4,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"
  },
  { 
    name: "Sofia Vaga", 
    role: "Motion Designer", 
    text: "I found resources here that I couldn't find anywhere else. Truly a next-level platform.", 
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
  },
]

const TestimonialCard = ({ item, index }: { item: typeof testimonials[0], index: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="p-8 rounded-[2.5rem] bg-card/50 backdrop-blur-sm border border-border/20 flex flex-col gap-6 transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 group relative overflow-hidden"
    >
      {/* Decorative element */}
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <Quote className="h-12 w-12 text-primary" />
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted/20'}`} 
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-base text-foreground/80 leading-relaxed font-medium relative z-10">
        "{item.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4 pt-6 border-t border-border/10 mt-auto">
        <div className="relative h-12 w-12 rounded-2xl overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="text-sm font-bold tracking-tight text-foreground">{item.name}</h4>
          <p className="text-[11px] text-muted-foreground font-semibold tracking-tight">Digital Creator</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function TrustWall() {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 sm:mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[12px] font-semibold">
            <Star className="h-3 w-3 fill-primary" />
            <span>Trusted excellence</span>
          </div>
          <h3 className="text-4xl md:text-6xl font-black tracking-tighter">
            Loved by the <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">experts.</span>
          </h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Join 10,000+ designers and developers who rely on Assetra for professional-grade digital resources.
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((item, i) => (
            <TestimonialCard key={item.name} item={item} index={i} />
          ))}
        </div>

        {/* Social Proof Bar */}
        <div className="mt-20 md:mt-32 flex flex-wrap items-center justify-center gap-12 md:gap-20">
          {[
            { value: '4.9/5', label: 'Global Rating' },
            { value: '10k+', label: 'Digital Assets' },
            { value: '99.9%', label: 'Uptime Delivery' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center sm:items-start gap-1 group">
              <span className="text-4xl md:text-5xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{stat.value}</span>
              <span className="text-[13px] font-semibold text-muted-foreground/60">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
