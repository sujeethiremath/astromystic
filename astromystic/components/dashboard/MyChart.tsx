'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Loader2,
  Sun,
  Moon,
  Star,
  Globe,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';

interface MyChartProps {
  currentStyles: any;
  theme: 'sun' | 'moon';
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Universal Time)' },
  { value: 'America/New_York', label: 'New York (Eastern)' },
  { value: 'America/Chicago', label: 'Chicago (Central)' },
  { value: 'America/Denver', label: 'Denver (Mountain)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

// --- NEW: CHART VISUALIZER COMPONENT ---
const ChartVisualizer = ({
  planets,
  theme,
}: {
  planets: any;
  theme: 'sun' | 'moon';
}) => {
  const ZODIACS = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  const RADIUS = 120;
  const CENTER = 150;

  // Zoom State
  const [zoom, setZoom] = useState(1);
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2.0)); // Max zoom 2x
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.8)); // Min zoom 0.8x

  // Helper to place points on the circle
  // Standard Astrology Wheel: Aries (0 deg) starts at 9 o'clock (180 deg visual) and goes counter-clockwise
  const getCoords = (sign: string, degree: number, distance: number) => {
    const signIndex = ZODIACS.indexOf(sign);
    if (signIndex === -1) return { x: CENTER, y: CENTER };

    const totalDegree = signIndex * 30 + degree;
    // Convert zodiac degree to SVG angle (Aries@180 -> Pisces@150)
    // Formula: 180 - degree gives us counter-clockwise movement starting from left
    const angleDeg = 180 - totalDegree;
    const angleRad = (angleDeg * Math.PI) / 180;

    return {
      x: CENTER + distance * Math.cos(angleRad),
      y: CENTER + distance * Math.sin(angleRad),
    };
  };

  const PLANET_COLORS: Record<string, string> = {
    sun: '#F59E0B', // Amber
    moon: '#A78BFA', // Purple
    rising: '#10B981', // Emerald (ASC)
    mercury: '#9CA3AF',
    venus: '#F472B6',
    mars: '#EF4444',
    jupiter: '#FCD34D',
    saturn: '#78716C',
    default: '#6B7280',
  };

  return (
    <div className="relative w-[300px] h-[300px] mx-auto mb-8 group">
      {/* Zoom Controls */}
      <div className="absolute top-0 right-0 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleZoomIn}
          className="p-1.5 bg-white/10 backdrop-blur-md rounded hover:bg-white/20 border border-current/20"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 bg-white/10 backdrop-blur-md rounded hover:bg-white/20 border border-current/20"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full h-full overflow-hidden rounded-full">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Outer Zodiac Ring - Darker/Thicker */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.6"
            strokeWidth="1.5"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS - 30}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="1"
          />

          {/* Zodiac Segment Dividers */}
          {ZODIACS.map((z, i) => {
            const angle = (180 - i * 30) * (Math.PI / 180);
            const x1 = CENTER + (RADIUS - 30) * Math.cos(angle);
            const y1 = CENTER + (RADIUS - 30) * Math.sin(angle);
            const x2 = CENTER + RADIUS * Math.cos(angle);
            const y2 = CENTER + RADIUS * Math.sin(angle);

            // Label Position
            const labelAngle = (180 - (i * 30 + 15)) * (Math.PI / 180);
            const lx = CENTER + (RADIUS - 15) * Math.cos(labelAngle);
            const ly = CENTER + (RADIUS - 15) * Math.sin(labelAngle);

            return (
              <g key={z}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />
                {/* Tiny Zodiac Initial - Darker */}
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="currentColor"
                  opacity="0.8"
                >
                  {z.substring(0, 3).toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Planets */}
          {Object.entries(planets).map(([key, data]: any) => {
            // Stagger radius slightly to avoid bunching? For simplicity, we keep fixed radius
            // But we can shift Sun/Moon slightly inward
            let dist = RADIUS - 45;
            if (key === 'sun') dist = RADIUS - 55;
            if (key === 'moon') dist = RADIUS - 35;
            if (key === 'rising') dist = RADIUS; // Put ASC on the line

            const pos = getCoords(data.sign, data.degree, dist);
            const color = PLANET_COLORS[key] || PLANET_COLORS.default;

            return (
              <g key={key}>
                {/* Planet Marker */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={key === 'rising' ? 4 : 3}
                  fill={color}
                  stroke={theme === 'sun' ? '#FFF' : '#000'}
                  strokeWidth="1"
                />
                {/* Connector Line to Center - Darker */}
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.6"
                />

                {/* Label (Sun/Moon only to reduce clutter) */}
                {['sun', 'moon', 'rising'].includes(key) && (
                  <text
                    x={pos.x}
                    y={pos.y - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill={color}
                    style={{
                      textTransform: 'capitalize',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    {key === 'rising' ? 'ASC' : key}
                  </text>
                )}
              </g>
            );
          })}

          {/* Center Point */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={3}
            fill="currentColor"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Overlay Center Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`text-[10px] font-serif opacity-40 tracking-widest font-bold ${theme === 'sun' ? 'text-amber-900' : 'text-indigo-100'}`}
        >
          NATAL
        </div>
      </div>
    </div>
  );
};

// --- AUTOCOMPLETE COMPONENT ---
const CityAutocomplete = ({
  value,
  onChange,
  onSelect,
  styles,
  theme,
}: any) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShow(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const handleInput = async (e: any) => {
    const val = e.target.value;
    onChange(val);

    if (val.length > 2) {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${val}&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setSuggestions(data);
        setShow(true);
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setShow(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <MapPin className="absolute left-3 top-3 w-5 h-5 opacity-40" />
      <input
        type="text"
        placeholder="Start typing city (e.g. London)"
        required
        value={value}
        onChange={handleInput}
        onFocus={() => value.length > 2 && setShow(true)}
        className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:border-opacity-100 transition-all ${styles.inputBg} ${styles.border} border-opacity-50`}
      />

      {show && (suggestions.length > 0 || loading) && (
        <div
          className={`absolute z-50 w-full mt-1 rounded-lg shadow-xl overflow-hidden border max-h-60 overflow-y-auto ${styles.panelBg} ${styles.border}`}
        >
          {loading && suggestions.length === 0 ? (
            <div className="p-3 text-xs opacity-50 text-center">
              Searching...
            </div>
          ) : (
            suggestions.map((s: any, i: number) => (
              <button
                key={i}
                type="button"
                className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-current border-opacity-5 last:border-0 ${theme === 'sun' ? 'hover:bg-amber-50' : 'hover:bg-white/10'}`}
                onClick={() => {
                  const city =
                    s.address.city ||
                    s.address.town ||
                    s.address.village ||
                    s.name;
                  const state = s.address.state;
                  const country = s.address.country;
                  const fullLocation = [city, state, country]
                    .filter(Boolean)
                    .join(', ');
                  onSelect(fullLocation);
                  setShow(false);
                }}
              >
                <div className="font-bold">{s.name}</div>
                <div className="text-xs opacity-60 truncate">
                  {s.display_name}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function MyChart({ currentStyles, theme }: MyChartProps) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    timezone: 'UTC',
  });

  // 1. Check for existing chart on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const chartRef = doc(db, 'users', currentUser.uid, 'charts', 'natal');
          const chartSnap = await getDoc(chartRef);

          if (chartSnap.exists()) {
            setChartData(chartSnap.data());
          }
        } catch (error) {
          console.error('Error fetching chart:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Handle New Chart Generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setGenerating(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/chart/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          birthDate: formData.date,
          birthTime: formData.time,
          city: formData.location,
          timezone: formData.timezone,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setChartData(result.data);
    } catch (error) {
      console.error(error);
      alert('Failed to generate chart. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading)
    return (
      <div className="col-span-full py-24 text-center flex flex-col items-center justify-center opacity-50">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-sm">Consulting the archives...</p>
      </div>
    );

  // VIEW 1: CHART DISPLAY (If data exists)
  if (chartData) {
    const { planets, meta } = chartData;
    return (
      <div
        className={`p-8 rounded-2xl border shadow-lg animate-in fade-in zoom-in duration-500 ${currentStyles.panelBg} ${currentStyles.border}`}
      >
        <div className="text-center mb-8 pb-6 border-b border-current border-opacity-10">
          <h2 className="text-3xl font-serif font-bold mb-1">
            Your Natal Blueprint
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm opacity-60 mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {meta.city}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{' '}
              {new Date(meta.local_time).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> {meta.timezone || 'UTC'}
            </span>
          </div>
        </div>

        {/* NEW: VISUAL CHART DIAGRAM */}
        <ChartVisualizer planets={planets} theme={theme} />

        {/* Big Three */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {['Sun', 'Moon', 'Rising'].map((point) => {
            const pKey = point.toLowerCase();
            const pData = planets[pKey];
            return (
              <div
                key={point}
                className={`p-4 rounded-xl text-center border ${theme === 'sun' ? 'bg-amber-50 border-amber-200' : 'bg-indigo-900/30 border-indigo-500/30'}`}
              >
                <div className="text-xs uppercase tracking-widest opacity-50 mb-1">
                  {point}
                </div>
                <div className="font-bold text-xl font-serif">
                  {pData?.sign || 'N/A'}
                </div>
                <div className="text-xs opacity-50">
                  {pData?.degree ? pData.degree.toFixed(1) : 0}°
                </div>
              </div>
            );
          })}
        </div>

        {/* Full List */}
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(planets).map(
            ([key, data]: any) =>
              key !== 'rising' && (
                <div
                  key={key}
                  className="flex justify-between items-center p-3 rounded-lg border border-current border-opacity-10"
                >
                  <div className="capitalize font-bold w-24 flex items-center gap-2">
                    {key === 'sun' && (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                    {key === 'moon' && (
                      <Moon className="w-4 h-4 text-indigo-400" />
                    )}
                    {key}
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{data.sign}</span>{' '}
                    <span className="opacity-50 text-xs">
                      {data.degree.toFixed(1)}°
                    </span>
                    <div className="text-[10px] opacity-40 uppercase">
                      {data.house} House
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    );
  }

  // VIEW 2: GENERATION FORM (If no data)
  return (
    <div
      className={`max-w-2xl mx-auto p-8 rounded-2xl border shadow-xl ${currentStyles.panelBg} ${currentStyles.border}`}
    >
      <div className="mb-8 text-center">
        <div
          className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${theme === 'sun' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-900 text-indigo-300'}`}
        >
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">
          Generate Your Chart
        </h2>
        <p className="opacity-70 text-sm max-w-md mx-auto">
          Enter your birth details once to unlock your planetary placements.
          This data will be securely saved to your profile.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 opacity-40" />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:border-opacity-100 transition-all ${currentStyles.inputBg} ${currentStyles.border} border-opacity-50`}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
              Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-5 h-5 opacity-40" />
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:border-opacity-100 transition-all ${currentStyles.inputBg} ${currentStyles.border} border-opacity-50`}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
              City of Birth
            </label>
            <CityAutocomplete
              value={formData.location}
              onChange={(val: string) =>
                setFormData({ ...formData, location: val })
              }
              onSelect={(val: string) =>
                setFormData({ ...formData, location: val })
              }
              styles={currentStyles}
              theme={theme}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
              Timezone
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 w-5 h-5 opacity-40" />
              <select
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:border-opacity-100 transition-all ${currentStyles.inputBg} ${currentStyles.border} border-opacity-50`}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          disabled={generating}
          className={`w-full py-4 rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 transition-all ${currentStyles.button} ${generating ? 'opacity-50' : 'hover:scale-[1.02]'}`}
        >
          {generating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {generating ? 'Calculating...' : 'Reveal My Chart'}
        </button>
      </form>
    </div>
  );
}
