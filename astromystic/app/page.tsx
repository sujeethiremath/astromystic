"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Sparkles, ArrowRight, Menu, X, 
  Compass, LogOut, LayoutDashboard, User as UserIcon,
  Mail, Lock, ArrowLeft, Send, CheckCircle, AlertCircle,
  BookOpen, Heart, Users, Video, FileText, Star 
} from 'lucide-react';
import { User } from 'firebase/auth';

// =========================================================
// 1. REAL IMPORTS (UNCOMMENT THESE IN YOUR LOCAL PROJECT)
// =========================================================

import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AuthModal from '../components/AuthModal';
import Navbar from '../components/Navbar';
import StarField from '../components/StarField';
import Footer from '../components/Footer';
import Hero from '../components/sections/Hero';
import Services from '../components/sections/Services';
import About from '../components/sections/About';
import Contact from '../components/sections/Contact';


export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dashboardPath, setDashboardPath] = useState('/dashboard'); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') setDashboardPath('/admin');
          else setDashboardPath('/dashboard');
        } catch (e) { setDashboardPath('/dashboard'); }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleBookNow = () => {
    if (!user) setIsAuthModalOpen(true);
    else router.push(dashboardPath);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setDashboardPath('/dashboard');
    router.push('/'); 
  };

  const styles = {
    sun: {
      bg: 'bg-amber-50', text: 'text-amber-900', accent: 'text-amber-600',
      cardBg: 'bg-white', cardBorder: 'border-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      navBg: 'bg-amber-50/90 backdrop-blur-md', footerBg: 'bg-amber-100',
      gradient: 'from-amber-400 to-orange-500'
    },
    moon: {
      bg: 'bg-slate-950', text: 'text-slate-100', accent: 'text-indigo-400',
      cardBg: 'bg-slate-900', cardBorder: 'border-indigo-900/50',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      navBg: 'bg-slate-950/90 backdrop-blur-md', footerBg: 'bg-slate-900',
      gradient: 'from-indigo-400 to-purple-600'
    }
  };
  const current = styles[theme];

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${current.bg} ${current.text} font-sans selection:bg-opacity-30 selection:bg-purple-500`}>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} theme={theme} />
      <Navbar user={user} authLoading={authLoading} onOpenAuth={() => setIsAuthModalOpen(true)} onSignOut={handleSignOut} currentStyles={current} dashboardPath={dashboardPath} theme={theme} toggleTheme={toggleTheme} />
      <main className="pt-16 relative">
        <StarField theme={theme} />
        <Hero theme={theme} currentStyles={current} onBookNow={handleBookNow} />
        <Services theme={theme} currentStyles={current} onBookNow={handleBookNow} />
        <About theme={theme} />
        <Contact theme={theme} />
        <Footer currentStyles={current} />
      </main>
    </div>
  );
}