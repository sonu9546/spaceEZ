'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { SHOW_SPLASH_SCREEN } from '@/config'

/**
 * A premium splash screen that shows on initial load.
 * Hides once the application is mounted and ready.
 */
export default function SplashScreen({ children }: { children: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        if (!SHOW_SPLASH_SCREEN) {
            setIsVisible(false)
            return
        }

        // Keep splash screen for at least 800ms for branding impact
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 800)

        return () => clearTimeout(timer)
    }, [])

    if (!isMounted) return null

    return (
        <>
            <AnimatePresence mode="wait">
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ 
                            opacity: 0,
                            transition: { duration: 0.5, ease: "easeInOut" }
                        }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#0f172a]"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ 
                                scale: 1, 
                                opacity: 1,
                                transition: { duration: 0.5, ease: "easeOut" }
                            }}
                            className="relative"
                        >
                            <Image
                                priority
                                src="/images/logo.png"
                                alt="App Logo"
                                width={120}
                                height={120}
                                className="object-contain"
                            />
                            
                            {/* Subtitle/Brand name animation */}
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="mt-4 text-center"
                            >
                                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    SpaceEZ
                                </h2>
                                <div className="mt-2 flex justify-center gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                scale: [1, 1.5, 1],
                                                opacity: [0.3, 1, 0.3],
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                            }}
                                            className="h-1.5 w-1.5 rounded-full bg-primary"
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* 
              We always render children but keep them hidden or slightly blurred 
              until splash is gone to ensure hydration matches but visual focus 
              stays on logo.
            */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                    opacity: isVisible ? 0 : 1,
                    transition: { duration: 0.5 }
                }}
            >
                {children}
            </motion.div>
        </>
    )
}
