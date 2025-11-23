import React, { useState } from 'react';
import { X, Mail, Lock, ArrowLeft } from 'lucide-react';

// Import necessary Firebase functions directly
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';

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
const googleProvider = new GoogleAuthProvider();
// -----------------------------

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'sun' | 'moon';
}

type AuthMode = 'login' | 'signup' | 'forgot';

export default function AuthModal({ isOpen, onClose, theme }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Styles based on theme
  const styles = {
    sun: {
      bg: 'bg-white',
      text: 'text-amber-900',
      inputBg: 'bg-amber-50',
      border: 'border-amber-200',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      accent: 'text-amber-600',
      link: 'text-amber-600 hover:text-amber-700'
    },
    moon: {
      bg: 'bg-slate-900',
      text: 'text-indigo-100',
      inputBg: 'bg-slate-800',
      border: 'border-indigo-900',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      accent: 'text-indigo-400',
      link: 'text-indigo-400 hover:text-indigo-300'
    }
  };

  const current = styles[theme];

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
  };

  // Sync user to database (Only call this after verification!)
  const syncUserWithBackend = async (user: FirebaseUser) => {
    try {
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
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
      // Google accounts are considered verified by default
      await syncUserWithBackend(result.user);
      onClose(); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Password reset email sent! Please check your inbox and spam folder.");
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') setError("No account found with this email.");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      if (mode === 'login') {
        // 1. Attempt Login
        const result = await signInWithEmailAndPassword(auth, email, password);
        
        // 2. Check Verification Status
        if (!result.user.emailVerified) {
          // If not verified, sign them out immediately
          await signOut(auth);
          setError("Email not verified. Please check your inbox and spam folder.");
          return;
        }

        // 3. If Verified, Sync and Close
        await syncUserWithBackend(result.user);
        onClose();

      } else {
        // 1. Create Account
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // 2. Send Verification Email
        await sendEmailVerification(result.user);
        
        // 3. Switch to Login view and show Success Message
        setMode('login');
        setSuccessMsg(`Verification link sent to ${email}. Please check your inbox (and Spam folder) to verify your account before logging in.`);
        
        // Note: We do NOT sync to backend yet. We wait for a verified login.
      }

    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') setError("Invalid email or password.");
      else if (err.code === 'auth/email-already-in-use') setError("Email already in use.");
      else if (err.code === 'auth/weak-password') setError("Password should be at least 6 characters.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-md p-8 rounded-2xl shadow-2xl ${current.bg} ${current.text} border ${current.border}`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity"
        >
          <X className="w-6 h-6" />
        </button>

        {/* --- VIEW: FORGOT PASSWORD --- */}
        {mode === 'forgot' ? (
          <>
            <h2 className="text-2xl font-serif font-bold text-center mb-2">Reset Password</h2>
            <p className="text-center opacity-70 mb-8 text-sm">
              Enter your email and we'll send you a link to get back into your account.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 ring-opacity-50 transition-all ${current.inputBg} ${current.border} focus:ring-current`}
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">{error}</p>}
              {successMsg && <p className="text-green-500 text-sm text-center font-medium bg-green-500/10 p-2 rounded">{successMsg}</p>}

              <button 
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold tracking-wide transition-transform active:scale-95 ${current.button} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button 
                type="button"
                onClick={() => switchMode('login')}
                className={`w-full py-3 flex items-center justify-center gap-2 opacity-70 hover:opacity-100 transition-opacity`}
              >
                 <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
            </form>
          </>
        ) : (
          /* --- VIEW: LOGIN & SIGNUP --- */
          <>
            <h2 className="text-3xl font-serif font-bold text-center mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Join the Cosmos'}
            </h2>
            <p className="text-center opacity-70 mb-8 text-sm">
              {mode === 'login' ? 'Sign in to access your readings' : 'Create an account to book your journey'}
            </p>

            {/* Success Message (e.g. Verification Sent) */}
            {successMsg && (
              <div className={`mb-6 p-4 rounded-lg text-sm text-center ${theme === 'sun' ? 'bg-green-100 text-green-800' : 'bg-green-900/30 text-green-200'}`}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 ring-opacity-50 transition-all ${current.inputBg} ${current.border} focus:ring-current`}
                  required
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 ring-opacity-50 transition-all ${current.inputBg} ${current.border} focus:ring-current`}
                  required
                />
              </div>

              {mode === 'login' && (
                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className={`text-xs font-semibold ${current.link}`}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">{error}</p>}

              <button 
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold tracking-wide transition-transform active:scale-95 ${current.button} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4 opacity-50">
              <div className="h-px flex-1 bg-current" />
              <span className="text-xs uppercase tracking-widest">Or</span>
              <div className="h-px flex-1 bg-current" />
            </div>

            <button 
              onClick={handleGoogleSignIn}
              className={`w-full py-3 rounded-lg font-bold border border-current border-opacity-20 hover:bg-current hover:bg-opacity-5 transition-all flex items-center justify-center gap-3`}
            >
               {/* Google Logo SVG */}
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z" fill="#FBBC05" />
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
               </svg>
               <span>Continue with Google</span>
            </button>

            <div className="mt-6 text-center text-sm">
              <span className="opacity-70">{mode === 'login' ? "Don't have an account?" : "Already have an account?"}</span>
              <button 
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className={`ml-2 font-bold hover:underline ${current.accent}`}
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}