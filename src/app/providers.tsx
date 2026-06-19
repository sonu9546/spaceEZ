'use client'

import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { Toaster } from 'react-hot-toast'
import enUS from 'antd/locale/en_US'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { lightTheme } from '@/theme/antdTheme'

import { persistor, store } from '@/redux/store/store'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AntdRegistry>
            <ConfigProvider
              locale={enUS}
              componentSize="large"
              theme={lightTheme}
            >
              <Toaster position="top-right" />
              {/* <CentralLoader /> */}
              {children}
            </ConfigProvider>
          </AntdRegistry>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}
