'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductFAQProps {
  category: string
}

export default function ProductFAQ({ category }: ProductFAQProps) {
  // Generate contextual FAQs based on category
  const faqs = [
    {
      question: "Can I use this for commercial client projects?",
      answer: "Yes, absolutely! Once purchased, you get a commercial license which allows you to use this asset in unlimited personal and commercial projects for your clients. However, you cannot resell the source files."
    },
    {
      question: "Do I get free updates?",
      answer: "Yes. Every purchase comes with lifetime free updates. Whenever the creator uploads a new version or adds new screens, you will be able to download it from your Library at no extra cost."
    },
    {
      question: "What if I need help or support?",
      answer: "You can reach out to the creator directly via their profile page. Most creators respond within 24-48 hours. Assetra also provides platform-level support for billing and download issues."
    },
    ...(category === 'UI Kits' || category === 'Templates' ? [{
      question: "Do I need a paid Figma/React account to use this?",
      answer: "No. The files are designed to work perfectly with the free tiers of Figma, React, or Next.js. You only need a paid account if your own team's usage requires it."
    }] : [])
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(0) // Open the first one by default

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="animate-fade-in-up mt-16 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-sm font-medium text-muted-foreground">Everything you need to know about this asset.</p>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index

          return (
            <div 
              key={index} 
              className={cn(
                "rounded-2xl border transition-colors duration-300 overflow-hidden",
                isOpen ? "bg-card border-primary/30 shadow-md" : "bg-muted/30 border-border/20 hover:border-border"
              )}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-bold text-base md:text-lg">{faq.question}</span>
                <ChevronDown 
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-300 shrink-0",
                    isOpen && "rotate-180 text-primary"
                  )} 
                />
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed font-medium">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
