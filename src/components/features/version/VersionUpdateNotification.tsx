'use client'

import { Modal, Button } from 'antd'
import { ReloadOutlined, CloseOutlined } from '@ant-design/icons'
import { VERSION_CONFIG } from '@/config/version.config'
import { useVersionCheck } from '@/hooks/system/useVersionCheck'

export default function VersionUpdateNotification() {
    const { updateAvailable, newVersion, refreshApp, dismissUpdate } = useVersionCheck()

    if (!VERSION_CONFIG.SHOW_NOTIFICATION || !updateAvailable) {
        return null
    }

    return (
        <Modal
            open={updateAvailable}
            closable={false}
            footer={null}
            centered
            width={600}
            maskClosable={false}
        >
            <div className="text-center py-4">
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <ReloadOutlined className="text-3xl text-primary" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2">Update Available</h3>

                {/* Description */}
                <p className="text-muted-foreground mb-6">
                    A new version of the app is available. Please refresh to get the latest features and improvements.
                </p>

                {/* Version Info */}
                {newVersion && (
                    <div className="mb-6 p-3 bg-muted rounded-lg text-sm">
                        <div className="text-muted-foreground">New Version</div>
                        <div className="font-semibold">{newVersion.version}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {newVersion.buildDate}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-center mb-5">
                    <Button
                        type="primary"
                        size="large"
                        icon={<ReloadOutlined />}
                        onClick={refreshApp}
                        className="min-w-40"
                    >
                        Update Now
                    </Button>
                    <Button
                        size="large"
                        icon={<CloseOutlined />}
                        onClick={dismissUpdate}
                        className='min-w-40'
                    >
                        Later
                    </Button>
                </div>

                {/* Note */}
                <p className="text-xs text-muted-foreground">
                    The app will refresh automatically to apply updates
                </p>
            </div>
        </Modal>
    )
}
