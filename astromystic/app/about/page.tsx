"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, BookOpen, Heart, Users, Clock, MapPin, 
  FileText, Video, Star, HelpCircle, Menu, X, LayoutDashboard, User as UserIcon, LogOut, Mail, Lock, ArrowLeft, CheckCircle, AlertCircle, Send, Instagram
} from 'lucide-react';
import { User } from 'firebase/auth';

import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import StarField from '../../components/StarField';
import AuthModal from '../../components/AuthModal';
import { trackEvent, identifyUser, resetUser } from '../../lib/mixpanel'; // Import Mixpanel

export default function AboutPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  // Auth & State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dashboardPath, setDashboardPath] = useState('/dashboard');

  // 1. TRACK PAGE VIEW
  useEffect(() => {
    trackEvent("Page Viewed", { page: "About Page", theme: theme });
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        identifyUser(currentUser.uid, currentUser.email || undefined); // Identify User
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setDashboardPath('/admin');
          } else {
            setDashboardPath('/dashboard');
          }
        } catch (e) {
          setDashboardPath('/dashboard');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    trackEvent("User Signed Out", { location: "About Page" }); // Track Logout
    resetUser(); // Reset Mixpanel session
    await signOut(auth);
    router.push('/');
  };

  // Styles
  const styles = {
    sun: {
      bg: 'bg-amber-50', 
      text: 'text-amber-900', 
      cardBg: 'bg-white', 
      cardBorder: 'border-amber-100',
      accent: 'text-amber-600', 
      highlight: 'bg-amber-100/50',
      navBg: 'bg-amber-50/90 backdrop-blur-md', 
      footerBg: 'bg-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    moon: {
      bg: 'bg-slate-950', 
      text: 'text-slate-100', 
      cardBg: 'bg-slate-900', 
      cardBorder: 'border-indigo-900/50',
      accent: 'text-indigo-400', 
      highlight: 'bg-indigo-900/20',
      navBg: 'bg-slate-950/90 backdrop-blur-md', 
      footerBg: 'bg-slate-900',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    }
  };
  const current = styles[theme];

  // Service Data
  const services = [
    {
      title: "Natal Chart Reading",
      price: "$100",
      format: "Video + PDF Analysis",
      desc: "Uncover your potential, tap into your gifts, and choose the best career path.",
      details: [
        "Ask up to 5 specific questions",
        "Requires: Date, Time, & Place of Birth"
      ]
    },
    {
      title: "Synastry Reading",
      price: "$150",
      format: "Video + PDF Analysis",
      desc: "Relationship guidance to help you pick the partner who aligns with your vision.",
      details: [
        "Analysis of two charts overlayed",
        "Ask up to 5 questions",
        "Requires: Birth data for BOTH people"
      ]
    },
    {
      title: "Composite Chart Reading",
      price: "$130",
      format: "Video Response + PDF",
      desc: "Understand the relationship as its own entity using midpoints.",
      details: [
        "Focuses on the dynamics of the relationship itself",
        "Requires: Birth data for BOTH people"
      ]
    },
    {
      title: "Transit Reading",
      price: "$100",
      format: "Video Response + PDF",
      desc: "Navigate life challenges and plan events by understanding current planetary movements.",
      details: [
        "Ask up to 5 questions",
        "Requires: Date, Time, & Place of Birth"
      ]
    },
    {
      title: "Synastry Video Call",
      price: "$180",
      format: "1 Hour Live Video Call + PDF",
      desc: "Deep dive discussion into relationship dynamics with real-time Q&A.",
      details: [
        "Live interaction",
        "Requires: Birth data for BOTH people"
      ],
      highlight: true
    },
    {
      title: "Synastry + Composite",
      price: "$200",
      format: "Video Call + PDF",
      desc: "The complete relationship picture. Combines interaction (Synastry) and essence (Composite).",
      details: [
        "Comprehensive relationship analysis",
        "Requires: Birth data for BOTH people"
      ],
      highlight: true
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${current.bg} ${current.text} font-sans selection:bg-opacity-30 selection:bg-purple-500`}>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        theme={theme} 
      />

      <Navbar 
        user={user} 
        authLoading={authLoading}
        onOpenAuth={() => { trackEvent("Auth Modal Opened", { source: "About Page Navbar" }); setIsAuthModalOpen(true); }}
        onSignOut={handleSignOut}
        currentStyles={current}
        dashboardPath={dashboardPath}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="pt-24 pb-20 relative px-4 sm:px-6">
        <StarField theme={theme} />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-20">
          
          {/* SECTION 1: INTRO - UPDATED BRANDING */}
          <section className="text-center space-y-8">
            {/* Large Logo Design */}
            <div className="flex justify-center items-center gap-6 animate-fade-in">
               {/* Vertical Icon Stack (Scaled Up) */}
               <div className="flex flex-col items-center gap-2 pr-6 border-r-2 border-current border-opacity-40 py-2">
                  <Sun className={`w-8 h-8 ${theme === 'sun' ? 'text-amber-500' : 'text-indigo-300'} opacity-90`} />
                  <div className="relative w-8 h-8">
                    <Moon className={`w-8 h-8 ${theme === 'sun' ? 'text-amber-600' : 'text-indigo-400'} opacity-90`} />
                    <Star className={`absolute -top-1 -right-2 w-4 h-4 fill-current ${theme === 'sun' ? 'text-amber-400' : 'text-indigo-200'} opacity-90`} />
                  </div>
                  <Star className={`w-8 h-8 ${theme === 'sun' ? 'text-amber-700' : 'text-indigo-500'} opacity-90`} />
               </div>

               {/* Text Group (Scaled Up) */}
               <div className="flex flex-col -space-y-2 text-left">
                  <div className="flex items-baseline">
                    <span className="text-5xl md:text-7xl font-normal mr-2 opacity-90" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                      gul
                    </span>
                    <span className="font-serif text-4xl md:text-6xl font-bold tracking-wide">
                      NARA
                    </span>
                  </div>
                  <span className="font-sans text-sm md:text-base uppercase tracking-[0.35em] opacity-70 ml-1">
                    Astrology
                  </span>
               </div>
            </div>

            <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed">
              Astrology is an ancient symbolic system that studies the relationship between celestial movements and human experience.
            </p>
          </section>

          {/* SECTION 2: WHAT IS ASTROLOGY */}
          <section className={`p-8 rounded-2xl border ${current.cardBg} ${current.cardBorder}`}>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className={`w-6 h-6 ${current.accent}`} />
              <h2 className="text-2xl font-serif font-bold">The Basics</h2>
            </div>
            <div className="space-y-4 opacity-90 leading-relaxed">
              <p>
                It is based on the idea that the positions of the planets and stars at any given moment reflect patterns that can describe personality, life themes, timing, and the dynamics between people and events.
              </p>
              <p>
                There are various types of systems in astrology, such as aspects, sidereal system of astrology, western, as well as chart systems. Astrology is a very practical tool you can utilize in your life to navigate through life challenges, make plans, or adjust them by using <strong>transits</strong>.
              </p>
              <p>
                It allows you to learn your psychological makeup, understand yourself on a deeper level, uncover your potential, tap into your gifts, and choose the best career path while becoming aware of what to avoid.
              </p>
            </div>
          </section>

          {/* SECTION 3: RELATIONSHIPS */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className={`p-8 rounded-2xl border ${current.cardBg} ${current.cardBorder}`}>
               <div className="flex items-center gap-3 mb-4">
                 <Heart className={`w-6 h-6 ${current.accent}`} />
                 <h3 className="text-xl font-serif font-bold">Synastry</h3>
               </div>
               <p className="opacity-80 leading-relaxed">
                 Used for relationship guidance to help you pick the partner who aligns with your vision. We put one chart on top of another to see how two people's planets interact with each other (7th house astrology).
               </p>
            </div>
            <div className={`p-8 rounded-2xl border ${current.cardBg} ${current.cardBorder}`}>
               <div className="flex items-center gap-3 mb-4">
                 <Users className={`w-6 h-6 ${current.accent}`} />
                 <h3 className="text-xl font-serif font-bold">Composite Charts</h3>
               </div>
               <p className="opacity-80 leading-relaxed">
                 A chart based on the midpoints of two people's charts. It generates a single chart that represents the relationship itself as if it were a person. It is often best to combine this with Synastry.
               </p>
            </div>
          </section>

          {/* SECTION 4: SERVICES MENU */}
          <section>
            <h2 className="text-3xl font-serif font-bold text-center mb-10">Service Offerings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, idx) => (
                <div 
                  key={idx} 
                  className={`p-6 rounded-xl border flex flex-col ${service.highlight ? `${current.highlight} border-opacity-50` : `${current.cardBg} ${current.cardBorder}`}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold font-serif">{service.title}</h3>
                    <span className={`text-lg font-bold ${current.accent}`}>{service.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs opacity-60 mb-4 uppercase tracking-widest font-bold">
                    {service.format.includes('Video') ? <Video className="w-3 h-3"/> : <FileText className="w-3 h-3"/>}
                    {service.format}
                  </div>

                  <p className="opacity-80 mb-6 flex-grow">{service.desc}</p>

                  <div className="mt-auto pt-4 border-t border-current border-opacity-10">
                    <div className="text-xs font-bold opacity-50 mb-2 uppercase">Requirements</div>
                    <ul className="space-y-1 text-sm opacity-70">
                      {service.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`mt-1.5 w-1 h-1 rounded-full ${theme === 'sun' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <p className="opacity-60 mb-4 text-sm">Ready to discover your path?</p>
              <button 
                onClick={() => { 
                  trackEvent("Button Clicked", { button: "Book a Reading", location: "About Page" });
                  user ? router.push(dashboardPath) : setIsAuthModalOpen(true);
                }}
                className={`px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform ${current.button}`}
              >
                Book a Reading
              </button>
            </div>
          </section>
        
        </div>
      </main>
      
      {/* POWERED BY SECTION */}
      <section className={`py-12 text-center border-t border-current border-opacity-10 ${current.bg} ${current.text}`}>
         <a 
           href="https://sujeethiremath.com" 
           target="_blank" 
           rel="noopener noreferrer"
           className="inline-flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300"
           onClick={() => trackEvent("Powered By Link Clicked", { location: "About Page" })}
         >
           <span className="text-sm uppercase tracking-widest">Powered by</span>
           {/* Inverts logo color in dark mode to ensure visibility */}
           <img 
             src="/hiremath-logo.webp" 
             alt="Hiremath Labs" 
             className={`h-16 w-auto ${theme === 'moon' ? 'invert' : ''}`} 
           /> 
         </a>
      </section>

      <Footer currentStyles={current} />
    </div>
  );
}