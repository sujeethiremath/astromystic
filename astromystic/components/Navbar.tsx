"use client";

import React, { useState } from 'react';
import { Sun, Moon, Menu, X, LayoutDashboard, User as UserIcon, LogOut, Star } from 'lucide-react';
import { User } from 'firebase/auth';

// =========================================================
// 1. REAL IMPORTS (Uncomment these in your local Next.js project)
// =========================================================
 import { useRouter, usePathname } from 'next/navigation';

interface NavbarProps {
  user: User | null;
  authLoading: boolean;
  onOpenAuth: () => void;
  onSignOut: () => void;
  currentStyles: any; 
  dashboardPath: string;
  theme: 'sun' | 'moon';
  toggleTheme: () => void;
}

export default function Navbar({ 
  user, 
  authLoading, 
  onOpenAuth, 
  onSignOut, 
  currentStyles, 
  dashboardPath,
  theme, 
  toggleTheme 
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setIsMenuOpen(false);
    
    if (id === 'about') {
      router.push('/about');
      return;
    }
    
    if (id === 'home') {
      if (pathname === '/') {
         window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
         router.push('/');
      }
      return;
    }

    if (pathname === '/') {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 border-b border-opacity-10 border-current transition-all duration-300 ${currentStyles.navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* --- NEW LOGO DESIGN (Matches Uploaded Image) --- */}
          <div 
            className="flex items-center gap-3 cursor-pointer z-50 group"
            onClick={() => handleNavClick('home')}
          >
            {/* 1. Vertical Icon Stack */}
            <div className="flex flex-col items-center gap-0.5 pr-3 border-r border-current border-opacity-40 py-1">
               <Sun className="w-3 h-3 opacity-80" />
               <div className="relative w-3 h-3">
                 <Moon className="w-3 h-3 opacity-80" />
                 <Star className="w-1.5 h-1.5 absolute -top-0.5 -right-1 fill-current opacity-80" />
               </div>
               <Star className="w-3 h-3 opacity-80" />
            </div>

            {/* 2. Text Group */}
            <div className="flex flex-col -space-y-1">
               <div className="flex items-baseline">
                 {/* 'gul' in cursive style */}
                 <span className="text-3xl font-normal mr-1 opacity-90" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                   gul
                 </span>
                 {/* 'NARA' in bold serif */}
                 <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
                   NARA
                 </span>
               </div>
               {/* 'Astrology' spaced out below */}
               <span className="font-sans text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.25em] opacity-70 ml-1">
                 Astrology
               </span>
            </div>
          </div>
          {/* ----------------------- */}

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">
            {['Services', 'About', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => handleNavClick(item.toLowerCase())}
                className="text-sm uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                {item}
              </button>
            ))}
            
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-500 transform hover:scale-110 ${theme === 'sun' ? 'bg-amber-100 text-amber-600' : 'bg-slate-800 text-indigo-300'}`}
              aria-label="Toggle theme"
            >
              {theme === 'sun' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {!authLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4 pl-4 border-l border-current border-opacity-20">
                    <button 
                      onClick={() => router.push(dashboardPath)} 
                      className="text-sm font-semibold hover:opacity-80 flex items-center gap-2"
                    >
                       <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                    <button onClick={onSignOut} className="text-sm hover:underline opacity-60">Sign Out</button>
                  </div>
                ) : (
                  <button 
                    onClick={onOpenAuth}
                    className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all shadow-md hover:shadow-lg ${theme === 'sun' ? 'bg-amber-200 text-amber-900 hover:bg-amber-300' : 'bg-indigo-600 text-indigo-100 hover:bg-indigo-500'}`}
                  >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden flex items-center gap-4 z-50">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && (
        <div className={`md:hidden fixed inset-0 top-16 ${currentStyles.navBg} backdrop-blur-xl border-t border-opacity-10 border-current h-[calc(100vh-4rem)] flex flex-col p-6 space-y-6 animate-in slide-in-from-right-10 fade-in duration-200`}>
          
          <div className="space-y-4">
            {['Services', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item.toLowerCase())}
                className="block w-full text-left text-2xl font-serif font-bold py-2 border-b border-current border-opacity-10"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="pt-4 space-y-4">
             <div className="flex items-center justify-between bg-current bg-opacity-5 p-4 rounded-xl">
                <span className="text-sm font-bold tracking-wider opacity-80">THEME</span>
                <button 
                  onClick={toggleTheme}
                  className={`p-2 rounded-full ${theme === 'sun' ? 'bg-amber-100 text-amber-600' : 'bg-slate-800 text-indigo-300'}`}
                >
                  {theme === 'sun' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
             </div>

             {user ? (
               <div className="bg-current bg-opacity-5 p-4 rounded-xl space-y-4">
                <div className="text-sm opacity-60">Signed in as <br/><span className="font-bold text-current opacity-100">{user.email}</span></div>
                <button onClick={() => router.push(dashboardPath)} className="flex items-center gap-3 w-full py-3 font-bold border-t border-current border-opacity-10">
                   <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
                </button>
                <button onClick={onSignOut} className="flex items-center gap-3 w-full py-3 text-red-400 font-bold">
                    <LogOut className="w-5 h-5" /> Sign Out
                </button>
               </div>
             ) : (
               <button 
                onClick={() => { onOpenAuth(); setIsMenuOpen(false); }} 
                className={`w-full py-4 rounded-xl text-lg font-bold ${theme === 'sun' ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'}`}
               >
                  Sign In / Register
               </button>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}