'use client'

import React from 'react'
import { Button, Avatar } from 'antd'
import { useLogout } from '@/hooks/auth/useLogout'
import { 
    UserOutlined, 
    LogoutOutlined,
    MenuOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/tanstack/keys'

interface ProtectedHeaderProps {
    onMenuClick?: () => void
}

const ProtectedHeader: React.FC<ProtectedHeaderProps> = ({ onMenuClick }) => {
    const logout = useLogout()
    
    const { data: user } = useQuery<any>({
        queryKey: [QUERY_KEYS.USER],
    })

    return (
        <header className="h-16 px-6 flex items-center justify-between bg-white border-b-4 border-b-[#E5EAF2] shadow-[0_4px_16px_rgba(0,0,0,0.04)] sticky top-0 z-40 transition-all duration-300">
            {/* Left: Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
                <Button 
                    type="text" 
                    icon={<MenuOutlined />} 
                    className="md:hidden flex items-center justify-center text-xl" 
                    onClick={onMenuClick}
                />
            </div>

            {/* Right: Actions, Help & User Profile */}
            <div className="flex items-center gap-4">
                {/* User Profile Info */}
                <div className="flex items-center gap-3">
                    <Avatar 
                        src={user?.avatar} 
                        icon={<UserOutlined />} 
                        className="bg-[#22A652] border border-[#E5EAF2] shrink-0"
                        size={36}
                    />
                    <div className="hidden sm:flex flex-col items-start leading-tight">
                        <span className="text-sm font-bold text-[#1F2937]">{user?.name || 'John Smith'}</span>
                        <span className="text-[11px] text-[#6B7280] font-medium">{user?.role || 'City Administrator'}</span>
                    </div>
                    
                    <Button 
                        type="text" 
                        danger 
                        icon={<LogoutOutlined />} 
                        onClick={() => logout()}
                        className="hover:bg-red-50 flex items-center justify-center"
                    />
                </div>
            </div>
        </header>
    )
}

export default ProtectedHeader