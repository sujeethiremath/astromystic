'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Sparkles,
  Loader2,
  Trash2,
  User,
  ZoomIn,
  ZoomOut,
  CheckCircle,
} from 'lucide-react';
import ChartVisualizer from '../ChartVisualizer';
import { auth } from '../../lib/firebase';

// Timezones List
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

// --- REUSED AUTOCOMPLETE ---
const CityAutocomplete = ({ value, onChange, onSelect, styles }: any) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
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
        placeholder="City (e.g. London)"
        required
        value={value}
        onChange={handleInput}
        className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:border-opacity-100 transition-all ${styles.inputBg} ${styles.border}`}
      />

      {show && (suggestions.length > 0 || loading) && (
        <div
          className={`absolute z-50 w-full mt-1 rounded-lg shadow-xl overflow-hidden border max-h-40 overflow-y-auto ${styles.panelBg} ${styles.border}`}
        >
          {loading && suggestions.length === 0 ? (
            <div className="p-2 text-center opacity-50 text-xs">Loading...</div>
          ) : (
            suggestions.map((s: any, i: number) => (
              <button
                type="button"
                key={i}
                className="w-full text-left px-4 py-2 text-xs hover:opacity-60 border-b border-current border-opacity-5 transition-opacity"
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
                <div className="opacity-60 truncate">{s.display_name}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function ChartManagerModal({
  isOpen,
  onClose,
  existingChart,
  onSave,
  currentStyles,
  theme,
}: any) {
  const [mode, setMode] = useState<'create' | 'view'>(
    existingChart ? 'view' : 'create'
  );
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    date: '',
    time: '',
    location: '',
    timezone: 'UTC',
  });
  const [wasExisting, setWasExisting] = useState(false); // Track if loaded from cache

  // If viewing existing, use that data, otherwise use form result
  const [viewData, setViewData] = useState<any>(existingChart);

  useEffect(() => {
    if (existingChart) {
      setMode('view');
      setViewData(existingChart);
      setWasExisting(false);
    } else {
      setMode('create');
      setFormData({
        firstName: '',
        lastName: '',
        date: '',
        time: '',
        location: '',
        timezone: 'UTC',
      });
    }
  }, [existingChart, isOpen]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();

      // Strip whitespace from names before sending
      const sanitizedData = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };

      const res = await fetch('/api/admin/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedData),
      });
      const data = await res.json();
      if (res.ok) {
        onSave(data); // Notify parent to refresh list
        setViewData(data);
        setWasExisting(data.isExisting); // Check API flag
        setMode('view'); // Switch to view mode
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className={`relative w-full max-w-4xl p-8 rounded-2xl shadow-2xl border ${currentStyles.panelBg} ${currentStyles.border} max-h-[90vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 opacity-50 hover:opacity-100"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-serif font-bold">
            {mode === 'create'
              ? 'New Standalone Chart'
              : `${viewData?.firstName}'s Chart`}
          </h2>
          {wasExisting && (
            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
              <CheckCircle className="w-3 h-3" /> Found Existing Chart
            </div>
          )}
        </div>

        {/* --- CREATE MODE --- */}
        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                <input
                  placeholder="First Name"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none ${currentStyles.inputBg} ${currentStyles.border}`}
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                <input
                  placeholder="Last Name"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none ${currentStyles.inputBg} ${currentStyles.border}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none ${currentStyles.inputBg} ${currentStyles.border}`}
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none ${currentStyles.inputBg} ${currentStyles.border}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <CityAutocomplete
                value={formData.location}
                onChange={(v: string) =>
                  setFormData({ ...formData, location: v })
                }
                onSelect={(v: string) =>
                  setFormData({ ...formData, location: v })
                }
                styles={currentStyles}
              />
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                <select
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData({ ...formData, timezone: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none ${currentStyles.inputBg} ${currentStyles.border}`}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 ${currentStyles.button}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}{' '}
              Generate Chart
            </button>
          </form>
        )}

        {/* --- VIEW MODE --- */}
        {mode === 'view' && viewData && (
          <div className="animate-in fade-in">
            <div className="flex justify-center mb-8">
              <div className="scale-110">
                <ChartVisualizer planets={viewData.planets} theme={theme} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {/* List Planets in a nice grid */}
              {Object.entries(viewData.planets).map(([k, v]: any) => (
                // UPDATED: Removed background color classes for transparency
                <div
                  key={k}
                  className="flex flex-col p-3 rounded-lg border border-current border-opacity-10 text-center"
                >
                  <span className="capitalize opacity-60 text-xs mb-1">
                    {k}
                  </span>
                  <span className="font-bold text-lg">{v.sign}</span>
                  <span className="opacity-40 text-xs">
                    {v.degree.toFixed(1)}°
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-current border-opacity-10 text-center text-xs opacity-50 flex justify-center gap-6">
              <span>
                <Calendar className="w-3 h-3 inline mr-1" />{' '}
                {new Date(viewData.meta.local_time).toLocaleDateString()}{' '}
                {new Date(viewData.meta.local_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>
                <MapPin className="w-3 h-3 inline mr-1" /> {viewData.meta.city}
              </span>
              <span>
                <Globe className="w-3 h-3 inline mr-1" />{' '}
                {viewData.meta.timezone}
              </span>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setMode('create');
                  setViewData(null);
                  setWasExisting(false);
                }}
                className="py-2 px-6 rounded-full border border-current border-opacity-20 hover:bg-current hover:bg-opacity-5 transition-all text-sm font-bold"
              >
                + Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
