"use client";

import React, { useState } from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';


import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import { trackEvent } from '../../lib/mixpanel';

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
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => {
              // TRACK EVENT: Navigation
              trackEvent('Dashboard Navigation', {
                action: 'Click Home Logo',
                location: 'Dashboard Navbar',
                user_email: user?.email
              });
              router.push('/');
            }}
          >
            {theme === 'sun' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            <span className="font-serif font-bold tracking-wider">DASHBOARD</span>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={() => {
                  // TRACK EVENT: Theme Change
                  trackEvent('Theme Toggled', {
                    location: 'Dashboard Navbar',
                    previous_theme: theme,
                    new_theme: theme === 'sun' ? 'moon' : 'sun',
                    user_email: user?.email
                  });
                  toggleTheme();
                }}
                className={`p-2 rounded-full transition-all hover:bg-current hover:bg-opacity-10`}
              >
                {theme === 'sun' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              
              {user && (
                <div className="flex items-center gap-3 pl-4 border-l border-current border-opacity-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStyles.accent}`}>
                     {user.email?.[0].toUpperCase()}
                  </div>
                  <button 
                    onClick={() => {
                      // TRACK EVENT: Sign Out
                      trackEvent('User Signed Out', {
                        location: 'Dashboard Navbar',
                        method: 'Button Click',
                        user_email: user?.email
                      });
                      onSignOut();
                    }} 
                    className="text-sm opacity-70 hover:opacity-100 flex items-center gap-1"
                  >
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