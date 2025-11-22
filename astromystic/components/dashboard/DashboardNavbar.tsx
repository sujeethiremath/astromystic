"use client";

import React, { useState } from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';

// =========================================================
// 1. REAL IMPORTS (Uncomment these in your local Next.js project)
// =========================================================
import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';

// =========================================================
// 2. PREVIEW MOCKS (Delete these in your local Next.js project)
// =========================================================
/*
const useRouter = () => ({ push: (path: string) => window.location.href = path });
const useTheme = () => {
  const [t, setT] = useState<'sun'|'moon'>('moon');
  return { theme: t, toggleTheme: () => setT(p => p === 'sun' ? 'moon' : 'sun') };
};
*/
// =========================================================

interface DashboardNavbarProps {
  user: User | null;
  onSignOut: () => void;
  currentStyles: any;
}

export default function DashboardNavbar({ user, onSignOut, currentStyles }: DashboardNavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={`fixed top-0 w-full z-50 border-b backdrop-blur-md ${currentStyles.nav}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Home Link */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            {theme === 'sun' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            <span className="font-serif font-bold tracking-wider">DASHBOARD</span>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all hover:bg-current hover:bg-opacity-10`}
              >
                {theme === 'sun' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              
              {user && (
                <div className="flex items-center gap-3 pl-4 border-l border-current border-opacity-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStyles.accent}`}>
                     {user.email?.[0].toUpperCase()}
                  </div>
                  <button onClick={onSignOut} className="text-sm opacity-70 hover:opacity-100 flex items-center gap-1">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </nav>
  );
}