"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, Pagination } from "antd";


import CityParkSidebar from "../dashboard/CityParkSidebar";
import CityParkHeader from "../dashboard/CityParkHeader";
import {
  mockFacilities,
  Facility,
  getStoredFacilities,
} from "../dashboard/mockData";
import { useAppQuery } from "@/tanstack/useAppQuery";
import { QUERY_KEYS } from "@/tanstack/keys";
import { useSearchParams } from "next/navigation";

function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = value;
    if (end === 0) {
      setCount(0);
      return;
    }
    const totalMilliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMilliseconds / end), 15);
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalMilliseconds, 1);
      const easeProgress = progress * (2 - progress); // Ease out quad
      const current = Math.floor(easeProgress * end);
      
      setCount(current);

      if (progress >= 1) {
        setCount(end);
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count}</>;
}

export default function ParksClient() {
  // Fetch facilities using our TanStack query hook
  const { data: _queryResponse } = useAppQuery<Facility[]>({
    queryKey: [QUERY_KEYS.PARKS],
    url: "/parks",
    showErrorToast: false,
    options: {
      initialData: {
        status: 200,
        message: "Loaded cached data",
        data: mockFacilities,
      },
    },
  });

  
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    const loaded = getStoredFacilities();
    console.log("FACILITIES LOADED:", loaded);
    setFacilities(loaded);
  }, []);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("ALL");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sportFilter]);

  const searchParams = useSearchParams();
  const sportParam = searchParams ? searchParams.get("sport") : null;

  useEffect(() => {
    if (sportParam) {
      setSportFilter(sportParam.toUpperCase());
    } else {
      setSportFilter("ALL");
    }
  }, [sportParam]);

  // Refresh & Animation states for KPI cards
  const [refreshParksKey, setRefreshParksKey] = useState(0);
  const [refreshAmenitiesKey, setRefreshAmenitiesKey] = useState(0);
  const [isRefreshingParks, setIsRefreshingParks] = useState(false);
  const [isRefreshingAmenities, setIsRefreshingAmenities] = useState(false);

  const handleRefreshParks = () => {
    setIsRefreshingParks(true);
    setRefreshParksKey(prev => prev + 1);
    const loaded = getStoredFacilities();
    setFacilities(loaded);
    setTimeout(() => setIsRefreshingParks(false), 1000);
  };

  const handleRefreshAmenities = () => {
    setIsRefreshingAmenities(true);
    setRefreshAmenitiesKey(prev => prev + 1);
    const loaded = getStoredFacilities();
    setFacilities(loaded);
    setTimeout(() => setIsRefreshingAmenities(false), 1000);
  };

  // Selected Park state
  const [selectedParkName, setSelectedParkName] = useState<string | null>(null);

  // Group facilities by park name
  const groupedParks = React.useMemo(() => {
    const groups: Record<string, Facility[]> = {};
    facilities.forEach((fac) => {
      const parkName = fac.name.split(" - ")[0] || fac.name;
      if (!groups[parkName]) {
        groups[parkName] = [];
      }
      groups[parkName].push(fac);
    });

    return Object.entries(groups).map(([parkName, facs]) => {
      const firstFac = facs[0];
      return {
        id: `park-${parkName.toLowerCase().replace(/\s+/g, "-")}`,
        name: parkName,
        facilities: facs,
        imageUrl:
          firstFac?.imageUrl ||
          "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80",
        address: firstFac?.address || "SpaceEZ Venue Partner • Municipal Zone",
        description: `${parkName} is a premium community space with multiple sports and amenities, managed by SpaceEZ.`,
        lat: firstFac?.lat || 41.8781,
        lng: firstFac?.lng || -87.6298,
      };
    });
  }, [facilities]);

  const selectedPark = React.useMemo(() => {
    return groupedParks.find((p) => p.name === selectedParkName) || null;
  }, [groupedParks, selectedParkName]);

  // Categories State
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    const loadCats = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cityparkon_categories');
        if (stored) {
          try {
            setCategories(JSON.parse(stored));
          } catch {
            const defaults = ['Tennis', 'Football', 'Cricket', 'Badminton', 'Aquatics'];
            localStorage.setItem('cityparkon_categories', JSON.stringify(defaults));
            setCategories(defaults);
          }
        } else {
          const defaults = ['Tennis', 'Football', 'Cricket', 'Badminton', 'Aquatics'];
          localStorage.setItem('cityparkon_categories', JSON.stringify(defaults));
          setCategories(defaults);
        }
      }
    };
    
    loadCats();
    window.addEventListener('categories-changed', loadCats);
    return () => {
      window.removeEventListener('categories-changed', loadCats);
    };
  }, []);

  // Edit Facility States
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const [editSubname, setEditSubname] = useState("");
  const [editSportType, setEditSportType] = useState<string>("Tennis");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<"AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE" | "RESERVED">("AVAILABLE");

  const [activeQrFacility, setActiveQrFacility] = useState<Facility | null>(null);

  // Google Maps State & Coordinates for Add Amenity Modal
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);
  const modalMapRef = React.useRef<HTMLDivElement | null>(null);
  const modalMapInstanceRef = React.useRef<any>(null);
  const modalMarkerRef = React.useRef<any>(null);

  // Add Amenity Modal States
  const [showAddAmenityModal, setShowAddAmenityModal] = useState(false);
  const [modalTargetParkName, setModalTargetParkName] = useState<string>("");
  
  // Form fields
  const [amenitySportType, setAmenitySportType] = useState<string>("Tennis");
  const [amenityName, setAmenityName] = useState<string>("");
  const [amenityOpeningTime, setAmenityOpeningTime] = useState<string>("08:00");
  const [amenityClosingTime, setAmenityClosingTime] = useState<string>("22:00");
  const [amenityPrice, setAmenityPrice] = useState<number>(15);
  const [amenityIsAvailable, setAmenityIsAvailable] = useState<boolean>(true);
  const [amenityGuidelines, setAmenityGuidelines] = useState<string>("");
  const [amenityLat, setAmenityLat] = useState<number | undefined>(undefined);
  const [amenityLng, setAmenityLng] = useState<number | undefined>(undefined);
  const [amenityPlaced, setAmenityPlaced] = useState<boolean>(false);

  // Large Map Modal States
  const [showLargeMapModal, setShowLargeMapModal] = useState<boolean>(false);
  const [largeMapTarget, setLargeMapTarget] = useState<any>(null);
  const largeMapContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Dynamically load Google Maps script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).google && (window as any).google.maps) {
      setIsMapScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      const handleLoad = () => setIsMapScriptLoaded(true);
      existingScript.addEventListener("load", handleLoad);
      return () => {
        existingScript.removeEventListener("load", handleLoad);
      };
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsMapScriptLoaded(true);
    script.onerror = () => console.error("Google Maps API failed to load.");
    
    document.body.appendChild(script);
  }, []);

  // Initialize and update Modal Map
  useEffect(() => {
    if (!isMapScriptLoaded || !modalMapRef.current || !showAddAmenityModal) {
      modalMapInstanceRef.current = null;
      modalMarkerRef.current = null;
      return;
    }

    const google = (window as any).google;
    if (!google || !google.maps) return;

    // Find center based on active park facilities, or default to some coordinates
    const parkFacilities = facilities.filter((f) => {
      const pName = f.name.split(" - ")[0] || f.name;
      return pName === modalTargetParkName;
    });
    
    const initialLat = amenityLat !== undefined ? amenityLat : (parkFacilities[0]?.lat ?? 41.8781);
    const initialLng = amenityLng !== undefined ? amenityLng : (parkFacilities[0]?.lng ?? -87.6298);
    const center = { lat: initialLat, lng: initialLng };

    // Always create a new map instance to avoid container reuse issues
    const map = new google.maps.Map(modalMapRef.current, {
      center,
      zoom: 17,
      mapTypeId: "hybrid",
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });
    modalMapInstanceRef.current = map;

    const marker = new google.maps.Marker({
      position: center,
      map: map,
      draggable: true,
      title: "Amenity Location",
    });
    modalMarkerRef.current = marker;

    // Add click to place pin
    map.addListener("click", (e: any) => {
      const clickedLat = e.latLng.lat();
      const clickedLng = e.latLng.lng();
      marker.setPosition(e.latLng);
      setAmenityLat(clickedLat);
      setAmenityLng(clickedLng);
      setAmenityPlaced(true);
    });

    // Add dragend to place pin
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (pos) {
        const dragLat = pos.lat();
        const dragLng = pos.lng();
        setAmenityLat(dragLat);
        setAmenityLng(dragLng);
        setAmenityPlaced(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapScriptLoaded, showAddAmenityModal, modalTargetParkName]);

  // Initialize and update Large Map Modal
  useEffect(() => {
    if (!isMapScriptLoaded || !largeMapContainerRef.current || !showLargeMapModal || !largeMapTarget) {
      return;
    }

    const google = (window as any).google;
    if (!google || !google.maps) return;

    const center = { lat: largeMapTarget.lat, lng: largeMapTarget.lng };

    const map = new google.maps.Map(largeMapContainerRef.current, {
      center,
      zoom: 17,
      mapTypeId: "hybrid",
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    new google.maps.Marker({
      position: center,
      map: map,
      title: largeMapTarget.name,
    });
  }, [isMapScriptLoaded, showLargeMapModal, largeMapTarget]);

  const handleOpenMapModal = (target: any) => {
    setLargeMapTarget(target);
    setShowLargeMapModal(true);
  };

  const handleLatChange = (val: number) => {
    setAmenityLat(val);
    setAmenityPlaced(true);
    const google = (window as any).google;
    if (google && modalMarkerRef.current && modalMapInstanceRef.current) {
      const newPos = { lat: val, lng: amenityLng ?? -87.6298 };
      modalMarkerRef.current.setPosition(newPos);
      modalMapInstanceRef.current.setCenter(newPos);
    }
  };

  const handleLngChange = (val: number) => {
    setAmenityLng(val);
    setAmenityPlaced(true);
    const google = (window as any).google;
    if (google && modalMarkerRef.current && modalMapInstanceRef.current) {
      const newPos = { lat: amenityLat ?? 41.8781, lng: val };
      modalMarkerRef.current.setPosition(newPos);
      modalMapInstanceRef.current.setCenter(newPos);
    }
  };

  const handleSaveNewAmenity = () => {
    if (!amenityName.trim() || !modalTargetParkName) return;
    
    // Fallback coordinates
    const targetParkFacilities = facilities.filter((f) => {
      const pName = f.name.split(" - ")[0] || f.name;
      return pName === modalTargetParkName;
    });
    
    const latVal = amenityLat !== undefined ? amenityLat : (targetParkFacilities[0]?.lat ?? 41.8781);
    const lngVal = amenityLng !== undefined ? amenityLng : (targetParkFacilities[0]?.lng ?? -87.6298);

    const newGame: Facility = {
      id: `facility-new-${Date.now()}`,
      name: `${modalTargetParkName} - ${amenityName}`,
      sportType: amenitySportType,
      pricePerHour: Number(amenityPrice),
      status: amenityIsAvailable ? "AVAILABLE" : "UNAVAILABLE",
      activeBookings: 0,
      imageUrl: targetParkFacilities[0]?.imageUrl || "https://images.unsplash.com/photo-1595182595000-5fdec0129a8c?w=600&auto=format&fit=crop&q=80",
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=checkin-${Date.now()}`,
      lat: latVal,
      lng: lngVal,
      description: `${amenitySportType} • ${amenityGuidelines || "Standard amenity rules apply."}`,
      address: targetParkFacilities[0]?.address || "SpaceEZ Park Partner • Municipal Zone",
      openingTime: amenityOpeningTime,
      closingTime: amenityClosingTime,
      recentLogs: [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: `Amenity ${amenityName} added to ${modalTargetParkName}`,
          type: "success",
        },
      ],
    };

    const updated = [...facilities, newGame];
    setFacilities(updated);
    localStorage.setItem("cityparkon_facilities", JSON.stringify(updated));
    setShowAddAmenityModal(false);
  };

  // Filter Logic based on grouped parks
  const filteredParks = React.useMemo(() => {
    return groupedParks.filter((park) => {
      const matchesSearch =
        park.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        park.facilities.some(
          (f) =>
            f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesSport =
        sportFilter === "ALL" ||
        park.facilities.some(
          (f) => f.sportType.toUpperCase() === sportFilter.toUpperCase(),
        );

      return matchesSearch && matchesSport;
    });
  }, [groupedParks, searchTerm, sportFilter]);

  // Paginated Parks for display limit 10
  const paginatedParks = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredParks.slice(start, start + pageSize);
  }, [filteredParks, currentPage, pageSize]);


  const handleStartEdit = (game: Facility) => {
    setEditingFacilityId(game.id);
    const parts = game.name.split(" - ");
    const subname = parts.length > 1 ? parts.slice(1).join(" - ") : parts[0];
    setEditSubname(subname);
    setEditSportType(game.sportType);
    setEditPrice(game.pricePerHour);
    setEditStatus(game.status);
  };

  const handleSaveEdit = (gameId: string) => {
    if (!editSubname.trim()) return;
    const updated = facilities.map((f) => {
      if (f.id === gameId) {
        return {
          ...f,
          name: `${selectedParkName} - ${editSubname}`,
          sportType: editSportType,
          pricePerHour: Number(editPrice),
          status: editStatus,
        };
      }
      return f;
    });
    setFacilities(updated);
    localStorage.setItem("cityparkon_facilities", JSON.stringify(updated));
    setEditingFacilityId(null);
  };

  const handleDeleteFacility = (gameId: string) => {
    const updated = facilities.filter((f) => f.id !== gameId);
    setFacilities(updated);
    localStorage.setItem("cityparkon_facilities", JSON.stringify(updated));
  };



  // Handle PNG download
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
      // Fallback: open in a new window/tab
      window.open(url, "_blank");
    }
  };

  const handleDeletePark = (parkName: string) => {
    if (window.confirm(`Are you sure you want to delete "${parkName}" and all of its amenities?`)) {
      const updated = facilities.filter((f) => {
        const pName = f.name.split(" - ")[0] || f.name;
        return pName !== parkName;
      });
      setFacilities(updated);
      localStorage.setItem("cityparkon_facilities", JSON.stringify(updated));
      if (selectedParkName === parkName) {
        setSelectedParkName(null);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <CityParkSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <CityParkHeader
          showSearch={!showAddAmenityModal}
          stepNavigation={
            showAddAmenityModal ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAddAmenityModal(false)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold text-xs transition-all active:scale-95 border border-slate-200 px-3 py-1.5 rounded-lg bg-white shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                  Back to Directory
                </button>
                <div className="h-4 w-px bg-[#bdcaba]/30" />
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#006b2c]">
                  Add New Amenity to {modalTargetParkName}
                </span>
              </div>
            ) : undefined
          }
        />

        {showAddAmenityModal ? (
          /* Add Amenity Page Layout (Same as Add Venue Wizard) */
          <main className="p-8 flex-1 flex flex-col pt-24 pb-28">
            <div className="grid grid-cols-12 gap-8 w-full flex-1">
              {/* Left Column: Form Fields */}
              <div className="col-span-5 bg-white p-8 rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#0b1c30] border-b border-[#bdcaba]/20 pb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#006b2c]/10 text-[#006b2c] flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    Amenity Details
                  </h3>

                  <div className="grid grid-cols-12 gap-4">
                    {/* Sport Type */}
                    <div className="col-span-6 space-y-2">
                      <label className="block text-xs font-bold text-[#0b1c30] uppercase">Sport Type</label>
                      <Select
                        value={amenitySportType || undefined}
                        onChange={(val) => setAmenitySportType(val)}
                        placeholder="Select Sport"
                        className="w-full text-slate-700 font-semibold custom-antd-select"
                        size="large"
                        options={categories.map((cat) => ({ label: cat, value: cat }))}
                      />
                    </div>

                    {/* Ground or Court Name */}
                    <div className="col-span-6 space-y-2">
                      <label className="block text-xs font-bold text-[#0b1c30] uppercase">Ground or Court Name</label>
                      <input
                        type="text"
                        value={amenityName}
                        onChange={(e) => setAmenityName(e.target.value)}
                        placeholder="e.g. West Wing Cricket Ground"
                        className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4">
                    {/* Opening Time */}
                    <div className="col-span-4 space-y-2">
                      <label className="block text-xs font-bold text-[#0b1c30] uppercase">Opening Time</label>
                      <input
                        type="time"
                        value={amenityOpeningTime}
                        onChange={(e) => setAmenityOpeningTime(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all font-semibold"
                      />
                    </div>

                    {/* Closing Time */}
                    <div className="col-span-4 space-y-2">
                      <label className="block text-xs font-bold text-[#0b1c30] uppercase">Closing Time</label>
                      <input
                        type="time"
                        value={amenityClosingTime}
                        onChange={(e) => setAmenityClosingTime(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all font-semibold"
                      />
                    </div>

                    {/* Price Per Hour */}
                    <div className="col-span-4 space-y-2">
                      <label className="block text-xs font-bold text-[#0b1c30] uppercase">Price Per Hour ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          value={amenityPrice || ""}
                          onChange={(e) => setAmenityPrice(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl pl-7 pr-4 py-3 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all text-right font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guidelines */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#0b1c30] uppercase">Guidelines &amp; Safety Rules</label>
                    <textarea
                      value={amenityGuidelines}
                      onChange={(e) => setAmenityGuidelines(e.target.value)}
                      placeholder="Add rules (shoes requirement, deposit rules, guest capacity)..."
                      rows={5}
                      className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#006b2c] focus:border-[#006b2c] text-sm text-[#0b1c30] outline-none transition-all resize-none font-semibold"
                    />
                  </div>

                  {/* Latitude / Longitude Manual input */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-4 border-t border-[#bdcaba]/20">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#545f73] uppercase font-sans">Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={amenityLat !== undefined ? amenityLat : ""}
                        onChange={(e) => handleLatChange(parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 41.8781"
                        className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-3 py-2.5 text-sm text-[#0b1c30] outline-none focus:ring-1 focus:ring-[#006b2c]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#545f73] uppercase font-sans">Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={amenityLng !== undefined ? amenityLng : ""}
                        onChange={(e) => handleLngChange(parseFloat(e.target.value) || 0)}
                        placeholder="e.g. -87.6298"
                        className="w-full bg-[#F8FAFC] border border-[#bdcaba]/50 rounded-xl px-3 py-2.5 text-sm text-[#0b1c30] outline-none focus:ring-1 focus:ring-[#006b2c]"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#bdcaba]/20 mt-6">
                  <button
                    onClick={() => setShowAddAmenityModal(false)}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-[#545f73] hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewAmenity}
                    disabled={!amenityName.trim()}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-md text-white ${
                      amenityName.trim()
                        ? "bg-[#006b2c] hover:bg-[#005221]"
                        : "bg-slate-300 cursor-not-allowed"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs font-bold">check</span>
                    Save Amenity
                  </button>
                </div>
              </div>

              {/* Right Column: Locational Preview Map */}
              <div className="col-span-7 bg-white p-6 rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] space-y-4 flex flex-col">
                <div className="flex justify-between items-center pb-2 border-b border-[#bdcaba]/20">
                  <h4 className="text-xs font-bold text-[#0b1c30] uppercase flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#006b2c]/10 text-[#006b2c] flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    Locational Preview
                  </h4>
                  {amenityPlaced ? (
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider animate-bounce">
                      Placed
                    </span>
                  ) : (
                    <span className="text-[9px] bg-amber-100 text-amber-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                      Default Location
                    </span>
                  )}
                </div>
                <div className="h-[520px] rounded-xl overflow-hidden relative border bg-slate-100 flex-1">
                  <div ref={modalMapRef} className="w-full h-full" />
                  {!isMapScriptLoaded && (
                    <div className="absolute inset-0 bg-[#0b1c30]/10 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#006b2c] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-[#0b1c30]">
                        Loading satellite map...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        ) : (
          /* Normal Dashboard Main Container */
          <main className="p-8 flex gap-8 flex-1">
            {/* LEFT: Parks Grid and Filters */}
            <div className="flex-1 space-y-6">
              {/* Page Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                    Venues Directory
                  </h2>
                  <p className="text-xs text-[#545f73] mt-1">
                    Manage venue fields, view booking rates, and configure check-in
                    codes.
                  </p>
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    title: "Total Venues",
                    valNode: <AnimatedCounter key={refreshParksKey} value={groupedParks.length} />,
                    change: "+3 this month",
                    icon: "\uEA63",
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                    onRefresh: handleRefreshParks,
                    isRefreshing: isRefreshingParks,
                  },
                  {
                    title: "Total Amenities",
                    valNode: <AnimatedCounter key={refreshAmenitiesKey} value={facilities.length} />,
                    change: "+8 this month",
                    icon: "sports_soccer",
                    color: "text-indigo-600",
                    bg: "bg-indigo-50",
                    onRefresh: handleRefreshAmenities,
                    isRefreshing: isRefreshingAmenities,
                  },
                ].map((kpi, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-5 rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-300 relative group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-semibold text-[#545f73] uppercase tracking-wider">
                        {kpi.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            kpi.onRefresh();
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Refresh"
                        >
                          <motion.span
                            animate={{ rotate: kpi.isRefreshing ? 360 : 0 }}
                            transition={{ repeat: kpi.isRefreshing ? Infinity : 0, duration: 1, ease: "linear" }}
                            className="material-symbols-outlined text-sm"
                          >
                            refresh
                          </motion.span>
                        </button>
                        <div className={`${kpi.bg} w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0`}>
                          <span
                            className={`material-symbols-outlined ${kpi.color} text-xl flex items-center justify-center w-6 h-6 overflow-hidden shrink-0`}
                          >
                            {kpi.icon}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                      {kpi.valNode}
                    </h3>
                    <p className="text-xs text-[#16A34A] font-medium mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs flex items-center justify-center w-4 h-4 shrink-0">
                        {"\uE5D8"}
                      </span>
                      {kpi.change}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-xl border border-[#bdcaba]/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined text-slate-400 text-sm absolute left-3 top-1/2 -translate-y-1/2">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search parks by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#006b2c] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={sportFilter}
                    onChange={(val) => setSportFilter(val)}
                    className="min-w-[130px]"
                    options={[
                      { label: "All Sports", value: "ALL" },
                      ...categories.map((cat) => ({ label: cat, value: cat.toUpperCase() }))
                    ]}
                  />
                </div>
              </div>

              {/* Parks Listing Table */}
              <div className="bg-white rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#bdcaba]/20 text-[10px] font-bold text-[#545f73] uppercase tracking-wider">
                        <th className="px-6 py-4">Venue Name / Location</th>
                        <th className="px-6 py-4">Amenities</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#bdcaba]/10 text-xs">
                      {filteredParks.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-6 py-12 text-center text-slate-400"
                          >
                            <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                              inventory_2
                            </span>
                            No matching venues found.
                          </td>
                        </tr>
                      ) : (
                        paginatedParks.map((park) => {
                          const isSelected = selectedParkName === park.name;
                          return (
                            <tr
                              key={park.name}
                              onClick={() => {
                                setSelectedParkName(isSelected ? null : park.name);
                              }}
                              className={`cursor-pointer transition-colors group ${
                                isSelected ? "bg-slate-50/80 font-medium" : "hover:bg-slate-50/40"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div className="font-extrabold text-[#0b1c30] group-hover:text-[#006b2c] transition-colors">
                                  {park.name}
                                </div>
                                <div className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-0.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenMapModal(park.facilities[0]);
                                    }}
                                    className="hover:underline flex items-center gap-0.5"
                                  >
                                    <span className="material-symbols-outlined text-xs">location_on</span>
                                    {park.facilities[0]?.address || "SpaceEZ Partner Location"}
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {park.facilities.map((fac) => {
                                    const subname = fac.name.split(" - ")[1] || fac.name;
                                    return (
                                      <span
                                        key={fac.id}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#F1F5F9] rounded-lg text-[10px] font-bold text-slate-700 hover:bg-[#E2E8F0] transition-colors"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#006b2c]"></span>
                                        {subname} ({fac.sportType})
                                      </span>
                                    );
                                  })}
                                  {park.facilities.length === 0 && (
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      No amenities configured
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4  text-right">
                                <div className="flex items-center pt-10 justify-end gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setModalTargetParkName(park.name);
                                      setAmenityName("");
                                      setAmenitySportType(categories[0] || "Tennis");
                                      setAmenityOpeningTime("08:00");
                                      setAmenityClosingTime("22:00");
                                      setAmenityPrice(15);
                                      setAmenityIsAvailable(true);
                                      setAmenityGuidelines("");
                                      setAmenityLat(park.facilities[0]?.lat);
                                      setAmenityLng(park.facilities[0]?.lng);
                                      setAmenityPlaced(park.facilities[0]?.lat !== undefined);
                                      setShowAddAmenityModal(true);
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#006b2c] hover:bg-[#005221] text-white flex items-center gap-1 shadow-sm"
                                  >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Add Amenity
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePark(park.name);
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-sm">{"\uE872"}</span>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Antd Pagination */}
                {filteredParks.length > 0 && (
                  <div className="p-4 border-t border-[#bdcaba]/10 flex justify-between items-center bg-slate-50/50">
                    <span className="text-xs text-slate-500 font-medium">
                      Showing {Math.min((currentPage - 1) * pageSize + 1, filteredParks.length)} to{" "}
                      {Math.min(currentPage * pageSize, filteredParks.length)} of {filteredParks.length} venues
                    </span>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredParks.length}
                      onChange={(page) => setCurrentPage(page)}
                      showSizeChanger={false}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Selected Venue Inspector Panel */}
            <AnimatePresence>
              {selectedPark && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-96 shrink-0 bg-white rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] p-6 overflow-hidden flex flex-col"
                >
                  <div className="flex justify-between pt-5 items-start border-b border-[#bdcaba]/20 pb-4">
                    <div>
                      <h3 className="font-extrabold text-[#0b1c30] text-base">
                        {selectedPark.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {selectedPark.facilities[0]?.address || "SpaceEZ Partner Location"}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedParkName(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>

                  <div className="mt-6 flex-1 flex flex-col min-h-0 ">
                    <div className="flex justify-between items-center mb-4 ">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Amenities ({selectedPark.facilities.length})
                      </h4>
                      <button
                        onClick={() => {
                          setModalTargetParkName(selectedPark.name);
                          setAmenityName("");
                          setAmenitySportType(categories[0] || "Tennis");
                          setAmenityOpeningTime("08:00");
                          setAmenityClosingTime("22:00");
                          setAmenityPrice(15);
                          setAmenityIsAvailable(true);
                          setAmenityGuidelines("");
                          setAmenityLat(selectedPark.facilities[0]?.lat);
                          setAmenityLng(selectedPark.facilities[0]?.lng);
                          setAmenityPlaced(selectedPark.facilities[0]?.lat !== undefined);
                          setShowAddAmenityModal(true);
                        }}
                        className="text-[10px] font-bold text-[#006b2c] hover:underline flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-xs">add</span>
                        Add Amenity
                      </button>
                    </div>

                    {/* Amenities List */}
                    <div className="space-y-3 overflow-y-auto pr-1">
                      {selectedPark.facilities.map((game) => {
                        const isEditing = editingFacilityId === game.id;
                        const subname = game.name.split(" - ")[1] || game.name;

                        if (isEditing) {
                          return (
                            <div
                              key={game.id}
                              className="p-3.5 rounded-xl border border-[#006b2c]/30 bg-[#006b2c]/5 space-y-3"
                            >
                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-slate-500 uppercase">
                                  Ground/Court Name
                                </label>
                                <input
                                  type="text"
                                  value={editSubname}
                                  onChange={(e) => setEditSubname(e.target.value)}
                                  className="w-full bg-white border border-[#bdcaba]/50 rounded-lg px-2.5 py-1.5 text-xs text-[#0b1c30] focus:ring-1 focus:ring-[#006b2c] outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="block text-[9px] font-bold text-slate-500 uppercase">
                                    Sport Type
                                  </label>
                                  <Select
                                    value={editSportType}
                                    onChange={(val) => setEditSportType(val)}
                                    size="small"
                                    className="w-full"
                                    options={categories.map((cat) => ({ label: cat, value: cat }))}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-[9px] font-bold text-slate-500 uppercase">
                                    Hourly Rate ($)
                                  </label>
                                  <input
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border border-[#bdcaba]/50 rounded-lg px-2.5 py-1.5 text-xs text-[#0b1c30] text-right outline-none"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  onClick={() => setEditingFacilityId(null)}
                                  className="px-2.5 py-1 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(game.id)}
                                  className="px-2.5 py-1 bg-[#006b2c] hover:bg-[#005221] text-white rounded-lg text-[10px] font-bold shadow-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={game.id}
                            className="p-3 rounded-lg border border-slate-100 bg-white flex justify-between items-center group hover:border-slate-200"
                          >
                            <div className="truncate pr-2">
                              <div className="text-xs font-bold text-[#0b1c30] truncate">
                                {subname}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                {game.sportType} • ${game.pricePerHour}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleStartEdit(game)}
                                className="p-1.5 text-slate-400 hover:text-[#006b2c] hover:bg-slate-50 rounded"
                              >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteFacility(game.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        )}
      </div>

      {/* QR Code Modal Overlay */}
      <AnimatePresence>
        {activeQrFacility && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative space-y-4 text-center border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveQrFacility(null)}
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
                  {activeQrFacility.name}
                </p>
              </div>

              {/* QR Image Box */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex items-center justify-center mx-auto w-48 h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeQrFacility.qrCodeUrl}
                  alt={`${activeQrFacility.name} QR Code`}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleDownloadQR(activeQrFacility.name, activeQrFacility.qrCodeUrl);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#006b2c] hover:bg-[#006b2c]/95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">{"\uE2C4"}</span>
                  Download QR Code
                </button>
                <button
                  onClick={() => setActiveQrFacility(null)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Large Map Modal */}
      <AnimatePresence>
        {showLargeMapModal && largeMapTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-4xl shadow-xl overflow-hidden border border-[#bdcaba]/30 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#bdcaba]/20 flex justify-between items-center bg-[#F8FAFC]">
                <div>
                  <h3 className="font-extrabold text-[#0b1c30] text-base">
                    {largeMapTarget.name} - Location Map
                  </h3>
                  <p className="text-xs text-[#545f73] mt-1 font-medium">
                    {largeMapTarget.address}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLargeMapModal(false);
                    setLargeMapTarget(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Map Container */}
              <div className="h-[500px] w-full bg-slate-100 relative">
                <div ref={largeMapContainerRef} className="w-full h-full" />
                {!isMapScriptLoaded && (
                  <div className="absolute inset-0 bg-[#0b1c30]/10 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-4 border-[#006b2c] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-[#0b1c30]">Loading map...</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-[#bdcaba]/20 flex justify-end">
                <button
                  onClick={() => {
                    setShowLargeMapModal(false);
                    setLargeMapTarget(null);
                  }}
                  className="px-6 py-2 bg-[#006b2c] hover:bg-[#005221] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
