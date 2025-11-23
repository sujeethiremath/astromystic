"use client";

import React, { useState, useEffect } from 'react';
// ADDED: Trash2 to the imports
import { Shield, Users, Video, Plus, Save, Check, Search, Loader2, LogOut, Sun, Moon, CheckCircle, X, MessageSquare, Clock, Inbox, History, User as UserIcon, Trash2 } from 'lucide-react';
import { User } from 'firebase/auth';

// =========================================================
// 1. REAL IMPORTS (Uncomment these in your local Next.js project)
// =========================================================
import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext'; 
import { auth, db } from '@/lib/firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, query, orderBy, doc, getDoc, onSnapshot, where, updateDoc } from 'firebase/firestore';
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
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);

  // Assignment Form State (Multiple Videos)
  const [readingTitle, setReadingTitle] = useState('');
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
  const [videoList, setVideoList] = useState<VideoItem[]>([{ title: 'Part 1', url: '' }]);
  const [saving, setSaving] = useState(false);
  
  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // 1. INITIAL AUTH CHECK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/');
      setCurrentUser(user);
      
      // In prod, strictly rely on API/Rules. For UI smoothness:
      const allowedEmails = ['sujeetshiremath@gmail.com', 'hiremath09@gmail.com'];
      if (user.email && allowedEmails.includes(user.email)) {
         await fetchUsers(user);
      } else {
         await fetchUsers(user); // API will reject if invalid
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
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 403 || res.status === 401) {
        alert("Access Denied: Admin privileges required.");
        router.push('/');
        return;
      }

      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        setLoading(false);
      }
    } catch (error) {
      console.error("API Error:", error);
      setLoading(false);
    }
  };

  // 3. FETCH REQUESTS (Real-time Listener)
  useEffect(() => {
    if (!selectedUser) {
      setRequests([]);
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
    }, (err) => {
      // Ignore missing index error on first run, console provides link
      if (err.code !== 'permission-denied') console.warn("Snapshot error:", err.message);
    });

    return () => unsubscribe();
  }, [selectedUser, activeTab]);

  // 4. HANDLE ASSIGNMENT WORKFLOW
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

  // Video List Management
  const updateVideoItem = (index: number, field: 'title' | 'url', value: string) => {
    const newList = [...videoList];
    newList[index][field] = value;
    setVideoList(newList);
  };

  const addVideoRow = () => {
    setVideoList([...videoList, { title: `Part ${videoList.length + 1}`, url: '' }]);
  };

  const removeVideoRow = (index: number) => {
    if (videoList.length > 1) {
      setVideoList(videoList.filter((_, i) => i !== index));
    }
  };

  // 5. SUBMIT ASSIGNMENT (Calls API)
  const handleCompleteAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !currentUser || !readingTitle) return;

    setSaving(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUid: selectedUser.uid,
          readingTitle,
          readingDate,
          videos: videoList.filter(v => v.url), // Clean up empty rows
          requestId: selectedRequest?.id // Optional: links to request
        })
      });

      if (!res.ok) throw new Error('Failed to assign');
      
      const result = await res.json();

      if (result.remaining > 0) {
        setModalMessage(`Saved! ${result.remaining} readings remaining in this package.`);
      } else {
        setModalMessage(`Reading assigned! Request marked as fully complete.`);
      }

      setShowSuccessModal(true);
      
      // Reset Form
      setReadingTitle('');
      setVideoList([{ title: 'Part 1', url: '' }]);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Assign Error:", error);
      alert("Failed to assign reading. Check permissions.");
    } finally {
      setSaving(false);
    }
  };

  // --- STYLES ---
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

  if (loading) return <div className={`min-h-screen flex items-center justify-center gap-3 ${current.bg} ${current.text}`}><Loader2 className="w-6 h-6 animate-spin" /> Accessing Mainframe...</div>;

  return (
    <div className={`min-h-screen font-sans p-6 md:p-12 transition-colors duration-500 ${current.bg} ${current.text}`}>
      <StarField theme={theme} />
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative w-full max-w-sm p-8 rounded-2xl shadow-2xl border text-center ${current.panelBg} ${current.border}`}>
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
            <h3 className="text-xl font-serif font-bold mb-2">Update Successful</h3>
            <p className="opacity-70 text-sm mb-6">{modalMessage}</p>
            <button onClick={() => setShowSuccessModal(false)} className={`w-full py-3 rounded-xl font-bold tracking-wide ${current.button}`}>Close</button>
          </div>
        </div>
      )}

      <header className={`flex justify-between items-center mb-8 border-b pb-6 relative z-10 ${current.border}`}>
        <div className="flex items-center gap-3">
          <Shield className={`w-8 h-8 ${theme === 'sun' ? 'text-amber-600' : 'text-amber-500'}`} />
          <div>
            <h1 className="text-2xl font-serif font-bold">Mission Control</h1>
            <p className="text-xs opacity-60 uppercase tracking-widest">Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className={`p-2 rounded-full transition-all hover:bg-current hover:bg-opacity-10`}>{theme === 'sun' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</button>
          <button onClick={() => { signOut(auth); router.push('/'); }} className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors ${current.secondaryButton}`}><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 relative z-10 h-[calc(100vh-10rem)]">
        
        {/* LEFT COLUMN: USER LIST */}
        <div className={`lg:col-span-4 border rounded-xl overflow-hidden flex flex-col ${current.panelBg} ${current.border}`}>
          <div className={`p-4 border-b flex justify-between items-center ${current.border} bg-opacity-50`}>
            <h2 className="font-bold flex items-center gap-2 text-sm">
              <Users className={`w-4 h-4 ${theme === 'sun' ? 'text-amber-600' : 'text-indigo-400'}`} /> Travelers ({users.length})
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
            {users.map((user) => (
              <button key={user.uid} onClick={() => { setSelectedUser(user); setSelectedRequest(null); }} className={`w-full text-left p-3 rounded-lg transition-all border border-transparent group ${selectedUser?.uid === user.uid ? current.listActive : current.listHover}`}>
                <div className="flex justify-between items-start">
                  <div className="font-bold text-sm truncate">
                    {user.firstName ? `${user.firstName} ${user.lastName}` : (user.displayName || user.email)}
                  </div>
                  {(user.age || user.gender) && (
                    <span className="text-[10px] opacity-50 border border-current rounded px-1 ml-2 whitespace-nowrap">
                      {user.age || '?'} / {user.gender?.[0] || '?'}
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-50 truncate mt-0.5">{user.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: WORKSPACE */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto">
          {selectedUser ? (
            <>
              {/* USER HEADER */}
              <div className={`flex justify-between items-end pb-4 border-b ${current.border}`}>
                 <div>
                   <h2 className="text-2xl font-serif font-bold">{selectedUser.firstName} {selectedUser.lastName}</h2>
                   <p className="text-sm opacity-60">{selectedUser.email}</p>
                 </div>
                 <div className="text-right text-xs opacity-50">
                    <div>{selectedUser.age ? `Age: ${selectedUser.age}` : ''} {selectedUser.gender ? `• ${selectedUser.gender}` : ''}</div>
                 </div>
              </div>

              {/* TABS */}
              <div className="flex gap-4 border-b border-current border-opacity-10">
                <button onClick={() => setActiveTab('open')} className={`pb-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'open' ? 'border-current opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}><Inbox className="w-4 h-4"/> Open Requests</button>
                <button onClick={() => setActiveTab('history')} className={`pb-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'history' ? 'border-current opacity-100' : 'border-transparent opacity-40 hover:opacity-70'}`}><History className="w-4 h-4"/> History</button>
              </div>

              {/* REQUESTS LIST */}
              <div className={`border rounded-xl p-6 ${current.panelBg} ${current.border}`}>
                 <h3 className="font-bold mb-4 text-sm uppercase tracking-wider opacity-70 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> {activeTab} Requests ({requests.length})</h3>
                 
                 {requests.length === 0 ? (
                   <p className="text-sm opacity-50 italic">No {activeTab} requests found.</p>
                 ) : (
                   <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                     {requests.map(req => (
                       <div key={req.id} className={`p-4 rounded-lg border text-sm ${theme === 'sun' ? 'bg-amber-50 border-amber-200' : 'bg-slate-950 border-slate-800'}`}>
                          <div className="flex justify-between mb-2 items-center">
                             <span className={`font-bold px-2 py-1 rounded text-xs ${theme === 'sun' ? 'bg-amber-200 text-amber-800' : 'bg-indigo-900 text-indigo-200'}`}>{req.service}</span>
                             <span className="text-xs opacity-50 flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(req.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 mt-2">
                            <div><span className="text-[10px] uppercase opacity-50 block font-bold">Situation</span><p className="opacity-90 leading-relaxed">{req.situation}</p></div>
                            <div><span className="text-[10px] uppercase opacity-50 block font-bold">Question</span><p className="opacity-90 leading-relaxed">{req.question}</p></div>
                          </div>
                          {/* Context Footer */}
                          {(req.age || req.gender) && (
                             <div className="mt-3 pt-2 border-t border-current border-opacity-10 text-xs opacity-50">Context: Age {req.age} • {req.gender}</div>
                          )}
                          
                          {/* Package Progress Badge */}
                          {(req.totalReadings || 0) > 1 && (
                             <div className="mt-2 text-right">
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${req.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                 {req.status === 'completed' ? 'All Videos Sent' : `${req.remainingReadings} / ${req.totalReadings} remaining`}
                               </span>
                             </div>
                          )}

                          {/* Fulfill Button (Only for Open Tab) */}
                          {activeTab === 'open' && selectedRequest?.id !== req.id && (
                             <button onClick={() => initAssignment(req)} className={`mt-3 text-xs font-bold px-3 py-1.5 rounded-lg w-full md:w-auto ${current.button}`}>
                               {(req.remainingReadings || 0) > 1 ? 'Add Video to Package' : 'Fulfill Request'}
                             </button>
                          )}
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              {/* ASSIGNMENT WORKSPACE */}
              <div className={`border rounded-xl p-8 ${current.panelBg} ${current.border} animate-in slide-in-from-bottom-2`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif font-bold">
                    {selectedRequest ? `Fulfilling: ${selectedRequest.service}` : 'Assign New Reading'}
                  </h2>
                  {selectedRequest && <button onClick={() => {setSelectedRequest(null); setReadingTitle('');}} className="text-xs opacity-50 hover:opacity-100">Cancel Selection</button>}
                </div>

                <form onSubmit={handleCompleteAssignment} className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest opacity-60 mb-2">Package Title</label>
                    <input type="text" value={readingTitle} onChange={(e) => setReadingTitle(e.target.value)} className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${current.inputBg} ${current.border}`} required />
                  </div>

                  {/* MULTI-VIDEO INPUTS */}
                  <div className="space-y-3">
                    <label className="block text-xs uppercase tracking-widest opacity-60">Videos</label>
                    {videoList.map((video, index) => (
                      <div key={index} className="flex gap-2 items-start">
                         <div className="flex-1 space-y-2">
                            <input placeholder="Title (e.g. Part 1)" value={video.title} onChange={(e) => updateVideoItem(index, 'title', e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-sm ${current.inputBg} ${current.border}`} required />
                            <div className="relative">
                              <Video className="absolute left-3 top-2.5 w-4 h-4 opacity-40" />
                              <input placeholder="YouTube URL" value={video.url} onChange={(e) => updateVideoItem(index, 'url', e.target.value)} className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm ${current.inputBg} ${current.border}`} required />
                            </div>
                         </div>
                         {videoList.length > 1 && (
                           <button type="button" onClick={() => removeVideoRow(index)} className="p-2 mt-1 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                         )}
                      </div>
                    ))}
                    <button type="button" onClick={addVideoRow} className={`text-xs font-bold flex items-center gap-1 mt-2 ${current.secondaryButton}`}><Plus className="w-3 h-3"/> Add Another Video</button>
                  </div>

                  <div className="pt-4 border-t border-current border-opacity-10">
                    <button disabled={saving} className={`flex items-center justify-center gap-2 w-full font-bold py-4 rounded-xl transition-all disabled:opacity-50 ${current.button}`}>
                      {saving ? 'Uploading...' : <><Save className="w-4 h-4" /> Complete Assignment</>}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center opacity-60 ${current.border}`}>
              <Search className="w-16 h-16 mb-4 opacity-30" />
              <h3 className="font-bold text-lg">No Request Selected</h3>
              <p className="text-sm opacity-70 max-w-xs mt-2">Select an "Open Request" from the middle column to start assigning videos.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}