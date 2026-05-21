"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface ProductGalleryProps {
  title: string
  mainImage: string
}

export default function ProductGallery({ title, mainImage }: ProductGalleryProps) {
  // Simulate multiple images since DB only has one for now
  const images = [
    mainImage,
    `https://api.dicebear.com/7.x/shapes/svg?seed=${title}&backgroundColor=0a0a0a`,
    `https://api.dicebear.com/7.x/shapes/svg?seed=${title}2&backgroundColor=0a0a0a`,
    `https://api.dicebear.com/7.x/shapes/svg?seed=${title}3&backgroundColor=0a0a0a`,
  ]

  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Showcase */}
      <div 
        className="animate-btns opacity-0 relative aspect-[16/10] rounded-[2.5rem] overflow-hidden border border-border/20 bg-muted/30 shadow-xl group cursor-zoom-in"
        onClick={() => setIsLightboxOpen(true)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            src={images[activeIndex]}
            alt={`${title} Preview ${activeIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Maximize2 className="h-12 w-12 text-white/50" />
        </div>

        {/* Navigation Arrows */}
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handlePrev}
            aria-label="Previous image"
            title="Previous image"
            className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-black/60 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={handleNext}
            aria-label="Next image"
            title="Next image"
            className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-black/60 transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "h-2 rounded-full transition-all duration-300 shadow-sm",
                idx === activeIndex ? "w-8 bg-white" : "w-2 bg-white/40"
              )}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="animate-btns opacity-0 grid grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "relative aspect-[16/10] rounded-2xl overflow-hidden border-2 transition-all duration-300 group",
              idx === activeIndex 
                ? "border-primary ring-4 ring-primary/20 scale-[0.98]" 
                : "border-transparent opacity-60 hover:opacity-100 hover:scale-[1.02]"
            )}
          >
            <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            {idx !== activeIndex && <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden bg-black/95 border-none rounded-[2rem] shadow-xl flex flex-col items-center justify-center">
          <div className="relative h-full w-full flex items-center justify-center p-4 md:p-12">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                src={images[activeIndex]}
                className="max-h-full max-w-full object-contain shadow-xl rounded-xl"
                alt={title}
              />
            </AnimatePresence>

            {/* Lightbox Navigation */}
            <div className="absolute inset-x-4 md:inset-x-10 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
              <button 
                className="h-16 w-16 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-center justify-center pointer-events-auto hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
                onClick={handlePrev}
                aria-label="Previous image"
                title="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button 
                className="h-16 w-16 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-center justify-center pointer-events-auto hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
                onClick={handleNext}
                aria-label="Next image"
                title="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>
            
            {/* Top Bar */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white">
              <p className="text-sm font-semibold tracking-tight">{title}</p>
              <div className="h-4 w-[1px] bg-white/20" />
              <span className="text-xs font-bold text-white/60 ">{activeIndex + 1} / {images.length}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
