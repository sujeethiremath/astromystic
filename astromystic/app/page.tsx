"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Sparkles, 
  ArrowRight, 
  Menu, 
  X, 
  Compass, 
  LogOut, 
  LayoutDashboard, 
  User as UserIcon,
  Mail,
  Lock,
  ArrowLeft
} from 'lucide-react';

// --- ROUTER SETUP ---
// In your local project, uncomment this line:
// import { useRouter } from 'next/navigation';
// And delete this mock:
const useRouter = () => ({ push: (path: string) => window.location.href = path });

// --- FIREBASE IMPORTS ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  User,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

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
const db = getFirestore(app); // Initialize Firestore
const googleProvider = new GoogleAuthProvider();

// --- TYPES ---
interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  price?: string;
}

type AuthMode = 'login' | 'signup' | 'forgot';

// --- DATA ---
const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Natal Chart Reading',
    description: 'A deep dive into the placement of the planets at the exact moment of your birth. Understand your core blueprint.',
    icon: <Compass className="w-6 h-6" />,
    price: '$150'
  },
  {
    id: '2',
    title: 'Solar Return (Year Ahead)',
    description: 'Predictive astrology based on when the sun returns to its natal position. A roadmap for your next 12 months.',
    icon: <Sun className="w-6 h-6" />,
    price: '$120'
  },
  {
    id: '3',
    title: 'Synastry (Relationship)',
    description: 'Understanding the dynamics between two charts. Perfect for couples, business partners, or family analysis.',
    icon: <Moon className="w-6 h-6" />,
    price: '$200'
  }
];

// --- COMPONENTS ---

// 1. StarField Component
const StarField = ({ theme }: { theme: 'sun' | 'moon' }) => {
  if (theme === 'sun') return null;
  
  const stars = [
    { top: '10%', left: '15%', size: 2, opacity: 0.8 },
    { top: '20%', left: '85%', size: 3, opacity: 0.6 },
    { top: '35%', left: '45%', size: 2, opacity: 0.9 },
    { top: '55%', left: '10%', size: 3, opacity: 0.5 },
    { top: '70%', left: '80%', size: 2, opacity: 0.7 },
    { top: '85%', left: '25%', size: 3, opacity: 0.8 },
    { top: '15%', left: '60%', size: 2, opacity: 0.4 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star, i) => (
        <div 
          key={i}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${3 + i}s`
          }}
        />
      ))}
    </div>
  );
};

// 2. AuthModal Component
const AuthModal = ({ isOpen, onClose, theme }: { isOpen: boolean; onClose: () => void; theme: 'sun' | 'moon' }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          await signOut(auth);
          setError("Email not verified. Please check your inbox and spam folder.");
          return;
        }
        await syncUserWithBackend(result.user);
        onClose();
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        setMode('login');
        setSuccessMsg(`Verification link sent to ${email}. Please check your inbox (and Spam folder) to verify your account before logging in.`);
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
        <button onClick={onClose} className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
          <X className="w-6 h-6" />
        </button>

        {mode === 'forgot' ? (
          <>
            <h2 className="text-2xl font-serif font-bold text-center mb-2">Reset Password</h2>
            <p className="text-center opacity-70 mb-8 text-sm">Enter your email and we'll send you a link to get back into your account.</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 ring-opacity-50 transition-all ${current.inputBg} ${current.border} focus:ring-current`} required />
              </div>
              {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">{error}</p>}
              {successMsg && <p className="text-green-500 text-sm text-center font-medium bg-green-500/10 p-2 rounded">{successMsg}</p>}
              <button disabled={loading} className={`w-full py-3 rounded-lg font-bold tracking-wide transition-transform active:scale-95 ${current.button} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => switchMode('login')} className={`w-full py-3 flex items-center justify-center gap-2 opacity-70 hover:opacity-100 transition-opacity`}>
                 <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-serif font-bold text-center mb-2">{mode === 'login' ? 'Welcome Back' : 'Join the Cosmos'}</h2>
            <p className="text-center opacity-70 mb-8 text-sm">{mode === 'login' ? 'Sign in to access your readings' : 'Create an account to book your journey'}</p>
            {successMsg && <div className={`mb-6 p-4 rounded-lg text-sm text-center ${theme === 'sun' ? 'bg-green-100 text-green-800' : 'bg-green-900/30 text-green-200'}`}>{successMsg}</div>}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 ring-opacity-50 transition-all ${current.inputBg} ${current.border} focus:ring-current`} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 ring-opacity-50 transition-all ${current.inputBg} ${current.border} focus:ring-current`} required />
              </div>
              {mode === 'login' && <div className="text-right"><button type="button" onClick={() => switchMode('forgot')} className={`text-xs font-semibold ${current.link}`}>Forgot Password?</button></div>}
              {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">{error}</p>}
              <button disabled={loading} className={`w-full py-3 rounded-lg font-bold tracking-wide transition-transform active:scale-95 ${current.button} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>{loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}</button>
            </form>
            <div className="my-6 flex items-center gap-4 opacity-50"><div className="h-px flex-1 bg-current" /><span className="text-xs uppercase tracking-widest">Or</span><div className="h-px flex-1 bg-current" /></div>
            <button onClick={handleGoogleSignIn} className={`w-full py-3 rounded-lg font-bold border border-current border-opacity-20 hover:bg-current hover:bg-opacity-5 transition-all flex items-center justify-center gap-2`}><UserIcon className="w-4 h-4" /> Continue with Google</button>
            <div className="mt-6 text-center text-sm"><span className="opacity-70">{mode === 'login' ? "Don't have an account?" : "Already have an account?"}</span><button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className={`ml-2 font-bold hover:underline ${current.accent}`}>{mode === 'login' ? 'Sign Up' : 'Log In'}</button></div>
          </>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function Home() {
  const router = useRouter(); 
  const [theme, setTheme] = useState<'sun' | 'moon'>('moon');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  // Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 1. LOAD THEME from LocalStorage AND Firebase
  useEffect(() => {
    // Initialize with localStorage first for speed
    const savedTheme = localStorage.getItem('astromystic-theme') as 'sun' | 'moon';
    if (savedTheme) setTheme(savedTheme);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Fetch theme from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().theme) {
            const dbTheme = userDoc.data().theme;
            setTheme(dbTheme);
            localStorage.setItem('astromystic-theme', dbTheme); // Sync local
          }
        } catch (e) {
          console.error("Error fetching theme:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. TOGGLE & SAVE THEME
  const toggleTheme = async () => {
    const newTheme = theme === 'sun' ? 'moon' : 'sun';
    setTheme(newTheme);
    localStorage.setItem('astromystic-theme', newTheme);

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        // We use setDoc with merge: true in case the doc doesn't exist yet (rare but safer)
        await setDoc(userRef, { theme: newTheme }, { merge: true });
      } catch (e) {
        console.error("Error saving theme to DB:", e);
      }
    }
  };

  const navigateTo = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      setIsMenuOpen(false);
      // Keep current theme, or reset to default? Usually better to keep it.
      router.push('/'); 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        theme={theme} 
      />

      <nav className={`fixed top-0 w-full z-50 border-b border-opacity-10 border-current ${current.navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigateTo('home')}
            >
              {theme === 'sun' ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-indigo-400" />}
              <span className="font-serif text-xl tracking-wider font-bold">ASTRO<span className="font-light opacity-80">MYSTIC</span></span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {['About', 'Services', 'Portfolio', 'Contact'].map((item) => (
                <button 
                  key={item}
                  onClick={() => navigateTo(item.toLowerCase())}
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
                      <button onClick={handleSignOut} className="text-sm hover:underline opacity-60">Sign Out</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAuthModalOpen(true)}
                      className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all shadow-md hover:shadow-lg ${theme === 'sun' ? 'bg-amber-200 text-amber-900 hover:bg-amber-300' : 'bg-indigo-600 text-indigo-100 hover:bg-indigo-500'}`}
                    >
                      Sign In
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="md:hidden flex items-center gap-4">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute w-full border-b border-opacity-10 border-current bg-inherit">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['About', 'Services', 'Portfolio', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => navigateTo(item.toLowerCase())}
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
                    <button onClick={handleSignOut} className="flex items-center gap-2 w-full text-left px-3 py-2 text-base font-medium">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                   </>
                 ) : (
                   <button onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-2 text-base font-medium text-amber-500">
                      <UserIcon className="w-4 h-4" /> Sign In
                   </button>
                 )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16 relative">
        <StarField theme={theme} />

        {activeSection === 'home' && (
          <section className="min-h-[90vh] flex items-center relative px-4">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 z-10">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-opacity-20 border-current text-sm uppercase tracking-widest ${theme === 'sun' ? 'bg-amber-100/50' : 'bg-slate-800/50'}`}>
                  <Sparkles className="w-4 h-4" />
                  <span>Professional Astrologer</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-serif leading-tight">
                  Align with the <br/>
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${current.gradient}`}>
                    Cosmic Rhythm
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl opacity-80 max-w-lg leading-relaxed">
                  Bridging the gap between celestial movements and earthly experiences. 
                  Uncover your potential through the ancient wisdom of the stars.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleBookNow}
                    className={`px-8 py-4 rounded-full font-semibold tracking-wide transition-transform hover:scale-105 shadow-lg ${current.button}`}
                  >
                    Book a Reading
                  </button>
                  <button 
                    onClick={() => navigateTo('services')}
                    className={`px-8 py-4 rounded-full font-semibold tracking-wide border border-current border-opacity-30 hover:bg-current hover:bg-opacity-5 transition-all`}
                  >
                    View Services
                  </button>
                </div>
              </div>
              
              <div className="relative h-[400px] md:h-[600px] flex items-center justify-center z-0">
                <div className={`absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full filter blur-3xl opacity-30 bg-gradient-to-tr ${current.gradient} animate-pulse`} />
                <div className={`relative w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full border border-current border-opacity-20 flex items-center justify-center animate-[spin_60s_linear_infinite]`}>
                   <div className={`w-[150px] h-[150px] md:w-[250px] md:h-[250px] rounded-full border border-current border-opacity-40 flex items-center justify-center`}>
                     <div className="text-6xl md:text-8xl opacity-80">
                       {theme === 'sun' ? '☉' : '☾'}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {(activeSection === 'services' || activeSection === 'home') && (
          <section className={`py-24 px-4 ${theme === 'sun' ? 'bg-amber-100/50' : 'bg-slate-900/50'}`}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-4xl font-serif">Celestial Offerings</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {SERVICES.map((service) => (
                  <div key={service.id} className={`p-8 rounded-2xl border ${current.cardBg} ${current.cardBorder}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${theme === 'sun' ? 'bg-amber-100 text-amber-600' : 'bg-slate-800 text-indigo-400'}`}>
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 font-serif">{service.title}</h3>
                    <p className="opacity-70 mb-6">{service.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-current border-opacity-10">
                      <span className="text-lg font-semibold">{service.price}</span>
                      <button 
                        onClick={handleBookNow}
                        className={`flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all ${current.accent}`}
                      >
                        Book Now <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {(activeSection === 'about' || activeSection === 'home') && (
          <section className="py-24 px-4 relative overflow-hidden">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <div className={`aspect-[3/4] rounded-full overflow-hidden border-4 border-opacity-20 border-current relative ${theme === 'sun' ? 'shadow-2xl shadow-amber-500/20' : 'shadow-2xl shadow-indigo-500/20'}`}>
                 <div className={`w-full h-full flex items-center justify-center ${theme === 'sun' ? 'bg-amber-200' : 'bg-slate-800'}`}>
                    <span className="opacity-50 font-serif text-2xl italic">Portrait</span>
                 </div>
              </div>
              
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-serif">The Interpreter of Stars</h2>
                <div className="space-y-4 opacity-80 leading-relaxed text-lg">
                  <p>
                    Hello, I'm a certified evolutionary astrologer with a passion for translating the 
                    cosmic language into practical guidance. 
                  </p>
                  <p>
                    My practice is rooted in the belief that the natal chart is not a script of fate, 
                    but a map of potential. I help clients navigate their "Inner Sky" to understand 
                    their motivations, fears, and highest calling.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { label: 'Sun', sign: 'Scorpio ♏' },
                    { label: 'Moon', sign: 'Pisces ♓' },
                    { label: 'Rising', sign: 'Leo ♌' }
                  ].map((placement) => (
                    <div key={placement.label} className={`p-4 rounded-lg text-center border border-opacity-20 border-current ${theme === 'sun' ? 'bg-white/50' : 'bg-slate-800/50'}`}>
                      <div className="text-xs uppercase tracking-widest opacity-60 mb-1">{placement.label}</div>
                      <div className="font-serif text-lg font-medium">{placement.sign}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {(activeSection === 'contact' || activeSection === 'home') && (
          <section className={`py-24 px-4 ${theme === 'sun' ? 'bg-amber-900 text-amber-50' : 'bg-slate-900 text-slate-100'}`}>
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-serif">Chart Your Course</h2>
              <p className="opacity-80 max-w-xl mx-auto">
                Ready to explore your chart? Have questions about a workshop? 
                Reach out and let's connect.
              </p>
              
              <form className="max-w-md mx-auto space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm uppercase tracking-widest opacity-70 mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 focus:outline-none focus:border-opacity-50 transition-all"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-widest opacity-70 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 focus:outline-none focus:border-opacity-50 transition-all"
                    placeholder="stars@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm uppercase tracking-widest opacity-70 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 focus:outline-none focus:border-opacity-50 transition-all"
                    placeholder="I'm interested in..."
                  />
                </div>
                <button className={`w-full py-4 rounded-lg font-bold tracking-wide bg-white text-slate-900 hover:bg-opacity-90 transition-all mt-4`}>
                  Send Message
                </button>
              </form>
            </div>
          </section>
        )}

        <footer className={`py-12 px-4 border-t border-current border-opacity-10 text-center ${current.footerBg}`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 text-sm">
            <div className="font-serif">© 2024 Astralumina. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:opacity-100">Instagram</a>
              <a href="#" className="hover:opacity-100">Twitter</a>
              <a href="#" className="hover:opacity-100">Newsletter</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}