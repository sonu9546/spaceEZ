'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ScaleInProps {
    children: ReactNode
    delay?: number
    duration?: number
    scale?: number
    className?: string
}

export default function ScaleIn({
    children,
    delay = 0,
    duration = 0.5,
    scale = 0.8,
    className = '',
}: ScaleInProps) {
    return (
        <motion.div
            initial={{
                scale,
                opacity: 0,
            }}
            whileInView={{
                scale: 1,
                opacity: 1,
            }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration,
                delay,
                ease: [0.34, 1.56, 0.64, 1], // Bounce effect
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
