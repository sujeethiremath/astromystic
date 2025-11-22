"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Play, LogOut, 
  LayoutDashboard, Compass, Calendar, 
  ShoppingBag, ExternalLink, Video, Star, User as UserIcon 
} from 'lucide-react';
import { User } from 'firebase/auth';

// =========================================================
// 1. REAL IMPORTS (UNCOMMENT THESE LOCALLY)
// =========================================================

import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import StarField from '../../components/StarField';
import DashboardNavbar from '../../components/dashboard/DashboardNavbar';
import ReadingsList from '../../components/dashboard/ReadingList';
import BookingList from '../../components/dashboard/BookingList';


// =========================================================
// 2. PREVIEW MOCKS & INLINE COMPONENTS (DELETE LOCALLY)
// =========================================================

// --- MOCK ROUTER ---
//const useRouter = () => ({ push: (path: string) => window.location.href = path });
/*
// --- INLINE FIREBASE ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// --- MOCK THEME HOOK ---
/*
const useTheme = () => {
  const [theme, setTheme] = useState<'sun'|'moon'>('moon');
  
  useEffect(() => {
    const saved = localStorage.getItem('astromystic-theme') as 'sun'|'moon';
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'sun' ? 'moon' : 'sun';
    setTheme(newTheme);
    localStorage.setItem('astromystic-theme', newTheme);
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { theme: newTheme }, { merge: true });
      } catch (e) { console.error(e); }
    }
  };
  return { theme, toggleTheme };
};
*/
// --- INLINE COMPONENTS (Copies of what I gave you previously) ---
/*
const StarField = ({ theme }: { theme: 'sun' | 'moon' }) => {
  if (theme === 'sun') return null;
  const stars = Array.from({ length: 20 }).map((_, i) => ({
    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, size: Math.random() * 3 + 1, delay: Math.random() * 3
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((s, i) => (
        <div key={i} className="absolute bg-white rounded-full animate-pulse" style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: 0.6, animationDuration: `${2+s.delay}s` }} />
      ))}
    </div>
  );
};
*/
/*
const DashboardNavbar = ({ user, onSignOut, currentStyles }: any) => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  return (
    <nav className={`fixed top-0 w-full z-50 border-b backdrop-blur-md ${currentStyles.nav}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            {theme === 'sun' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            <span className="font-serif font-bold tracking-wider">DASHBOARD</span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={toggleTheme} className={`p-2 rounded-full transition-all hover:bg-current hover:bg-opacity-10`}>
                {theme === 'sun' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              {user && (
                <div className="flex items-center gap-3 pl-4 border-l border-current border-opacity-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStyles.accent}`}>
                     {user.email?.[0].toUpperCase()}
                  </div>
                  <button onClick={onSignOut} className="text-sm opacity-70 hover:opacity-100 flex items-center gap-1"><LogOut className="w-4 h-4" /></button>
                </div>
              )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const ReadingsList = ({ currentStyles, theme, onBrowse }: any) => {
  const MOCK_READINGS = [
    { id: '1', title: 'Solar Return 2024', date: 'Oct 24, 2023', videoUrl: 'https://youtube.com', status: 'ready' },
    { id: '2', title: 'Natal Chart Deep Dive', date: 'Jan 12, 2023', videoUrl: 'https://youtube.com', status: 'ready' }
  ];
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_READINGS.map((reading) => (
        <div key={reading.id} className={`group rounded-xl overflow-hidden border transition-all hover:shadow-xl ${currentStyles.panelBg} ${currentStyles.border}`}>
          <div className="relative aspect-video bg-black/20 group-hover:opacity-90 transition-opacity cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center"><div className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform`}><Play className="w-5 h-5 text-white ml-1" /></div></div>
            <div className={`w-full h-full ${theme === 'sun' ? 'bg-amber-200' : 'bg-indigo-900'} opacity-20`} />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2"><h3 className="font-serif text-lg font-bold">{reading.title}</h3>{reading.status === 'ready' && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}</div>
            <div className="flex items-center gap-2 text-xs opacity-60 mb-4"><Calendar className="w-3 h-3" /><span>{reading.date}</span></div>
            <a href={reading.videoUrl} target="_blank" rel="noopener noreferrer" className={`block w-full py-2 text-center rounded-lg text-sm font-bold border border-current border-opacity-20 hover:bg-current hover:bg-opacity-5 transition-all`}>Watch Reading</a>
          </div>
        </div>
      ))}
    </div>
  );
}

const BookingList = ({ currentStyles }: any) => {
  const ITEMS = [
    { title: 'Natal Chart', icon: <Compass className="w-6 h-6" />, price: '$150', desc: 'Discover your blueprint.' },
    { title: 'Solar Return', icon: <Sun className="w-6 h-6" />, price: '$120', desc: 'Your year ahead forecast.' },
    { title: 'Synastry', icon: <Moon className="w-6 h-6" />, price: '$200', desc: 'Relationship dynamics.' }
  ];
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {ITEMS.map((item, idx) => (
        <div key={idx} className={`p-6 rounded-xl border flex flex-col ${currentStyles.panelBg} ${currentStyles.border}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${currentStyles.accent}`}>{item.icon}</div>
          <h3 className="font-serif text-xl font-bold mb-2">{item.title}</h3>
          <p className="text-sm opacity-70 mb-6 flex-grow">{item.desc}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-current border-opacity-10"><span className="font-bold">{item.price}</span><button className={`text-sm font-bold hover:underline ${currentStyles.secondary}`}>Book Now</button></div>
        </div>
      ))}
    </div>
  );
}
  */
// =========================================================


export default function Dashboard() {
  const router = useRouter();
  
  // Global Theme State
  const { theme } = useTheme();
  
  // Local State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'readings' | 'book'>('readings');

  // Auth Protection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/'); // Redirect to home if not logged in
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
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
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      nav: 'bg-amber-50/90 border-amber-200',
      secondary: 'text-amber-600'
    },
    moon: {
      bg: 'bg-slate-950',
      panelBg: 'bg-slate-900',
      text: 'text-indigo-100',
      border: 'border-indigo-900',
      accent: 'bg-slate-800 text-indigo-300',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      nav: 'bg-slate-950/90 border-indigo-900',
      secondary: 'text-indigo-400'
    }
  };

  const current = styles[theme];

  // Loading State
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${current.bg} ${current.text}`}>
        Loading your stars...
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${current.bg} ${current.text} font-sans`}>
      <StarField theme={theme} />
      
      <DashboardNavbar 
        user={user} 
        onSignOut={handleSignOut} 
        currentStyles={current} 
      />

      <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto relative z-10">
        
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-serif mb-2">
            Welcome back, {user?.displayName || 'Star Traveler'}
          </h1>
          <p className="opacity-70 max-w-2xl">
            Here you can access your personal reading library or chart your next course.
          </p>
        </div>

        {/* Tabs / Actions */}
        <div className="flex gap-4 mb-8 border-b border-current border-opacity-10 pb-1">
          <button 
            onClick={() => setActiveTab('readings')}
            className={`pb-3 px-2 text-sm font-bold tracking-wide transition-all border-b-2 ${activeTab === 'readings' ? `border-current opacity-100` : 'border-transparent opacity-50 hover:opacity-80'}`}
          >
            MY LIBRARY
          </button>
          <button 
            onClick={() => setActiveTab('book')}
            className={`pb-3 px-2 text-sm font-bold tracking-wide transition-all border-b-2 ${activeTab === 'book' ? `border-current opacity-100` : 'border-transparent opacity-50 hover:opacity-80'}`}
          >
            BOOK NEW
          </button>
        </div>

        {/* DYNAMIC CONTENT AREA */}
        {activeTab === 'readings' ? (
          <ReadingsList 
            currentStyles={current} 
            theme={theme} 
            onBrowse={() => setActiveTab('book')} 
          />
        ) : (
          <BookingList currentStyles={current} />
        )}

      </main>
    </div>
  );
}