'use client'

import React, { ReactNode, useState } from 'react'
import { ConfigProvider, Layout, Drawer } from 'antd'
import enUS from 'antd/locale/en_US'
import { lightTheme } from "@/theme/antdTheme"
import ProtectedHeader from './ProtectedHeader'
import Sidebar from './Sidebar'
import PageTransition from '@/components/animations/PageTransition'

const { Content } = Layout

export default function ProtectedShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileVisible, setMobileVisible] = useState(false)

  return (
    <ConfigProvider
      locale={enUS}
      theme={lightTheme}
      componentSize="middle"
    >
      <Layout className="h-screen bg-background transition-colors overflow-hidden">
        {/* Sidebar (Desktop) */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} className="hidden md:block" />

        {/* Mobile Sidebar (Drawer) */}
        <Drawer
          placement="left"
          onClose={() => setMobileVisible(false)}
          open={mobileVisible}
          width={280}
          styles={{ body: { padding: 0 } }}
          closable={false}
          className="md:hidden"
        >
          <div className="h-full bg-card">
            <Sidebar collapsed={false} setCollapsed={() => {}} className="border-none h-full" />
          </div>
        </Drawer>

        <Layout className="flex flex-col min-w-0 bg-transparent transition-all duration-300">
          {/* Topbar */}
          <ProtectedHeader onMenuClick={() => setMobileVisible(true)} />

          {/* Main Content Area */}
          <Content className="p-4 md:p-8 flex-1 overflow-auto">
            <div className="w-full h-full">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </Content>
        </Layout>
      </Layout>

      <style jsx global>{`
        .ant-layout {
          background: transparent !important;
        }
        .ant-breadcrumb-link {
          color: var(--muted-foreground) !important;
          font-weight: 500;
          font-size: 13px;
        }
        .ant-breadcrumb-separator {
          color: var(--border) !important;
        }
        .ant-breadcrumb-link:hover {
          color: var(--primary) !important;
        }
        .ant-drawer-content-wrapper {
          box-shadow: 20px 0 50px rgba(0,0,0,0.1) !important;
        }
        .ant-drawer-body > div > aside {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            min-width: 0 !important;
            border-right: none !important;
        }
      `}</style>
    </ConfigProvider>
  )
}
