'use client'

import React from 'react'
import Link from 'next/link'
import { Image } from 'antd'

interface HeaderProps {
  title?: string
  showSearch?: boolean
  stepNavigation?: React.ReactNode
}

export default function CityParkHeader({
  title,
  showSearch = true,
  stepNavigation,
}: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-260px)] h-16 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-[#bdcaba]/30 flex justify-between items-center px-8 z-40">
      <div className="flex items-center gap-6 w-2/3">
        {stepNavigation ? (
          stepNavigation
        ) : title ? (
          <h2 className="font-bold text-lg text-[#0b1c30]">{title}</h2>
        ) : (
          showSearch && (
            <div className="flex items-center gap-3 bg-[#eff4ff]/60 px-4 py-2 rounded-full border border-[#bdcaba]/30 w-full max-w-md focus-within:border-[#006b2c] focus-within:ring-2 focus-within:ring-[#006b2c]/20 transition-all duration-200">
              <span className="material-symbols-outlined text-[#545f73] text-lg select-none">search</span>
              <input
                className="bg-transparent border-none text-sm w-full outline-none text-[#0b1c30] placeholder-[#545f73]"
                placeholder="Search parks or amenities..."
                type="text"
              />
            </div>
          )
        )}
      </div>

      <div className="flex items-center gap-6">
        <Link
          href="/parks/add"
          className="bg-[#006b2c] text-white font-semibold text-sm py-2 px-5 rounded-lg hover:bg-[#00873a] transition-all active:scale-[0.98] duration-150 shadow-sm"
        >
ADD PARK         
</Link>

        {/* Profile Avatar */}
        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-[#bdcaba]/40 shadow-inner">
          <Image
            className="w-full h-full object-cover"
            alt="Admin Profile"
            preview={false}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvJXcOvQ_wF_SX7ijQRuvw0r-XpDKSuZpwWIzUo-X3aPo-jztY1Ps18hVGs1Pwu38pXV2dddG9FIqCjLevMZ2WWkWZ8sgiktHNHv3bmWfJmlJgY432PyASZNNWh4QsWH0ANIu0sDh16gHNzdM7GBSKRK8o0tPzZNr0JSz-TyA8EOHCR7cBpwPfkVm27UEbEK9Thd69G2YbkZTuVjvBvqFF8i_AD_ugDlu8GhCJtVhiaQOR6N_En9xA0dO8jxo2-bBmlzWMVUadMDxt"
          />
        </div>
      </div>
    </header>
  )
}
