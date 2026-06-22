'use client'

import React, { useState } from 'react'
import { Input } from 'antd'
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
  const openingTime = '06:00 AM'
  const closingTime = '10:00 PM'
  const [coverPhoto, setCoverPhoto] = useState<string | null>(
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80'
  )

  // Google Maps State & Coordinates
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false)
  const [parkLat, setParkLat] = useState<number>(41.8807)
  const [parkLng, setParkLng] = useState<number>(-87.6221)

  // Map and Input Refs
  const addressInputRef = React.useRef<HTMLInputElement | null>(null)
  const step3SearchRef = React.useRef<HTMLInputElement | null>(null)
  const previewMapRef = React.useRef<HTMLDivElement | null>(null)
  const previewMapInstanceRef = React.useRef<any>(null)
  const previewMarkerInstanceRef = React.useRef<any>(null)

  const step3MapRef = React.useRef<HTMLDivElement | null>(null)
  const step3MapInstanceRef = React.useRef<any>(null)
  const step3MarkersRef = React.useRef<Record<string, any>>({})

  const modalMapRef = React.useRef<HTMLDivElement | null>(null)
  const modalMapInstanceRef = React.useRef<any>(null)
  const modalMarkerRef = React.useRef<any>(null)

  // Dynamically load Google Maps script
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    if ((window as any).google && (window as any).google.maps) {
      setIsMapScriptLoaded(true)
      return
    }

    const existingScript = document.getElementById('google-maps-script')
    if (existingScript) {
      const handleLoad = () => setIsMapScriptLoaded(true)
      existingScript.addEventListener('load', handleLoad)
      return () => {
        existingScript.removeEventListener('load', handleLoad)
      }
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsMapScriptLoaded(true)
    script.onerror = () => console.error('Google Maps API failed to load.')
    
    document.body.appendChild(script)
  }, [])

  // Google Places Autocomplete setup (Step 1 Address Input)
  React.useEffect(() => {
    if (!isMapScriptLoaded || !addressInputRef.current) return

    const google = (window as any).google
    if (!google || !google.maps || !google.maps.places) return

    const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
      types: ['geocode', 'establishment'],
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        const formattedAddress = place.formatted_address || ''
        
        setAddress(formattedAddress)
        setParkLat(lat)
        setParkLng(lng)
      }
    })
  }, [isMapScriptLoaded, step])

  // Google Places Autocomplete setup (Step 3 Search Input)
  React.useEffect(() => {
    if (!isMapScriptLoaded || !step3SearchRef.current || step !== 3) return

    const google = (window as any).google
    if (!google || !google.maps || !google.maps.places) return

    const autocomplete = new google.maps.places.Autocomplete(step3SearchRef.current, {
      types: ['geocode', 'establishment'],
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        const formattedAddress = place.formatted_address || ''
        
        setAddress(formattedAddress)
        setParkLat(lat)
        setParkLng(lng)

        // Center Step 3 Map on new coordinates
        if (step3MapInstanceRef.current) {
          step3MapInstanceRef.current.setCenter({ lat, lng })
          step3MapInstanceRef.current.setZoom(17)
        }
      }
    })
  }, [isMapScriptLoaded, step])

  // Initialize and update Step 1 Locational Preview Map (satellite/hybrid form)
  React.useEffect(() => {
    if (!isMapScriptLoaded || !previewMapRef.current || step !== 1) {
      previewMapInstanceRef.current = null
      previewMarkerInstanceRef.current = null
      return
    }

    const google = (window as any).google
    if (!google || !google.maps) return

    const center = { lat: parkLat, lng: parkLng }

    if (!previewMapInstanceRef.current) {
      const map = new google.maps.Map(previewMapRef.current, {
        center,
        zoom: 16,
        mapTypeId: 'hybrid', // satellite with labels
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.SMALL,
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        streetViewControl: false,
        fullscreenControl: false,
      })
      previewMapInstanceRef.current = map

      const marker = new google.maps.Marker({
        position: center,
        map: map,
        draggable: true,
        title: 'Park Center',
      })
      previewMarkerInstanceRef.current = marker

      // Drag listener to update park coordinates
      marker.addListener('dragend', () => {
        const pos = marker.getPosition()
        if (pos) {
          const newLat = pos.lat()
          const newLng = pos.lng()
          setParkLat(newLat)
          setParkLng(newLng)

          // Reverse geocode new address
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              setAddress(results[0].formatted_address)
            }
          })
        }
      })

      // Click on map to place center marker
      map.addListener('click', (e: any) => {
        const clickedLat = e.latLng.lat()
        const clickedLng = e.latLng.lng()
        setParkLat(clickedLat)
        setParkLng(clickedLng)
        marker.setPosition(e.latLng)

        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ location: { lat: clickedLat, lng: clickedLng } }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            setAddress(results[0].formatted_address)
          }
        })
      })
    } else {
      // Map already exists, just center and update marker position
      previewMapInstanceRef.current.setCenter(center)
      if (previewMarkerInstanceRef.current) {
        previewMarkerInstanceRef.current.setPosition(center)
      }
    }
  }, [isMapScriptLoaded, parkLat, parkLng, step])

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
  const [activeQrAmenity, setActiveQrAmenity] = useState<any | null>(null)

  // Refs for tracking active selection and amenities to avoid stale closures in Step 3
  const amenitiesRef = React.useRef(amenities)
  React.useEffect(() => {
    amenitiesRef.current = amenities
  }, [amenities])

  const selectedAmenityToPlaceRef = React.useRef(selectedAmenityToPlace)
  React.useEffect(() => {
    selectedAmenityToPlaceRef.current = selectedAmenityToPlace
  }, [selectedAmenityToPlace])

  const parkLatRef = React.useRef(parkLat)
  const parkLngRef = React.useRef(parkLng)
  React.useEffect(() => {
    parkLatRef.current = parkLat
    parkLngRef.current = parkLng
  }, [parkLat, parkLng])

  // Initialize and update Step 3 Map
  React.useEffect(() => {
    if (!isMapScriptLoaded || !step3MapRef.current || step !== 3) {
      step3MapInstanceRef.current = null
      step3MarkersRef.current = {}
      return
    }

    const google = (window as any).google
    if (!google || !google.maps) return

    if (!step3MapInstanceRef.current) {
      const map = new google.maps.Map(step3MapRef.current, {
        center: { lat: parkLatRef.current, lng: parkLngRef.current },
        zoom: 17,
        mapTypeId: 'hybrid',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      })
      step3MapInstanceRef.current = map

      // Click to place
      map.addListener('click', (e: any) => {
        const activeId = selectedAmenityToPlaceRef.current
        if (!activeId) return

        const clickedLat = e.latLng.lat()
        const clickedLng = e.latLng.lng()

        setAmenities((prev) =>
          prev.map((a) => {
            if (a.id === activeId) {
              return { ...a, lat: clickedLat, lng: clickedLng, placed: true }
            }
            return a
          })
        )

        // Find and select the next unplaced amenity
        const nextUnplaced = amenitiesRef.current.find((a) => a.id !== activeId && !a.placed)
        if (nextUnplaced) {
          setSelectedAmenityToPlace(nextUnplaced.id)
        } else {
          setSelectedAmenityToPlace('')
        }
      })
    }

    const map = step3MapInstanceRef.current

    // Sync marker list
    // 1. Remove markers that are no longer placed or present
    Object.keys(step3MarkersRef.current).forEach((id) => {
      const a = amenities.find((item) => item.id === id)
      if (!a || !a.placed || a.lat === undefined || a.lng === undefined) {
        step3MarkersRef.current[id].setMap(null)
        delete step3MarkersRef.current[id]
      }
    })

    // 2. Add or update markers
    amenities.forEach((a) => {
      if (!a.placed || a.lat === undefined || a.lng === undefined) return

      const isSelected = selectedAmenityToPlace === a.id
      const markerColor =
        a.sportType === 'cricket'
          ? '#16A34A'
          : a.sportType === 'tennis'
          ? '#2563EB'
          : '#EF4444'

      const position = { lat: a.lat, lng: a.lng }

      if (step3MarkersRef.current[a.id]) {
        // Update position
        step3MarkersRef.current[a.id].setPosition(position)
        // Update styling if selection changed
        step3MarkersRef.current[a.id].setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: isSelected ? '#ffffff' : '#000000',
          strokeWeight: isSelected ? 3 : 1,
        })
      } else {
        // Create marker
        const marker = new google.maps.Marker({
          position,
          map: map,
          draggable: true,
          title: a.name || 'Amenity',
          label: {
            text: (a.name || 'A').charAt(0).toUpperCase(),
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '12px'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: isSelected ? '#ffffff' : '#000000',
            strokeWeight: isSelected ? 3 : 1,
          }
        })

        // Dragend listener
        marker.addListener('dragend', () => {
          const pos = marker.getPosition()
          if (pos) {
            setAmenities((prev) =>
              prev.map((item) => {
                if (item.id === a.id) {
                  return { ...item, lat: pos.lat(), lng: pos.lng() }
                }
                return item
              })
            )
          }
        })

        // Click on marker to select it
        marker.addListener('click', () => {
          setSelectedAmenityToPlace(a.id)
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 4px; font-family: sans-serif; font-size: 12px;">
              <strong style="color: #0b1c30; display: block; margin-bottom: 2px;">${a.name || 'Unnamed Amenity'}</strong>
              <span style="color: #545f73; font-size: 10px; text-transform: uppercase; font-weight: bold;">${a.sportType || 'Sport'}</span>
            </div>`
          })
          infoWindow.open(map, marker)
        })

        step3MarkersRef.current[a.id] = marker
      }
    })
  }, [isMapScriptLoaded, step, amenities, selectedAmenityToPlace])

  // Initialize and update Step 2 Modal Map
  React.useEffect(() => {
    if (!isMapScriptLoaded || !modalMapRef.current || mapActiveAmenityId === null) {
      modalMapInstanceRef.current = null
      modalMarkerRef.current = null
      return
    }

    const google = (window as any).google
    if (!google || !google.maps) return

    const activeAmenity = amenities.find((a) => a.id === mapActiveAmenityId)
    if (!activeAmenity) return

    const initialLat = activeAmenity.lat !== undefined ? activeAmenity.lat : parkLat
    const initialLng = activeAmenity.lng !== undefined ? activeAmenity.lng : parkLng
    const center = { lat: initialLat, lng: initialLng }

    if (!modalMapInstanceRef.current) {
      const map = new google.maps.Map(modalMapRef.current, {
        center,
        zoom: 17,
        mapTypeId: 'hybrid',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      })
      modalMapInstanceRef.current = map

      const marker = new google.maps.Marker({
        position: center,
        map: map,
        draggable: true,
        title: activeAmenity.name || 'Amenity Location',
      })
      modalMarkerRef.current = marker

      // Add click to place pin
      map.addListener('click', (e: any) => {
        const clickedLat = e.latLng.lat()
        const clickedLng = e.latLng.lng()
        marker.setPosition(e.latLng)
        
        setAmenities((prev) =>
          prev.map((a) =>
            a.id === mapActiveAmenityId
              ? { ...a, lat: clickedLat, lng: clickedLng, placed: true }
              : a
          )
        )
      })

      // Add dragend to place pin
      marker.addListener('dragend', () => {
        const pos = marker.getPosition()
        if (pos) {
          const dragLat = pos.lat()
          const dragLng = pos.lng()
          setAmenities((prev) =>
            prev.map((a) =>
              a.id === mapActiveAmenityId
                ? { ...a, lat: dragLat, lng: dragLng, placed: true }
                : a
            )
          )
        }
      })
    } else {
      modalMapInstanceRef.current.setCenter(center)
      if (modalMarkerRef.current) {
        modalMarkerRef.current.setPosition(center)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapScriptLoaded, mapActiveAmenityId])


  const handleSaveToLocalStorage = () => {
    const id = `facility-new-${Date.now()}-0`
    const facilityItem: any = {
      id: id,
      name: `${parkName} - Main Ground`,
      sportType: 'Tennis',
      status: 'AVAILABLE',
      pricePerHour: 15.00,
      activeBookings: 0,
      imageUrl: coverPhoto || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=checkin-main-${Date.now()}`,
      lat: parkLat,
      lng: parkLng,
      description: 'Tennis • Standard amenity rules apply.',
      address: address,
      recentLogs: [
        { id: `log-new-${Date.now()}-0-1`, time: '12:00 PM', text: 'Park and default facility added to database', type: 'success' }
      ]
    }
    
    saveMultipleFacilities([facilityItem])
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
  const _handleAddAmenity = () => {
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

  const _handleRemoveAmenity = (id: string) => {
    setAmenities((prev) => prev.filter((a) => a.id !== id))
  }

  const _handleUpdateAmenity = (id: string, field: keyof AmenityInput, value: any) => {
    setAmenities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, [field]: value }
        }
        return a
      })
    )
  }

  const _handleGenerateQR = (id: string) => {
    setAmenities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, qrCodeGenerated: true }
        }
        return a
      })
    )
  }

  const handleDownloadQR = async (name: string, url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${name.replace(/\s+/g, "_")}_QR_Code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download QR code:", error);
      window.open(url, "_blank");
    }
  };



  // Navigation Steps Action
  const handleNextStep = () => {
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
        amenities: [
          {
            sportType: 'Tennis',
            name: 'Main Ground',
            maxPlayers: 10,
            pricePerHour: 15.00,
            isAvailable: true,
            guidelines: 'Standard amenity rules apply.',
            lat: parkLat,
            lng: parkLng,
          }
        ],
      },
    })
  }

  const _handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1)
    }
  }

  // Header step indicators JSX
  const stepIndicators = (
    <nav className="flex items-center gap-6">
      <div className="flex items-center gap-2 text-[#006b2c] font-bold">
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-[#006b2c] text-[#006b2c] bg-white ring-4 ring-[#006b2c]/10">
          1
        </span>
        <span className="text-xs uppercase tracking-wider">General Info &amp; Location</span>
      </div>
    </nav>
  )

  // Render content of active step
  const renderStepContent = () => {
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
                <Input
                  value={parkName}
                  onChange={(e) => setParkName(e.target.value)}
                  placeholder="e.g. Millenium Sports Field"
                  className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-3 text-[#0b1c30]"
                  size="large"
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
                <input
                  ref={addressInputRef}
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Search and select park address..."
                  className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all"
                />
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
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#0b1c30] uppercase">Locational Preview</h4>
                  <span className="text-[10px] text-slate-500 font-semibold">Drag marker to adjust center</span>
                </div>
                <div className="h-56 rounded-xl overflow-hidden relative border bg-slate-100">
                  <div ref={previewMapRef} className="w-full h-full" />
                  {!isMapScriptLoaded && (
                    <div className="absolute inset-0 bg-[#0b1c30]/10 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#006b2c] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-[#0b1c30]">Loading satellite map...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
    )
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
              Configure general information, banner image, and center location coordinates.
            </p>
          </div>

          <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col">
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
          </div>
        </main>

        {/* Sticky footer navigation */}
        <footer className="fixed bottom-0 right-0 w-[calc(100%-260px)] h-20 bg-white border-t border-[#bdcaba]/30 flex items-center justify-between px-8 z-40">
          <button
            onClick={() => { window.location.href = '/parks' }}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg font-bold text-sm transition-all text-[#545f73] hover:bg-[#eff4ff]/60 hover:text-[#0b1c30] active:scale-95"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Directory
          </button>

          <div className="flex items-center gap-4">
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
                  Publish Park
                  <span className="material-symbols-outlined text-base">check</span>
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
                <h3 className="text-xl font-bold text-[#0b1c30]">Park Created Successfully!</h3>
                <p className="text-xs text-[#545f73] leading-relaxed">
                  Your new location <span className="text-[#0b1c30] font-semibold">&quot;{parkName}&quot;</span> has been created. You can now manage its amenities and view check-ins immediately from the parks directory.
                </p>
              </div>

              {/* Park configuration breakdown */}
              <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-4 text-left divide-y divide-slate-100">
                <div className="flex justify-between py-2 text-xs">
                  <span className="text-slate-500">Address</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">{address}</span>
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
              <div className="flex-1 relative bg-slate-100 overflow-hidden group">
                <div ref={modalMapRef} className="w-full h-full" />
                {!isMapScriptLoaded && (
                  <div className="absolute inset-0 bg-[#0b1c30]/10 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-4 border-[#006b2c] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-[#0b1c30]">Loading satellite workspace...</span>
                  </div>
                )}
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

      {/* QR Code Modal Overlay */}
      <AnimatePresence>
        {activeQrAmenity && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative space-y-4 text-center border border-[#bdcaba]/30"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveQrAmenity(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="pt-2">
                <span className="material-symbols-outlined text-4xl text-[#006b2c] bg-[#eff4ff] p-3 rounded-full">
                  qr_code_2
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-[#0b1c30] text-base">
                  Facility QR Code
                </h3>
                <p className="text-xs text-[#545f73] mt-1 font-medium">
                  {activeQrAmenity.name}
                </p>
                {parkName && (
                  <p className="text-[10px] text-[#545f73] font-medium">
                    {parkName}
                  </p>
                )}
              </div>

              {/* QR Image Box */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex items-center justify-center mx-auto w-48 h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    `spaceez://amenity/${activeQrAmenity.id}?park=${encodeURIComponent(
                      parkName || 'Park'
                    )}&name=${encodeURIComponent(activeQrAmenity.name || 'Amenity')}`
                  )}`}
                  alt={`${activeQrAmenity.name} QR Code`}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    const qrVal = `spaceez://amenity/${activeQrAmenity.id}?park=${encodeURIComponent(
                      parkName || 'Park'
                    )}&name=${encodeURIComponent(activeQrAmenity.name || 'Amenity')}`;
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrVal)}`;
                    handleDownloadQR(activeQrAmenity.name || 'Amenity', qrUrl);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#006b2c] hover:bg-[#006b2c]/95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">{"\uE2C4"}</span>
                  Download QR Code
                </button>
                <button
                  onClick={() => setActiveQrAmenity(null)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
