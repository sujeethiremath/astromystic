'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';

import { auth } from '../../lib/firebase';
import { trackEvent } from '../../lib/mixpanel';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
  theme: 'sun' | 'moon';
  currentStyles: any;
  isRedemption?: boolean; // Prop to signal if this is using a credit
}

export default function BookingModal({
  isOpen,
  onClose,
  serviceTitle,
  theme,
  currentStyles,
  isRedemption,
}: BookingModalProps) {
  const [situation, setSituation] = useState('');
  const [question, setQuestion] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setShowSuccess(false);
    setSituation('');
    setQuestion('');
    setAge('');
    setGender('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      // 1. Get the ID Token for security
      const token = await auth.currentUser.getIdToken();

      // 2. Send Request to API
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service: serviceTitle,
          situation,
          question,
          age,
          gender,
          isRedemption, // Pass the flag to the server
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      // 3. TRACK EVENT: Successful Submission
      trackEvent('Booking Request Submitted', {
        service: serviceTitle,
        is_redemption: isRedemption,
        has_context: !!situation, // Did they write a situation?
        has_age: !!age, // Did they provide age?
        has_gender: !!gender, // Did they provide gender?
        user_email: auth.currentUser.email,
      });

      setShowSuccess(true);
    } catch (error: any) {
      console.error('Error booking:', error);
      alert(error.message || 'Failed to send request.');

      // TRACK EVENT: Failure
      trackEvent('Booking Request Failed', {
        service: serviceTitle,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg p-8 rounded-2xl shadow-2xl ${currentStyles.panelBg} ${currentStyles.border} border text-left overflow-y-auto max-h-[90vh]`}
      >
        {showSuccess ? (
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">
              Request Received
            </h2>
            <p className="opacity-70 text-sm mb-6">
              I have received your request.
              <br />I will review your details and assign your reading to your
              dashboard soon.
            </p>
            <button
              onClick={handleClose}
              className={`w-full py-3 rounded-xl font-bold tracking-wide ${currentStyles.button}`}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 opacity-50 hover:opacity-100"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-serif font-bold mb-2">
              {isRedemption ? 'Redeem Credit' : `Request: ${serviceTitle}`}
            </h2>
            <p className="opacity-70 text-sm mb-6">
              Please share your current context so I can prepare for this
              reading.
              {isRedemption && (
                <span className="block mt-1 text-green-500 font-bold text-xs uppercase tracking-wide">
                  Using 1 Credit
                </span>
              )}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
                    Age (Optional)
                  </label>
                  <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    className={`w-full rounded-lg px-4 py-3 outline-none border bg-opacity-50 ${currentStyles.inputBg} ${currentStyles.border}`}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
                    Gender (Optional)
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={`w-full rounded-lg px-4 py-3 outline-none border bg-opacity-50 ${currentStyles.inputBg} ${currentStyles.border}`}
                  >
                    <option value="">Select...</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

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
                  'Sending...'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Submit Request <Send className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
