'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SlideInProps {
    children: ReactNode
    direction?: 'left' | 'right' | 'up' | 'down'
    distance?: number
    delay?: number
    duration?: number
    className?: string
}

export default function SlideIn({
    children,
    direction = 'left',
    distance = 100,
    delay = 0,
    duration = 0.6,
    className = '',
}: SlideInProps) {
    const directionOffset = {
        left: { x: -distance },
        right: { x: distance },
        up: { y: -distance },
        down: { y: distance },
    }

    return (
        <motion.div
            initial={{
                ...directionOffset[direction],
                opacity: 0,
            }}
            whileInView={{
                x: 0,
                y: 0,
                opacity: 1,
            }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
