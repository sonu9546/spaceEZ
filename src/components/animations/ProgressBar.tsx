'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
    progress: number // 0-100
    height?: number
    color?: string
    backgroundColor?: string
    duration?: number
    className?: string
}

export default function ProgressBar({
    progress,
    height = 8,
    color = 'bg-primary',
    backgroundColor = 'bg-muted',
    duration = 0.5,
    className = '',
}: ProgressBarProps) {
    return (
        <div
            className={`w-full rounded-full overflow-hidden ${backgroundColor} ${className}`}
            style={{ height }}
        >
            <motion.div
                className={`h-full rounded-full ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                transition={{ duration, ease: 'easeOut' }}
            />
        </div>
    )
}
