'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

import { trackEvent } from '../../lib/mixpanel';

interface ContactProps {
  theme: 'sun' | 'moon';
}

export default function Contact({ theme }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // TRACK EVENT: Form Submission Started
    trackEvent('Contact Form Initiated', {
      sender_name: formData.name, // Optional: Don't track PII if privacy is a concern
      message_length: formData.message.length,
    });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');

        // TRACK EVENT: Success
        trackEvent('Contact Form Submitted', {
          success: true,
        });

        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');

        // TRACK EVENT: API Error
        trackEvent('Contact Form Failed', {
          reason: 'API Error',
          status_code: res.status,
        });
      }
    } catch (error: any) {
      console.error(error);
      setStatus('error');

      // TRACK EVENT: Network Error
      trackEvent('Contact Form Failed', {
        reason: 'Network Error',
        error_message: error.message,
      });
    }
  };

  const styles = {
    sun: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      cardBg: 'bg-white',
      inputBg: 'bg-amber-50',
      border: 'border-amber-200',
      focusRing: 'focus:ring-amber-400',
      button: 'bg-amber-600 text-white hover:bg-amber-700',
      icon: 'text-amber-400',
    },
    moon: {
      bg: 'bg-slate-950',
      text: 'text-slate-100',
      cardBg: 'bg-slate-900',
      inputBg: 'bg-slate-950',
      border: 'border-indigo-900/50',
      focusRing: 'focus:ring-indigo-400',
      button: 'bg-indigo-600 text-white hover:bg-indigo-500',
      icon: 'text-indigo-400',
    },
  };

  const current = styles[theme];

  return (
    <section
      id="contact"
      className={`py-12 md:py-24 px-4 relative overflow-hidden ${current.bg} ${current.text}`}
    >
      {/* Decorative Background Glows (Subtle) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-20 -right-20 w-96 h-96 rounded-full filter blur-3xl opacity-10 ${theme === 'sun' ? 'bg-amber-300' : 'bg-indigo-600'}`}
        />
        <div
          className={`absolute -bottom-20 -left-20 w-72 h-72 rounded-full filter blur-3xl opacity-10 ${theme === 'sun' ? 'bg-yellow-300' : 'bg-purple-600'}`}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-current border-opacity-20 text-xs uppercase tracking-widest opacity-80`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Get in Touch</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold">
            Chart Your Course
          </h2>
          <p className="opacity-70 max-w-xl mx-auto text-lg font-light">
            Ready to explore your chart? Have questions about a workshop? Reach
            out and let's connect.
          </p>
        </div>

        {/* Form Card */}
        <div
          className={`max-w-xl mx-auto p-8 rounded-3xl border shadow-xl ${current.cardBg} ${current.border}`}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest opacity-60 font-bold ml-1">
                Name
              </label>
              <div className="relative group">
                <User
                  className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${current.icon} opacity-50 group-focus-within:opacity-100`}
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all duration-300 ${current.inputBg} ${current.border} ${current.focusRing} focus:ring-2 focus:border-transparent placeholder-current placeholder-opacity-30`}
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest opacity-60 font-bold ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail
                  className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${current.icon} opacity-50 group-focus-within:opacity-100`}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all duration-300 ${current.inputBg} ${current.border} ${current.focusRing} focus:ring-2 focus:border-transparent placeholder-current placeholder-opacity-30`}
                  placeholder="stars@example.com"
                  required
                />
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest opacity-60 font-bold ml-1">
                Message
              </label>
              <div className="relative group">
                <MessageSquare
                  className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${current.icon} opacity-50 group-focus-within:opacity-100`}
                />
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all duration-300 ${current.inputBg} ${current.border} ${current.focusRing} focus:ring-2 focus:border-transparent placeholder-current placeholder-opacity-30`}
                  placeholder="I'm interested in..."
                  required
                />
              </div>
            </div>

            {/* Status Messages */}
            {status === 'success' && (
              <div className="p-4 rounded-xl bg-green-500/10 text-green-600 text-sm flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 border border-green-500/20">
                <CheckCircle className="w-5 h-5" /> Message sent successfully!
              </div>
            )}
            {status === 'error' && (
              <div className="p-4 rounded-xl bg-red-500/10 text-red-600 text-sm flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 border border-red-500/20">
                <AlertCircle className="w-5 h-5" /> Failed to send message.
                Please try again.
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={status === 'loading' || status === 'success'}
              className={`w-full py-4 rounded-xl font-bold tracking-wide shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 ${current.button}`}
            >
              {status === 'loading' ? (
                <span className="animate-pulse">
                  Sending across the cosmos...
                </span>
              ) : (
                <>
                  Send Message <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
