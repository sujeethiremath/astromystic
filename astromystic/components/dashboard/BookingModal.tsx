'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle, CreditCard } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { trackEvent } from '../../lib/mixpanel';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
  theme: 'sun' | 'moon';
  currentStyles: any;
  // Removed isRedemption prop
}

export default function BookingModal({
  isOpen,
  onClose,
  serviceTitle,
  theme,
  currentStyles,
}: BookingModalProps) {
  const [situation, setSituation] = useState('');
  const [question, setQuestion] = useState('');
  const [p1, setP1] = useState({ name: '', date: '', time: '', city: '' });
  const [p2, setP2] = useState({ name: '', date: '', time: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const requiresPartner =
    serviceTitle.toLowerCase().includes('synastry') ||
    serviceTitle.toLowerCase().includes('composite');

  if (!isOpen) return null;

  const handleClose = () => {
    setShowSuccess(false);
    setSituation('');
    setQuestion('');
    setP1({ name: '', date: '', time: '', city: '' }); // Reset P1
    setP2({ name: '', date: '', time: '', city: '' }); // Reset P2
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      const token = await auth.currentUser.getIdToken();

      // --- STRIPE PAYMENT FLOW ---
      // Always redirect to payment
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceTitle,
          situation,
          question,
          p1Details: p1, // Send P1 object
          p2Details: requiresPartner ? p2 : null, // Only send P2 if needed
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      trackEvent('Checkout Started', { service: serviceTitle });

      // Redirect user to Stripe to pay
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Booking Error:', error);
      alert(error.message || 'Failed to process request.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg p-8 rounded-2xl shadow-2xl ${currentStyles.panelBg} ${currentStyles.border} border text-left overflow-y-auto max-h-[90vh]`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 opacity-50 hover:opacity-100"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-serif font-bold mb-2">
          Book {serviceTitle}
        </h2>
        <p className="opacity-70 text-sm mb-6">
          Please share your current context so I can prepare for this reading.
          <span className="block mt-1 text-amber-500 font-bold text-xs uppercase tracking-wide">
            Payment Required
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 p-4 rounded-xl border border-current border-opacity-20">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-70">
              Your Birth Details
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <input
                placeholder="First & Last Name"
                // Removed 'bg-opacity-50' so the background is solid and clear
                className={`w-full rounded-lg px-3 py-2 text-sm outline-none border ${currentStyles.inputBg} ${currentStyles.border}`}
                value={p1.name}
                onChange={(e) => setP1({ ...p1, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                // Removed 'bg-opacity-50' so the background is solid and clear
                className={`w-full rounded-lg px-3 py-2 text-sm outline-none border ${currentStyles.inputBg} ${currentStyles.border}`}
                value={p1.date}
                onChange={(e) => setP1({ ...p1, date: e.target.value })}
                required
              />
              <input
                type="time"
                // Removed 'bg-opacity-50' so the background is solid and clear
                className={`w-full rounded-lg px-3 py-2 text-sm outline-none border ${currentStyles.inputBg} ${currentStyles.border}`}
                value={p1.time}
                onChange={(e) => setP1({ ...p1, time: e.target.value })}
                required
              />
            </div>

            <input
              placeholder="City of Birth (e.g. London, UK)"
              // Removed 'bg-opacity-50' so the background is solid and clear
              className={`w-full rounded-lg px-3 py-2 text-sm outline-none border ${currentStyles.inputBg} ${currentStyles.border}`}
              value={p1.city}
              onChange={(e) => setP1({ ...p1, city: e.target.value })}
              required
            />
          </div>

          {/* PERSON 2 DETAILS (Conditional) */}
          {requiresPartner && (
            // Removed 'bg-current' and 'bg-opacity-5' to remove the dark tint
            <div className="space-y-3 p-4 rounded-xl border border-current border-opacity-20">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-70">
                Partner's Birth Details
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <input
                  placeholder="First & Last Name"
                  // Removed 'bg-opacity-50' so the background is solid and clear
                  className={`w-full rounded-lg px-3 py-2 text-sm outline-none border ${currentStyles.inputBg} ${currentStyles.border}`}
                  value={p2.name}
                  onChange={(e) => setP2({ ...p2, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  // Removed 'bg-opacity-50' so the background is solid and clear
                  className={`w-full rounded-lg px-3 py-2 text-sm outline-none border ${currentStyles.inputBg} ${currentStyles.border}`}
                  value={p2.date}
                  onChange={(e) => setP2({ ...p2, date: e.target.value })}
                  required
                />
                <input
                  type="time"
                  // Removed 'bg-opacity-50' so the background is solid and clear
                  className={`w-full rounded-lg px-3 py-2 text-sm outline-none border ${currentStyles.inputBg} ${currentStyles.border}`}
                  value={p2.time}
                  onChange={(e) => setP2({ ...p2, time: e.target.value })}
                  required
                />
              </div>

              <input
                placeholder="City of Birth (e.g. New York, USA)"
                // Removed 'bg-opacity-50' so the background is solid and clear
                className={`w-full rounded-lg px-3 py-2 text-sm outline-none border ${currentStyles.inputBg} ${currentStyles.border}`}
                value={p2.city}
                onChange={(e) => setP2({ ...p2, city: e.target.value })}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
              Current Situation
            </label>
            <textarea
              rows={3}
              className={`w-full rounded-lg px-4 py-3 outline-none border bg-opacity-50 focus:border-opacity-100 transition-all ${currentStyles.inputBg} ${currentStyles.border}`}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="What is happening in your life right now?"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
              Specific Question
            </label>
            <textarea
              rows={2}
              className={`w-full rounded-lg px-4 py-3 outline-none border bg-opacity-50 focus:border-opacity-100 transition-all ${currentStyles.inputBg} ${currentStyles.border}`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What do you most need clarity on?"
              required
            />
          </div>

          <button
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold tracking-wide ${currentStyles.button} ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? (
              'Processing...'
            ) : (
              <span className="flex items-center justify-center gap-2">
                Proceed to Payment <CreditCard className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
