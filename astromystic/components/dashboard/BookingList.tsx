'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Compass,
  X,
  Send,
  Sparkles,
  Zap,
  Heart,
  Users,
  Calendar,
  Video,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

import BookingModal from './BookingModal';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { trackEvent } from '../../lib/mixpanel';

interface BookingListProps {
  currentStyles: any;
}

// Define Service Item Structure
interface ServiceItem {
  title: string;
  icon: React.ReactNode;
  price: string;
  desc: string;
}

export default function BookingList({ currentStyles }: BookingListProps) {
  const { theme } = useTheme();

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);

  // 1. TRACKING: View
  useEffect(() => {
    if (!auth.currentUser) return;

    // Track that they viewed this list
    trackEvent('Booking Dashboard Viewed', {
      location: 'User Dashboard',
      userId: auth.currentUser.uid,
    });

    const unsub = onSnapshot(
      doc(db, 'users', auth.currentUser.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setCredits(docSnapshot.data()?.credits || 0);
        }
      }
    );
    return () => unsub();
  }, []);

  // 2. TRACKING: Click
  const handleBook = (title: string, price: string = '0') => {
    // Detailed Event Logging
    trackEvent('Booking Initiated', {
      service_name: title,
      action_type: 'New Purchase',
      price: price,
      user_current_credits: credits,
    });

    setSelectedService(title);
  };

  const ITEMS: ServiceItem[] = [
    {
      title: 'Natal Chart Reading',
      icon: <Compass className="w-6 h-6" />,
      price: '$100',
      desc: 'Video + PDF Analysis. Uncover your potential and life path.',
    },
    {
      title: 'Synastry Reading',
      icon: <Heart className="w-6 h-6" />,
      price: '$150',
      desc: 'Video + PDF. Relationship compatibility guidance.',
    },
    {
      title: 'Synastry Video Call',
      icon: <Video className="w-6 h-6" />,
      price: '$180',
      desc: '1 Hour Live Call + PDF. Deep dive into relationship dynamics.',
    },
    {
      title: 'Composite Chart',
      icon: <Users className="w-6 h-6" />,
      price: '$130',
      desc: 'Video Response + PDF. The relationship as its own entity.',
    },
    {
      title: 'Synastry + Composite',
      icon: <Sparkles className="w-6 h-6" />,
      price: '$200',
      desc: 'Video Call + PDF. Complete relationship analysis.',
    },
    {
      title: 'Transit Reading',
      icon: <Calendar className="w-6 h-6" />,
      price: '$100',
      desc: 'Video Response + PDF. Navigate timing and life events.',
    },
  ];

  return (
    <>
      <BookingModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        serviceTitle={selectedService || ''}
        theme={theme}
        currentStyles={currentStyles}
      />

      {/* ADDED CONTAINER DIV HERE to match the closing div and provide Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ITEMS.map((item, idx) => (
          <div
            key={idx}
            // FIXED: Removed extra quotes/braces at the end of className
            className={`p-6 rounded-xl border flex flex-col relative overflow-hidden ${currentStyles.panelBg} ${currentStyles.border}`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${currentStyles.accent}`}
            >
              {item.icon}
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-sm opacity-70 mb-6 flex-grow">{item.desc}</p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-current border-opacity-10">
              <span className="font-bold">{item.price}</span>
              <button
                // FIXED: Removed the 'false' argument. Now passes (title, price) correctly.
                onClick={() => handleBook(item.title, item.price)}
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
