'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type Theme = 'sun' | 'moon';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'sun', // Default context value
  toggleTheme: () => {},
  loading: true,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // CHANGED: Default state is now 'sun'
  const [theme, setTheme] = useState<Theme>('sun');
  const [mounted, setMounted] = useState(false);

  // 1. Initialize from LocalStorage immediately
  useEffect(() => {
    const saved = localStorage.getItem('astromystic-theme') as Theme;
    if (saved) {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  // 2. Sync with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().theme) {
            const dbTheme = userDoc.data().theme as Theme;
            setTheme(dbTheme);
            localStorage.setItem('astromystic-theme', dbTheme);
          }
        } catch (e) {
          console.error('Theme sync error:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Handle Toggle
  const toggleTheme = async () => {
    const newTheme = theme === 'sun' ? 'moon' : 'sun';
    setTheme(newTheme);
    localStorage.setItem('astromystic-theme', newTheme);

    if (auth.currentUser) {
      try {
        await setDoc(
          doc(db, 'users', auth.currentUser.uid),
          { theme: newTheme },
          { merge: true }
        );
      } catch (e) {
        console.error('Error saving theme:', e);
      }
    }
  };

  // Prevent hydration mismatch or flash
  if (!mounted) {
    // CHANGED: Loading background is now Amber (Sun) instead of Slate (Moon) to prevent flashing
    return <div className="min-h-screen bg-amber-50" />;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading: !mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
