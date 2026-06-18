'use client'

import { useWakeLock } from '@/hooks/browser/useWakeLock'

/**
 * Component that prevents screen from sleeping
 * Uses the Screen Wake Lock API to keep the screen active
 */
export default function WakeLockProvider() {
    useWakeLock()
    return null
}
