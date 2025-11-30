'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Moon,
  Play,
  LogOut,
  LayoutDashboard,
  Compass,
  Calendar,
  ShoppingBag,
  ExternalLink,
  Video,
  Star,
  User as UserIcon,
  X,
  Send,
  CheckCircle,
  Zap,
  FileText,
  MapPin,
  Sparkles,
  Heart,
  Users,
  Loader2,
  Instagram,
  AlertCircle,
  Globe,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import StarField from '../../components/StarField';
import DashboardNavbar from '../../components/dashboard/DashboardNavbar';
import ReadingsList from '../../components/dashboard/ReadingList';
import BookingList from '../../components/dashboard/BookingList';
import Footer from '../../components/Footer';
import MyChart from '../../components/dashboard/MyChart';
import { trackEvent } from '../../lib/mixpanel';

export default function Dashboard() {
  const router = useRouter();
  const { theme } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Added 'my-chart' to allowed tabs
  const [activeTab, setActiveTab] = useState<'readings' | 'book' | 'my-chart'>(
    'readings'
  );

  // Auth Protection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/'); // Redirect to home if not logged in
      } else {
        // Check Admin role to redirect if needed
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            router.push('/admin');
            return;
          }
        } catch (e) {
          console.error('Role check error', e);
        }
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    // Clear user state immediately to prevent permission errors on unmount
    setUser(null);
    await signOut(auth);
    router.push('/');
  };

  // Theme Styles Configuration
  const styles = {
    sun: {
      bg: 'bg-amber-50',
      panelBg: 'bg-white',
      text: 'text-amber-900',
      border: 'border-amber-200',
      accent: 'bg-amber-100 text-amber-700',
      inputBg: 'bg-amber-50',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      nav: 'bg-amber-50/90 border-amber-200',
      secondary: 'text-amber-600',
    },
    moon: {
      bg: 'bg-slate-950',
      panelBg: 'bg-slate-900',
      text: 'text-indigo-100',
      border: 'border-indigo-900',
      accent: 'bg-slate-800 text-indigo-300',
      inputBg: 'bg-slate-950',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      nav: 'bg-slate-950/90 border-indigo-900',
      secondary: 'text-indigo-400',
    },
  };

  const current = styles[theme];

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${current.bg} ${current.text}`}
      >
        Loading your stars...
      </div>
    );
  }

  const handleTabChange = (tabName: 'readings' | 'book' | 'my-chart') => {
    trackEvent('Dashboard Tab Changed', {
      tab: tabName,
      userId: user?.uid,
    });
    setActiveTab(tabName);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${current.bg} ${current.text} font-sans`}
    >
      <StarField theme={theme} />

      <DashboardNavbar
        user={user}
        onSignOut={handleSignOut}
        currentStyles={current}
      />

      <main className="pt-24 px-4 pb-20 max-w-7xl mx-auto relative z-10 min-h-[80vh]">
        {/* Welcome Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-serif mb-2">
            Welcome back, {user?.displayName || 'Star Traveler'}
          </h1>
          <p className="opacity-70 max-w-2xl text-sm md:text-base">
            Here you can access your personal reading library, chart your next
            course, or view your natal blueprint.
          </p>
        </div>

        {/* Tabs / Actions */}
        <div className="flex gap-6 mb-8 border-b border-current border-opacity-10 pb-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange('readings')}
            className={`pb-3 px-2 text-sm font-bold tracking-wide transition-all border-b-2 whitespace-nowrap ${activeTab === 'readings' ? `border-current opacity-100` : 'border-transparent opacity-50 hover:opacity-80'}`}
          >
            MY LIBRARY
          </button>
          <button
            onClick={() => handleTabChange('book')}
            className={`pb-3 px-2 text-sm font-bold tracking-wide transition-all border-b-2 whitespace-nowrap ${activeTab === 'book' ? `border-current opacity-100` : 'border-transparent opacity-50 hover:opacity-80'}`}
          >
            BOOK NEW
          </button>
          <button
            onClick={() => handleTabChange('my-chart')}
            className={`pb-3 px-2 text-sm font-bold tracking-wide transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'my-chart' ? `border-current opacity-100` : 'border-transparent opacity-50 hover:opacity-80'}`}
          >
            <FileText className="w-4 h-4" /> MY CHART
          </button>
        </div>

        {/* DYNAMIC CONTENT AREA */}
        {/* Only render if user exists to prevent hydration mismatch or flash */}
        {user && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'readings' && (
              <ReadingsList
                currentStyles={current}
                theme={theme}
                onBrowse={() => setActiveTab('book')}
              />
            )}

            {activeTab === 'book' && <BookingList currentStyles={current} />}

            {activeTab === 'my-chart' && (
              <MyChart currentStyles={current} theme={theme} />
            )}
          </div>
        )}
      </main>

      <Footer currentStyles={current} />
    </div>
  );
}
