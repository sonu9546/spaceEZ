'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

interface AnimatedCounterProps {
    from?: number
    to: number
    duration?: number
    delay?: number
    className?: string
}

export default function AnimatedCounter({
    from = 0,
    to,
    duration = 2,
    delay = 0,
    className = '',
}: AnimatedCounterProps) {
    const count = useMotionValue(from)
    const rounded = useTransform(count, (latest) => Math.round(latest))

    useEffect(() => {
        const timer = setTimeout(() => {
            const controls = animate(count, to, { duration, ease: 'easeOut' })
            return controls.stop
        }, delay * 1000)

        return () => clearTimeout(timer)
    }, [count, to, duration, delay])

    return <motion.span className={className}>{rounded}</motion.span>
}
