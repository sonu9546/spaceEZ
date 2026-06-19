export interface Facility {
  id: string;
  name: string;
  sportType: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE' | 'RESERVED';
  pricePerHour: number;
  activeBookings: number;
  imageUrl: string;
  qrCodeUrl: string;
  lat: number;
  lng: number;
  description: string;
  address?: string;
  recentLogs: Array<{
    id: string;
    time: string;
    text: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>;
}

export const mockFacilities: Facility[] = [
  {
    id: 'facility-1',
    name: 'Central Park - Tennis Court 1',
    sportType: 'Tennis',
    status: 'AVAILABLE',
    pricePerHour: 15.00,
    activeBookings: 12,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV6a3AM0qNu7DvCgz5hSf8IPzJWiPn-sfRiPUjzTR2x13GlsRwabYqGoax3gGCQ2KtZykXpvLufmfQffgm_J7ihirP3U1qvLzaszyLGfayObIH5CidBC8x7SUibQUBoZTPWnOepunBRQkbRil0SBRjbWUpCazxNFlGe2V0k-1XO78amseizShCzSTXZRLJ00-YVoAf8Alv0GujojFcSxp7ilzGa3xoOJGEJynyRRt_ITCGUliAmS9hDjcotpckXkijz_YB9Chfhygy',
    qrCodeUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0hNOA99dE8jFzmfeP5vSr064sb5jbk_qQifjoTW1WfztlsGZ-u3qidEQPKJ-7u-X29WO2UonxWeA_9szSqxcNEJFZ4YRt1mSOFnfIysZS-r-0X-PdZwvKA9DYGGLtzTTjoZlaU0zHXDv1SWYu_Z3eyfae7BSemjTZsOkbAggryQVqKS7V1GnPUDyMTZpR7foGlD48nXSysF_FznGF1ke53GNJ1i5EkUX0qW1gEqEeZ1cqdUIoHuNjVlvH2LO4Osus8aBWEWBjwjKG',
    lat: 41.8781,
    lng: -87.6298,
    description: 'Tennis • Multi-purpose surface. Professional-grade outdoor blue tennis court in a lush green public park, perfectly maintained with tensioned nets.',
    recentLogs: [
      { id: 'log-1-1', time: '06:00 AM', text: 'Facility cleaned by Site Crew B', type: 'success' },
      { id: 'log-1-2', time: '10:00 AM', text: 'Reservation confirmed for John D.', type: 'info' }
    ]
  },
  {
    id: 'facility-2',
    name: 'Riverside Park - Football Pitch A',
    sportType: 'Football',
    status: 'RESERVED',
    pricePerHour: 25.00,
    activeBookings: 8,
    imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&auto=format&fit=crop&q=80',
    qrCodeUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0hNOA99dE8jFzmfeP5vSr064sb5jbk_qQifjoTW1WfztlsGZ-u3qidEQPKJ-7u-X29WO2UonxWeA_9szSqxcNEJFZ4YRt1mSOFnfIysZS-r-0X-PdZwvKA9DYGGLtzTTjoZlaU0zHXDv1SWYu_Z3eyfae7BSemjTZsOkbAggryQVqKS7V1GnPUDyMTZpR7foGlD48nXSysF_FznGF1ke53GNJ1i5EkUX0qW1gEqEeZ1cqdUIoHuNjVlvH2LO4Osus8aBWEWBjwjKG',
    lat: 41.8820,
    lng: -87.6220,
    description: 'Football • Natural Grass. Full-size soccer field equipped with goalposts, night lighting, and spectator benches.',
    recentLogs: [
      { id: 'log-2-1', time: '08:00 AM', text: 'Line marking completed', type: 'success' },
      { id: 'log-2-2', time: '11:15 AM', text: 'Booking checked in for Riverside FC', type: 'info' }
    ]
  },
  {
    id: 'facility-3',
    name: 'Oakwood Hills - Cricket Oval 2',
    sportType: 'Cricket',
    status: 'AVAILABLE',
    pricePerHour: 35.00,
    activeBookings: 5,
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80',
    qrCodeUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0hNOA99dE8jFzmfeP5vSr064sb5jbk_qQifjoTW1WfztlsGZ-u3qidEQPKJ-7u-X29WO2UonxWeA_9szSqxcNEJFZ4YRt1mSOFnfIysZS-r-0X-PdZwvKA9DYGGLtzTTjoZlaU0zHXDv1SWYu_Z3eyfae7BSemjTZsOkbAggryQVqKS7V1GnPUDyMTZpR7foGlD48nXSysF_FznGF1ke53GNJ1i5EkUX0qW1gEqEeZ1cqdUIoHuNjVlvH2LO4Osus8aBWEWBjwjKG',
    lat: 41.8700,
    lng: -87.6350,
    description: 'Cricket • Clay turf wicket. Beautifully landscaped circular grass outfield with sight screens and high-quality synthetic practice nets.',
    recentLogs: [
      { id: 'log-3-1', time: '07:30 AM', text: 'Pitch rolled and grass trimmed', type: 'success' },
      { id: 'log-3-2', time: '09:00 AM', text: 'Practice nets opened for community', type: 'info' }
    ]
  },
  {
    id: 'facility-4',
    name: 'Valley Recreation - Badminton Hall B',
    sportType: 'Badminton',
    status: 'MAINTENANCE',
    pricePerHour: 10.00,
    activeBookings: 0,
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    qrCodeUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0hNOA99dE8jFzmfeP5vSr064sb5jbk_qQifjoTW1WfztlsGZ-u3qidEQPKJ-7u-X29WO2UonxWeA_9szSqxcNEJFZ4YRt1mSOFnfIysZS-r-0X-PdZwvKA9DYGGLtzTTjoZlaU0zHXDv1SWYu_Z3eyfae7BSemjTZsOkbAggryQVqKS7V1GnPUDyMTZpR7foGlD48nXSysF_FznGF1ke53GNJ1i5EkUX0qW1gEqEeZ1cqdUIoHuNjVlvH2LO4Osus8aBWEWBjwjKG',
    lat: 41.8730,
    lng: -87.6250,
    description: 'Badminton • Indoor wooden courts. Features four premium indoor badminton courts with specialized shock-absorption flooring and overhead LED lights.',
    recentLogs: [
      { id: 'log-4-1', time: '10:00 AM', text: 'Net replacement in progress', type: 'warning' },
      { id: 'log-4-2', time: '01:00 PM', text: 'Floor cleaning scheduled', type: 'info' }
    ]
  },
  {
    id: 'facility-5',
    name: 'Memorial Park - Tennis Court 2',
    sportType: 'Tennis',
    status: 'UNAVAILABLE',
    pricePerHour: 15.00,
    activeBookings: 3,
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
    qrCodeUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0hNOA99dE8jFzmfeP5vSr064sb5jbk_qQifjoTW1WfztlsGZ-u3qidEQPKJ-7u-X29WO2UonxWeA_9szSqxcNEJFZ4YRt1mSOFnfIysZS-r-0X-PdZwvKA9DYGGLtzTTjoZlaU0zHXDv1SWYu_Z3eyfae7BSemjTZsOkbAggryQVqKS7V1GnPUDyMTZpR7foGlD48nXSysF_FznGF1ke53GNJ1i5EkUX0qW1gEqEeZ1cqdUIoHuNjVlvH2LO4Osus8aBWEWBjwjKG',
    lat: 41.8750,
    lng: -87.6320,
    description: 'Tennis • Hard court surface. Standard outdoor hard court, partially shaded. Currently closed due to minor surface crack inspections.',
    recentLogs: [
      { id: 'log-5-1', time: '09:00 AM', text: 'Surface inspection initiated', type: 'warning' }
    ]
  }
];

export const getStoredFacilities = (): Facility[] => {
  if (typeof window === 'undefined') return mockFacilities;
  const stored = localStorage.getItem('cityparkon_facilities');
  if (!stored) {
    localStorage.setItem('cityparkon_facilities', JSON.stringify(mockFacilities));
    return mockFacilities;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return mockFacilities;
  }
};

export const saveFacility = (facility: Facility) => {
  if (typeof window === 'undefined') return;
  const current = getStoredFacilities();
  const updated = [...current, facility];
  localStorage.setItem('cityparkon_facilities', JSON.stringify(updated));
};

export const saveMultipleFacilities = (newFacilities: Facility[]) => {
  if (typeof window === 'undefined') return;
  const current = getStoredFacilities();
  const updated = [...current, ...newFacilities];
  localStorage.setItem('cityparkon_facilities', JSON.stringify(updated));
};

