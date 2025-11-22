"use client";

import React from 'react';
import { Sun, Moon, Compass } from 'lucide-react';

interface BookingListProps {
  currentStyles: any;
}

export default function BookingList({ currentStyles }: BookingListProps) {
  const ITEMS = [
    { title: 'Natal Chart', icon: <Compass className="w-6 h-6" />, price: '$150', desc: 'Discover your blueprint.' },
    { title: 'Solar Return', icon: <Sun className="w-6 h-6" />, price: '$120', desc: 'Your year ahead forecast.' },
    { title: 'Synastry', icon: <Moon className="w-6 h-6" />, price: '$200', desc: 'Relationship dynamics.' }
  ];

  return (
    // MOBILE OPTIMIZATION: grid-cols-1 ensures cards stack on small screens
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ITEMS.map((item, idx) => (
        <div key={idx} className={`p-6 rounded-xl border flex flex-col ${currentStyles.panelBg} ${currentStyles.border}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${currentStyles.accent}`}>
            {item.icon}
          </div>
          <h3 className="font-serif text-xl font-bold mb-2">{item.title}</h3>
          <p className="text-sm opacity-70 mb-6 flex-grow">{item.desc}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-current border-opacity-10">
            <span className="font-bold">{item.price}</span>
            <button className={`text-sm font-bold hover:underline ${currentStyles.secondary}`}>
              Book Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}