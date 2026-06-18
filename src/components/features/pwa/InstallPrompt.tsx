'use client'

import { useEffect, useState } from 'react'
import { Button, Modal } from 'antd'
import { DownloadOutlined, CloseOutlined } from '@ant-design/icons'
import { usePathname } from 'next/navigation'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA Install Prompt Component
 * Shows a prompt to install the app when it's installable
 */
export default function InstallPrompt() {
    const pathname = usePathname()
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)

            // Skip auto-prompt on auth pages to avoid interrupting user focus
            const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
            if (isAuthPage) return

            // Show prompt after 30 seconds if not dismissed before
            setTimeout(() => {
                const dismissed = localStorage.getItem('pwa-install-dismissed')
                if (!dismissed) {
                    setShowInstallPrompt(true)
                }
            }, 30000)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Check if app was installed
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true)
            setShowInstallPrompt(false)
            localStorage.removeItem('pwa-install-dismissed')
        })

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setShowInstallPrompt(false)
        }

        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowInstallPrompt(false)
        localStorage.setItem('pwa-install-dismissed', 'true')
    }

    if (isInstalled || !showInstallPrompt) return null

    return (
        <Modal
            open={showInstallPrompt}
            onCancel={handleDismiss}
            footer={null}
            closeIcon={<CloseOutlined />}
            centered
            width={400}
        >
            <div className="text-center py-4">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-xl font-bold mb-2">Install SpaceEZ</h3>
                <p className="text-muted-foreground mb-6">
                    Install our app for a better experience! Access it directly from your home screen and use it offline.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button
                        type="primary"
                        size="large"
                        icon={<DownloadOutlined />}
                        onClick={handleInstall}
                    >
                        Install App
                    </Button>
                    <Button
                        size="large"
                        onClick={handleDismiss}
                    >
                        Not Now
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
