"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Users, Video, Plus, Save, Check, Search, Loader2, LogOut, Sun, Moon, CheckCircle, X, MessageSquare, Clock, Inbox, History, User as UserIcon, ChevronRight } from 'lucide-react';
import { User } from 'firebase/auth';

// =========================================================
// 1. REAL IMPORTS (Uncomment in Local)
// =========================================================
import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext'; 
import { auth, db } from '@/lib/firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, query, orderBy, doc, getDoc, onSnapshot, where } from 'firebase/firestore';
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
  
  // Request View State
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  
  // Assignment Form State
  const [readingTitle, setReadingTitle] = useState('');
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
  const [videoList, setVideoList] = useState<VideoItem[]>([{ title: 'Part 1', url: '' }]);
  const [saving, setSaving] = useState(false);
  
  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // 1. AUTH & USER LIST
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/');
      setCurrentUser(user);
      
      const allowedEmails = ['sujeetshiremath@gmail.com', 'hiremath09@gmail.com'];
      if (user.email && allowedEmails.includes(user.email)) {
         await fetchUsers(user);
      } else {
         await fetchUsers(user);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUsers = async (user: User) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.status === 403) return router.push('/');
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (error) { console.error(error); }
  };

  // 2. FETCH REQUESTS (REALTIME)
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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RequestData));
      setRequests(reqs);
      // If the currently selected request vanishes (completed), clear selection
      if (selectedRequest && !reqs.find(r => r.id === selectedRequest.id)) {
         setSelectedRequest(null);
      }
    });
    return () => unsubscribe();
  }, [selectedUser, activeTab]);


  // 3. INIT ASSIGNMENT (When clicking a Request)
  const initAssignment = (req: RequestData) => {
    setSelectedRequest(req);
    
    // Smart Title Generation based on Package progress
    const total = req.totalReadings || 1;
    const remaining = req.remainingReadings ?? 1;
    const currentNumber = (total - remaining) + 1;
    
    if (total > 1) {
       setReadingTitle(`${req.service} (Reading ${currentNumber} of ${total})`);
    } else {
       setReadingTitle(`${req.service} Reading`);
    }
    
    // Reset video list
    setVideoList([{ title: 'Part 1', url: '' }]);
  };

  // 4. FORM HANDLERS
  const updateVideo = (index: number, field: keyof VideoItem, value: string) => {
    const newVideos = [...videoList];
    newVideos[index][field] = value;
    setVideoList(newVideos);
  };
  const addVideo = () => setVideoList([...videoList, { title: `Part ${videoList.length + 1}`, url: '' }]);
  const removeVideo = (index: number) => setVideoList(videoList.filter((_, i) => i !== index));

  const handleCompleteAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !currentUser || !readingTitle) return;

    setSaving(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          targetUid: selectedUser.uid,
          readingTitle,
          readingDate,
          videos: videoList.filter(v => v.url),
          requestId: selectedRequest?.id 
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error('Failed');

      if (result.remaining > 0) {
        setModalMessage(`Saved! ${result.remaining} readings remaining in this package.`);
      } else {
        setModalMessage(`Reading assigned! Request marked as fully complete.`);
      }

      setShowSuccessModal(true);
      
      // Reset Form but keep User selected
      setReadingTitle('');
      setVideoList([{ title: 'Part 1', url: '' }]);
      setSelectedRequest(null);
    } catch (error) {
      alert("Failed to assign.");
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    sun: {
      bg: 'bg-amber-50', text: 'text-amber-900', panelBg: 'bg-white', border: 'border-amber-200',
      accent: 'bg-amber-100 text-amber-700', inputBg: 'bg-amber-50',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      secondaryButton: 'text-amber-600 hover:bg-amber-100',
      listHover: 'hover:bg-amber-100', listActive: 'bg-amber-200 border-amber-400',
      highlightBox: 'bg-amber-50 border-amber-200'
    },
    moon: {
      bg: 'bg-slate-950', text: 'text-slate-100', panelBg: 'bg-slate-900', border: 'border-slate-800',
      accent: 'bg-slate-800 text-indigo-300', inputBg: 'bg-slate-950',
      button: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      secondaryButton: 'text-slate-400 hover:text-white hover:bg-slate-800',
      listHover: 'hover:bg-slate-800', listActive: 'bg-indigo-900/50 border-indigo-500/50',
      highlightBox: 'bg-indigo-900/20 border-indigo-500/30'
    }
  };
  const current = styles[theme];

  if (loading) return <div className={`min-h-screen flex items-center justify-center gap-3 ${current.bg} ${current.text}`}><Loader2 className="w-6 h-6 animate-spin" /> Loading Mission Control...</div>;

  return (
    <div className={`min-h-screen font-sans p-4 md:p-8 transition-colors duration-500 ${current.bg} ${current.text} overflow-hidden h-screen flex flex-col`}>
      <StarField theme={theme} />
      
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`relative w-full max-w-sm p-8 rounded-2xl shadow-2xl border text-center ${current.panelBg} ${current.border}`}>
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
            <h3 className="text-xl font-serif font-bold mb-2">Update Successful</h3>
            <p className="opacity-70 text-sm mb-6">{modalMessage}</p>
            <button onClick={() => setShowSuccessModal(false)} className={`w-full py-3 rounded-xl font-bold tracking-wide ${current.button}`}>Close</button>
          </div>
        </div>
      )}

      <header className={`flex justify-between items-center mb-6 border-b pb-4 relative z-10 ${current.border}`}>
        <div className="flex items-center gap-3">
          <Shield className={`w-8 h-8 ${theme === 'sun' ? 'text-amber-600' : 'text-amber-500'}`} />
          <div><h1 className="text-2xl font-serif font-bold">Mission Control</h1></div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className={`p-2 rounded-full hover:bg-current hover:bg-opacity-10`}>{theme === 'sun' ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}</button>
          <button onClick={() => { signOut(auth); router.push('/'); }} className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${current.secondaryButton}`}><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-6 relative z-10 flex-1 overflow-hidden">
        
        {/* LEFT: USER LIST */}
        <div className={`lg:col-span-3 border rounded-xl overflow-hidden flex flex-col ${current.panelBg} ${current.border}`}>
          <div className={`p-4 border-b flex justify-between items-center ${current.border} bg-opacity-50`}>
            <h2 className="font-bold flex items-center gap-2 text-sm"><Users className="w-4 h-4" /> Travelers ({users.length})</h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
            {users.map((user) => (
              <button key={user.uid} onClick={() => { setSelectedUser(user); setSelectedRequest(null); }} className={`w-full text-left p-3 rounded-lg transition-all border border-transparent group ${selectedUser?.uid === user.uid ? current.listActive : current.listHover}`}>
                <div className="flex justify-between items-start">
                  <div className="font-bold text-sm truncate">
                    {user.firstName ? `${user.firstName} ${user.lastName}` : (user.displayName || user.email)}
                  </div>
                </div>
                <div className="text-xs opacity-50 truncate mt-0.5">{user.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* MIDDLE: REQUESTS LIST */}
        <div className={`lg:col-span-4 flex flex-col ${selectedUser ? '' : 'opacity-50 pointer-events-none'}`}>
            <div className={`flex gap-2 mb-4 border-b ${current.border}`}>
               <button onClick={() => setActiveTab('open')} className={`flex-1 pb-2 text-center text-sm font-bold border-b-2 transition-all ${activeTab === 'open' ? 'border-current opacity-100' : 'border-transparent opacity-40'}`}>Open Requests</button>
               <button onClick={() => setActiveTab('history')} className={`flex-1 pb-2 text-center text-sm font-bold border-b-2 transition-all ${activeTab === 'history' ? 'border-current opacity-100' : 'border-transparent opacity-40'}`}>History</button>
            </div>

            <div className={`flex-1 border rounded-xl overflow-hidden flex flex-col ${current.panelBg} ${current.border}`}>
              {requests.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm opacity-40 italic p-8 text-center">
                  {selectedUser ? `No ${activeTab} requests found for this traveler.` : "Select a traveler to view requests."}
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 p-4 space-y-4 custom-scrollbar">
                  {requests.map(req => (
                    <div 
                      key={req.id} 
                      onClick={() => activeTab === 'open' && initAssignment(req)}
                      className={`p-4 rounded-xl border text-sm transition-all cursor-pointer ${selectedRequest?.id === req.id ? `${current.listActive} ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-500` : `${current.border} ${current.inputBg} hover:border-opacity-100 border-opacity-50`}`}
                    >
                       <div className="flex justify-between mb-3 items-center">
                          <span className={`font-bold px-2 py-1 rounded text-xs ${theme === 'sun' ? 'bg-amber-200 text-amber-800' : 'bg-indigo-500 text-white'}`}>{req.service}</span>
                          <span className="text-xs opacity-50 flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(req.createdAt).toLocaleDateString()}</span>
                       </div>
                       
                       <div className="space-y-3">
                         <div><span className="text-[10px] uppercase opacity-50 block font-bold">Situation</span><p className="opacity-90 leading-relaxed">{req.situation}</p></div>
                         <div><span className="text-[10px] uppercase opacity-50 block font-bold">Question</span><p className="opacity-90 leading-relaxed">{req.question}</p></div>
                       </div>

                       {/* Context Footer */}
                       <div className="mt-4 pt-3 border-t border-current border-opacity-10 flex justify-between items-center text-xs opacity-60">
                          <div>{req.age ? `Age: ${req.age}` : ''} {req.gender ? `• ${req.gender}` : ''}</div>
                          {/* Package Progress */}
                          {(req.totalReadings || 0) > 1 && (
                             <span className="font-bold text-amber-500">
                               {req.remainingReadings} / {req.totalReadings} readings left
                             </span>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>

        {/* RIGHT: ASSIGNMENT WORKSPACE */}
        <div className={`lg:col-span-5 flex flex-col ${selectedRequest ? '' : 'opacity-50 pointer-events-none'}`}>
           
           {selectedRequest ? (
             <div className={`border rounded-xl p-6 h-full overflow-y-auto custom-scrollbar ${current.panelBg} ${current.border}`}>
                <div className="flex justify-between items-start mb-6">
                   <div>
                     <h2 className="text-xl font-serif font-bold">Fulfill Request</h2>
                     <p className="text-sm opacity-60">Assigning to: {selectedUser?.email}</p>
                   </div>
                   <button onClick={() => setSelectedRequest(null)} className="p-1 hover:bg-current hover:bg-opacity-10 rounded"><X className="w-5 h-5"/></button>
                </div>

                {/* Context Summary */}
                <div className={`p-4 rounded-lg mb-6 border ${current.highlightBox} text-sm`}>
                   <div className="font-bold mb-1 flex items-center gap-2"><UserIcon className="w-3 h-3"/> Context for this reading</div>
                   <p className="opacity-80 italic line-clamp-3">"{selectedRequest.question}"</p>
                </div>

                <form onSubmit={handleCompleteAssignment} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">Reading Title</label>
                    <input type="text" value={readingTitle} onChange={(e) => setReadingTitle(e.target.value)} className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${current.inputBg} ${current.border}`} required />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs uppercase tracking-widest opacity-60 flex justify-between">
                      <span>Video Links</span>
                      <span className="text-[10px] normal-case opacity-50">Unlisted YouTube links only</span>
                    </label>
                    {videoList.map((video, index) => (
                      <div key={index} className="flex gap-2 items-start">
                         <div className="flex-1 space-y-2">
                            <input placeholder="Title (e.g. Part 1)" value={video.title} onChange={(e) => updateVideo(index, 'title', e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs ${current.inputBg} ${current.border}`} required />
                            <div className="relative"><Video className="absolute left-3 top-2.5 w-4 h-4 opacity-40" /><input placeholder="YouTube URL" value={video.url} onChange={(e) => updateVideo(index, 'url', e.target.value)} className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs ${current.inputBg} ${current.border}`} required /></div>
                         </div>
                         {videoList.length > 1 && <button type="button" onClick={() => removeVideo(index)} className="p-2 mt-1 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>}
                      </div>
                    ))}
                    <button type="button" onClick={addVideo} className={`text-xs font-bold flex items-center gap-1 mt-2 ${current.secondaryButton}`}><Plus className="w-3 h-3"/> Add Another Video</button>
                  </div>

                  <div className="pt-4 border-t border-current border-opacity-10">
                    <button disabled={saving} className={`flex items-center justify-center gap-2 w-full font-bold py-4 rounded-xl transition-all disabled:opacity-50 ${current.button}`}>
                      {saving ? 'Uploading...' : <><Save className="w-4 h-4" /> Complete Assignment</>}
                    </button>
                  </div>
                </form>
             </div>
           ) : (
             <div className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center opacity-60 ${current.border}`}>
               <Inbox className="w-16 h-16 mb-4 opacity-30" />
               <h3 className="font-bold text-lg">No Request Selected</h3>
               <p className="text-sm opacity-70 max-w-xs mt-2">Select an "Open Request" from the middle column to start assigning videos.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}