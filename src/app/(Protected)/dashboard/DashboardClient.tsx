'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CityParkSidebar from './CityParkSidebar'
import CityParkHeader from './CityParkHeader'
import { mockFacilities, Facility, getStoredFacilities } from './mockData'
import { Image } from 'antd'
export default function DashboardClient() {

  const [facilities, setFacilities] = useState<Facility[]>([])

  useEffect(() => {
    setFacilities(getStoredFacilities())
  }, [])

  // Dynamic counts based on loaded facilities
  const totalAmenities = facilities.length || mockFacilities.length;
  const uniqueParks = new Set((facilities.length ? facilities : mockFacilities).map(f => f.name.split(" - ")[0] || f.name));
  const totalParks = uniqueParks.size;

  const [selectedId, setSelectedId] = useState<string>('facility-1')
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null)
  
  // Chart and statistics interactions


  const selectedFacility = facilities.find((f) => f.id === selectedId) || facilities[0] || mockFacilities[0]

  // Handler to download QR Code
  const handleDownloadQR = (facilityName: string, qrUrl: string) => {
    // Open a link to trigger mock download or create mock anchor
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `${facilityName.toLowerCase().replace(/\s+/g, '-')}-qr.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Toggle switch to make facility available/unavailable
  const handleStatusToggle = (id: string) => {
    setFacilities((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const isCurrentlyAvailable = f.status === 'AVAILABLE'
          const newStatus: Facility['status'] = isCurrentlyAvailable ? 'MAINTENANCE' : 'AVAILABLE'
          const logText = isCurrentlyAvailable
            ? 'Status changed to Maintenance by Admin'
            : 'Status changed to Available by Admin'
          
          return {
            ...f,
            status: newStatus,
            recentLogs: [
              {
                id: `log-admin-${Date.now()}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: logText,
                type: isCurrentlyAvailable ? 'warning' : 'success',
              },
              ...f.recentLogs,
            ],
          }
        }
        return f
      })
    )
  }





  // Status mapping UI helper
  const statusStyles = {
    AVAILABLE: { bg: 'bg-[#16A34A]/10', text: 'text-[#16A34A]', label: 'Available' },
    RESERVED: { bg: 'bg-[#2563EB]/10', text: 'text-[#2563EB]', label: 'Reserved' },
    MAINTENANCE: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', label: 'Maintenance' },
    UNAVAILABLE: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', label: 'Unavailable' },
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <CityParkSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <CityParkHeader />

        {/* Content Canvas */}
        <main className="flex-1 pt-24 pb-12 px-8 flex gap-8">
          
          {/* LEFT: Dashboard Columns */}
          <div className="flex-1 space-y-6">
            
            {/* Page Header Title */}
            <div>
              <h2 className="text-2xl font-bold text-[#0b1c30]">Dashboard Overview</h2>
              <p className="text-sm text-[#545f73]">Real-time management and booking utilization dashboard.</p>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { title: 'Total Parks', val: totalParks.toString(), change: '+3 this month', icon: 'park', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { title: 'Total Amenities', val: totalAmenities.toString(), change: '+8 this month', icon: 'sports_soccer', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              ].map((kpi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-[#545f73] uppercase tracking-wider">{kpi.title}</span>
                    <div className={`${kpi.bg} p-2 rounded-xl`}>
                      <span className={`material-symbols-outlined ${kpi.color} text-xl`}>{kpi.icon}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">{kpi.val}</h3>
                  <p className="text-xs text-[#16A34A] font-medium mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">arrow_upward</span>
                    {kpi.change}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Live Park Status Map */}
            <div className="bg-white p-6 rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-base text-[#0b1c30]">Live Facility Locations Map</h4>
                  <p className="text-xs text-[#545f73]">Select a marker coordinate on the map canvas to inspect that specific amenity.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#16A34A]">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> Available
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#2563EB]">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span> Reserved
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#F59E0B]">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Maintenance
                  </span>
                </div>
              </div>

              {/* Map Placeholder Image */}
              <div className="h-80 w-full relative rounded-xl overflow-hidden border border-slate-200/60 shadow-inner bg-slate-50">
                <Image
                  className="w-full h-full object-cover select-none pointer-events-none animate-fade-in"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYphNUeWqHukKfvcOh0Dm0qowmOtooKpVwk59IALgkOlwwKYQulWu5CwocDAOiidi65iJwTRbA8x87yAtADTdGjTWQAXp4WHwO-YkBCLcMDgA56Q2pz8xfPH-pWMZmh-0l54JTep6EVcqUmjJYYm9UDi5yhDR1zH1gb6t3CDafE7BtG135W8MZjjCQ46ot4ZgucjIqB0Hc5DvU6ZpOfG9vBYgQuW-D4nQP6e7X8_WfQ6RPzoqMPrvAvAzmQcM9EgOuuWtBWPMtSoXR"
                  alt="Live Map View"
                  preview={false}
                />

                {/* Overlaid Interactive Markers */}
                {facilities.map((fac) => {
                  const isSelected = selectedId === fac.id
                  const isHovered = hoveredPinId === fac.id

                  // Map absolute placement based on mock data lat/lng values
                  // coordinates ranges roughly 41.87 to 41.88 and -87.62 to -87.63
                  const y = ((41.883 - fac.lat) / (41.883 - 41.868)) * 100
                  const x = ((fac.lng - (-87.638)) / ((-87.618) - (-87.638))) * 100

                  // Color mapping based on sport/status
                  const pinColor = fac.status === 'AVAILABLE'
                    ? '#16A34A'
                    : fac.status === 'RESERVED'
                    ? '#2563EB'
                    : fac.status === 'MAINTENANCE'
                    ? '#F59E0B'
                    : '#EF4444'

                  const iconName = fac.sportType === 'Tennis'
                    ? 'sports_tennis'
                    : fac.sportType === 'Football'
                    ? 'sports_soccer'
                    : fac.sportType === 'Cricket'
                    ? 'sports_cricket'
                    : fac.sportType === 'Aquatics'
                    ? 'pool'
                    : 'sports_badminton'

                  return (
                    <div
                      key={fac.id}
                      className="absolute z-20 transition-transform duration-200"
                      style={{ top: `${y}%`, left: `${x}%` }}
                    >
                      <button
                        onClick={() => setSelectedId(fac.id)}
                        onMouseEnter={() => setHoveredPinId(fac.id)}
                        onMouseLeave={() => setHoveredPinId(null)}
                        className={`flex flex-col items-center -translate-x-1/2 -translate-y-full relative transition-transform ${
                          isSelected || isHovered ? 'scale-115' : 'scale-100'
                        }`}
                      >
                        <div
                          className="bg-white p-1.5 rounded-lg shadow-xl border-2 flex items-center justify-center"
                          style={{ borderColor: pinColor }}
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={{ color: pinColor, fontVariationSettings: "'FILL' 1" }}
                          >
                            {iconName}
                          </span>
                        </div>
                        {/* Pin needle */}
                        <div className="w-1.5 h-1.5 rounded-full bg-white border shadow-md -mt-0.5" style={{ borderColor: pinColor }}></div>

                        {/* Hover Tooltip */}
                        <AnimatePresence>
                          {(isHovered || isSelected) && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute bg-[#0b1c30] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg -top-10 whitespace-nowrap z-30"
                            >
                              {fac.name}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Selected Facility Details Panel */}
          <div className="w-[400px] shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFacility.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl border border-[#bdcaba]/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-6 space-y-6 sticky top-24"
              >
                
                {/* Heading / Photo */}
                <div className="space-y-4">
                  <div className="h-44 w-full rounded-xl overflow-hidden relative border border-slate-100">
                    <Image
                      className="w-full h-full object-cover animate-fade-in"
                      src={selectedFacility.imageUrl}
                      alt={selectedFacility.name}
                      preview={false}
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        statusStyles[selectedFacility.status].bg
                      } ${statusStyles[selectedFacility.status].text}`}>
                        {statusStyles[selectedFacility.status].label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#0b1c30]">{selectedFacility.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded uppercase tracking-wider">
                        {selectedFacility.sportType}
                      </span>
                      <span className="text-xs text-[#545f73]">Hourly Rate: ${selectedFacility.pricePerHour.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#545f73] leading-relaxed">
                    {selectedFacility.description}
                  </p>
                </div>

                {/* Switch Actions */}
                <div className="border-t border-[#bdcaba]/20 pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#0b1c30]">Available for Booking</h4>
                    <p className="text-[10px] text-[#545f73]">Toggle facility availability</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedFacility.status === 'AVAILABLE' || selectedFacility.status === 'RESERVED'}
                      onChange={() => handleStatusToggle(selectedFacility.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-5 after:width-5 after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006b2c]"></div>
                  </label>
                </div>

                {/* QR Code Action Card */}
                <div className="bg-[#eff4ff]/60 border border-[#bdcaba]/20 rounded-xl p-4 flex items-center gap-4">
                  <Image
                    className="w-16 h-16 rounded-lg bg-white border border-slate-200 p-1 shrink-0 animate-fade-in"
                    src={selectedFacility.qrCodeUrl}
                    alt="QR Code"
                    preview={false}
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-[#0b1c30]">QR Check-in Code</h4>
                    <p className="text-[10px] text-[#545f73]">Unique ID: {selectedFacility.id}</p>
                    <button
                      onClick={() => handleDownloadQR(selectedFacility.name, selectedFacility.qrCodeUrl)}
                      className="text-xs font-bold text-[#006b2c] hover:underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">download</span>
                      Download PNG
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-semibold text-xs text-slate-700">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit Facility
                  </button>
                  <button className="flex items-center justify-center gap-1 px-4 py-2 border border-red-200 bg-red-50/50 rounded-lg hover:bg-red-50 transition-all font-semibold text-xs text-red-600">
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Deactivate
                  </button>
                </div>

                {/* Recent Activity Log */}
                <div className="border-t border-[#bdcaba]/20 pt-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">Facility History Log</h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {selectedFacility.recentLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2.5 text-xs">
                        <span className="font-mono text-[#545f73] shrink-0 text-[10px] mt-0.5">{log.time}</span>
                        <div className="flex-1 flex gap-1.5 items-start">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                            log.type === 'success'
                              ? 'bg-green-500'
                              : log.type === 'warning'
                              ? 'bg-yellow-500'
                              : log.type === 'error'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`} />
                          <span className="text-slate-600 text-[11px] leading-snug">{log.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </main>
      </div>
    </div>
  )
}
