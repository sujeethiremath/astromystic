'use client';

import React, { useRef } from 'react';
import {
  Sun,
  Moon,
  Compass,
  ArrowRight,
  Heart,
  Video,
  Users,
  Sparkles,
  Calendar,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ServicesProps {
  currentStyles: any;
  theme: 'sun' | 'moon';
  onBookNow: () => void;
}

export default function Services({
  currentStyles,
  theme,
  onBookNow,
}: ServicesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const SERVICES = [
    {
      id: '1',
      title: 'Natal Chart Reading',
      description:
        'Video + PDF Analysis. Uncover your potential and life path.',
      icon: <Compass className="w-6 h-6" />,
      price: '$100',
    },
    {
      id: '2',
      title: 'Synastry Reading',
      description: 'Video + PDF. Relationship compatibility guidance.',
      icon: <Heart className="w-6 h-6" />,
      price: '$150',
    },
    {
      id: '3',
      title: 'Synastry Video Call',
      description:
        '1 Hour Live Call + PDF. Deep dive into relationship dynamics.',
      icon: <Video className="w-6 h-6" />,
      price: '$180',
    },
    {
      id: '4',
      title: 'Composite Chart',
      description: 'Video Response + PDF. The relationship as its own entity.',
      icon: <Users className="w-6 h-6" />,
      price: '$130',
    },
    {
      id: '5',
      title: 'Synastry + Composite',
      description: 'Video Call + PDF. Complete relationship analysis.',
      icon: <Sparkles className="w-6 h-6" />,
      price: '$200',
    },
    {
      id: '6',
      title: 'Transit Reading',
      description: 'Video Response + PDF. Navigate timing and life events.',
      icon: <Calendar className="w-6 h-6" />,
      price: '$100',
    },
    {
      id: '7',
      title: 'Cosmic Package',
      description: '4 Readings (Valid for 90 days). Best Value.',
      icon: <Zap className="w-6 h-6" />,
      price: '$400',
      isPackage: true,
    },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Scroll by the width of a card plus gap to ensure smooth pagination
      const cardWidth = current.children[0]?.clientWidth || 300;
      const gap = 24; // Matches gap-6
      const scrollAmount = cardWidth + gap;

      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="services"
      className={`py-12 md:py-24 px-4 relative ${theme === 'sun' ? 'bg-amber-100/50' : 'bg-slate-900/50'} overflow-hidden`}
    >
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-12 md:mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Celestial Offerings
          </h2>
          <p className="opacity-70 text-sm md:text-base leading-relaxed">
            Explore the various ways we can illuminate your path. Swipe to see
            all services.
          </p>
        </div>

        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className={`hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-current shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${theme === 'sun' ? 'bg-white/80 text-amber-900' : 'bg-slate-900/80 text-indigo-100'}`}
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Horizontal Slider Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {SERVICES.map((service) => (
              <div
                key={service.id}
                className={`
                  flex-shrink-0
                  w-[85vw] sm:w-[45vw] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]
                  p-8 rounded-2xl border flex flex-col relative 
                  snap-center transition-all duration-300 
                  ${currentStyles.cardBg} ${currentStyles.cardBorder} 
                  ${service.isPackage ? 'border-amber-500/50 shadow-lg shadow-amber-500/10 scale-[1.02]' : 'hover:shadow-xl hover:-translate-y-1'}
                `}
              >
                {service.isPackage && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-widest uppercase">
                    Best Value
                  </div>
                )}

                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${theme === 'sun' ? 'bg-amber-100 text-amber-600' : 'bg-slate-800 text-indigo-400'}`}
                >
                  {service.icon}
                </div>

                <h3 className="text-2xl font-bold mb-3 font-serif">
                  {service.title}
                </h3>
                <p className="opacity-70 mb-8 text-sm leading-relaxed flex-grow">
                  {service.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-current border-opacity-10 mt-auto">
                  <span className="text-xl font-bold">{service.price}</span>
                  <button
                    onClick={onBookNow}
                    className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all ${currentStyles.accent} hover:bg-current hover:bg-opacity-5`}
                  >
                    Book Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Spacer for end of list padding */}
            <div className="min-w-[1px] w-[1px]" />
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className={`hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-current shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${theme === 'sun' ? 'bg-white/80 text-amber-900' : 'bg-slate-900/80 text-indigo-100'}`}
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Hide Scrollbar CSS */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
