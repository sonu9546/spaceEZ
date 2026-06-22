"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CityParkSidebar from "./CityParkSidebar";
import CityParkHeader from "./CityParkHeader";
import { mockFacilities, Facility, getStoredFacilities } from "./mockData";

export default function DashboardClient() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedId, setSelectedId] = useState<string>("facility-1");
  const [selectedParkName, setSelectedParkName] = useState<string | null>(null);
  const [parkSearchQuery, setParkSearchQuery] = useState<string>("");
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredFacilities();
    setFacilities(stored);
    if (stored.length > 0) {
      const activeFac = stored.find(f => f.id === selectedId) || stored[0];
      setSelectedId(activeFac.id);
      setSelectedParkName(activeFac.name.split(" - ")[0] || activeFac.name);
    } else {
      const activeFac = mockFacilities.find(f => f.id === selectedId) || mockFacilities[0];
      setSelectedId(activeFac.id);
      setSelectedParkName(activeFac.name.split(" - ")[0] || activeFac.name);
    }
  }, []);

  // Dynamic counts based on loaded facilities
  const totalAmenities = facilities.length || mockFacilities.length;
  const uniqueParks = new Set(
    (facilities.length ? facilities : mockFacilities).map(
      (f) => f.name.split(" - ")[0] || f.name,
    ),
  );
  const totalParks = uniqueParks.size;

  // Group facilities by park name
  const groupedParks = React.useMemo(() => {
    const groups: Record<string, Facility[]> = {};
    const list = facilities.length ? facilities : mockFacilities;
    list.forEach((fac) => {
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

  // Filter parks based on search query
  const filteredGroupedParks = React.useMemo(() => {
    return groupedParks.filter(park =>
      park.name.toLowerCase().includes(parkSearchQuery.toLowerCase()) ||
      park.address.toLowerCase().includes(parkSearchQuery.toLowerCase())
    );
  }, [groupedParks, parkSearchQuery]);

  const activeParkFacilities = React.useMemo(() => {
    if (!selectedParkName) return [];
    const list = facilities.length ? facilities : mockFacilities;
    return list.filter(f => (f.name.split(" - ")[0] || f.name) === selectedParkName);
  }, [facilities, selectedParkName]);

  const selectedFacility =
    facilities.find((f) => f.id === selectedId) ||
    facilities[0] ||
    mockFacilities[0];

  // Handler to download QR Code
  const handleDownloadQR = (facilityName: string, qrUrl: string) => {
    // Open a link to trigger mock download or create mock anchor
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `${facilityName.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle switch to make facility available/unavailable
  const handleStatusToggle = (id: string) => {
    setFacilities((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const isCurrentlyAvailable = f.status === "AVAILABLE";
          const newStatus: Facility["status"] = isCurrentlyAvailable
            ? "MAINTENANCE"
            : "AVAILABLE";
          const logText = isCurrentlyAvailable
            ? "Status changed to Maintenance by Admin"
            : "Status changed to Available by Admin";

          return {
            ...f,
            status: newStatus,
            recentLogs: [
              {
                id: `log-admin-${Date.now()}`,
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                text: logText,
                type: isCurrentlyAvailable ? "warning" : "success",
              },
              ...f.recentLogs,
            ],
          };
        }
        return f;
      }),
    );
  };

  // Status mapping UI helper
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
              <h2 className="text-2xl font-bold text-[#0b1c30]">
                Dashboard Overview
              </h2>
              <p className="text-sm text-[#545f73]">
                Real-time management and booking utilization dashboard.
              </p>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  title: "Total Parks",
                  val: totalParks.toString(),
                  change: "+3 this month",
                  icon: "\uEA63",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  title: "Total Amenities",
                  val: totalAmenities.toString(),
                  change: "+8 this month",
                  icon: "sports_soccer",
                  color: "text-indigo-600",
                  bg: "bg-indigo-50",
                },
              ].map((kpi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-[#545f73] uppercase tracking-wider">
                      {kpi.title}
                    </span>
                    <div className={`${kpi.bg} w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0`}>
                      <span
                        className={`material-symbols-outlined ${kpi.color} text-xl flex items-center justify-center w-6 h-6 overflow-hidden shrink-0`}
                      >
                        {kpi.icon}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                    {kpi.val}
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

            {/* Registered Parks Listing */}
            <div className="bg-white p-6 rounded-2xl border border-[#bdcaba]/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-base text-[#0b1c30]">
                    Managed Park Locations
                  </h4>
                  <p className="text-xs text-[#545f73]">
                    Click on a park to inspect its active amenities and configurations.
                  </p>
                </div>
                <div className="relative w-64">
                  <span className="material-symbols-outlined text-slate-400 text-sm absolute left-3 top-1/2 -translate-y-1/2 select-none">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search parks..."
                    value={parkSearchQuery}
                    onChange={(e) => setParkSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#006b2c] transition-colors"
                  />
                </div>
              </div>

              {/* Parks Table/List */}
              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#bdcaba]/20 text-[10px] font-bold text-[#545f73] uppercase tracking-wider">
                      <th className="px-4 py-3">Park Info</th>
                      <th className="px-4 py-3">Operating Hours</th>
                      <th className="px-4 py-3">Amenities Count</th>
                      <th className="px-4 py-3">Active Rates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#bdcaba]/10 text-xs">
                    {filteredGroupedParks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                          No matching parks found.
                        </td>
                      </tr>
                    ) : (
                      filteredGroupedParks.map((park) => {
                        const isSelected = selectedParkName === park.name;
                        // Get rate range for display
                        const rates = park.facilities.map(f => f.pricePerHour);
                        const minRate = Math.min(...rates);
                        const maxRate = Math.max(...rates);
                        const rateString = minRate === maxRate ? `$${minRate.toFixed(2)}/hr` : `$${minRate.toFixed(2)} - $${maxRate.toFixed(2)}/hr`;

                        return (
                          <tr
                            key={park.id}
                            onClick={() => {
                              setSelectedParkName(park.name);
                              // Auto-select the first facility of this park
                              if (park.facilities.length > 0) {
                                setSelectedId(park.facilities[0].id);
                              }
                            }}
                            className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                              isSelected ? "bg-[#eff4ff]/60 font-semibold text-[#006b2c]" : "text-slate-700"
                            }`}
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
                                  src={park.imageUrl}
                                  alt={park.name}
                                />
                                <div className="min-w-0">
                                  <span className="font-bold text-[#0b1c30] block text-xs truncate max-w-[180px]">
                                    {park.name}
                                  </span>
                                  <span className="text-[10px] text-[#545f73] truncate block max-w-[180px] font-normal">
                                    {park.address}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-[#545f73] font-medium">
                              06:00 AM - 10:00 PM
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-800 border border-slate-200">
                                {park.facilities.length} {park.facilities.length === 1 ? 'amenity' : 'amenities'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold">
                              {rateString}
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="w-full h-full object-cover"
                      src={selectedFacility.imageUrl}
                      alt={selectedFacility.name}
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          statusStyles[selectedFacility.status].bg
                        } ${statusStyles[selectedFacility.status].text}`}
                      >
                        {statusStyles[selectedFacility.status].label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#0b1c30]">
                      {selectedFacility.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded uppercase tracking-wider">
                        {selectedFacility.sportType}
                      </span>
                      <span className="text-xs text-[#545f73]">
                        Hourly Rate: ${selectedFacility.pricePerHour.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#545f73] leading-relaxed">
                    {selectedFacility.description}
                  </p>

                  {/* Amenities selector for the active park */}
                  {activeParkFacilities.length > 1 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[10px] font-extrabold text-[#0b1c30] uppercase tracking-wider">
                        Park Amenities ({activeParkFacilities.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {activeParkFacilities.map((fac) => {
                          const isCurrent = fac.id === selectedId;
                          return (
                            <button
                              key={fac.id}
                              onClick={() => setSelectedId(fac.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                                isCurrent
                                  ? "bg-[#006b2c] border-[#006b2c] text-white shadow-sm"
                                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {fac.name.split(" - ")[1] || fac.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Switch Actions */}
                <div className="border-t border-[#bdcaba]/20 pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#0b1c30]">
                      Available for Booking
                    </h4>
                    <p className="text-[10px] text-[#545f73]">
                      Toggle facility availability
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={
                        selectedFacility.status === "AVAILABLE" ||
                        selectedFacility.status === "RESERVED"
                      }
                      onChange={() => handleStatusToggle(selectedFacility.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-5 after:width-5 after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006b2c]"></div>
                  </label>
                </div>

                {/* QR Code Action Card */}
                <div className="bg-[#eff4ff]/60 border border-[#bdcaba]/20 rounded-xl p-4 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-16 h-16 rounded-lg bg-white border border-slate-200 p-1 shrink-0"
                    src={selectedFacility.qrCodeUrl}
                    alt="QR Code"
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-[#0b1c30]">
                      QR Check-in Code
                    </h4>
                    <p className="text-[10px] text-[#545f73]">
                      Unique ID: {selectedFacility.id}
                    </p>
                    <button
                      onClick={() =>
                        handleDownloadQR(
                          selectedFacility.name,
                          selectedFacility.qrCodeUrl,
                        )
                      }
                      className="text-xs font-bold text-[#006b2c] hover:underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">
                        download
                      </span>
                      Download PNG
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-semibold text-xs text-slate-700">
                    <span className="material-symbols-outlined text-sm">
                      edit
                    </span>
                    Edit Facility
                  </button>
                  <button className="flex items-center justify-center gap-1 px-4 py-2 border border-red-200 bg-red-50/50 rounded-lg hover:bg-red-50 transition-all font-semibold text-xs text-red-600">
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                    Deactivate
                  </button>
                </div>

                {/* Recent Activity Log */}
                <div className="border-t border-[#bdcaba]/20 pt-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">
                    Facility History Log
                  </h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {selectedFacility.recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-2.5 text-xs"
                      >
                        <span className="font-mono text-[#545f73] shrink-0 text-[10px] mt-0.5">
                          {log.time}
                        </span>
                        <div className="flex-1 flex gap-1.5 items-start">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                              log.type === "success"
                                ? "bg-green-500"
                                : log.type === "warning"
                                  ? "bg-yellow-500"
                                  : log.type === "error"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                            }`}
                          />
                          <span className="text-slate-600 text-[11px] leading-snug">
                            {log.text}
                          </span>
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
  );
}
