'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import ProgressBar from '@/components/animations/ProgressBar'

/**
 * Top loading bar that shows during route transitions
 */
export default function TopLoadingBar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [progress, setProgress] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Start loading
        setIsLoading(true)
        setProgress(30)

        // Snappy simulation
        const timer1 = setTimeout(() => setProgress(70), 50)

        // Rapid completion
        const timer2 = setTimeout(() => {
            setProgress(100)
            setTimeout(() => {
                setIsLoading(false)
                setProgress(0)
            }, 100)
        }, 150)

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
        }
    }, [pathname, searchParams])

    if (!isLoading && progress === 0) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999]">
            <ProgressBar
                progress={progress}
                height={3}
                duration={0.2}
                color="bg-primary"
            />
        </div>
    )
}
