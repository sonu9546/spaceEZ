'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { VERSION_CONFIG, type VersionInfo } from '@/config/version.config'
import logger from '@/utils/logger'

const MIN_CHECK_INTERVAL = 60000 // Minimum 1 minute between checks

export function useVersionCheck() {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [newVersion, setNewVersion] = useState<VersionInfo | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const currentVersionRef = useRef<string | null>(null)
    const lastCheckTimeRef = useRef<number>(0)

    const fetchVersion = useCallback(async (): Promise<VersionInfo | null> => {
        try {
            // Add timestamp to prevent caching
            const response = await fetch(
                `${VERSION_CONFIG.VERSION_FILE}?t=${Date.now()}`,
                {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: VersionInfo = await response.json()
            return data
        } catch (error) {
            logger.error('Failed to fetch version:', error)
            return null
        }
    }, [])

    const checkForUpdates = useCallback(async (force = false) => {
        if (!VERSION_CONFIG.ENABLED) {
            return
        }

        // Prevent too frequent checks (unless forced)
        const now = Date.now()
        if (!force && now - lastCheckTimeRef.current < MIN_CHECK_INTERVAL) {
            logger.info('Skipping version check - too soon since last check')
            return
        }

        lastCheckTimeRef.current = now

        const serverVersion = await fetchVersion()
        if (!serverVersion) {
            return
        }

        // Initialize current version on first check
        if (!currentVersionRef.current) {
            currentVersionRef.current = serverVersion.buildId
            localStorage.setItem(
                VERSION_CONFIG.STORAGE_KEY,
                JSON.stringify(serverVersion)
            )
            logger.info('Version initialized:', serverVersion.buildId)
            return
        }

        // Compare versions - only show update if server version is NEWER
        if (serverVersion.buildId !== currentVersionRef.current) {
            // Double check with localStorage to avoid false positives
            const stored = localStorage.getItem(VERSION_CONFIG.STORAGE_KEY)
            if (stored) {
                try {
                    const storedVersion: VersionInfo = JSON.parse(stored)
                    // If server version matches stored version, update current ref and don't show modal
                    if (serverVersion.buildId === storedVersion.buildId) {
                        currentVersionRef.current = serverVersion.buildId
                        return
                    }
                } catch (error) {
                    logger.error('Failed to parse stored version:', error)
                }
            }

            logger.info('New version detected:', {
                current: currentVersionRef.current,
                new: serverVersion.buildId,
            })
            setNewVersion(serverVersion)
            setUpdateAvailable(true)
        }
    }, [fetchVersion])

    const refreshApp = useCallback(() => {
        setUpdateAvailable(false)
        // Update stored version to the new version before refreshing
        if (newVersion) {
            localStorage.setItem(
                VERSION_CONFIG.STORAGE_KEY,
                JSON.stringify(newVersion)
            )
            currentVersionRef.current = newVersion.buildId
        }

        // Clear cache and reload
        if ('caches' in window) {
            caches.keys().then((names) => {
                names.forEach((name) => {
                    caches.delete(name)
                })
            })
        }

        // Force reload from server
        window.location.reload()
    }, [newVersion])

    const dismissUpdate = useCallback(() => {
        setUpdateAvailable(false)
    }, [])

    useEffect(() => {
        if (!VERSION_CONFIG.ENABLED) {
            logger.info('Version check disabled (not in production)')
            return
        }

        // Reset update state on mount (prevents false positives on hot reload)
        setUpdateAvailable(false)
        setNewVersion(null)

        // Load stored version
        const stored = localStorage.getItem(VERSION_CONFIG.STORAGE_KEY)
        if (stored) {
            try {
                const storedVersion: VersionInfo = JSON.parse(stored)
                currentVersionRef.current = storedVersion.buildId
                logger.info('Loaded stored version:', storedVersion.buildId)
            } catch (error) {
                logger.error('Failed to parse stored version:', error)
            }
        }

        // Initial check (forced to bypass cooldown)
        checkForUpdates(true)

        // Set up polling
        intervalRef.current = setInterval(
            () => checkForUpdates(false),
            VERSION_CONFIG.CHECK_INTERVAL
        )

        // Handle visibility change (when user switches back to tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Only check if enough time has passed (respects cooldown)
                checkForUpdates(false)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [checkForUpdates])

    return {
        updateAvailable,
        newVersion,
        refreshApp,
        dismissUpdate,
    }
}
