'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ScrollReveal({ children }: { children: React.ReactNode }) {
  const container = useRef(null)

  useGSAP(() => {
    const cards = gsap.utils.toArray('.reveal-item')
    
    cards.forEach((card: any) => {
      gsap.fromTo(card, 
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out'
        }
      )
    })
  }, { scope: container })

  return <div ref={container}>{children}</div>
}
