"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- IMPORTS ---
import { useTheme } from '../context/ThemeContext';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

// --- COMPONENTS ---
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
  
  // Global State from Context
  const { theme, toggleTheme } = useTheme();
  
  // Local Page State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleBookNow = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      router.push('/dashboard');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Ensure we stay on home or refresh state
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // Theme Styles Configuration
  // We define this here to pass consistent styling down to all child components
  const styles = {
    sun: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      accent: 'text-amber-600',
      cardBg: 'bg-white',
      cardBorder: 'border-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      navBg: 'bg-amber-50/90 backdrop-blur-md',
      footerBg: 'bg-amber-100',
      gradient: 'from-amber-400 to-orange-500'
    },
    moon: {
      bg: 'bg-slate-950',
      text: 'text-slate-100',
      accent: 'text-indigo-400',
      cardBg: 'bg-slate-900',
      cardBorder: 'border-indigo-900/50',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      navBg: 'bg-slate-950/90 backdrop-blur-md',
      footerBg: 'bg-slate-900',
      gradient: 'from-indigo-400 to-purple-600'
    }
  };

  const current = styles[theme];

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${current.bg} ${current.text} font-sans selection:bg-opacity-30 selection:bg-purple-500`}>
      
      {/* Modals & Overlays */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        theme={theme} 
      />

      {/* Header */}
      <Navbar 
        user={user} 
        authLoading={authLoading}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        currentStyles={current}
      />

      <main className="pt-16 relative">
        <StarField theme={theme} />

        <Hero 
          theme={theme} 
          currentStyles={current} 
          onBookNow={handleBookNow} 
        />

        <Services 
          theme={theme} 
          currentStyles={current} 
          onBookNow={handleBookNow} 
        />
        
        <About theme={theme} />

        <Contact theme={theme} />

        <Footer currentStyles={current} />
      </main>
    </div>
  );
}