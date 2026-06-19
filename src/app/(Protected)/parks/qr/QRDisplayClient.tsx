'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { QRCode, Button } from 'antd'

export default function QRDisplayClient() {
  const params = useSearchParams()
  const id      = params.get('id') || ''
  const name    = params.get('name') || 'Amenity'
  const park    = params.get('park') || 'Park'
  const sport   = params.get('sport') || ''

  const qrValue = `spaceez://amenity/${id}?park=${encodeURIComponent(park)}&name=${encodeURIComponent(name)}`

  const handleDownload = () => {
    const canvas = document.querySelector<HTMLCanvasElement>('.ant-qrcode canvas')
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${name.replace(/\s+/g, '-').toLowerCase()}.png`
      a.click()
    }
  }

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#bdcaba]/30 p-10 flex flex-col items-center gap-6 max-w-sm w-full print:shadow-none print:border-none">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-[#006b2c]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[#006b2c] text-2xl">qr_code_2</span>
          </div>
          <h1 className="text-lg font-extrabold text-[#0b1c30]">{name}</h1>
          <p className="text-xs text-[#545f73] font-medium">{park}</p>
          {sport && (
            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-extrabold rounded uppercase tracking-wider mt-1">
              {sport}
            </span>
          )}
        </div>

        {/* QR Code */}
        <div className="p-4 rounded-2xl border-2 border-[#006b2c]/20 bg-white shadow-inner">
          <QRCode
            value={qrValue}
            size={220}
            color="#006b2c"
            bgColor="#ffffff"
            style={{ borderRadius: 8 }}
          />
        </div>

        <p className="text-[11px] text-center text-[#545f73] leading-relaxed max-w-[220px]">
          Scan this QR code at the facility entrance to check in or view booking details.
        </p>

        {/* Amenity ID */}
        <div className="w-full bg-[#F8FAFC] rounded-xl px-4 py-2.5 text-center">
          <p className="text-[10px] text-[#545f73] font-medium">Amenity ID</p>
          <p className="text-xs font-mono font-bold text-[#0b1c30] break-all">{id}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full print:hidden">
          <Button
            onClick={handleDownload}
            className="flex-1"
            size="large"
            style={{ borderColor: '#006b2c', color: '#006b2c' }}
            icon={<span className="material-symbols-outlined text-sm" style={{ verticalAlign: 'middle' }}>download</span>}
          >
            Download
          </Button>
          <Button
            onClick={handlePrint}
            className="flex-1"
            size="large"
            style={{ borderColor: '#006b2c', color: '#006b2c' }}
            icon={<span className="material-symbols-outlined text-sm" style={{ verticalAlign: 'middle' }}>print</span>}
          >
            Print
          </Button>
        </div>

        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </div>
    </div>
  )
}
