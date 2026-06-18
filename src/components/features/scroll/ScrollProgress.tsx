'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Floating scroll progress indicator at bottom right
 * Shows page scroll progress as a circular progress bar
 */
export default function ScrollProgress() {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            const scrollTop = window.scrollY

            // Calculate scroll percentage
            const totalScrollableHeight = documentHeight - windowHeight
            const progress = (scrollTop / totalScrollableHeight) * 100

            setScrollProgress(Math.min(100, Math.max(0, progress)))

            // Show indicator after scrolling 10%
            setIsVisible(progress > 10)
        }

        window.addEventListener('scroll', handleScroll)
        handleScroll() // Initial check

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <div className="relative">
                        {/* Circular Progress Container */}
                        <div className="relative w-16 h-16 bg-transparent backdrop-blur-md border-2 border-border rounded-full shadow-lg flex items-center justify-center">
                            {/* SVG Circular Progress */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                {/* Background Circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    className="text-muted opacity-20"
                                />
                                {/* Progress Circle */}
                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    className="text-primary"
                                    initial={{ strokeDashoffset: 283 }}
                                    animate={{
                                        strokeDashoffset: 283 - (283 * scrollProgress) / 100,
                                    }}
                                    transition={{ duration: 0.1 }}
                                    style={{
                                        strokeDasharray: 283,
                                    }}
                                />
                            </svg>

                            {/* Percentage Text */}
                            <span className="text-xs font-semibold text-foreground z-10">
                                {Math.round(scrollProgress)}%
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
