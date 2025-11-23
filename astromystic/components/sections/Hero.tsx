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
    <section id="home" className="min-h-[calc(100vh-4rem)] flex items-center relative px-4 py-12 md:py-0">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        
        {/* Text Content */}
        {/* On mobile, this stacks naturally. Added ordering classes if you want to force visual first: order-2 md:order-1 */}
        <div className="space-y-6 md:space-y-8 z-10 relative">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-opacity-20 border-current text-xs md:text-sm uppercase tracking-widest ${theme === 'sun' ? 'bg-amber-100/50' : 'bg-slate-800/50'}`}>
            <Sparkles className="w-4 h-4" />
            <span>Professional Astrologer</span>
          </div>
          
          {/* Responsive Font Size: 4xl mobile, 7xl desktop */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif leading-tight">
            Align with the <br/>
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${currentStyles.gradient}`}>
              Cosmic Rhythm
            </span>
          </h1>
          
          <p className="text-lg md:text-xl opacity-80 max-w-lg leading-relaxed">
            Bridging the gap between celestial movements and earthly experiences. 
            Uncover your potential through the ancient wisdom of the stars.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
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
        
        {/* Visual Element */}
        <div className="relative h-[300px] md:h-[600px] flex items-center justify-center z-0">
          {/* Background Glow */}
          <div className={`absolute w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full filter blur-3xl opacity-30 bg-gradient-to-tr ${currentStyles.gradient} animate-pulse`} />
          
          {/* Rotating Rings - Scaled for mobile */}
          <div className={`relative w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full border border-current border-opacity-20 flex items-center justify-center animate-[spin_60s_linear_infinite]`}>
             <div className="absolute -top-2 left-1/2 w-4 h-4 bg-current rounded-full opacity-50" />
             <div className="absolute top-1/2 -right-2 w-4 h-4 bg-current rounded-full opacity-50" />
             <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-current rounded-full opacity-50" />
             <div className="absolute top-1/2 -left-2 w-4 h-4 bg-current rounded-full opacity-50" />
             
             {/* Center Icon */}
             <div className={`w-[120px] h-[120px] md:w-[250px] md:h-[250px] rounded-full border border-current border-opacity-40 flex items-center justify-center animate-[spin_40s_linear_infinite_reverse]`}>
               <div className="text-5xl md:text-8xl opacity-80">
                 {theme === 'sun' ? '☉' : '☾'}
               </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}