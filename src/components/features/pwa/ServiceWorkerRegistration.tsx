'use client'

import { useEffect } from 'react'

/**
 * Service Worker Registration Component
 * Manually registers the service worker for PWA functionality
 */
export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            process.env.NODE_ENV === 'production'
        ) {
            // Register service worker
            navigator.serviceWorker
                .register('/sw.js', { scope: '/' })
                .then((registration) => {
                    console.log('✅ Service Worker registered successfully:', registration.scope)

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update()
                    }, 60000) // Check every minute

                    // Handle updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New service worker available
                                    console.log('🔄 New service worker available')
                                }
                            })
                        }
                    })
                })
                .catch((error) => {
                    console.error('❌ Service Worker registration failed:', error)
                })
        }
    }, [])

    return null
}
