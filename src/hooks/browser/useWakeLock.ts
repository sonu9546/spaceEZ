'use client'

import { useEffect, useRef } from 'react'
import logger from '@/utils/logger'

/**
 * Hook to prevent screen from sleeping using the Screen Wake Lock API
 * This keeps the screen active while the user is on the page
 */
export function useWakeLock() {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null)

    useEffect(() => {
        // Check if Wake Lock API is supported
        if (!('wakeLock' in navigator)) {
            logger.warn('Wake Lock API not supported in this browser')
            return
        }

        const requestWakeLock = async () => {
            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen')
                logger.info('Screen wake lock activated')

                wakeLockRef.current.addEventListener('release', () => {
                    logger.info('Screen wake lock released')
                })
            } catch (err) {
                logger.error('Failed to activate screen wake lock:', err)
            }
        }

        // Request wake lock when component mounts
        requestWakeLock()

        // Re-request wake lock when page becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
                requestWakeLock()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Cleanup: release wake lock when component unmounts
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)

            if (wakeLockRef.current) {
                wakeLockRef.current.release().then(() => {
                    wakeLockRef.current = null
                    logger.info('Screen wake lock released on cleanup')
                })
            }
        }
    }, [])
}
