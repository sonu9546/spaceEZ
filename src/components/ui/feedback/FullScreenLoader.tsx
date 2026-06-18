'use client'

import React from 'react'
import { Spin } from 'antd'

interface FullScreenLoaderProps {
  loading: boolean
  message?: string
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ 
  loading, 
  message = 'Processing...' 
}) => {
  if (!loading) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4">
        <Spin size="large" />
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  )
}

export default FullScreenLoader
