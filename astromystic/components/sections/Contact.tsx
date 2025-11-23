"use client";

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactProps {
  theme: 'sun' | 'moon';
}

export default function Contact({ theme }: ContactProps) {
  // 1. State for Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  // 2. State for UI Status
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // 3. Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 4. Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Call the API route we created
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' }); // Clear form
        // Reset success message after 5 seconds
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className={`py-24 px-4 ${theme === 'sun' ? 'bg-amber-900 text-amber-50' : 'bg-slate-900 text-slate-100'}`}>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-serif">Chart Your Course</h2>
        <p className="opacity-80 max-w-xl mx-auto">
          Ready to explore your chart? Have questions about a workshop? 
          Reach out and let's connect.
        </p>
        
        <form className="max-w-md mx-auto space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm uppercase tracking-widest opacity-70 mb-2">Name</label>
            <input 
              type="text" 
              name="name" // Added name attribute
              value={formData.name} // Bind value
              onChange={handleChange} // Bind handler
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 focus:outline-none focus:border-opacity-50 transition-all placeholder-white/30"
              placeholder="Your Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-widest opacity-70 mb-2">Email</label>
            <input 
              type="email" 
              name="email" // Added name attribute
              value={formData.email} // Bind value
              onChange={handleChange} // Bind handler
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 focus:outline-none focus:border-opacity-50 transition-all placeholder-white/30"
              placeholder="stars@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-widest opacity-70 mb-2">Message</label>
            <textarea 
              rows={4}
              name="message" // Added name attribute
              value={formData.message} // Bind value
              onChange={handleChange} // Bind handler
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 focus:outline-none focus:border-opacity-50 transition-all placeholder-white/30"
              placeholder="I'm interested in..."
              required
            />
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="p-3 rounded-lg bg-green-500/20 text-green-200 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Message sent successfully!
            </div>
          )}
          {status === 'error' && (
            <div className="p-3 rounded-lg bg-red-500/20 text-red-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Failed to send message. Please try again.
            </div>
          )}

          <button 
            disabled={status === 'loading' || status === 'success'}
            className={`w-full py-4 rounded-lg font-bold tracking-wide bg-white text-slate-900 hover:bg-opacity-90 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {status === 'loading' ? (
              'Sending...'
            ) : (
              <>Send Message <Send className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}