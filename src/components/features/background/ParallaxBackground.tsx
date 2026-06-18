'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface ParallaxBackgroundProps {
  children: React.ReactNode
  imageSrc: string
  imageAlt?: string
  overlayOpacity?: number
  speed?: number
  className?: string
}

export default function ParallaxBackground({
  children,
  imageSrc,
  imageAlt = 'Background image',
  overlayOpacity = 0.6,
  speed = 0.5,
  className = 'min-h-60dvh md:min-h-100dvh',
}: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    let rafId: number | null = null

    const handleScroll = () => {
      if (!containerRef.current) return
      if (rafId) return

      rafId = requestAnimationFrame(() => {
        const element = containerRef.current!
        const rect = element.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        // Only animate while visible
        if (rect.bottom > 0 && rect.top < viewportHeight) {
          const scrolled = -rect.top * speed
          setOffsetY(scrolled)
        }

        rafId = null
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [speed])

  return (
    <section
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${offsetY}px)`,
          willChange: 'transform',
        }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </section>
  )
}
