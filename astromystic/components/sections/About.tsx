"use client";

import React from 'react';
// We use a standard img tag here for better compatibility in the preview

interface AboutProps {
  theme: 'sun' | 'moon';
}

export default function About({ theme }: AboutProps) {
  return (
    <section id="about" className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        
        {/* Image / Portrait Column */}
        <div className={`aspect-[3/4] rounded-full overflow-hidden border-4 border-opacity-20 border-current relative ${theme === 'sun' ? 'shadow-2xl shadow-amber-500/20' : 'shadow-2xl shadow-indigo-500/20'}`}>
           <div className="relative w-full h-full">
             {/* Standard img tag works reliably in all preview environments */}
             <img 
               src="/IMG_7200.jpg" 
               alt="Portrait of the Astrologer"
               className="w-full h-full object-cover"
             />
           </div>
        </div>
        
        {/* Text Content Column */}
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

          {/* Placements Grid */}
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
  );
}