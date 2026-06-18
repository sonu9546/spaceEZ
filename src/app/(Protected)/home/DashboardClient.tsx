"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Button,
  Input,
  Select,
  Form,
  Steps,
  Checkbox,
  TimePicker,
  message,
  Dropdown,
  MenuProps,
  Drawer,
  Modal,
  QRCode,
  Table,
  Image,
} from "antd";
import {
  PlusOutlined,
  FilterOutlined,
  SearchOutlined,
  EllipsisOutlined,
  EnvironmentOutlined,
  UserOutlined,
  QrcodeOutlined,
  EditOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

// Custom SVGs for category bar to match the screenshot precisely
const GridIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);
const TreeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L3 17H9V22H15V17H21L12 2Z" />
  </svg>
);
const DoorIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 9h.01" />
  </svg>
);
const CoffeeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
  </svg>
);
const PavilionIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 7h20L12 2zM4 22V10h3v12H4zm6 0V10h4v12h-4zm7 0V10h3v12h-3z" />
  </svg>
);
const BallIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M6.2 6.2a8.8 8.8 0 0 0 11.6 11.6M17.8 6.2A8.8 8.8 0 0 0 6.2 17.8" />
  </svg>
);
const BikeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="5" cy="18" r="3" />
    <circle cx="19" cy="18" r="3" />
    <path d="M12 18V8l3-3M5 18h9l3-7H9" />
  </svg>
);

interface Venue {
  id: number;
  name: string;
  category: string;
  location: string;
  address: string;
  coordinates: string;
  pricePerHour: number;
  capacity: number;
  operatingHours: string;
  status: "Active" | "Inactive" | "Limited" | "Occupied";
  imageUrl: string;
  gallery: string[];
  description: string;
}

interface Reservation {
  id: string;
  venueId: number;
  customerName: string;
  customerEmail: string;
  date: string;
  timeSlot: string;
  amountPaid: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}

const initialReservations: Reservation[] = [
  {
    id: "RES-001",
    venueId: 1,
    customerName: "Alice Cooper",
    customerEmail: "alice@example.com",
    date: "2026-06-19",
    timeSlot: "10:00 AM - 12:00 PM",
    amountPaid: "$70.00",
    status: "Confirmed"
  },
  {
    id: "RES-002",
    venueId: 1,
    customerName: "Bob Marley",
    customerEmail: "bob@example.com",
    date: "2026-06-20",
    timeSlot: "02:00 PM - 04:00 PM",
    amountPaid: "$70.00",
    status: "Pending"
  },
  {
    id: "RES-003",
    venueId: 2,
    customerName: "Charlie Brown",
    customerEmail: "charlie@example.com",
    date: "2026-06-19",
    timeSlot: "09:00 AM - 11:00 AM",
    amountPaid: "$90.00",
    status: "Confirmed"
  },
  {
    id: "RES-004",
    venueId: 2,
    customerName: "Diana Ross",
    customerEmail: "diana@example.com",
    date: "2026-06-21",
    timeSlot: "01:00 PM - 03:00 PM",
    amountPaid: "$90.00",
    status: "Cancelled"
  },
  {
    id: "RES-005",
    venueId: 3,
    customerName: "Ethan Hunt",
    customerEmail: "ethan@example.com",
    date: "2026-06-22",
    timeSlot: "08:00 AM - 10:00 AM",
    amountPaid: "$50.00",
    status: "Confirmed"
  },
  {
    id: "RES-006",
    venueId: 4,
    customerName: "Fiona Gallagher",
    customerEmail: "fiona@example.com",
    date: "2026-06-20",
    timeSlot: "11:00 AM - 01:00 PM",
    amountPaid: "$120.00",
    status: "Confirmed"
  },
  {
    id: "RES-007",
    venueId: 5,
    customerName: "George Clooney",
    customerEmail: "george@example.com",
    date: "2026-06-23",
    timeSlot: "03:00 PM - 05:00 PM",
    amountPaid: "$80.00",
    status: "Pending"
  }
];

const initialVenues: Venue[] = [
  {
    id: 1,
    name: "Fairmount Park - Pavilion A",
    category: "Parks",
    location: "Philadelphia, PA",
    address: "1 Boathouse Row, Philadelphia, PA 19130, USA",
    coordinates: "39.9653° N, 75.1827° W",
    pricePerHour: 35,
    capacity: 50,
    operatingHours: "6:00 AM - 10:00 PM",
    status: "Active",
    imageUrl:
      "https://images.unsplash.com/photo-1543731068-7e0f5beff43a?w=500&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1543731068-7e0f5beff43a?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&auto=format&fit=crop&q=80",
    ],
    description:
      "Charming open-air timber shelter situated inside the historic Fairmount Park. Complete with picnic tables, a brick BBQ grill, and immediate access to scenic walking trails.",
  },
  {
    id: 2,
    name: "Community Meeting Room 1",
    category: "Meeting Rooms",
    location: "City Hall, Philadelphia, PA",
    address: "1400 John F Kennedy Blvd, Philadelphia, PA 19107, USA",
    coordinates: "39.9526° N, 75.1652° W",
    pricePerHour: 45,
    capacity: 15,
    operatingHours: "8:00 AM - 8:00 PM",
    status: "Active",
    imageUrl:
      "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=500&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&auto=format&fit=crop&q=80",
    ],
    description:
      "Modern, fully equipped presentation room featuring dynamic lighting, high-speed Wi-Fi, writing boards, and smart conferencing setup.",
  },
  {
    id: 3,
    name: "Rittenhouse Café",
    category: "Cafés",
    location: "Rittenhouse Square, Philadelphia, PA",
    address: "210 W Rittenhouse Square, Philadelphia, PA 19103, USA",
    coordinates: "39.9495° N, 75.1725° W",
    pricePerHour: 25,
    capacity: 30,
    operatingHours: "7:00 AM - 9:00 PM",
    status: "Active",
    imageUrl:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&auto=format&fit=crop&q=80",
    ],
    description:
      "Cozy indoor venue inside Rittenhouse Square. Includes access to a coffee machine, premium sound system, and soft lounge seats.",
  },
  {
    id: 4,
    name: "Soccer Field #3",
    category: "Sports Courts",
    location: "FDR Park, Philadelphia, PA",
    address: "1500 Pattison Ave, Philadelphia, PA 19145, USA",
    coordinates: "39.9048° N, 75.1764° W",
    pricePerHour: 60,
    capacity: 22,
    operatingHours: "6:00 AM - 10:00 PM",
    status: "Active",
    imageUrl:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&auto=format&fit=crop&q=80",
    ],
    description:
      "Championship-grade artificial turf soccer field. Complete with heavy-duty metal nets, player bench covers, and LED stadium floodlights.",
  },
  {
    id: 5,
    name: "Boat Rental Station",
    category: "Rentals",
    location: "Schuylkill River Park, Philadelphia, PA",
    address: "300 S 25th St, Philadelphia, PA 19103, USA",
    coordinates: "39.9482° N, 75.1812° W",
    pricePerHour: 20,
    capacity: 10,
    operatingHours: "9:00 AM - 6:00 PM",
    status: "Inactive",
    imageUrl:
      "https://images.unsplash.com/photo-1505244208262-1907c84439c2?w=500&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505244208262-1907c84439c2?w=200&auto=format&fit=crop&q=80",
    ],
    description:
      "Waterfront launch deck offering single and tandem kayak rentals, lifevests, and quick safety instructions.",
  },
  {
    id: 6,
    name: "Basketball Court #2",
    category: "Sports Courts",
    location: "Penn Treaty Park, Philadelphia, PA",
    address: "1301 N Beach St, Philadelphia, PA 19125, USA",
    coordinates: "39.9678° N, 75.1292° W",
    pricePerHour: 15,
    capacity: 12,
    operatingHours: "8:00 AM - 10:00 PM",
    status: "Active",
    imageUrl:
      "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=500&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=200&auto=format&fit=crop&q=80",
    ],
    description:
      "Premium outdoor court with steel chain nets, clear backboards, and freshly painted boundaries. Excellent breeze next to the water.",
  },
];

const categories = [
  { name: "All", icon: <GridIcon /> },
  { name: "Parks", icon: <TreeIcon /> },
  { name: "Meeting Rooms", icon: <DoorIcon /> },
  { name: "Cafés", icon: <CoffeeIcon /> },
  { name: "Pavilions", icon: <PavilionIcon /> },
  { name: "Sports Courts", icon: <BallIcon /> },
  { name: "Rentals", icon: <BikeIcon /> },
];

export default function DashboardClient() {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [selectedVenueId, setSelectedVenueId] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recently");

  // Add/Edit Wizard Form States
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingVenueId, setEditingVenueId] = useState<number | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [reservationsModalOpen, setReservationsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();

  const selectedVenue = useMemo(() => {
    return venues.find((v) => v.id === selectedVenueId) || venues[0];
  }, [venues, selectedVenueId]);

  const selectedVenueReservations = useMemo(() => {
    return reservations.filter((r) => r.venueId === selectedVenue.id);
  }, [reservations, selectedVenue]);

  const filteredVenues = useMemo(() => {
    let list = [...venues];

    // Category filter
    if (selectedCategory !== "All") {
      list = list.filter((v) => v.category === selectedCategory);
    }

    // Search text
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.location.toLowerCase().includes(query) ||
          v.category.toLowerCase().includes(query),
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      list.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.pricePerHour - a.pricePerHour);
    } else if (sortBy === "recently") {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [venues, selectedCategory, searchQuery, sortBy]);

  // Toggle Active Status
  const toggleVenueStatus = (id: number) => {
    setVenues((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const nextStatus = v.status === "Active" ? "Inactive" : "Active";
          message.success(`Venue status changed to ${nextStatus}`);
          return { ...v, status: nextStatus };
        }
        return v;
      }),
    );
  };

  // Handlers for Add/Edit Form Flow
  const handleNextStep = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(["name", "category", "description"]);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        await form.validateFields([
          "capacity",
          "pricePerHour",
          "startTime",
          "endTime",
          "is24Hours",
        ]);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        await form.validateFields(["searchLocation"]);
        setCurrentStep(3);
      }
    } catch {
      message.error("Please fill in the required fields correctly.");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const openAddMode = () => {
    setEditMode(false);
    setEditingVenueId(null);
    form.resetFields();
    setIsAdding(true);
    setCurrentStep(0);
  };

  const openEditMode = (venue: Venue) => {
    setEditMode(true);
    setEditingVenueId(venue.id);
    form.setFieldsValue({
      name: venue.name,
      category: venue.category,
      description: venue.description,
      capacity: venue.capacity,
      pricePerHour: venue.pricePerHour,
      startTime:
        venue.operatingHours === "24 Hours"
          ? null
          : dayjs("2026-06-18 " + venue.operatingHours.split(" - ")[0]),
      endTime:
        venue.operatingHours === "24 Hours"
          ? null
          : dayjs("2026-06-18 " + venue.operatingHours.split(" - ")[1]),
      is24Hours: venue.operatingHours === "24 Hours",
      searchLocation: venue.address,
    });
    setIsAdding(true);
    setCurrentStep(0);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditMode(false);
    setEditingVenueId(null);
    form.resetFields();
    setCurrentStep(0);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("venue-qrcode")?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `${selectedVenue.name.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      message.success("QR Code downloaded successfully!");
    } else {
      message.error("Failed to generate QR Code for download.");
    }
  };

  const handleCancelReservation = (id: string) => {
    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, status: "Cancelled" as const } : r)
    );
    message.success("Reservation cancelled successfully.");
  };

  const handleFormSubmit = () => {
    const values = form.getFieldsValue();
    const startStr = values.startTime
      ? dayjs(values.startTime).format("h:mm A")
      : "";
    const endStr = values.endTime ? dayjs(values.endTime).format("h:mm A") : "";
    const opHours = values.is24Hours ? "24 Hours" : `${startStr} - ${endStr}`;

    if (editMode && editingVenueId) {
      setVenues((prev) =>
        prev.map((v) => {
          if (v.id === editingVenueId) {
            return {
              ...v,
              name: values.name,
              category: values.category,
              description: values.description,
              capacity: Number(values.capacity),
              pricePerHour: Number(values.pricePerHour),
              operatingHours: opHours,
              address: values.searchLocation || v.address,
            };
          }
          return v;
        }),
      );
      message.success("Venue updated successfully!");
    } else {
      const newId =
        venues.length > 0 ? Math.max(...venues.map((v) => v.id)) + 1 : 1;
      const newVenue: Venue = {
        id: newId,
        name: values.name,
        category: values.category,
        location: "Philadelphia, PA",
        address: values.searchLocation || "123 Main St, Philadelphia, PA",
        coordinates: "39.9526° N, 75.1652° W",
        pricePerHour: Number(values.pricePerHour) || 30,
        capacity: Number(values.capacity) || 20,
        operatingHours: opHours,
        status: "Active",
        imageUrl:
          "https://images.unsplash.com/photo-1543731068-7e0f5beff43a?w=500&auto=format&fit=crop&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1543731068-7e0f5beff43a?w=200&auto=format&fit=crop&q=80",
        ],
        description: values.description || "Custom venue description",
      };
      setVenues((prev) => [newVenue, ...prev]);
      setSelectedVenueId(newId);
      message.success("New venue added successfully!");
    }
    closeForm();
  };

  const MockMap = ({ address }: { address: string }) => (
    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#E5EAF2] border border-[#E5EAF2]/50 flex items-center justify-center shadow-inner">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100%" height="100%" fill="#E3ECF5" />
        <path
          d="M -50 40 L 500 40 M -50 100 L 500 100 M -50 160 L 500 160 M -50 220 L 500 220"
          stroke="#FFFFFF"
          strokeWidth="3"
        />
        <path
          d="M 60 -50 L 60 300 M 180 -50 L 180 300 M 300 -50 L 300 300"
          stroke="#FFFFFF"
          strokeWidth="3"
        />
        {/* River */}
        <path
          d="M -20 120 Q 140 80 220 150 T 500 110"
          stroke="#A9CDEE"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Green park zones */}
        <rect
          x="10"
          y="10"
          width="80"
          height="50"
          rx="8"
          fill="#C3E9C7"
          opacity="0.6"
        />
        <rect
          x="230"
          y="30"
          width="130"
          height="80"
          rx="12"
          fill="#C3E9C7"
          opacity="0.6"
        />
      </svg>

      {/* Pulsing Target Ring & Pin */}
      <div className="absolute flex flex-col items-center">
        <div className="relative flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22A652] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#22A652]"></span>
        </div>
        <div className="bg-[#062B52] text-white px-2.5 py-1 rounded-md text-[10px] font-bold shadow-md mt-1 border border-white/20 whitespace-nowrap">
          {address.split(",")[0]}
        </div>
      </div>
    </div>
  );

  const detailMenu = (venue: Venue): MenuProps => ({
    items: [
      {
        key: "edit",
        label: "Edit Venue",
        icon: <EditOutlined />,
        onClick: () => openEditMode(venue),
      },
      {
        key: "status",
        label: venue.status === "Active" ? "Disable Venue" : "Enable Venue",
        icon: <StopOutlined />,
        onClick: () => toggleVenueStatus(venue.id),
      },
    ],
  });

  return (
    <div className="h-full flex flex-col space-y-5 pb-6">
      {/* Top Row: Title, Subtitle, and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2937]">
            Venues
          </h1>
          <p className="text-sm text-[#6B7280]">
            Manage venue categories, pricing, availability, and locations.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={openAddMode}
          className="bg-[#22A652] hover:bg-[#1d8e45] text-white font-semibold flex items-center gap-2 border-none h-11 shadow-md shadow-[#22A652]/20"
        >
          Add Venue
        </Button>
      </div>

      {/* Category horizontal tabs */}
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-gray-200">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <motion.button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              whileHover={{ y: -1.5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#22A652] text-white border border-[#22A652] border-b-4 border-b-[#177239] shadow-[0_4px_10px_rgba(34,166,82,0.15)]"
                  : "bg-white text-[#1F2937] border border-[#E5EAF2] border-b-4 border-b-[#CCD3DF] hover:bg-gray-50 shadow-[0_2px_4px_rgba(0,0,0,0.01)]"
              }`}
            >
              <span className={isActive ? "text-white" : "text-[#6B7280]"}>
                {cat.icon}
              </span>
              {cat.name}
            </motion.button>
          );
        })}
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Venues List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E5EAF2] p-4 flex flex-col space-y-4 lg:max-h-[70vh] lg:overflow-y-auto overflow-visible">
          {/* List Header Actions */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#1F2937]">
              {filteredVenues.length} Venues Found
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={sortBy}
                onChange={setSortBy}
                className="w-36 border-none select-custom text-xs"
                variant="borderless"
                options={[
                  { value: "recently", label: "Recently Added" },
                  { value: "price-low", label: "Price: Low to High" },
                  { value: "price-high", label: "Price: High to Low" },
                ]}
              />
              <Button
                type="text"
                shape="circle"
                icon={<FilterOutlined className="text-gray-400" />}
              />
            </div>
          </div>

          {/* Search inside the List Column */}
          <Input
            prefix={<SearchOutlined className="text-gray-400 mr-1" />}
            placeholder="Search current list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#F8F6F0] border-none rounded-lg text-xs"
          />

          {/* Venue Cards List */}
          <div className="space-y-4 flex-1 overflow-y-auto p-1">
            <AnimatePresence>
              {filteredVenues.length > 0 ? (
                filteredVenues.map((venue) => {
                  const isSelected = selectedVenue.id === venue.id;
                  return (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      whileHover={{ y: -1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      onClick={() => setSelectedVenueId(venue.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 relative ${
                        isSelected
                          ? "border-l-4 border-l-[#22A652] border-[#E5EAF2] border-b-4 border-b-[#22A652]/30 bg-[#DDF5E5]/25 shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
                          : "border-[#E5EAF2] border-b-4 border-b-[#CCD3DF] bg-white hover:bg-gray-50 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.1)]"
                      }`}
                    >
                      <img
                        src={venue.imageUrl}
                        alt={venue.name}
                        className="w-16 h-16 rounded-md object-cover border border-[#E5EAF2]"
                      />
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-sm text-[#1F2937] truncate pr-1">
                            {venue.name}
                          </h3>
                          <Tag
                            color={
                              venue.status === "Active" ? "success" : "default"
                            }
                            className="text-[10px] px-2 py-0.5 rounded-full border-none font-bold"
                            style={{
                              backgroundColor:
                                venue.status === "Active"
                                  ? "#DDF5E5"
                                  : "#E5EAF2",
                              color:
                                venue.status === "Active"
                                  ? "#22A652"
                                  : "#6B7280",
                            }}
                          >
                            {venue.status}
                          </Tag>
                        </div>
                        <p className="text-xs text-[#6B7280] truncate flex items-center gap-1">
                          <EnvironmentOutlined /> {venue.location}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-extrabold text-[#062B52]">
                            ${venue.pricePerHour}{" "}
                            <span className="text-[10px] text-[#6B7280] font-normal">
                              / hour
                            </span>
                          </span>
                          <span className="text-[10px] font-bold text-[#22A652] bg-[#DDF5E5] px-2 py-0.5 rounded">
                            {venue.category}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-[#6B7280] text-sm">
                  No venues found matching selection.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 2: Venue Detail Preview */}
        <div
          className="lg:col-span-8 bg-white rounded-xl border border-[#E5EAF2] p-5 flex flex-col space-y-4 lg:max-h-[70vh] lg:overflow-y-auto overflow-visible"
        >
          <div className="flex justify-between items-center border-b border-[#E5EAF2] pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#1F2937]">
                {selectedVenue.name}
              </h2>
              <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                <EnvironmentOutlined /> {selectedVenue.address}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Tag
                color={
                  selectedVenue.status === "Active" ? "success" : "default"
                }
                className="text-xs px-2.5 py-0.5 rounded-full font-bold border-none"
                style={{
                  backgroundColor:
                    selectedVenue.status === "Active" ? "#DDF5E5" : "#E5EAF2",
                  color:
                    selectedVenue.status === "Active" ? "#22A652" : "#6B7280",
                }}
              >
                {selectedVenue.status}
              </Tag>
              <Dropdown menu={detailMenu(selectedVenue)} trigger={["click"]}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<EllipsisOutlined className="text-lg text-[#1F2937]" />}
                />
              </Dropdown>
            </div>
          </div>

          {/* Main Image & Small Gallery */}
          <div className="space-y-3">
            <div className="relative h-48 rounded-xl overflow-hidden shadow-sm">
              <img
                src={selectedVenue.imageUrl}
                alt={selectedVenue.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-medium hover:bg-black/80 transition-colors">
                <EyeOutlined /> View Gallery
              </div>
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-2">
              {selectedVenue.gallery.slice(0, 4).map((imgUrl, index) => {
                const isLast = index === 3 && selectedVenue.gallery.length > 4;
                return (
                  <div
                    key={index}
                    className="relative w-16 h-12 rounded-lg overflow-hidden border border-[#E5EAF2] cursor-pointer flex-1"
                  >
                    <Image
                      src={imgUrl}
                      className="w-full h-full object-cover"
                      alt="gallery-item"
                    />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                        +{selectedVenue.gallery.length - 4}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description Text */}
          <div className="bg-[#F8F6F0] p-4 rounded-xl border border-[#E5EAF2]/50">
            <h4 className="text-xs font-bold text-[#062B52] mb-1 uppercase tracking-wider">
              About Venue
            </h4>
            <p className="text-xs text-[#1F2937] leading-relaxed">
              {selectedVenue.description}
            </p>
          </div>

          {/* Details Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ y: -1.5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="p-3 bg-white rounded-xl border border-[#E5EAF2] flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
            >
              <div className="w-9 h-9 rounded-lg bg-[#DDF5E5] flex items-center justify-center text-[#22A652]">
                <PlusOutlined />
              </div>
              <div>
                <span className="text-[10px] text-[#6B7280] block">
                  Category
                </span>
                <span className="text-xs font-bold text-[#1F2937]">
                  {selectedVenue.category}
                </span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -1.5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="p-3 bg-white rounded-xl border border-[#E5EAF2] flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
            >
              <div className="w-9 h-9 rounded-lg bg-[#DDF5E5] flex items-center justify-center text-[#22A652]">
                <DollarOutlined />
              </div>
              <div>
                <span className="text-[10px] text-[#6B7280] block">
                  Price Per Hour
                </span>
                <span className="text-xs font-bold text-[#1F2937]">
                  ${selectedVenue.pricePerHour} / hr
                </span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -1.5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="p-3 bg-white rounded-xl border border-[#E5EAF2] flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
            >
              <div className="w-9 h-9 rounded-lg bg-[#DDF5E5] flex items-center justify-center text-[#22A652]">
                <UserOutlined />
              </div>
              <div>
                <span className="text-[10px] text-[#6B7280] block">
                  Capacity
                </span>
                <span className="text-xs font-bold text-[#1F2937]">
                  {selectedVenue.capacity} People
                </span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -1.5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="p-3 bg-white rounded-xl border border-[#E5EAF2] flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
            >
              <div className="w-9 h-9 rounded-lg bg-[#DDF5E5] flex items-center justify-center text-[#22A652]">
                <ClockCircleOutlined />
              </div>
              <div>
                <span className="text-[10px] text-[#6B7280] block">
                  Operating Hours
                </span>
                <span className="text-xs font-bold text-[#1F2937]">
                  {selectedVenue.operatingHours}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Location / Coordinates Map section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#1F2937]">
                Location details
              </span>
              <span className="text-[10px] text-[#6B7280] font-medium">
                {selectedVenue.coordinates}
              </span>
            </div>
            <MockMap address={selectedVenue.address} />
          </div>

          {/* Actions bar at bottom */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#E5EAF2]">
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditMode(selectedVenue)}
              className="w-full hover:border-[#22A652] hover:text-[#22A652] text-xs font-semibold h-10 rounded-lg flex items-center justify-center"
            >
              Edit Venue
            </Button>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => setReservationsModalOpen(true)}
              className="w-full hover:border-[#22A652] hover:text-[#22A652] text-xs font-semibold h-10 rounded-lg flex items-center justify-center"
            >
              Reservations
            </Button>
            <Button
              icon={<QrcodeOutlined />}
              onClick={() => setQrModalOpen(true)}
              className="w-full hover:border-[#22A652] hover:text-[#22A652] text-xs font-semibold h-10 rounded-lg flex items-center justify-center"
            >
              Generate QR
            </Button>
            <Button
              danger={selectedVenue.status === "Active"}
              type={selectedVenue.status === "Inactive" ? "primary" : "default"}
              onClick={() => toggleVenueStatus(selectedVenue.id)}
              style={{
                backgroundColor:
                  selectedVenue.status === "Inactive" ? "#22A652" : undefined,
                borderColor:
                  selectedVenue.status === "Inactive" ? "#22A652" : undefined,
              }}
              className="w-full text-xs font-semibold h-10 rounded-lg flex items-center justify-center"
            >
              {selectedVenue.status === "Active" ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>

      <Drawer
        title={
          <div className="border-b border-[#E5EAF2] pb-3 pr-8">
            <h2 className="text-base font-bold text-[#1F2937]">
              {editMode ? "Edit Venue" : "Add New Venue"}
            </h2>
            <p className="text-[11px] text-[#6B7280]">
              Configure venue details & settings.
            </p>
          </div>
        }
        placement="right"
        open={isAdding}
        onClose={closeForm}
        footer={null}
        width={550}
        destroyOnClose
        className="venue-wizard-drawer"
      >
        <div className="pt-4 flex flex-col space-y-4">
          {/* Wizard Progress Steps */}
          <Steps
            size="small"
            current={currentStep}
            className="stepper-custom mb-2"
            items={[
              { title: "Info" },
              { title: "Rules" },
              { title: "Location" },
              { title: "Photos" },
            ]}
          />

          <Form layout="vertical" form={form} className="space-y-4">
            {/* Step 0: Basic Info */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <h3 className="text-xs font-bold text-[#062B52] uppercase tracking-wider">
                  Basic Information
                </h3>

                <Form.Item
                  label="Venue Name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the venue name",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter venue name"
                    size="middle"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  label="Category"
                  name="category"
                  rules={[
                    { required: true, message: "Please select a category" },
                  ]}
                >
                  <Select
                    placeholder="Select Category"
                    size="middle"
                    className="rounded-lg"
                  >
                    {categories
                      .filter((c) => c.name !== "All")
                      .map((c) => (
                        <Select.Option key={c.name} value={c.name}>
                          {c.name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Description" name="description">
                  <Input.TextArea
                    placeholder="Enter description (optional)"
                    rows={3}
                    maxLength={250}
                    className="rounded-lg resize-none"
                  />
                </Form.Item>
              </motion.div>
            )}

            {/* Step 1: Pricing & Rules */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <h3 className="text-xs font-bold text-[#062B52] uppercase tracking-wider">
                  Capacity & Pricing
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <Form.Item
                    label="Capacity (People)"
                    name="capacity"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      size="middle"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Price Per Hour"
                    name="pricePerHour"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input
                      type="number"
                      prefix="$"
                      placeholder="e.g., 35"
                      size="middle"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </div>

                <h3 className="text-xs font-bold text-[#062B52] uppercase tracking-wider pt-2">
                  Operating Hours
                </h3>

                <Form.Item name="is24Hours" valuePropName="checked">
                  <Checkbox>24 Hours Open</Checkbox>
                </Form.Item>

                <Form.Item
                  shouldUpdate={(prev, curr) =>
                    prev.is24Hours !== curr.is24Hours
                  }
                  noStyle
                >
                  {({ getFieldValue }) => {
                    const is24 = getFieldValue("is24Hours");
                    if (is24) return null;
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        <Form.Item
                          label="Open Time"
                          name="startTime"
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <TimePicker
                            format="h:mm A"
                            use12Hours
                            size="middle"
                            className="w-full rounded-lg"
                          />
                        </Form.Item>
                        <Form.Item
                          label="Close Time"
                          name="endTime"
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <TimePicker
                            format="h:mm A"
                            use12Hours
                            size="middle"
                            className="w-full rounded-lg"
                          />
                        </Form.Item>
                      </div>
                    );
                  }}
                </Form.Item>
              </motion.div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <h3 className="text-xs font-bold text-[#062B52] uppercase tracking-wider">
                  Location Setup
                </h3>

                <Form.Item
                  label="Search Location"
                  name="searchLocation"
                  rules={[
                    {
                      required: true,
                      message: "Please enter location address",
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <EnvironmentOutlined className="text-gray-400" />
                    }
                    placeholder="Search address, place or ZIP code"
                    size="middle"
                    className="rounded-lg"
                  />
                </Form.Item>

                <MockMap
                  address={
                    form.getFieldValue("searchLocation") || "Fairmount Park"
                  }
                />
              </motion.div>
            )}

            {/* Step 3: Photos Upload (Mocked) */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-xs font-bold text-[#062B52] uppercase tracking-wider">
                  Photos Upload
                </h3>

                <div className="border-2 border-dashed border-[#E5EAF2] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#22A652] transition-colors">
                  <PlusOutlined className="text-3xl text-gray-400 mb-2" />
                  <span className="text-xs font-bold text-[#1F2937]">
                    Click to upload photos
                  </span>
                  <span className="text-[10px] text-[#6B7280] mt-1">
                    PNG, JPG, JPEG up to 5MB
                  </span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-[#DDF5E5] rounded-xl text-xs text-[#22A652] font-semibold border border-[#22A652]/20">
                  <CheckCircleOutlined className="text-sm" />
                  <span>Ready to finalize and publish the venue.</span>
                </div>
              </motion.div>
            )}
          </Form>

          {/* Form Wizard Navigation Buttons */}
          <div className="flex gap-2 pt-3 border-t border-[#E5EAF2]">
            {currentStep > 0 ? (
              <Button
                onClick={handlePrevStep}
                className="flex-1 text-xs font-semibold h-10 rounded-lg"
              >
                Back
              </Button>
            ) : (
              <Button
                onClick={closeForm}
                className="flex-1 text-xs font-semibold h-10 rounded-lg"
              >
                Cancel
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="primary"
                onClick={handleNextStep}
                className="flex-1 text-xs font-semibold h-10 rounded-lg bg-[#22A652] border-none text-white hover:bg-[#1d8e45]"
              >
                Next
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleFormSubmit}
                className="flex-1 text-xs font-semibold h-10 rounded-lg bg-[#22A652] border-none text-white hover:bg-[#1d8e45]"
              >
                {editMode ? "Update" : "Publish Venue"}
              </Button>
            )}
          </div>
        </div>
      </Drawer>

      <Modal
        title={
          <div className="border-b border-[#E5EAF2] pb-3">
            <h2 className="text-base font-bold text-[#1F2937]">Venue QR Code</h2>
            <p className="text-[11px] text-[#6B7280]">
              Scan to view or book the venue details.
            </p>
          </div>
        }
        open={qrModalOpen}
        onCancel={() => setQrModalOpen(false)}
        footer={null}
        width={400}
        destroyOnClose
        centered
        className="qr-code-modal"
      >
        <div className="flex flex-col items-center justify-center pt-6 pb-2 space-y-5">
          {/* Venue Brief Card */}
          <div className="text-center">
            <h3 className="text-sm font-bold text-[#1F2937]">
              {selectedVenue.name}
            </h3>
            <p className="text-xs text-[#6B7280]">{selectedVenue.category}</p>
          </div>

          {/* QR Code Container */}
          <div
            id="venue-qrcode"
            className="p-4 bg-white rounded-2xl border-2 border-[#E5EAF2] shadow-sm flex items-center justify-center"
          >
            <QRCode
              value={`https://spaceez.com/venue/${selectedVenue.id}`}
              size={200}
              color="#062B52"
              bordered={false}
            />
          </div>

          <p className="text-[10px] text-[#6B7280] text-center max-w-[250px]">
            This QR code points directly to the customer-facing booking page of this venue.
          </p>

          <Button
            type="primary"
            onClick={downloadQRCode}
            className="w-full bg-[#22A652] hover:bg-[#1d8e45] text-white font-semibold flex items-center justify-center gap-2 border-none h-11 rounded-lg"
          >
            Download QR Code
          </Button>
        </div>
      </Modal>

      <Drawer
        title={
          <div className="border-b border-[#E5EAF2] pb-3">
            <h2 className="text-base font-bold text-[#1F2937]">Reservations</h2>
            <p className="text-[11px] text-[#6B7280]">
              Showing active, pending, and past bookings for {selectedVenue.name}.
            </p>
          </div>
        }
        placement="right"
        open={reservationsModalOpen}
        onClose={() => setReservationsModalOpen(false)}
        width={650}
        destroyOnClose
        className="venue-reservations-drawer"
      >
        <div className="space-y-4">
          {selectedVenueReservations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-[#6B7280]">No bookings found for this venue.</p>
            </div>
          ) : (
            <Table
              dataSource={selectedVenueReservations}
              rowKey="id"
              pagination={false}
              className="border border-[#E5EAF2] rounded-xl overflow-hidden shadow-sm"
              columns={[
                {
                  title: "Customer",
                  dataIndex: "customerName",
                  key: "customerName",
                  render: (text, record: Reservation) => (
                    <div>
                      <div className="font-bold text-xs text-[#1F2937]">{text}</div>
                      <div className="text-[10px] text-[#6B7280]">{record.customerEmail}</div>
                    </div>
                  ),
                },
                {
                  title: "Date & Time",
                  dataIndex: "date",
                  key: "date",
                  render: (text, record: Reservation) => (
                    <div>
                      <div className="text-xs font-semibold text-[#1F2937]">{text}</div>
                      <div className="text-[10px] text-[#6B7280]">{record.timeSlot}</div>
                    </div>
                  ),
                },
                {
                  title: "Paid",
                  dataIndex: "amountPaid",
                  key: "amountPaid",
                  render: (text) => <span className="text-xs font-bold text-[#1F2937]">{text}</span>,
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (status) => {
                    let color = "blue";
                    if (status === "Confirmed") color = "green";
                    if (status === "Cancelled") color = "red";
                    return (
                      <Tag color={color} className="font-semibold text-[10px] uppercase rounded-full px-2">
                        {status}
                      </Tag>
                    );
                  },
                },
                {
                  title: "Action",
                  key: "action",
                  render: (_, record: Reservation) => (
                    record.status !== "Cancelled" ? (
                      <Button
                        type="link"
                        danger
                        className="p-0 text-xs font-bold hover:underline"
                        onClick={() => handleCancelReservation(record.id)}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <span className="text-[10px] text-[#9CA3AF] italic">Inactive</span>
                    )
                  ),
                },
              ]}
            />
          )}
        </div>
      </Drawer>
      </div>

      <style jsx global>{`
        /* Ant Design component overrides to match design tokens */
        .stepper-custom .ant-steps-item-icon {
          background: transparent !important;
          border-color: #e5eaf2 !important;
        }
        .stepper-custom .ant-steps-item-active .ant-steps-item-icon {
          background: #22a652 !important;
          border-color: #22a652 !important;
        }
        .stepper-custom .ant-steps-item-finish .ant-steps-item-icon {
          background: #22a652 !important;
          border-color: #22a652 !important;
        }
        .stepper-custom
          .ant-steps-item-finish
          .ant-steps-item-icon
          .ant-steps-icon {
          color: white !important;
        }
        .stepper-custom
          .ant-steps-item-active
          .ant-steps-item-icon
          .ant-steps-icon {
          color: white !important;
        }
        .stepper-custom .ant-steps-item-title {
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #6b7280 !important;
        }
        .stepper-custom .ant-steps-item-active .ant-steps-item-title {
          color: #1f2937 !important;
        }
        .stepper-custom .ant-steps-item-finish .ant-steps-item-tail::after {
          background-color: #22a652 !important;
        }
        .select-custom .ant-select-selector {
          padding: 0 !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          color: #062b52 !important;
        }
      `}</style>
    </div>
  );
}
