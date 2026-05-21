'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function HeroAnimations({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } })

    const targets = {
      badge: container.current?.querySelector('.animate-badge'),
      title: container.current?.querySelector('.animate-title'),
      desc: container.current?.querySelector('.animate-desc'),
      btns: container.current?.querySelector('.animate-btns')
    }

    if (targets.badge) {
      tl.fromTo('.animate-badge', { y: 20, opacity: 0 }, { y: 0, opacity: 1, delay: 0.2 })
    }
    
    if (targets.title) {
      tl.fromTo('.animate-title', { y: 40, opacity: 0 }, { y: 0, opacity: 1 }, targets.badge ? '-=0.7' : '0')
    }
    
    if (targets.desc) {
      tl.fromTo('.animate-desc', { y: 30, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.8')
    }
    
    if (targets.btns) {
      tl.fromTo('.animate-btns', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1 }, '-=0.8')
    }
  }, { scope: container })

  return <div ref={container}>{children}</div>
}
