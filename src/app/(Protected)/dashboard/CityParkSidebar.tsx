'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLogout } from '@/hooks/auth/useLogout'

interface SidebarProps {
  className?: string
}

export default function CityParkSidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { name: 'Parks', icon: 'park', href: '/parks' },
  ]

  const logout = useLogout()

  const bottomItems = [
    { name: 'Help Center', icon: 'help', href: '#', isLogout: false },
  ]

  return (
    <>


      <aside className={`fixed left-0 top-0 h-full w-[260px] bg-white border-r border-[#bdcaba]/40 flex flex-col py-6 px-4 z-50 ${className}`}>
        {/* Brand Header */}
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#006b2c] rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
            <span className="material-symbols-outlined font-semibold text-2xl">park</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#006b2c] leading-tight">CityParkON</h1>
            <p className="text-[10px] font-semibold text-[#545f73] uppercase tracking-wider">Admin Terminal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item, idx) => {
            const isActive =
              (item.href === '/dashboard' && pathname === '/dashboard') ||
              (item.href === '/parks' && pathname?.startsWith('/parks'));

            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#eff4ff] text-[#006b2c] font-semibold shadow-sm'
                    : 'text-[#545f73] hover:bg-[#eff4ff]/40 hover:text-[#0b1c30]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-[#006b2c] rounded-r"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span
                  className={`material-symbols-outlined transition-colors duration-200 ${
                    isActive ? 'text-[#006b2c]' : 'text-[#545f73] group-hover:text-[#006b2c]'
                  }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Area */}
        <div className="pt-4 border-t border-[#bdcaba]/30 space-y-1">
          {bottomItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all duration-200 group text-[#545f73] hover:bg-[#eff4ff]/40 hover:text-[#0b1c30]"
            >
              <span className="material-symbols-outlined text-[#545f73]">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50"
          >
            <span className="material-symbols-outlined text-red-500">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
