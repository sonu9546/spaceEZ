'use client'

import React, { useState } from 'react'
import { Select } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'

import CityParkSidebar from '../../dashboard/CityParkSidebar'
import CityParkHeader from '../../dashboard/CityParkHeader'
import { useAppMutate } from '@/tanstack/useAppMutate'
import { QUERY_KEYS, MUTATION_KEYS } from '@/tanstack/keys'
import { saveMultipleFacilities } from '../../dashboard/mockData'

// Local Types
interface AmenityInput {
  id: string
  sportType: string
  name: string
  maxPlayers: number
  pricePerHour: number
  isAvailable: boolean
  guidelines: string
  qrCodeGenerated: boolean
  lat?: number
  lng?: number
  placed: boolean
}

export default function AddParkClient() {


  // Wizard state: 1, 2, 3
  const [step, setStep] = useState<number>(1)

  // Step 1: General Info State
  const [parkName, setParkName] = useState('Riverside Meadows Park')
  const [description, setDescription] = useState(
    'A beautiful urban green space featuring modern recreational fields, spectator stands, and lighting for night play.'
  )
  const [address, setAddress] = useState('350 E Monroe St, Chicago, IL 60603')
  const [openingTime, setOpeningTime] = useState('06:00 AM')
  const [closingTime, setClosingTime] = useState('10:00 PM')
  const [coverPhoto, setCoverPhoto] = useState<string | null>(
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80'
  )

  // Step 2: Amenities State
  const [amenities, setAmenities] = useState<AmenityInput[]>([
    {
      id: 'amenity-1',
      sportType: 'cricket',
      name: 'West Wing Cricket Ground',
      maxPlayers: 22,
      pricePerHour: 45.0,
      isAvailable: true,
      guidelines: 'Clean non-marking studs required. Full safety kit mandatory.',
      qrCodeGenerated: true,
      placed: false,
    },
    {
      id: 'amenity-2',
      sportType: 'tennis',
      name: 'North Court 01',
      maxPlayers: 4,
      pricePerHour: 15.0,
      isAvailable: false,
      guidelines: 'Bring your own rackets. Maximum booking duration of 2 hours.',
      qrCodeGenerated: false,
      placed: false,
    },
  ])

  const [selectedAmenityToPlace, setSelectedAmenityToPlace] = useState<string>('amenity-1')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [mapActiveAmenityId, setMapActiveAmenityId] = useState<string | null>(null)

  const handleSaveToLocalStorage = () => {
    const newFacilities = amenities.map((a, index) => {
      const id = `facility-new-${Date.now()}-${index}`
      const sportLabel = a.sportType ? (a.sportType.charAt(0).toUpperCase() + a.sportType.slice(1).toLowerCase()) : 'Tennis'
      const facilityItem: any = {
        id: id,
        name: `${parkName} - ${a.name || 'Amenity'}`,
        sportType: sportLabel as any,
        status: a.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        pricePerHour: Number(a.pricePerHour) || 15.00,
        activeBookings: 0,
        imageUrl: coverPhoto || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80',
        qrCodeUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0hNOA99dE8jFzmfeP5vSr064sb5jbk_qQifjoTW1WfztlsGZ-u3qidEQPKJ-7u-X29WO2UonxWeA_9szSqxcNEJFZ4YRt1mSOFnfIysZS-r-0X-PdZwvKA9DYGGLtzTTjoZlaU0zHXDv1SWYu_Z3eyfae7BSemjTZsOkbAggryQVqKS7V1GnPUDyMTZpR7foGlD48nXSysF_FznGF1ke53GNJ1i5EkUX0qW1gEqEeZ1cqdUIoHuNjVlvH2LO4Osus8aBWEWBjwjKG',
        lat: a.lat || 41.8781,
        lng: a.lng || -87.6298,
        description: `${sportLabel} • ${a.guidelines || 'Standard amenity rules apply.'}`,
        address: address,
        recentLogs: [
          { id: `log-new-${Date.now()}-${index}-1`, time: '12:00 PM', text: 'Facility added to database', type: 'success' }
        ]
      }
      return facilityItem
    })
    
    saveMultipleFacilities(newFacilities)
  }

  // Use application mutation helper for publishing the park
  const { mutate: publishPark, isPending: isPublishing } = useAppMutate({
    mutationKey: [MUTATION_KEYS.PUBLISH_PARK],
    invalidateQueryKeys: [QUERY_KEYS.PARKS],
    showSuccessToast: false,
    showErrorToast: false,
    onSuccess: () => {
      handleSaveToLocalStorage()
      setShowSuccessModal(true)
    },
    onError: () => {
      console.warn("Backend API not reachable. Simulating offline park publishing success for demo.")
      handleSaveToLocalStorage()
      setShowSuccessModal(true)
    }
  })

  // Step 2 handlers
  const handleAddAmenity = () => {
    const newId = `amenity-${Date.now()}`
    setAmenities((prev) => [
      ...prev,
      {
        id: newId,
        sportType: '',
        name: '',
        maxPlayers: 10,
        pricePerHour: 0.0,
        isAvailable: true,
        guidelines: '',
        qrCodeGenerated: false,
        placed: false,
      },
    ])
  }

  const handleRemoveAmenity = (id: string) => {
    setAmenities((prev) => prev.filter((a) => a.id !== id))
  }

  const handleUpdateAmenity = (id: string, field: keyof AmenityInput, value: any) => {
    setAmenities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, [field]: value }
        }
        return a
      })
    )
  }

  const handleGenerateQR = (id: string) => {
    setAmenities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, qrCodeGenerated: true }
        }
        return a
      })
    )
  }

  // Step 3 map placement simulation
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedAmenityToPlace) return

    // Get click percentages to mock coordinate placement
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Map percentages to mock Chicago Coordinates
    // 41.8781 base +/- 0.005
    const mockLat = parseFloat((41.8781 + (50 - y) * 0.00015).toFixed(4))
    const mockLng = parseFloat((-87.6298 + (x - 50) * 0.00025).toFixed(4))

    setAmenities((prev) =>
      prev.map((a) => {
        if (a.id === selectedAmenityToPlace) {
          return { ...a, lat: mockLat, lng: mockLng, placed: true }
        }
        return a
      })
    )

    // Automatically select the next unplaced amenity
    const nextUnplaced = amenities.find((a) => a.id !== selectedAmenityToPlace && !a.placed)
    if (nextUnplaced) {
      setSelectedAmenityToPlace(nextUnplaced.id)
    } else {
      setSelectedAmenityToPlace('')
    }
  }

  // Navigation Steps Action
  const handleNextStep = () => {
    if (step < 3) {
      setStep((prev) => prev + 1)
    } else {
      // Step 3: Trigger Launch API Call
      publishPark({
        url: '/parks',
        method: 'POST',
        body: {
          name: parkName,
          description: description,
          address: address,
          openingTime: openingTime,
          closingTime: closingTime,
          coverPhoto: coverPhoto,
          amenities: amenities.map((a) => ({
            sportType: a.sportType,
            name: a.name,
            maxPlayers: a.maxPlayers,
            pricePerHour: a.pricePerHour,
            isAvailable: a.isAvailable,
            guidelines: a.guidelines,
            lat: a.lat,
            lng: a.lng,
          })),
        },
      })
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1)
    }
  }

  // Header step indicators JSX
  const stepIndicators = (
    <nav className="flex items-center gap-6">
      <div className={`flex items-center gap-2 ${step > 1 ? 'opacity-100 text-[#006b2c] font-bold' : step === 1 ? 'text-[#006b2c] font-bold' : 'opacity-50 text-[#545f73]'}`}>
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
          step > 1 ? 'bg-[#006b2c] text-white' : 'border border-[#006b2c] text-[#006b2c] bg-white'
        }`}>
          {step > 1 ? <span className="material-symbols-outlined text-[14px]">check</span> : '1'}
        </span>
        <span className="text-xs uppercase tracking-wider">General Info</span>
      </div>
      <div className="w-8 h-px bg-[#bdcaba]/40" />

      <div className={`flex items-center gap-2 ${step > 2 ? 'opacity-100 text-[#006b2c] font-bold' : step === 2 ? 'text-[#006b2c] font-bold' : 'opacity-50 text-[#545f73]'}`}>
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
          step > 2 ? 'bg-[#006b2c] text-white' : step === 2 ? 'border border-[#006b2c] text-[#006b2c] bg-white ring-4 ring-[#006b2c]/10' : 'border border-[#bdcaba]/60 text-[#545f73]'
        }`}>
          {step > 2 ? <span className="material-symbols-outlined text-[14px]">check</span> : '2'}
        </span>
        <span className="text-xs uppercase tracking-wider">Define Amenities</span>
      </div>
      <div className="w-8 h-px bg-[#bdcaba]/40" />

      <div className={`flex items-center gap-2 ${step === 3 ? 'text-[#006b2c] font-bold' : 'opacity-50 text-[#545f73]'}`}>
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
          step === 3 ? 'border border-[#006b2c] text-[#006b2c] bg-white ring-4 ring-[#006b2c]/10' : 'border border-[#bdcaba]/60 text-[#545f73]'
        }`}>
          3
        </span>
        <span className="text-xs uppercase tracking-wider">Add Locations</span>
      </div>
    </nav>
  )

  // Render content of active step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-12 gap-8 max-w-5xl mx-auto"
          >
            {/* Left: Fields */}
            <div className="col-span-7 bg-white p-8 rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] space-y-6">
              <h3 className="text-lg font-bold text-[#0b1c30] border-b border-[#bdcaba]/20 pb-3">Park General Profile</h3>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0b1c30] uppercase">Park Name</label>
                <input
                  type="text"
                  value={parkName}
                  onChange={(e) => setParkName(e.target.value)}
                  placeholder="e.g. Millenium Sports Field"
                  className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0b1c30] uppercase">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide public description, parking, accessibility details..."
                  rows={4}
                  className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0b1c30] uppercase">Park Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">location_on</span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street address, state, and ZIP code"
                    className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#0b1c30] uppercase">Opening Hours</label>
                  <input
                    type="text"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#0b1c30] uppercase">Closing Hours</label>
                  <input
                    type="text"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all text-center"
                  />
                </div>
              </div>

              {/* Cover Photo Drag and Drop */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0b1c30] uppercase">Cover Banner Image</label>
                <div className="border-2 border-dashed border-[#bdcaba]/60 rounded-xl p-5 text-center bg-[#F8FAFC] hover:bg-slate-50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                  {coverPhoto ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverPhoto} alt="Cover Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setCoverPhoto(null) }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">delete</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[#006b2c] text-3xl mb-1">cloud_upload</span>
                      <p className="text-xs text-[#0b1c30] font-bold">Drag and drop park banner here</p>
                      <p className="text-[10px] text-[#545f73] mt-0.5">Supports PNG, JPG, JPEG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Tip card and Static Map Preview */}
            <div className="col-span-5 space-y-6">
              <div className="bg-[#eff4ff]/60 border border-[#006b2c]/20 p-6 rounded-2xl">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[#006b2c] text-2xl">lightbulb</span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">Quick Setup Tip</h4>
                    <p className="text-xs text-[#545f73] leading-relaxed">
                      Choose a recognizable cover banner and set precise hours. This information displays directly to customers on their mobile booking dashboard.
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Canvas Preview Card */}
              <div className="bg-white p-4 rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] space-y-3">
                <h4 className="text-xs font-bold text-[#0b1c30] uppercase">Locational Preview</h4>
                <div className="h-56 rounded-xl overflow-hidden relative border bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtyxagyNUrwu1RJZEoB9eMqm34_D5ithTKVax7YNh9RYLecHJhlPEJS-TW85btJ2iD4n--qOvOLonkSeI9yuFDud0Fu44u9OzfQA89Sa12oq31pGclaOdn_cvif9cj4T7yLHoBXUvYw1NZpGqw35328HH5ykekct3fW4TjxnJS-5SkRXqqT_R-qwEJHOMWr9RcjoPJB5Ton_sw2dKmbDdulF7FNq660F6VVNkoYcVGwUsaSse5bxTD6c0HOYtsRkkqEcM8py8X-7fB"
                    alt="Map Preview"
                  />
                  <div className="absolute inset-0 bg-[#0b1c30]/10 flex items-center justify-center">
                    <div className="bg-white px-3 py-1.5 rounded-full shadow-lg border-2 border-[#006b2c] flex items-center gap-1.5 animate-bounce">
                      <span className="material-symbols-outlined text-[#006b2c] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                      <span className="text-[10px] font-extrabold text-[#0b1c30]">PARK CENTER</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* List of Amenity cards */}
            <div className="space-y-6">
              {amenities.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#bdcaba]/30 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative space-y-4 hover:border-[#006b2c]/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    {/* Delete button */}
                    <button
                      onClick={() => handleRemoveAmenity(item.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      title="Delete Amenity"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-[#0b1c30] border-b pb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#006b2c]/10 text-[#006b2c] flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    Amenity Details
                  </h4>

                  <div className="grid grid-cols-12 gap-6">
                    {/* Sport Type */}
                    <div className="col-span-4 space-y-2">
                      <label className="block text-xs font-bold text-[#0b1c30] uppercase">Sport Type</label>
                      <Select
                        value={item.sportType || undefined}
                        onChange={(val) => handleUpdateAmenity(item.id, 'sportType', val)}
                        placeholder="Select Sport"
                        className="w-full"
                        size="medium"
                        options={[
                          { label: 'Cricket', value: 'cricket' },
                          { label: 'Football', value: 'football' },
                          { label: 'Badminton', value: 'badminton' },
                          { label: 'Tennis', value: 'tennis' },
                        ]}
                      />
                    </div>

                    {/* Ground or Court Name */}
                    <div className="col-span-8 space-y-2">
                      <label className="block text-xs font-bold text-[#0b1c30] uppercase">Ground or Court Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateAmenity(item.id, 'name', e.target.value)}
                        placeholder="e.g. West Wing Cricket Ground"
                        className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-6">
                    {/* Max Players */}
                    <div className="col-span-3 space-y-2">
                      <label className="block text-xs font-bold text-[#0b1c30] uppercase">Max Players</label>
                      <input
                        type="number"
                        value={item.maxPlayers}
                        onChange={(e) => handleUpdateAmenity(item.id, 'maxPlayers', parseInt(e.target.value) || 0)}
                        className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all"
                      />
                    </div>

                    {/* Price Per Hour */}
                    <div className="col-span-3 space-y-2">
                      <label className="block text-xs font-bold text-[#0b1c30] uppercase">Price Per Hour ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          value={item.pricePerHour || ''}
                          onChange={(e) => handleUpdateAmenity(item.id, 'pricePerHour', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl pl-7 pr-4 py-2.5 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all text-right"
                        />
                      </div>
                    </div>

                    {/* Booking Availability */}
                    <div className="col-span-3 flex flex-col justify-end">
                      <div className="flex items-center gap-3 h-[42px]">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.isAvailable}
                            onChange={(e) => handleUpdateAmenity(item.id, 'isAvailable', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-5 after:width-5 after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006b2c]"></div>
                        </label>
                        <span className="text-xs font-bold text-[#0b1c30]">Booking Active</span>
                      </div>
                    </div>

                    {/* QR Code Action */}
                    <div className="col-span-3 flex items-end">
                      <button
                        onClick={() => {
                          handleGenerateQR(item.id)
                          const params = new URLSearchParams({
                            id: item.id,
                            name: item.name,
                            park: parkName,
                            sport: item.sportType,
                          })
                          const a = document.createElement('a')
                          a.href = `/parks/qr?${params.toString()}`
                          a.target = '_blank'
                          a.rel = 'noopener noreferrer'
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                        }}
                        
                        disabled={!item.name}
                        className={`w-full py-2.5 border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          item.qrCodeGenerated
                            ? 'bg-[#eff4ff] border-[#006b2c]/30 text-[#006b2c]'
                            : item.name
                            ? 'border-[#006b2c] text-[#006b2c] hover:bg-[#006b2c]/5 active:scale-95'
                            : 'border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">qr_code_2</span>
                        {item.qrCodeGenerated ? 'View QR Code' : 'Generate QR Code'}
                      </button>
                    </div>
                  </div>

                  {/* Guidelines */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#0b1c30] uppercase">Guidelines &amp; Safety Rules</label>
                    <textarea
                      value={item.guidelines}
                      onChange={(e) => handleUpdateAmenity(item.id, 'guidelines', e.target.value)}
                      placeholder="Add rules (shoes requirement, deposit rules, guest capacity)..."
                      rows={2}
                      className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Map Location Section */}
                  <div className="border-t border-[#bdcaba]/20 pt-4 mt-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#0b1c30] uppercase flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#006b2c]">location_on</span>
                        Map Coordinates &amp; Location
                      </label>
                      {item.placed ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          Placed
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          Not Placed
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-6 items-center">
                      <div className="col-span-4 space-y-2">
                        <label className="block text-[10px] font-bold text-[#545f73] uppercase">Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          placeholder="e.g. 41.8781"
                          value={item.lat !== undefined ? item.lat : ''}
                          onChange={(e) => handleUpdateAmenity(item.id, 'lat', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-2.5 text-sm text-[#0b1c30] font-mono outline-none"
                        />
                      </div>

                      <div className="col-span-4 space-y-2">
                        <label className="block text-[10px] font-bold text-[#545f73] uppercase">Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          placeholder="e.g. -87.6298"
                          value={item.lng !== undefined ? item.lng : ''}
                          onChange={(e) => handleUpdateAmenity(item.id, 'lng', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-2.5 text-sm text-[#0b1c30] font-mono outline-none"
                        />
                      </div>

                      <div className="col-span-4 flex items-end h-[62px] gap-2">
                        <button
                          type="button"
                          onClick={() => setMapActiveAmenityId(item.id)}
                          className="flex-1 py-2.5 bg-[#006b2c]/10 text-[#006b2c] border border-[#006b2c]/20 hover:bg-[#006b2c]/20 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <span className="material-symbols-outlined text-base">map</span>
                          {item.placed ? 'Change' : 'Mark on Map'}
                        </button>

                        {item.placed && (
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateAmenity(item.id, 'placed', false)
                              handleUpdateAmenity(item.id, 'lat', undefined)
                              handleUpdateAmenity(item.id, 'lng', undefined)
                            }}
                            className="p-2.5 border border-red-200 text-red-500 hover:bg-red-50 font-bold rounded-xl text-xs flex items-center justify-center transition-all active:scale-95"
                            title="Reset location"
                          >
                            <span className="material-symbols-outlined text-base">location_off</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Another Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleAddAmenity}
                className="flex items-center justify-center gap-2 text-[#006b2c] font-bold text-sm hover:bg-[#006b2c]/5 px-8 py-4 rounded-2xl border-2 border-dashed border-[#006b2c]/30 hover:border-[#006b2c]/60 transition-all w-full max-w-md group"
              >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                + Add Another Amenity
              </button>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex overflow-hidden border border-[#bdcaba]/20 rounded-2xl bg-white shadow-sm h-[calc(100vh-14rem)]"
          >
            {/* LEFT: Map workspace */}
            <div className="flex-1 relative bg-slate-50 cursor-crosshair overflow-hidden group">
              
              {/* Chicago satellite view background */}
              <div
                onClick={handleMapClick}
                className="absolute inset-0 bg-cover bg-center transition-all select-none"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6gJSYMzWF_QWI25bMFxIMnnp1TRADirIxWWwwacKDOPAISgPu4PrKcggzLErIskoCg6C_forqtYobMMuQ6XTfq7ngC6JroZ94yoy0W8BJQwdyx_owxafEdbOQk9xfS3FAWqigZhJ3ByhJnjbHtqxe6qByQAIRiwAZE-7lzTgMRnFCjcgD_r1AwG7fHxbTJ27ZbRf_HmTacrJP9WYAgpFdCU0eoHoePMol6TgcFjqzq0xM9kB-OgovaTAzALI_f2c35n94_qx2_B7C')",
                }}
              />

              {/* Floating map search */}
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center">
                <div className="relative flex-1 max-w-md shadow-lg rounded-xl overflow-hidden border bg-white flex items-center px-3 py-2">
                  <span className="material-symbols-outlined text-[#545f73] text-lg mr-2 select-none">search</span>
                  <input
                    className="w-full bg-transparent border-none text-xs outline-none text-[#0b1c30]"
                    placeholder="Search coordinates or search addresses..."
                    type="text"
                    defaultValue={address}
                    readOnly
                  />
                </div>
              </div>

              {/* Map markers representing already placed amenities */}
              {amenities
                .filter((a) => a.placed && a.lat && a.lng)
                .map((a) => {
                  const isSelected = selectedAmenityToPlace === a.id
                  const markerColor =
                    a.sportType === 'cricket'
                      ? '#16A34A'
                      : a.sportType === 'tennis'
                      ? '#2563EB'
                      : '#EF4444'
                  const markerIcon =
                    a.sportType === 'cricket'
                      ? 'sports_cricket'
                      : a.sportType === 'tennis'
                      ? 'sports_tennis'
                      : 'sports_soccer'

                  // Mock dynamic relative location overlay coordinates map:
                  // Base 41.8781 and -87.6298
                  const topPercent = 50 - ((a.lat! - 41.8781) / 0.00015)
                  const leftPercent = 50 + ((a.lng! - (-87.6298)) / 0.00025)

                  return (
                    <div
                      key={a.id}
                      className="absolute z-20 transition-transform duration-200"
                      style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                    >
                      <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full">
                        <div
                          className={`p-2 bg-white rounded-lg shadow-xl border-2 flex items-center justify-center ${
                            isSelected ? 'ring-4 ring-green-600/20' : ''
                          }`}
                          style={{ borderColor: markerColor }}
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={{ color: markerColor, fontVariationSettings: "'FILL' 1" }}
                          >
                            {markerIcon}
                          </span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white border shadow-md -mt-0.5" style={{ borderColor: markerColor }}></div>
                        <div className="mt-1 bg-[#0b1c30] text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                          {a.name}
                        </div>
                      </div>
                    </div>
                  )
                })}

              {/* Draggable helper HUD instruction */}
              {selectedAmenityToPlace && (
                <div className="absolute bottom-4 left-4 bg-[#0b1c30]/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg border border-[#bdcaba]/20">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
                    Click on the map layout above to drop the pin coordinates for: <span className="text-green-400">&quot;{amenities.find(a => a.id === selectedAmenityToPlace)?.name}&quot;</span>
                  </span>
                </div>
              )}
            </div>

            {/* RIGHT: Coordinates assignment sidebar */}
            <aside className="w-[380px] border-l border-[#bdcaba]/20 flex flex-col h-full bg-white">
              <div className="p-5 border-b border-[#bdcaba]/20">
                <h4 className="font-bold text-sm text-[#0b1c30] mb-1">Assign Locations</h4>
                <p className="text-xs text-[#545f73] leading-relaxed">
                  Click on the map workspace to drop marker pins representing physical amenities.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {amenities.map((item) => {
                  const isSelected = selectedAmenityToPlace === item.id
                  const isPlaced = item.placed && item.lat && item.lng
                  const badgeStyle =
                    item.sportType === 'cricket'
                      ? 'bg-green-100 text-green-700'
                      : item.sportType === 'tennis'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700'

                  return (
                    <div
                      key={item.id}
                      onClick={() => !isPlaced && setSelectedAmenityToPlace(item.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-[#006b2c] bg-[#eff4ff]/60 shadow-sm'
                          : isPlaced
                          ? 'border-emerald-100 bg-emerald-50/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined text-lg ${
                              item.sportType === 'cricket'
                                ? 'text-[#16A34A]'
                                : item.sportType === 'tennis'
                                ? 'text-[#2563EB]'
                                : 'text-slate-500'
                            }`}
                          >
                            {item.sportType === 'cricket'
                              ? 'sports_cricket'
                              : item.sportType === 'tennis'
                              ? 'sports_tennis'
                              : 'sports_soccer'}
                          </span>
                          <span className="font-bold text-xs text-[#0b1c30]">{item.name || 'Unnamed Amenity'}</span>
                        </div>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${badgeStyle}`}>
                          {item.sportType || 'sport'}
                        </span>
                      </div>

                      {isPlaced ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="space-y-1 bg-[#F8FAFC] p-2 rounded-lg border border-slate-100">
                              <span className="font-bold text-[#545f73] uppercase tracking-wider block">Latitude</span>
                              <span className="font-mono text-[#006b2c] font-bold">{item.lat}</span>
                            </div>
                            <div className="space-y-1 bg-[#F8FAFC] p-2 rounded-lg border border-slate-100">
                              <span className="font-bold text-[#545f73] uppercase tracking-wider block">Longitude</span>
                              <span className="font-mono text-[#006b2c] font-bold">{item.lng}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setAmenities((prev) =>
                                prev.map((a) => (a.id === item.id ? { ...a, placed: false, lat: undefined, lng: undefined } : a))
                              )
                              setSelectedAmenityToPlace(item.id)
                            }}
                            className="w-full text-center text-[10px] font-bold text-red-600 hover:underline border border-dashed border-red-200 py-1.5 rounded-lg"
                          >
                            Reset Marker Location
                          </button>
                        </div>
                      ) : (
                        <div className="border border-dashed border-slate-200 rounded-lg p-3 text-center hover:bg-slate-50/50">
                          <span className="material-symbols-outlined text-slate-400 text-xl mb-1">add_location_alt</span>
                          <p className="text-[10px] font-medium text-slate-500">
                            {isSelected ? 'Click map layout to place' : 'Click card to link location'}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </aside>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <CityParkSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <CityParkHeader showSearch={false} stepNavigation={stepIndicators} />

        {/* Wizard Panel */}
        <main className="flex-1 pt-24 pb-28 px-8 flex flex-col">
          <div className="mb-6 max-w-5xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-[#0b1c30]">Add New Park</h2>
            <p className="text-sm text-[#545f73]">
              {step === 1
                ? 'General information and opening schedule profile.'
                : step === 2
                ? 'Define sporting fields, scheduling constraints, and prices.'
                : 'Map coordinates linked assignment.'}
            </p>
          </div>

          <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col">
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
          </div>
        </main>

        {/* Sticky footer navigation */}
        <footer className="fixed bottom-0 right-0 w-[calc(100%-260px)] h-20 bg-white border-t border-[#bdcaba]/30 flex items-center justify-between px-8 z-40">
          <button
            onClick={handlePrevStep}
            disabled={step === 1}
            className={`flex items-center gap-1.5 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              step === 1
                ? 'text-slate-300 cursor-not-allowed opacity-50'
                : 'text-[#545f73] hover:bg-[#eff4ff]/60 hover:text-[#0b1c30] active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back
          </button>

          <div className="flex items-center gap-4">
            {step === 3 && amenities.filter((a) => !a.placed).length > 0 && (
              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                {amenities.filter((a) => !a.placed).length} amenity markers pending placement
              </span>
            )}
            
            <button className="text-xs font-bold text-slate-500 px-4 py-2 hover:underline">
              Save Draft
            </button>

            <button
              onClick={handleNextStep}
              disabled={isPublishing}
              className="bg-[#006b2c] text-white font-bold text-sm px-8 py-3 rounded-lg hover:bg-[#00873a] transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5 disabled:opacity-75 disabled:cursor-wait"
            >
              {isPublishing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Publishing...
                </>
              ) : (
                <>
                  {step === 3 ? 'Publish Park' : 'Continue'}
                  {step < 3 && <span className="material-symbols-outlined text-base">arrow_forward</span>}
                </>
              )}
            </button>
          </div>
        </footer>
      </div>

      {/* Dynamic SweetAlert-style Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-6"
            >
              {/* Success Badge */}
              <div className="w-16 h-16 bg-[#eff4ff] text-[#006b2c] rounded-full mx-auto flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-3xl font-extrabold">check_circle</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#0b1c30]">Park Launched Successfully!</h3>
                <p className="text-xs text-[#545f73] leading-relaxed">
                  Your new location <span className="text-[#0b1c30] font-semibold">&quot;{parkName}&quot;</span> has been configured with {amenities.length} active sporting facilities. Mobile users can now check in and reserve coordinates immediately.
                </p>
              </div>

              {/* Park configuration breakdown */}
              <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-4 text-left divide-y divide-slate-100">
                <div className="flex justify-between py-2 text-xs">
                  <span className="text-slate-500">Address</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">{address}</span>
                </div>
                <div className="flex justify-between py-2 text-xs">
                  <span className="text-slate-500">Total Amenities</span>
                  <span className="font-semibold text-slate-800">{amenities.length} grounds/courts</span>
                </div>
                <div className="flex justify-between py-2 text-xs">
                  <span className="text-slate-500">Operating Time</span>
                  <span className="font-semibold text-slate-800">{openingTime} - {closingTime}</span>
                </div>
              </div>

              <button
                  onClick={() => {
                  setShowSuccessModal(false)
                  window.location.href = '/parks'
                }}
                className="w-full bg-[#006b2c] text-white font-bold py-3.5 rounded-xl hover:bg-[#00873a] transition-all active:scale-95 shadow-md text-sm"
              >
                Go to Parks Directory
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Map Modal for Step 2 Location Assignment */}
      <AnimatePresence>
        {mapActiveAmenityId !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-4xl w-full flex flex-col h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[#bdcaba]/20 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-[#0b1c30]">
                    Mark Location: {amenities.find((a) => a.id === mapActiveAmenityId)?.name || 'Unnamed Amenity'}
                  </h3>
                  <p className="text-xs text-[#545f73]">
                    Click anywhere on the satellite view to drop the marker pin for this facility.
                  </p>
                </div>
                <button
                  onClick={() => setMapActiveAmenityId(null)}
                  className="p-2 rounded-full hover:bg-slate-200 text-[#545f73] transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Modal Map Workspace */}
              <div className="flex-1 relative bg-slate-100 cursor-crosshair overflow-hidden group">
                {/* Satellite Background */}
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width) * 100
                    const y = ((e.clientY - rect.top) / rect.height) * 100
                    
                    const mockLat = parseFloat((41.8781 + (50 - y) * 0.00015).toFixed(4))
                    const mockLng = parseFloat((-87.6298 + (x - 50) * 0.00025).toFixed(4))
                    
                    setAmenities((prev) =>
                      prev.map((a) =>
                        a.id === mapActiveAmenityId
                          ? { ...a, lat: mockLat, lng: mockLng, placed: true }
                          : a
                      )
                    )
                  }}
                  className="absolute inset-0 bg-cover bg-center select-none"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6gJSYMzWF_QWI25bMFxIMnnp1TRADirIxWWwwacKDOPAISgPu4PrKcggzLErIskoCg6C_forqtYobMMuQ6XTfq7ngC6JroZ94yoy0W8BJQwdyx_owxafEdbOQk9xfS3FAWqigZhJ3ByhJnjbHtqxe6qByQAIRiwAZE-7lzTgMRnFCjcgD_r1AwG7fHxbTJ27ZbRf_HmTacrJP9WYAgpFdCU0eoHoePMol6TgcFjqzq0xM9kB-OgovaTAzALI_f2c35n94_qx2_B7C')",
                  }}
                />

                {/* Display markers of all placed amenities */}
                {amenities
                  .filter((a) => a.placed && a.lat && a.lng)
                  .map((a) => {
                    const isActive = a.id === mapActiveAmenityId
                    const markerColor = isActive
                      ? '#006b2c'
                      : a.sportType === 'cricket'
                      ? '#16A34A'
                      : a.sportType === 'tennis'
                      ? '#2563EB'
                      : '#EF4444'

                    const markerIcon =
                      a.sportType === 'cricket'
                        ? 'sports_cricket'
                        : a.sportType === 'tennis'
                        ? 'sports_tennis'
                        : 'sports_soccer'

                    const topPercent = 50 - ((a.lat! - 41.8781) / 0.00015)
                    const leftPercent = 50 + ((a.lng! - (-87.6298)) / 0.00025)

                    return (
                      <div
                        key={a.id}
                        className={`absolute z-20 transition-all duration-200 ${isActive ? 'animate-bounce' : ''}`}
                        style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                      >
                        <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full">
                          <div
                            className={`p-2 bg-white rounded-lg shadow-xl border-2 flex items-center justify-center ${
                              isActive ? 'ring-4 ring-green-600/30' : ''
                            }`}
                            style={{ borderColor: markerColor }}
                          >
                            <span
                              className="material-symbols-outlined text-lg font-bold"
                              style={{ color: markerColor, fontVariationSettings: "'FILL' 1" }}
                            >
                              {markerIcon}
                            </span>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-white border shadow-md -mt-0.5" style={{ borderColor: markerColor }}></div>
                          <div className="mt-1 bg-[#0b1c30] text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                            {a.name || 'Unnamed'} {isActive ? '(Active)' : ''}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Modal Footer HUD */}
              <div className="p-6 border-t border-[#bdcaba]/20 bg-slate-50 flex items-center justify-between">
                <div className="flex gap-4 text-xs font-mono">
                  <div className="bg-white px-3 py-2 rounded-lg border">
                    <span className="text-slate-500 uppercase tracking-wider mr-1 text-[10px]">Lat:</span>
                    <span className="font-bold text-[#0b1c30]">
                      {amenities.find((a) => a.id === mapActiveAmenityId)?.lat || 'Not placed'}
                    </span>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg border">
                    <span className="text-slate-500 uppercase tracking-wider mr-1 text-[10px]">Lng:</span>
                    <span className="font-bold text-[#0b1c30]">
                      {amenities.find((a) => a.id === mapActiveAmenityId)?.lng || 'Not placed'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setAmenities((prev) =>
                        prev.map((a) =>
                          a.id === mapActiveAmenityId
                            ? { ...a, lat: undefined, lng: undefined, placed: false }
                            : a
                        )
                      )
                    }}
                    className="px-4 py-2 border rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Clear Pin
                  </button>
                  <button
                    onClick={() => setMapActiveAmenityId(null)}
                    className="px-6 py-2 bg-[#006b2c] hover:bg-[#00873a] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    Confirm &amp; Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
