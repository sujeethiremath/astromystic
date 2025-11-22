"use client";

import React from 'react';
import { Sun, Moon, Compass, ArrowRight } from 'lucide-react';

interface ServicesProps {
  currentStyles: any;
  theme: 'sun' | 'moon';
  onBookNow: () => void;
}

export default function Services({ currentStyles, theme, onBookNow }: ServicesProps) {
  const SERVICES = [
    {
      id: '1',
      title: 'Natal Chart Reading',
      description: 'A deep dive into the placement of the planets at the exact moment of your birth. Understand your core blueprint.',
      icon: <Compass className="w-6 h-6" />,
      price: '$150'
    },
    {
      id: '2',
      title: 'Solar Return (Year Ahead)',
      description: 'Predictive astrology based on when the sun returns to its natal position. A roadmap for your next 12 months.',
      icon: <Sun className="w-6 h-6" />,
      price: '$120'
    },
    {
      id: '3',
      title: 'Synastry (Relationship)',
      description: 'Understanding the dynamics between two charts. Perfect for couples, business partners, or family analysis.',
      icon: <Moon className="w-6 h-6" />,
      price: '$200'
    }
  ];

  return (
    <section id="services" className={`py-12 md:py-24 px-4 ${theme === 'sun' ? 'bg-amber-100/50' : 'bg-slate-900/50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-serif">Celestial Offerings</h2>
        </div>
        
        {/* Grid: 1 column on mobile, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {SERVICES.map((service) => (
            <div key={service.id} className={`p-6 md:p-8 rounded-2xl border ${currentStyles.cardBg} ${currentStyles.cardBorder}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${theme === 'sun' ? 'bg-amber-100 text-amber-600' : 'bg-slate-800 text-indigo-400'}`}>
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif">{service.title}</h3>
              <p className="opacity-70 mb-6 text-sm md:text-base">{service.description}</p>
              <div className="flex items-center justify-between pt-6 border-t border-current border-opacity-10">
                <span className="text-lg font-semibold">{service.price}</span>
                <button 
                  onClick={onBookNow}
                  className={`flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all ${currentStyles.accent}`}
                >
                  Book Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}