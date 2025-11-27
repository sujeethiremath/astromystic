"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, Sun, Moon, Star } from 'lucide-react';

interface HeroProps {
  currentStyles: any;
  theme: 'sun' | 'moon';
  onBookNow: () => void;
}

export default function Hero({ currentStyles, theme, onBookNow }: HeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleScrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-[calc(100vh-4rem)] flex items-center relative px-4 py-12 md:py-0 overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
        
        {/* --- TEXT CONTENT --- */}
        <div className={`space-y-8 z-10 relative transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-opacity-20 border-current text-xs md:text-sm uppercase tracking-widest ${theme === 'sun' ? 'bg-amber-100/50' : 'bg-slate-800/50'}`}>
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Empower Your Journey</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif leading-tight">
            Practical <br/>
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${currentStyles.gradient} animate-gradient-x`}>
              Love Astrology & Tarot
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl opacity-80 max-w-lg leading-relaxed border-l-4 border-current border-opacity-20 pl-6">
            A blend of astrology and tarot to help you understand yourself, the people in your life, and your relationship dynamics so that you 
            <span className={`font-bold ml-1 ${theme === 'sun' ? 'text-amber-700' : 'text-indigo-300'}`}>claim your power back.</span>
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={onBookNow}
              className={`px-8 py-4 rounded-full font-semibold tracking-wide transition-all hover:scale-105 shadow-lg hover:shadow-xl ${currentStyles.button}`}
            >
              Book a Reading
            </button>
            <button 
              onClick={handleScrollToServices}
              className={`px-8 py-4 rounded-full font-semibold tracking-wide border border-current border-opacity-30 hover:bg-current hover:bg-opacity-5 transition-all group`}
            >
              View Services <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
        
        {/* --- VISUAL ELEMENT --- */}
        <div className={`relative h-[300px] md:h-[600px] flex items-center justify-center z-0 transition-all duration-1000 delay-300 transform ${mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          
          {/* 1. Background Glow (Pulsing) */}
          <div className={`absolute w-[280px] h-[280px] md:w-[500px] md:h-[500px] rounded-full filter blur-3xl opacity-20 bg-gradient-to-tr ${currentStyles.gradient} animate-pulse`} />
          
          {/* 2. Rotating Rings */}
          <div className={`relative w-[280px] h-[280px] md:w-[450px] md:h-[450px] rounded-full border border-current border-opacity-10 flex items-center justify-center animate-[spin_60s_linear_infinite]`}>
             {/* Orbiting Particles */}
             <div className="absolute -top-2 left-1/2 w-3 h-3 bg-current rounded-full opacity-60 blur-[1px]" />
             <div className="absolute top-1/2 -right-2 w-2 h-2 bg-current rounded-full opacity-40" />
             <div className="absolute -bottom-2 left-1/2 w-3 h-3 bg-current rounded-full opacity-60 blur-[1px]" />
             <div className="absolute top-1/2 -left-2 w-2 h-2 bg-current rounded-full opacity-40" />
             
             {/* Inner Ring (Counter-Rotate) */}
             <div className={`w-[180px] h-[180px] md:w-[300px] md:h-[300px] rounded-full border border-current border-opacity-30 flex items-center justify-center animate-[spin_40s_linear_infinite_reverse]`}>
                <div className="absolute top-0 w-2 h-2 bg-current rounded-full opacity-80" />
                <div className="absolute bottom-0 w-2 h-2 bg-current rounded-full opacity-80" />
             </div>
          </div>

          {/* 3. CENTRAL LOGO STACK (Floating Animation) */}
          <div className="absolute flex flex-col items-center gap-4 animate-float">
            {/* Sun */}
            <Sun className={`w-12 h-12 md:w-16 md:h-16 opacity-90 ${theme === 'sun' ? 'text-amber-500' : 'text-indigo-200'}`} strokeWidth={1.5} />
            
            {/* Vertical Line */}
            <div className="w-px h-8 md:h-12 bg-current opacity-30"></div>
            
            {/* Moon & Star */}
            <div className="relative">
              <Moon className={`w-10 h-10 md:w-14 md:h-14 opacity-90 ${theme === 'sun' ? 'text-amber-600' : 'text-indigo-300'}`} strokeWidth={1.5} />
              <Star className={`absolute -top-1 -right-2 w-4 h-4 md:w-6 md:h-6 fill-current ${theme === 'sun' ? 'text-amber-400' : 'text-indigo-100'}`} />
            </div>

            {/* Vertical Line */}
            <div className="w-px h-8 md:h-12 bg-current opacity-30"></div>

            {/* Star */}
            <Star className={`w-8 h-8 md:w-12 md:h-12 opacity-90 ${theme === 'sun' ? 'text-amber-700' : 'text-indigo-400'}`} strokeWidth={1.5} />
          </div>

        </div>

      </div>

      {/* CSS for custom float animation if not in tailwind config */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}