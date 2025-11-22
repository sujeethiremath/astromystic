"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Play, LogOut, 
  LayoutDashboard, Compass, Calendar, 
  ShoppingBag, ExternalLink, Video, Star 
} from 'lucide-react';

// --- ROUTER SETUP ---
// In your local project, uncomment this line:
// import { useRouter } from 'next/navigation';
// And delete this mock:
const useRouter = () => ({ push: (path: string) => window.location.href = path });

// --- FIREBASE IMPORTS ---
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// --- CONFIGURATION FOR PREVIEW & LOCAL ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app); // Initialize DB
// -----------------------------------------

// --- MOCK DATA ---
const MOCK_READINGS = [
  {
    id: '1',
    title: 'Solar Return 2024',
    date: 'Oct 24, 2023',
    videoUrl: 'https://youtube.com',
    thumbnail: 'https://placehold.co/600x400/1e1b4b/FFF?text=Solar+Return',
    status: 'ready'
  },
  {
    id: '2',
    title: 'Natal Chart Deep Dive',
    date: 'Jan 12, 2023',
    videoUrl: 'https://youtube.com',
    thumbnail: 'https://placehold.co/600x400/312e81/FFF?text=Natal+Chart',
    status: 'ready'
  }
];

// --- COMPONENTS ---

const StarField = ({ theme }: { theme: 'sun' | 'moon' }) => {
  if (theme === 'sun') return null;
  
  const stars = Array.from({ length: 20 }).map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((s, i) => (
        <div 
          key={i}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: 0.6,
            animationDuration: `${2 + s.delay}s`
          }}
        />
      ))}
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'sun' | 'moon'>('moon');
  const [activeTab, setActiveTab] = useState<'readings' | 'book'>('readings');

  // 1. LOAD THEME & AUTH Logic
  useEffect(() => {
    // Initial load from local storage for speed (prevents flickering)
    const savedTheme = localStorage.getItem('astromystic-theme') as 'sun' | 'moon';
    if (savedTheme) setTheme(savedTheme);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/'); 
      } else {
        setUser(currentUser);
        setLoading(false);
        
        // Fetch theme from Firestore to ensure consistency across devices
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().theme) {
            const dbTheme = userDoc.data().theme;
            setTheme(dbTheme);
            localStorage.setItem('astromystic-theme', dbTheme); // Sync local
          }
        } catch (e) {
          console.error("Error fetching theme:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. TOGGLE & SAVE THEME Logic
  const toggleTheme = async () => {
    const newTheme = theme === 'sun' ? 'moon' : 'sun';
    setTheme(newTheme);
    localStorage.setItem('astromystic-theme', newTheme);

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        // Merge: true ensures we don't overwrite other user data
        await setDoc(userRef, { theme: newTheme }, { merge: true });
      } catch (e) {
        console.error("Error saving theme to DB:", e);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  // Theme Styles
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

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${styles[theme].bg} ${styles[theme].text}`}>Loading your stars...</div>;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${current.bg} ${current.text} font-sans`}>
      <StarField theme={theme} />
      
      {/* Top Navigation */}
      <nav className={`fixed top-0 w-full z-50 border-b backdrop-blur-md ${current.nav}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              {theme === 'sun' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
              <span className="font-serif font-bold tracking-wider">DASHBOARD</span>
            </div>

            <div className="flex items-center gap-4">
               {/* UPDATED THEME TOGGLE BUTTON */}
               <button 
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-all hover:bg-current hover:bg-opacity-10`}
                >
                  {theme === 'sun' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-current border-opacity-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${current.accent}`}>
                     {user?.email?.[0].toUpperCase()}
                  </div>
                  <button onClick={handleSignOut} className="text-sm opacity-70 hover:opacity-100 flex items-center gap-1">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
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

        {/* VIEW: MY READINGS */}
        {activeTab === 'readings' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Empty State Check (Mocking true for demo data existing) */}
            {MOCK_READINGS.length > 0 ? (
              MOCK_READINGS.map((reading) => (
                <div key={reading.id} className={`group rounded-xl overflow-hidden border transition-all hover:shadow-xl ${current.panelBg} ${current.border}`}>
                  {/* Thumbnail Area */}
                  <div className="relative aspect-video bg-black/20 group-hover:opacity-90 transition-opacity cursor-pointer">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform`}>
                        <Play className="w-5 h-5 text-white ml-1" />
                      </div>
                    </div>
                    {/* Fake Thumbnail Image */}
                    <div className={`w-full h-full ${theme === 'sun' ? 'bg-amber-200' : 'bg-indigo-900'} opacity-20`} />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-lg font-bold">{reading.title}</h3>
                      {reading.status === 'ready' && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs opacity-60 mb-4">
                      <Calendar className="w-3 h-3" />
                      <span>{reading.date}</span>
                    </div>
                    <a 
                      href={reading.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`block w-full py-2 text-center rounded-lg text-sm font-bold border border-current border-opacity-20 hover:bg-current hover:bg-opacity-5 transition-all`}
                    >
                      Watch Reading
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center border border-dashed border-current border-opacity-20 rounded-xl">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-serif mb-2">No readings yet</h3>
                <p className="opacity-60 mb-6">Your cosmic collection is waiting to begin.</p>
                <button onClick={() => setActiveTab('book')} className={`px-6 py-2 rounded-full font-bold ${current.button}`}>
                  Browse Offerings
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: BOOK NEW */}
        {activeTab === 'book' && (
          <div className="grid md:grid-cols-3 gap-6">
             {[
              { title: 'Natal Chart', icon: <Compass className="w-6 h-6" />, price: '$150', desc: 'Discover your blueprint.' },
              { title: 'Solar Return', icon: <Sun className="w-6 h-6" />, price: '$120', desc: 'Your year ahead forecast.' },
              { title: 'Synastry', icon: <Moon className="w-6 h-6" />, price: '$200', desc: 'Relationship dynamics.' }
             ].map((item, idx) => (
               <div key={idx} className={`p-6 rounded-xl border flex flex-col ${current.panelBg} ${current.border}`}>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${current.accent}`}>
                   {item.icon}
                 </div>
                 <h3 className="font-serif text-xl font-bold mb-2">{item.title}</h3>
                 <p className="text-sm opacity-70 mb-6 flex-grow">{item.desc}</p>
                 <div className="flex items-center justify-between mt-auto pt-4 border-t border-current border-opacity-10">
                   <span className="font-bold">{item.price}</span>
                   <button className={`text-sm font-bold hover:underline ${current.secondary}`}>
                     Book Now
                   </button>
                 </div>
               </div>
             ))}
          </div>
        )}

      </main>
    </div>
  );
}