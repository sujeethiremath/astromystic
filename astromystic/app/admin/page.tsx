'use client';

import React, { useState, useEffect } from 'react';
// ADDED: Send to the imports
import {
  Shield,
  Users,
  Video,
  Plus,
  Save,
  Check,
  Search,
  Loader2,
  LogOut,
  Sun,
  Moon,
  CheckCircle,
  X,
  MessageSquare,
  Clock,
  Inbox,
  History,
  User as UserIcon,
  Trash2,
  Mail,
  Send,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  doc,
  getDoc,
  onSnapshot,
  where,
  updateDoc,
} from 'firebase/firestore';
import StarField from '../../components/StarField';

// Types
interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  age?: string;
  gender?: string;
}

interface RequestData {
  id: string;
  service: string;
  situation: string;
  question: string;
  createdAt: string;
  status: 'pending' | 'completed';
  age?: string;
  gender?: string;
  remainingReadings?: number;
  totalReadings?: number;
}

interface VideoItem {
  title: string;
  url: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data State
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Requests State
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(
    null
  );

  // Assignment Form State (Single Video)
  const [readingTitle, setReadingTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [readingDate, setReadingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [saving, setSaving] = useState(false);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // NEW: Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // 1. INITIAL AUTH CHECK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/');
      setCurrentUser(user);

      const allowedEmails = [
        'sujeetshiremath@gmail.com',
        'hiremath09@gmail.com',
      ];
      if (user.email && allowedEmails.includes(user.email)) {
        await fetchUsers(user);
      } else {
        await fetchUsers(user);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. FETCH USERS VIA API
  const fetchUsers = async (user: User) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        alert('Access Denied: Admin privileges required.');
        router.push('/');
        return;
      }

      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        setLoading(false);
      }
    } catch (error) {
      console.error('API Error:', error);
      setLoading(false);
    }
  };

  // 3. FETCH REQUESTS (Real-time Listener)
  useEffect(() => {
    if (!selectedUser) {
      setRequests([]);
      setSelectedRequest(null);
      return;
    }

    const statusFilter = activeTab === 'open' ? 'pending' : 'completed';

    const q = query(
      collection(db, 'users', selectedUser.uid, 'requests'),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reqs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as RequestData
        );
        setRequests(reqs);

        if (selectedRequest && !reqs.find((r) => r.id === selectedRequest.id)) {
          setSelectedRequest(null);
        }
      },
      (err) => {
        if (err.code !== 'permission-denied')
          console.warn('Snapshot error:', err.message);
      }
    );

    return () => unsubscribe();
  }, [selectedUser, activeTab]);

  // 4. INIT ASSIGNMENT
  const initAssignment = (req: RequestData) => {
    setSelectedRequest(req);
    setReadingTitle(`${req.service} Reading`);
    setVideoUrl('');
  };

  // 5. SUBMIT ASSIGNMENT (Single Video)
  const handleCompleteAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !currentUser || !readingTitle || !videoUrl) return;

    setSaving(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUid: selectedUser.uid,
          readingTitle,
          readingDate,
          videoUrl,
          requestId: selectedRequest?.id,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error('Failed to assign');

      setModalMessage(
        result.remaining > 0
          ? `Saved! ${result.remaining} readings remaining.`
          : `Reading assigned! Request complete.`
      );
      setShowSuccessModal(true);

      setReadingTitle('');
      setVideoUrl('');
      setSelectedRequest(null);
    } catch (error) {
      alert('Failed to assign.');
    } finally {
      setSaving(false);
    }
  };

  // NEW: SEND EMAIL HANDLER
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !currentUser || !emailSubject || !emailMessage) return;

    setSendingEmail(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetEmail: selectedUser.email,
          targetName: selectedUser.firstName,
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      if (!res.ok) throw new Error('Failed to send email');

      setModalMessage(`Email sent successfully to ${selectedUser.email}`);
      setShowSuccessModal(true);
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      alert('Failed to send email.');
    } finally {
      setSendingEmail(false);
    }
  };

  // --- STYLES ---
  const styles = {
    sun: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      panelBg: 'bg-white',
      border: 'border-amber-200',
      accent: 'bg-amber-100 text-amber-700',
      inputBg: 'bg-amber-50',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      secondaryButton: 'text-amber-600 hover:bg-amber-100',
      listHover: 'hover:bg-amber-100',
      listActive: 'bg-amber-200 border-amber-400',
      badge: 'bg-amber-200 text-amber-800',
    },
    moon: {
      bg: 'bg-slate-950',
      text: 'text-slate-100',
      panelBg: 'bg-slate-900',
      border: 'border-slate-800',
      accent: 'bg-slate-800 text-indigo-300',
      inputBg: 'bg-slate-950',
      button: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      secondaryButton: 'text-slate-400 hover:text-white hover:bg-slate-800',
      listHover: 'hover:bg-slate-800',
      listActive: 'bg-indigo-900/50 border-indigo-500/50',
      badge: 'bg-indigo-900 text-indigo-200',
    },
  };
  const current = styles[theme];

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center gap-3 ${current.bg} ${current.text}`}
      >
        <Loader2 className="w-6 h-6 animate-spin" /> Connecting...
      </div>
    );

  return (
    <div
      className={`min-h-screen font-sans p-6 md:p-12 transition-colors duration-500 ${current.bg} ${current.text}`}
    >
      <StarField theme={theme} />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-sm p-8 rounded-2xl shadow-2xl border text-center ${current.panelBg} ${current.border}`}
          >
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">Success</h3>
            <p className="opacity-70 text-sm mb-6">{modalMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className={`w-full py-3 rounded-xl font-bold tracking-wide ${current.button}`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* NEW: Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-lg p-8 rounded-2xl shadow-2xl border ${current.panelBg} ${current.border}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                <Mail className="w-5 h-5" /> Send Email
              </h3>
              <button onClick={() => setShowEmailModal(false)}>
                <X className="w-5 h-5 opacity-50 hover:opacity-100" />
              </button>
            </div>
            <p className="text-xs opacity-60 mb-4">To: {selectedUser?.email}</p>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <input
                placeholder="Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${current.inputBg} ${current.border}`}
                required
              />
              <textarea
                placeholder="Write your message..."
                rows={6}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${current.inputBg} ${current.border}`}
                required
              />
              <button
                disabled={sendingEmail}
                className={`flex items-center justify-center gap-2 w-full font-bold py-3 rounded-xl disabled:opacity-50 ${current.button}`}
              >
                {sendingEmail ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <header
        className={`flex justify-between items-center mb-8 border-b pb-6 relative z-10 ${current.border}`}
      >
        <div className="flex items-center gap-3">
          <Shield
            className={`w-8 h-8 ${theme === 'sun' ? 'text-amber-600' : 'text-amber-500'}`}
          />
          <div>
            <h1 className="text-2xl font-serif font-bold">Mission Control</h1>
            <p className="text-xs opacity-60 uppercase tracking-widest">
              Admin Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full hover:bg-current hover:bg-opacity-10`}
          >
            {theme === 'sun' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => {
              signOut(auth);
              router.push('/');
            }}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors ${current.secondaryButton}`}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 relative z-10 h-[calc(100vh-10rem)]">
        {/* LEFT COLUMN: USER LIST */}
        <div
          className={`lg:col-span-4 border rounded-xl overflow-hidden flex flex-col ${current.panelBg} ${current.border}`}
        >
          <div
            className={`p-4 border-b flex justify-between items-center ${current.border} bg-opacity-50`}
          >
            <h2 className="font-bold flex items-center gap-2 text-sm">
              <Users
                className={`w-4 h-4 ${theme === 'sun' ? 'text-amber-600' : 'text-indigo-400'}`}
              />{' '}
              Travelers ({users.length})
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
            {users.map((user) => (
              <button
                key={user.uid}
                onClick={() => {
                  setSelectedUser(user);
                  setSelectedRequest(null);
                }}
                className={`w-full text-left p-3 rounded-lg transition-all border border-transparent group ${selectedUser?.uid === user.uid ? current.listActive : current.listHover}`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-sm truncate">
                    {user.firstName
                      ? `${user.firstName} ${user.lastName}`
                      : user.displayName || user.email}
                  </div>
                  {(user.age || user.gender) && (
                    <span className="text-[10px] opacity-50 border border-current rounded px-1 ml-2 whitespace-nowrap">
                      {user.age || '?'} / {user.gender?.[0] || '?'}
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-50 truncate mt-0.5">
                  {user.email}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: WORKSPACE */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pb-10">
          {selectedUser ? (
            <>
              {/* USER HEADER */}
              <div
                className={`flex justify-between items-end pb-4 border-b ${current.border}`}
              >
                <div>
                  <h2 className="text-2xl font-serif font-bold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <p className="text-sm opacity-60">{selectedUser.email}</p>
                </div>
                <div className="flex items-end gap-4">
                  {/* SEND EMAIL BUTTON */}
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className={`text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 border border-current opacity-70 hover:opacity-100 transition-all`}
                  >
                    <Mail className="w-4 h-4" /> Send Email
                  </button>
                  <div className="text-right text-xs opacity-50">
                    <div>
                      {selectedUser.age ? `Age: ${selectedUser.age}` : ''}{' '}
                      {selectedUser.gender ? `• ${selectedUser.gender}` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* TABS */}
              <div className="flex gap-4 border-b border-current border-opacity-10">
                <button
                  onClick={() => setActiveTab('open')}
                  className={`pb-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'open' ? 'border-current opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}
                >
                  <Inbox className="w-4 h-4" /> Open Requests
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'history' ? 'border-current opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}
                >
                  <History className="w-4 h-4" /> History
                </button>
              </div>

              {/* REQUEST LIST */}
              <div
                className={`border rounded-xl p-6 ${current.panelBg} ${current.border}`}
              >
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider opacity-70 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />{' '}
                  {activeTab === 'open'
                    ? 'Pending Actions'
                    : 'Completed History'}{' '}
                  ({requests.length})
                </h3>

                {requests.length === 0 ? (
                  <p className="text-sm opacity-50 italic">
                    No {activeTab} requests found.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        className={`p-4 rounded-lg border text-sm ${theme === 'sun' ? 'bg-amber-50 border-amber-200' : 'bg-slate-950 border-slate-800'}`}
                      >
                        <div className="flex justify-between mb-2 items-center">
                          <span
                            className={`font-bold px-2 py-1 rounded text-xs ${current.badge}`}
                          >
                            {req.service}
                          </span>
                          <span className="text-xs opacity-50 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{' '}
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mt-3">
                          <div>
                            <span className="text-[10px] uppercase opacity-50 block font-bold">
                              Situation
                            </span>
                            <p className="opacity-90 leading-relaxed whitespace-pre-wrap">
                              {req.situation}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase opacity-50 block font-bold">
                              Question
                            </span>
                            <p className="opacity-90 leading-relaxed whitespace-pre-wrap">
                              {req.question}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-current border-opacity-10 flex justify-between items-center">
                          <div className="text-xs opacity-50">
                            Context: {req.age || 'N/A'} • {req.gender || 'N/A'}
                          </div>
                          {(req.totalReadings || 0) > 1 && (
                            <div
                              className={`text-xs font-bold px-2 py-0.5 rounded ${req.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-400'}`}
                            >
                              {req.status === 'completed'
                                ? 'Completed'
                                : `${req.remainingReadings} readings left`}
                            </div>
                          )}
                        </div>

                        {/* ACTION BUTTON */}
                        {activeTab === 'open' &&
                          selectedRequest?.id !== req.id && (
                            <button
                              onClick={() => initAssignment(req)}
                              className={`mt-3 w-full md:w-auto text-xs font-bold px-4 py-2 rounded-lg ${current.button}`}
                            >
                              Fulfill Request
                            </button>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ASSIGNMENT FORM */}
              {selectedRequest && (
                <div
                  className={`border rounded-xl p-8 ${current.panelBg} ${current.border} animate-in slide-in-from-bottom-4 shadow-2xl`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold">
                      {selectedRequest
                        ? `Fulfilling: ${selectedRequest.service}`
                        : 'Assign New Reading'}
                    </h2>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="text-xs opacity-50 hover:opacity-100"
                    >
                      Cancel
                    </button>
                  </div>

                  <form
                    onSubmit={handleCompleteAssignment}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
                        Reading Title
                      </label>
                      <input
                        type="text"
                        value={readingTitle}
                        onChange={(e) => setReadingTitle(e.target.value)}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${current.inputBg} ${current.border}`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
                        YouTube Link
                      </label>
                      <div className="relative">
                        <Video className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://youtu.be/..."
                          className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:outline-none ${current.inputBg} ${current.border}`}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={readingDate}
                        onChange={(e) => setReadingDate(e.target.value)}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${current.inputBg} ${current.border}`}
                      />
                    </div>

                    <div className="pt-4 border-t border-current border-opacity-10">
                      <button
                        disabled={saving}
                        className={`flex items-center justify-center gap-2 w-full font-bold py-4 rounded-xl transition-all disabled:opacity-50 ${current.button}`}
                      >
                        {saving ? (
                          'Uploading...'
                        ) : (
                          <>
                            <Save className="w-4 h-4" /> Complete Assignment
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div
              className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center opacity-50 ${current.border}`}
            >
              <Search className="w-16 h-16 mb-4 opacity-30" />
              <h3 className="font-bold text-lg">Ready for Mission</h3>
              <p className="text-sm max-w-xs mt-2">
                Select a traveler from the list to view requests and assign
                readings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
