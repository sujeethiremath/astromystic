"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Heart, Users, 
  FileText, Video 
} from 'lucide-react';
import { User } from 'firebase/auth';

// --- IMPORTS ---
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// --- COMPONENTS ---
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import StarField from '../../components/StarField';
import AuthModal from '../../components/AuthModal';

export default function AboutPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  // Auth & State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dashboardPath, setDashboardPath] = useState('/dashboard');

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
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
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        currentStyles={current}
        dashboardPath={dashboardPath}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="pt-24 pb-20 relative px-4 sm:px-6">
        <StarField theme={theme} />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-20">
          
          {/* SECTION 1: INTRO */}
          <section className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-serif font-bold">Wisdom of the Stars</h1>
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
                    <div className="text-xs font-bold opacity-50 mb-2 uppercase">Details</div>
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
                onClick={() => user ? router.push(dashboardPath) : setIsAuthModalOpen(true)}
                className={`px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform ${current.button}`}
              >
                Book a Reading
              </button>
            </div>
          </section>
        
        </div>
      </main>
      
      <Footer currentStyles={current} />
    </div>
  );
}