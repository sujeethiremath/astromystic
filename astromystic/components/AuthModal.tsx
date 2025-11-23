"use client";

import React, { useState } from 'react';
import { X, Mail, Lock, ArrowLeft, User as UserIcon } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

// =========================================================
// 1. REAL IMPORTS (Uncomment these in your local Next.js project)
// =========================================================
/*
import { auth, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
*/

// =========================================================
// 2. PREVIEW MOCKS (Delete these in your local Next.js project)
// =========================================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';

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
const googleProvider = new GoogleAuthProvider();
// =========================================================

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'sun' | 'moon';
}

type AuthMode = 'login' | 'signup' | 'forgot';

export default function AuthModal({ isOpen, onClose, theme }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Name State (For Signup)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const styles = {
    sun: {
      bg: 'bg-white', text: 'text-amber-900', inputBg: 'bg-amber-50',
      border: 'border-amber-200', button: 'bg-amber-600 hover:bg-amber-700 text-white',
      accent: 'text-amber-600', link: 'text-amber-600 hover:text-amber-700'
    },
    moon: {
      bg: 'bg-slate-900', text: 'text-indigo-100', inputBg: 'bg-slate-800',
      border: 'border-indigo-900', button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      accent: 'text-indigo-400', link: 'text-indigo-400 hover:text-indigo-300'
    }
  };
  const current = styles[theme];

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode); setError(''); setSuccessMsg('');
  };

  // Sync user to database (Names + Email)
  const syncUserWithBackend = async (user: FirebaseUser) => {
    try {
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          firstName: firstName || user.displayName?.split(' ')[0] || '',
          lastName: lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
          photoURL: user.photoURL,
        }),
      });
    } catch (err) {
      console.error('Error syncing user:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserWithBackend(result.user);
      onClose(); 
    } catch (err: any) { setError(err.message); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email.");
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Password reset email sent!");
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccessMsg('');
    
    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          await signOut(auth);
          setError("Email not verified. Please check your inbox.");
          return;
        }
        await syncUserWithBackend(result.user);
        onClose();
      } else {
        // Signup Logic
        if (!firstName || !lastName) {
          throw new Error("Please enter your first and last name.");
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        
        // Sync immediately so names are saved
        await syncUserWithBackend(result.user);
        
        setMode('login');
        setSuccessMsg(`Verification sent to ${email}. Please verify before logging in.`);
      }
    } catch (err: any) { 
      if (err.code === 'auth/email-already-in-use') setError("Email already registered.");
      else setError(err.message); 
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* UPDATED: Added max-h-[90vh] and overflow-y-auto for mobile scrolling */}
      <div className={`relative w-full max-w-md p-8 rounded-2xl shadow-2xl ${current.bg} ${current.text} border ${current.border} max-h-[90vh] overflow-y-auto`}>
        <button onClick={onClose} className="absolute top-4 right-4 opacity-50 hover:opacity-100"><X className="w-6 h-6" /></button>
        
        <h2 className="text-2xl font-serif font-bold text-center mb-2">
          {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join the Cosmos' : 'Reset Password'}
        </h2>
        <p className="text-center opacity-70 mb-6 text-sm">
          {mode === 'login' ? 'Sign in to access your readings' : mode === 'signup' ? 'Create an account to book your journey' : 'Recover your account access'}
        </p>

        {successMsg && <div className="mb-4 p-3 rounded bg-green-500/20 text-green-600 text-sm text-center">{successMsg}</div>}
        {error && <div className="mb-4 p-3 rounded bg-red-500/20 text-red-600 text-sm text-center">{error}</div>}

        <form onSubmit={mode === 'forgot' ? handleResetPassword : handleEmailAuth} className="space-y-4">
          
          {/* Name Fields (Only for Signup) */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
                <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 ring-opacity-50 ${current.inputBg} ${current.border}`} required />
              </div>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
                <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 ring-opacity-50 ${current.inputBg} ${current.border}`} required />
              </div>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 ring-opacity-50 ${current.inputBg} ${current.border}`} required />
          </div>
          
          {mode !== 'forgot' && (
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 ring-opacity-50 ${current.inputBg} ${current.border}`} required />
            </div>
          )}
          
          {mode === 'login' && <div className="text-right"><button type="button" onClick={() => switchMode('forgot')} className={`text-xs font-bold ${current.link}`}>Forgot Password?</button></div>}
          
          <button disabled={loading} className={`w-full py-3 rounded-lg font-bold tracking-wide ${current.button} ${loading ? 'opacity-50' : ''}`}>
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="my-6 flex items-center gap-4 opacity-50"><div className="h-px flex-1 bg-current" /><span className="text-xs">OR</span><div className="h-px flex-1 bg-current" /></div>
            <button onClick={handleGoogleSignIn} className="w-full py-3 rounded-lg font-bold border border-current border-opacity-20 hover:bg-current hover:bg-opacity-5 flex items-center justify-center gap-3">
               {/* Google Logo */}
               <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
               <span>Continue with Google</span>
            </button>
            <div className="mt-6 text-center text-sm">
              <span className="opacity-70">{mode === 'login' ? "No account?" : "Has account?"}</span>
              <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className={`ml-2 font-bold ${current.accent}`}>{mode === 'login' ? 'Sign Up' : 'Log In'}</button>
            </div>
          </>
        )}
        {mode === 'forgot' && <div className="mt-6 text-center"><button onClick={() => switchMode('login')} className={`flex items-center justify-center gap-2 mx-auto ${current.link}`}><ArrowLeft className="w-4 h-4" /> Back to Login</button></div>}
      </div>
    </div>
  );
}