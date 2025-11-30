'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ChartVisualizerProps {
  planets: any;
  theme: 'sun' | 'moon';
}

export default function ChartVisualizer({
  planets,
  theme,
}: ChartVisualizerProps) {
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
          type="button"
          onClick={handleZoomIn}
          className="p-1.5 bg-white/10 backdrop-blur-md rounded hover:bg-white/20 border border-current/20"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
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
            // Stagger radius slightly to avoid bunching
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
}
