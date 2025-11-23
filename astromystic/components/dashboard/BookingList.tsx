"use client";

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Compass, X, Send, Sparkles, Zap } from 'lucide-react';

// =========================================================
// 1. REAL IMPORTS (Uncomment these in your local Next.js project)
// =========================================================
import BookingModal from './BookingModal';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';



interface BookingListProps {
  currentStyles: any;
}

export default function BookingList({ currentStyles }: BookingListProps) {
  const { theme } = useTheme(); 
  
  // Modal State
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isRedemption, setIsRedemption] = useState(false);
  
  // Credit State
  const [credits, setCredits] = useState(0);

  // Listen for User Credits
  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Real-time listener for the 'credits' field on the user document
    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setCredits(docSnapshot.data()?.credits || 0);
      }
    });
    
    return () => unsub();
  }, []);

  const handleBook = (title: string, redemption: boolean = false) => {
    setSelectedService(title);
    setIsRedemption(redemption);
  };

  const ITEMS = [
    { 
      title: 'Natal Chart', 
      icon: <Compass className="w-6 h-6" />, 
      price: '$150', 
      desc: 'Discover your blueprint.' 
    },
    { 
      title: 'Solar Return', 
      icon: <Sun className="w-6 h-6" />, 
      price: '$120', 
      desc: 'Your year ahead forecast.' 
    },
    { 
      title: 'Synastry', 
      icon: <Moon className="w-6 h-6" />, 
      price: '$200', 
      desc: 'Relationship dynamics.' 
    },
    { 
      title: 'Cosmic Package', 
      icon: <Sparkles className="w-6 h-6" />, 
      price: '$400', 
      desc: '4 Readings (Valid for 90 days).',
      isPackage: true 
    }
  ];

  return (
    <>
      <BookingModal 
        isOpen={!!selectedService} 
        onClose={() => setSelectedService(null)} 
        serviceTitle={selectedService || ''}
        theme={theme} 
        currentStyles={currentStyles}
        isRedemption={isRedemption}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* REDEMPTION CARD (Only shows if user has credits) */}
        {credits > 0 && (
          <div className={`p-6 rounded-xl border flex flex-col relative overflow-hidden ${theme === 'sun' ? 'bg-amber-100 border-amber-300' : 'bg-indigo-900/50 border-indigo-500'} shadow-lg`}>
            <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-widest uppercase">
              {credits} Credits Left
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-green-500 text-white`}>
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Redeem Reading</h3>
            <p className="text-sm opacity-70 mb-6 flex-grow">Use a credit from your package to get a new reading now.</p>
            <button 
              onClick={() => handleBook('Package Reading', true)}
              className={`w-full py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-500 transition-all`}
            >
              Use 1 Credit
            </button>
          </div>
        )}

        {/* STANDARD SERVICES */}
        {ITEMS.map((item, idx) => (
          <div 
            key={idx} 
            className={`p-6 rounded-xl border flex flex-col relative overflow-hidden ${currentStyles.panelBg} ${currentStyles.border} ${item.isPackage ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : ''}`}
          >
            {/* Special Badge for Package */}
            {item.isPackage && (
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-widest uppercase">
                Best Value
              </div>
            )}

            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${currentStyles.accent}`}>
              {item.icon}
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-sm opacity-70 mb-6 flex-grow">{item.desc}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-current border-opacity-10">
              <span className="font-bold">{item.price}</span>
              <button 
                onClick={() => handleBook(item.title)}
                className={`text-sm font-bold hover:underline ${currentStyles.secondary}`}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}