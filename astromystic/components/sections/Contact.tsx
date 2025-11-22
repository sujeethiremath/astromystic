"use client";

import React from 'react';

interface ContactProps {
  theme: 'sun' | 'moon';
}

export default function Contact({ theme }: ContactProps) {
  return (
    <section id="contact" className={`py-24 px-4 ${theme === 'sun' ? 'bg-amber-900 text-amber-50' : 'bg-slate-900 text-slate-100'}`}>
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
  );
}