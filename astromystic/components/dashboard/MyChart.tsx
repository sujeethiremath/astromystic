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
import ChartVisualizer from '../ChartVisualizer';

interface MyChartProps {
  currentStyles: any;
  theme: 'sun' | 'moon';
  targetUid?: string; // Optional prop for Admin use
}

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
        // console.error('Autocomplete error:', err);
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
export default function MyChart({
  currentStyles,
  theme,
  targetUid,
}: MyChartProps) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    timezone: 'UTC',
  });

  // 1. Check for existing chart
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const uidToFetch = targetUid || user.uid;

        try {
          const chartRef = doc(db, 'users', uidToFetch, 'charts', 'natal');
          const chartSnap = await getDoc(chartRef);

          if (chartSnap.exists()) {
            setChartData(chartSnap.data());
          } else {
            setChartData(null);
          }
        } catch (error) {
          //console.error('Error fetching chart:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [targetUid]);

  // 2. Handle New Chart Generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setGenerating(true);

    try {
      const token = await currentUser.getIdToken();
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
          targetUid: targetUid, // Pass this so admin can generate for others
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setChartData(result.data);
    } catch (error) {
      //console.error(error);
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

  // VIEW 1: CHART DISPLAY
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

        {/* VISUALIZER COMPONENT */}
        <div className="flex justify-center mb-8">
          <ChartVisualizer planets={planets} theme={theme} />
        </div>

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

  // VIEW 2: GENERATION FORM
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
