"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// --- FIREBASE INITIALIZATION (Inlined to fix import error) ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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
const db = getFirestore(app);
// -------------------------------------------------------------

type Theme = 'sun' | 'moon';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'moon',
  toggleTheme: () => {},
  loading: true,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('moon');
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
          console.error("Theme sync error:", e);
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
        await setDoc(doc(db, 'users', auth.currentUser.uid), { theme: newTheme }, { merge: true });
      } catch (e) {
        console.error("Error saving theme:", e);
      }
    }
  };

  // PREVENT FLASH: Render nothing (or a loader) until mounted on client
  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />; 
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading: !mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);