"use client";

import React, { useState } from 'react';
import { Sun, Moon, Menu, X, LayoutDashboard, User as UserIcon, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';

// =========================================================================
// 1. REAL IMPORTS (Uncomment these in your local Next.js project)
// =========================================================================
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';

// =========================================================================
// 2. PREVIEW MOCKS (Delete these in your local Next.js project)
// =========================================================================
// Mock Router
/*
const useRouter = () => ({ push: (path: string) => window.location.href = path });
// Mock Theme Hook
const useTheme = () => {
  const [t, setT] = useState<'sun'|'moon'>('moon');
  return { theme: t, toggleTheme: () => setT(p => p === 'sun' ? 'moon' : 'sun') };
};
*/
// =========================================================================

interface NavbarProps {
  user: User | null;
  authLoading: boolean;
  onOpenAuth: () => void;
  onSignOut: () => void;
  currentStyles: any; 
}

export default function Navbar({ user, authLoading, onOpenAuth, onSignOut, currentStyles }: NavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 border-b border-opacity-10 border-current ${currentStyles.navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* LOGO */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavClick('home')}
          >
            {theme === 'sun' ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-indigo-400" />}
            <span className="font-serif text-xl tracking-wider font-bold">ASTRO<span className="font-light opacity-80">MYSTIC</span></span>
          </div>

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
                      onClick={() => router.push('/dashboard')} 
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
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full border-b border-opacity-10 border-current bg-inherit">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {['Services', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item.toLowerCase())}
                className="block w-full text-left px-3 py-2 text-base font-medium hover:bg-opacity-10 hover:bg-current rounded-md"
              >
                {item}
              </button>
            ))}
            <div className="pt-4 border-t border-current border-opacity-10 mt-2">
               {user ? (
                 <>
                  <div className="px-3 py-2 text-sm opacity-60">Signed in as {user.email}</div>
                  <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 w-full text-left px-3 py-2 text-base font-medium">
                     <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </button>
                  <button onClick={onSignOut} className="flex items-center gap-2 w-full text-left px-3 py-2 text-base font-medium">
                      <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                 </>
               ) : (
                 <button onClick={() => { onOpenAuth(); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-2 text-base font-medium text-amber-500">
                    <UserIcon className="w-4 h-4" /> Sign In
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}