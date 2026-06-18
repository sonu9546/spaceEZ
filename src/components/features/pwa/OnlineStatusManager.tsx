'use client'

import { useEffect } from 'react'
import { message } from 'antd'
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons'
import { useOnlineStatus } from '@/hooks/browser/useOnlineStatus'

/**
 * Online/Offline Status Manager
 * Shows beautiful toast notifications when connection status changes
 */
export default function OnlineStatusManager() {
    const { isOnline, wasOffline } = useOnlineStatus()
    const [messageApi, contextHolder] = message.useMessage()

    useEffect(() => {
        if (!isOnline) {
            // Show offline message
            messageApi.open({
                key: 'online-status',
                type: 'error',
                content: (
                    <div className="flex items-center gap-2">
                        <DisconnectOutlined className="text-lg" />
                        <span className="font-medium">You are offline</span>
                    </div>
                ),
                duration: 0, // Stay until online
                className: 'custom-offline-message',
            })
        } else if (wasOffline) {
            // Show back online message
            messageApi.open({
                key: 'online-status',
                type: 'success',
                content: (
                    <div className="flex items-center gap-2">
                        <WifiOutlined className="text-lg" />
                        <span className="font-medium">You are back online</span>
                    </div>
                ),
                duration: 3,
                className: 'custom-online-message',
            })
        }
    }, [isOnline, wasOffline, messageApi])

    return <>{contextHolder}</>
}
