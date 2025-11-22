"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroProps {
  currentStyles: any;
  theme: 'sun' | 'moon';
  onBookNow: () => void;
}

export default function Hero({ currentStyles, theme, onBookNow }: HeroProps) {
  
  const handleScrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-[90vh] flex items-center relative px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* Text Content */}
        <div className="space-y-8 z-10">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-opacity-20 border-current text-sm uppercase tracking-widest ${theme === 'sun' ? 'bg-amber-100/50' : 'bg-slate-800/50'}`}>
            <Sparkles className="w-4 h-4" />
            <span>Professional Astrologer</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif leading-tight">
            Align with the <br/>
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${currentStyles.gradient}`}>
              Cosmic Rhythm
            </span>
          </h1>
          
          <p className="text-lg md:text-xl opacity-80 max-w-lg leading-relaxed">
            Bridging the gap between celestial movements and earthly experiences. 
            Uncover your potential through the ancient wisdom of the stars.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onBookNow}
              className={`px-8 py-4 rounded-full font-semibold tracking-wide transition-transform hover:scale-105 shadow-lg ${currentStyles.button}`}
            >
              Book a Reading
            </button>
            <button 
              onClick={handleScrollToServices}
              className={`px-8 py-4 rounded-full font-semibold tracking-wide border border-current border-opacity-30 hover:bg-current hover:bg-opacity-5 transition-all`}
            >
              View Services
            </button>
          </div>
        </div>
        
        {/* Visual Element (Spinning Sun/Moon) */}
        <div className="relative h-[400px] md:h-[600px] flex items-center justify-center z-0">
          {/* Background Glow */}
          <div className={`absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full filter blur-3xl opacity-30 bg-gradient-to-tr ${currentStyles.gradient} animate-pulse`} />
          
          {/* Rotating Rings */}
          <div className={`relative w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full border border-current border-opacity-20 flex items-center justify-center animate-[spin_60s_linear_infinite]`}>
             <div className="absolute -top-2 left-1/2 w-4 h-4 bg-current rounded-full opacity-50" />
             <div className="absolute top-1/2 -right-2 w-4 h-4 bg-current rounded-full opacity-50" />
             <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-current rounded-full opacity-50" />
             <div className="absolute top-1/2 -left-2 w-4 h-4 bg-current rounded-full opacity-50" />
             
             {/* Center Icon */}
             <div className={`w-[150px] h-[150px] md:w-[250px] md:h-[250px] rounded-full border border-current border-opacity-40 flex items-center justify-center animate-[spin_40s_linear_infinite_reverse]`}>
               <div className="text-6xl md:text-8xl opacity-80">
                 {theme === 'sun' ? '☉' : '☾'}
               </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}