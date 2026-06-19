'use client'

import React from 'react'
import { Layout, Menu } from 'antd'
import {
    BankOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    QuestionCircleOutlined,
    DashboardOutlined,
    PlusCircleOutlined
} from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import { ROUTES } from '@/routerKeys'
import { useLogout } from '@/hooks/auth/useLogout'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'antd/lib/image'

const { Sider } = Layout

interface SidebarProps {
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
    className?: string
}

const CityParkLogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
    if (collapsed) {
        return (
            <div className="w-6 h-6 mx-auto relative overflow-hidden rounded-md bg-white shadow-sm">
                {/* Crop to show only the icon (the left portion) */}
                <Image
                    src="/images/logo.png"
                    alt="SpaceEZ Icon"
                    className="absolute max-w-none h-6 -left-0.5 top-0"
                    style={{ width: 'auto' }}
                    preview={false}
                />
            </div>
        )
    }

    return (
        <div className="flex items-center h-12 py-1.5 bg-white px-4 rounded-xl w-full overflow-hidden shadow-sm">
            <Image
                src="/images/logo.png"
                alt="SpaceEZ Logo"
                className="h-9 w-full object-contain mx-auto"
                preview={false}
            />
        </div>
    )
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, className }) => {
    const router = useRouter()
    const pathname = usePathname()
    const logout = useLogout()

    const menuItems = [
        {
            key: ROUTES.PRIVATE.HOME,
            icon: <BankOutlined />,
            label: 'Venues',
        },
        {
            key: ROUTES.PRIVATE.DASHBOARD,
            icon: <DashboardOutlined />,
            label: 'CityParkON Dashboard',
        },
        {
            key: ROUTES.PRIVATE.ADD_PARK,
            icon: <PlusCircleOutlined />,
            label: 'Add New Park',
        },
    ]

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={260}
            collapsedWidth={80}
            style={{ backgroundColor: '#062B52' }}
            className={`sticky top-0 h-screen text-white border-r border-[#1E4E79]/20 z-50 transition-all duration-300 ${className || ''}`}
        >
            <div className="flex flex-col h-full py-5">
                {/* Logo Section */}
                <div className="px-3 mb-8 flex items-center justify-center overflow-hidden w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={collapsed ? 'collapsed' : 'expanded'}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="cursor-pointer w-full"
                            onClick={() => router.push(ROUTES.PRIVATE.HOME)}
                        >
                            <CityParkLogo collapsed={collapsed} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 px-3 overflow-y-auto ant-menu-custom-wrapper">
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[pathname]}
                        items={menuItems}
                        onClick={({ key }) => {
                            if (key.startsWith('/')) {
                                router.push(key)
                            }
                        }}
                        className="bg-transparent border-none ant-menu-custom"
                        style={{ background: 'transparent', border: 'none' }}
                    />
                </div>

                {/* Need Help Card */}
                <div className="px-3 mb-2">
                    {!collapsed ? (
                        <div className="p-3.5 rounded-xl bg-[#1E4E79]/20 border border-[#1E4E79]/30 flex items-center gap-3">
                            <QuestionCircleOutlined className="text-lg text-[#22A652]" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white leading-none mb-1">Need Help?</span>
                                <span className="text-[10px] text-[#A0AEC0] cursor-pointer hover:text-white transition-colors">Visit our help center</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 mx-auto rounded-xl bg-[#1E4E79]/20 border border-[#1E4E79]/30 flex items-center justify-center cursor-pointer hover:bg-[#1E4E79]/40 transition-colors">
                            <QuestionCircleOutlined className="text-lg text-[#22A652]" />
                        </div>
                    )}
                </div>

                {/* Footer Section (Logout) */}
                <div className="px-3 pb-3 border-t border-[#1E4E79]/20 pt-3">
                    <div 
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-red-500/10 text-[#A0AEC0] hover:text-red-400 transition-all group"
                    >
                        <LogoutOutlined className="text-lg" />
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-semibold text-sm"
                            >
                                Logout
                            </motion.span>
                        )}
                    </div>
                </div>

                {/* Collapse Toggle (Desktop) */}
                <div 
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-7 w-6 h-6 bg-[#22A652] text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform z-[60]"
                >
                    {collapsed ? <MenuUnfoldOutlined style={{ fontSize: '10px' }} /> : <MenuFoldOutlined style={{ fontSize: '10px' }} />}
                </div>
            </div>

            <style jsx global>{`
                .ant-menu-custom-wrapper::-webkit-scrollbar {
                    width: 4px;
                }
                .ant-menu-custom-wrapper::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                .ant-menu-custom.ant-menu-dark {
                    background: transparent !important;
                }
                .ant-menu-custom.ant-menu-dark .ant-menu-item {
                    height: 42px !important;
                    line-height: 42px !important;
                    border-radius: 8px !important;
                    margin-bottom: 4px !important;
                    display: flex !important;
                    align-items: center !important;
                    transition: all 0.2s ease !important;
                    color: #A0AEC0 !important;
                    background: transparent !important;
                }
                .ant-menu-custom.ant-menu-dark .ant-menu-item-selected {
                    background: #22A652 !important;
                    color: white !important;
                    font-weight: 600 !important;
                    box-shadow: 0 4px 12px rgba(34, 166, 82, 0.25) !important;
                }
                .ant-menu-custom.ant-menu-dark .ant-menu-item-selected .anticon {
                    color: white !important;
                }
                .ant-menu-custom.ant-menu-dark .ant-menu-item:hover:not(.ant-menu-item-selected) {
                    background: #1E4E79 !important;
                    color: white !important;
                }
                .ant-menu-custom.ant-menu-dark .ant-menu-item:hover:not(.ant-menu-item-selected) .anticon {
                    color: white !important;
                }
                .ant-menu-custom .anticon {
                    font-size: 16px !important;
                    transition: all 0.2s ease;
                }
                .ant-menu-inline-collapsed .ant-menu-item {
                    padding: 0 20px !important;
                    display: flex !important;
                    justify-content: center !important;
                }
            `}</style>
        </Sider>
    )
}

export default Sidebar
