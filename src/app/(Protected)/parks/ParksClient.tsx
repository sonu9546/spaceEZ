"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";


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

  const searchParams = useSearchParams();
  const sportParam = searchParams ? searchParams.get("sport") : null;

  useEffect(() => {
    if (sportParam) {
      setSportFilter(sportParam.toUpperCase());
    } else {
      setSportFilter("ALL");
    }
  }, [sportParam]);

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
        address: firstFac?.address || "SpaceEZ Park Partner • Municipal Zone",
        description: `${parkName} is a premium community space with multiple sports and amenities, managed by SpaceEZ.`,
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

  // Add Facility States
  const [showAddGameForm, setShowAddGameForm] = useState(false);
  const [newGameSubname, setNewGameSubname] = useState("");
  const [newGameSportType, setNewGameSportType] = useState<string>("Tennis");
  const [newGamePrice, setNewGamePrice] = useState<number>(15);
  const [activeQrFacility, setActiveQrFacility] = useState<Facility | null>(null);

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

  // Status Styles mapping
  const statusStyles = {
    AVAILABLE: {
      bg: "bg-[#16A34A]/10",
      text: "text-[#16A34A]",
      label: "Available",
    },
    RESERVED: {
      bg: "bg-[#2563EB]/10",
      text: "text-[#2563EB]",
      label: "Reserved",
    },
    MAINTENANCE: {
      bg: "bg-[#F59E0B]/10",
      text: "text-[#F59E0B]",
      label: "Maintenance",
    },
    UNAVAILABLE: {
      bg: "bg-[#EF4444]/10",
      text: "text-[#EF4444]",
      label: "Unavailable",
    },
  };

  const handleStatusToggle = (id: string) => {
    const updated = facilities.map((f) => {
      if (f.id === id) {
        const nextStatus: Facility["status"] = f.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
        return { ...f, status: nextStatus };
      }
      return f;
    });
    setFacilities(updated);
    localStorage.setItem("cityparkon_facilities", JSON.stringify(updated));
  };

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

  const handleAddGame = () => {
    if (!newGameSubname.trim() || !selectedParkName) return;
    const newGame: Facility = {
      id: `facility-new-${Date.now()}`,
      name: `${selectedParkName} - ${newGameSubname}`,
      sportType: newGameSportType,
      pricePerHour: Number(newGamePrice),
      status: "AVAILABLE",
      activeBookings: 0,
      imageUrl: "https://images.unsplash.com/photo-1595182595000-5fdec0129a8c?w=600&auto=format&fit=crop&q=80",
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=checkin-${Date.now()}`,
      lat: selectedPark?.facilities[0]?.lat ?? 37.7749,
      lng: selectedPark?.facilities[0]?.lng ?? -122.4194,
      description: `${newGameSportType} field located in ${selectedParkName}`,
      recentLogs: [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Amenity facility added to ${selectedParkName}`,
          type: "success"
        }
      ]
    };

    const updated = [...facilities, newGame];
    setFacilities(updated);
    localStorage.setItem("cityparkon_facilities", JSON.stringify(updated));
    setShowAddGameForm(false);
    setNewGameSubname("");
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
        <CityParkHeader />

        {/* Dashboard Main container */}
        <main className="p-8 flex gap-8 flex-1">
          {/* LEFT: Parks Grid and Filters */}
          <div className="flex-1 space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                  Parks Directory
                </h2>
                <p className="text-xs text-[#545f73] mt-1">
                  Manage park fields, view booking rates, and configure check-in
                  codes.
                </p>
              </div>
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
                <select
                  value={sportFilter}
                  onChange={(e) => setSportFilter(e.target.value)}
                  className="text-xs border border-slate-200 bg-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#006b2c] text-slate-700 font-semibold"
                >
                  <option value="ALL">All Sports</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat.toUpperCase()}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parks Listing Table */}
            <div className="bg-white rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#bdcaba]/20 text-[10px] font-bold text-[#545f73] uppercase tracking-wider">
                      <th className="px-6 py-4">Park Name / Location</th>
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
                          No matching parks found.
                        </td>
                      </tr>
                    ) : (
                      filteredParks.map((park) => {
                        const isSelected = selectedParkName === park.name;

                        return (
                          <tr
                            key={park.id}
                            onClick={() => setSelectedParkName(isSelected ? null : park.name)}
                            className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                              isSelected ? "bg-[#eff4ff]/35" : ""
                            }`}
                          >
                            <td className="px-6 py-4.5">
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                                  src={park.imageUrl}
                                  alt={park.name}
                                />
                                <div>
                                  <span className="font-bold text-[#0b1c30] block text-sm">
                                    {park.name}
                                  </span>
                                  <span className="text-[10px] text-[#545f73] font-medium">
                                    {park.address}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4.5 font-semibold text-slate-700">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors duration-150 border border-slate-200/80">
                                {park.facilities.length} {park.facilities.length === 1 ? 'amenity' : 'amenities'}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 text-right flex justify-end">
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
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Inspect Drawer Panel */}
          <AnimatePresence>
            {selectedPark && (
              <motion.div
                initial={{ opacity: 0, x: 50, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 420 }}
                exit={{ opacity: 0, x: 50, width: 0 }}
                className="shrink-0 overflow-hidden"
              >
                <div className="w-[420px] bg-white rounded-2xl border border-[#bdcaba]/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-6 space-y-6 sticky top-24 max-h-[85vh] overflow-y-auto">
                  {/* Title & Close */}
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-[#0b1c30] text-sm uppercase tracking-wider">
                      Park Inspector
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedParkName(null);
                        setEditingFacilityId(null);
                        setShowAddGameForm(false);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        close
                      </span>
                    </button>
                  </div>

                  {/* Photo & Status */}
                  <div className="space-y-4">
                    <div className="h-40 w-full rounded-xl overflow-hidden relative border border-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="w-full h-full object-cover"
                        src={selectedPark.imageUrl}
                        alt={selectedPark.name}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#0b1c30]">
                        {selectedPark.name}
                      </h3>
                      <p className="text-xs text-[#545f73] mt-1 font-medium">
                        {selectedPark.address}
                      </p>
                    </div>

                    <p className="text-xs text-[#545f73] leading-relaxed">
                      {selectedPark.description}
                    </p>
                  </div>

                  {/* Section: Amenities / Facilities */}
                  <div className="border-t border-[#bdcaba]/20 pt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">
                        Amenities ({selectedPark.facilities.length})
                      </h4>
                      {!showAddGameForm && (
                        <button
                          onClick={() => setShowAddGameForm(true)}
                          className="text-[10px] font-bold text-[#006b2c] hover:underline flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-xs">add</span>
                          Add Amenity
                        </button>
                      )}
                    </div>

                    {/* Add Amenity Form Inline */}
                    {showAddGameForm && (
                      <div className="p-4 rounded-xl border border-dashed border-[#bdcaba]/60 bg-slate-50/50 space-y-3">
                        <h5 className="text-[11px] font-bold text-[#0b1c30] uppercase tracking-wider">
                          New Amenity Facility
                        </h5>
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] font-bold text-[#545f73] block mb-1">
                              Name (e.g. Squash Court 1)
                            </label>
                            <input
                              type="text"
                              value={newGameSubname}
                              onChange={(e) => setNewGameSubname(e.target.value)}
                              placeholder="e.g. Squash Court 1"
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#006b2c]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-[#545f73] block mb-1">
                                Sport Type
                              </label>
                              <select
                                value={newGameSportType}
                                onChange={(e) => setNewGameSportType(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#006b2c] bg-white font-medium"
                              >
                                {categories.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#545f73] block mb-1">
                                Price per Hour ($)
                              </label>
                              <input
                                type="number"
                                value={newGamePrice}
                                onChange={(e) => setNewGamePrice(Number(e.target.value))}
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#006b2c]"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setShowAddGameForm(false)}
                            className="px-2.5 py-1.5 text-[10px] font-bold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddGame}
                            className="px-2.5 py-1.5 text-[10px] font-bold bg-[#006b2c] text-white rounded-lg hover:bg-[#005221]"
                          >
                            Add Amenity
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Amenities List */}
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {selectedPark.facilities.map((game) => {
                        const isEditing = editingFacilityId === game.id;
                        const gameSubname = game.name.split(" - ")[1] || game.name;

                        if (isEditing) {
                          return (
                            <div
                              key={game.id}
                              className="p-3.5 rounded-xl border border-[#006b2c] bg-[#eff9f4] space-y-3 shadow-sm"
                            >
                              <div>
                                <label className="text-[9px] font-bold text-[#545f73] block mb-0.5">
                                  Amenity/Court Name
                                </label>
                                <input
                                  type="text"
                                  value={editSubname}
                                  onChange={(e) => setEditSubname(e.target.value)}
                                  className="w-full text-xs px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-[#006b2c] bg-white font-medium"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] font-bold text-[#545f73] block mb-0.5">
                                    Sport Type
                                  </label>
                                  <select
                                    value={editSportType}
                                    onChange={(e) => setEditSportType(e.target.value)}
                                    className="w-full text-[10px] px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-[#006b2c] bg-white font-medium"
                                  >
                                    {categories.map((cat) => (
                                      <option key={cat} value={cat}>
                                        {cat}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-[#545f73] block mb-0.5">
                                    Price / hr ($)
                                  </label>
                                  <input
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(Number(e.target.value))}
                                    className="w-full text-[10px] px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-[#006b2c] bg-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[9px] font-bold text-[#545f73] block mb-0.5">
                                  Status
                                </label>
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value as any)}
                                  className="w-full text-[10px] px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-[#006b2c] bg-white font-medium"
                                >
                                  <option value="AVAILABLE">Available</option>
                                  <option value="RESERVED">Reserved</option>
                                  <option value="MAINTENANCE">Maintenance</option>
                                  <option value="UNAVAILABLE">Unavailable</option>
                                </select>
                              </div>

                              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                                <button
                                  onClick={() => setEditingFacilityId(null)}
                                  className="px-2 py-1 text-[9px] font-bold border border-slate-200 rounded bg-white text-slate-700 hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(game.id)}
                                  className="px-2 py-1 text-[9px] font-bold bg-[#006b2c] text-white rounded hover:bg-[#005221]"
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
                            className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-[#bdcaba]/60 hover:bg-slate-50/50 transition-all flex flex-col gap-2.5"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-[#0b1c30]">
                                  {gameSubname}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-extrabold rounded uppercase tracking-wider">
                                    {game.sportType}
                                  </span>
                                  <span className="text-[10px] text-[#545f73] font-medium">
                                    ${game.pricePerHour.toFixed(2)}/hr
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    statusStyles[game.status].bg
                                  } ${statusStyles[game.status].text}`}
                                >
                                  {statusStyles[game.status].label}
                                </span>

                                {/* Quick toggle status */}
                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={game.status === "AVAILABLE" || game.status === "RESERVED"}
                                    onChange={() => handleStatusToggle(game.id)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-3.5 after:width-3.5 after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#006b2c]"></div>
                                </label>
                              </div>
                            </div>

                            {/* Game Actions: Edit, Delete, QR Code */}
                            <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[10px]">
                              <span className="text-slate-400 font-medium font-mono text-[9px]">
                                ID: {game.id}
                              </span>

                              <div className="flex items-center gap-3 font-bold text-slate-600">
                                <button
                                  onClick={() => setActiveQrFacility(game)}
                                  className="hover:text-[#006b2c] flex items-center gap-0.5"
                                  title="View QR Code"
                                >
                                  <span className="material-symbols-outlined text-sm">qr_code_2</span>
                                  QR
                                </button>
                                <button
                                  onClick={() => handleStartEdit(game)}
                                  className="hover:text-[#006b2c] flex items-center gap-0.5"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteFacility(game.id)}
                                  className="hover:text-red-600 flex items-center gap-0.5 text-red-500"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
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
    </div>
  );
}
