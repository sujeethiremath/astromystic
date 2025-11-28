'use client';

import React, { useEffect, useState } from 'react';
import { Play, Calendar, Video, Star, X, Loader2 } from 'lucide-react';

import { auth, db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { trackEvent } from '../../lib/mixpanel';

interface ReadingsListProps {
  currentStyles: any;
  theme: 'sun' | 'moon';
  onBrowse: () => void;
}

export default function ReadingsList({
  currentStyles,
  theme,
  onBrowse,
}: ReadingsListProps) {
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // 1. Fetch Real Readings & Track View
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = undefined;
      }

      if (user) {
        // TRACK EVENT: User viewed their library
        trackEvent('Readings Library Viewed', {
          userId: user.uid,
          email: user.email,
        });

        const q = query(
          collection(db, 'users', user.uid, 'readings'),
          orderBy('createdAt', 'desc')
        );

        unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            const fetchedData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setReadings(fetchedData);
            setLoading(false);
          },
          (error) => {
            if (error.code === 'permission-denied') return;
            console.error('Error fetching readings:', error);
            setLoading(false);
          }
        );
      } else {
        setReadings([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : null;
  };

  const handleWatch = (reading: any) => {
    // TRACK EVENT: Video Started
    trackEvent('Reading Video Started', {
      video_title: reading.title,
      video_date: reading.date,
      video_url: reading.videoUrl,
    });

    const embedUrl = getYouTubeEmbedUrl(reading.videoUrl);
    if (embedUrl) {
      setActiveVideo(embedUrl);
    } else {
      window.open(reading.videoUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="col-span-full py-24 text-center flex flex-col items-center justify-center opacity-50">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-sm">Consulting the archives...</p>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="col-span-full py-16 text-center border border-dashed border-current border-opacity-20 rounded-xl">
        <Video className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <h3 className="text-xl font-serif mb-2">No readings yet</h3>
        <p className="opacity-60 mb-6">
          Your cosmic collection is waiting to begin.
        </p>
        <button
          onClick={onBrowse}
          className={`px-6 py-2 rounded-full font-bold ${currentStyles.button}`}
        >
          Browse Offerings
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {readings.map((reading) => (
          <div
            key={reading.id}
            className={`group rounded-xl overflow-hidden border transition-all hover:shadow-xl ${currentStyles.panelBg} ${currentStyles.border}`}
          >
            <div
              onClick={() => handleWatch(reading)}
              className="relative aspect-video bg-black/20 group-hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform`}
                >
                  <Play className="w-5 h-5 text-white ml-1" />
                </div>
              </div>
              <div
                className={`w-full h-full ${theme === 'sun' ? 'bg-amber-200' : 'bg-indigo-900'} opacity-20`}
              />
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-lg font-bold truncate pr-2">
                  {reading.title}
                </h3>
                {reading.status === 'ready' && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs opacity-60 mb-4">
                <Calendar className="w-3 h-3" />
                <span>{reading.date}</span>
              </div>
              <button
                onClick={() => handleWatch(reading)}
                className={`block w-full py-2 text-center rounded-lg text-sm font-bold border border-current border-opacity-20 hover:bg-current hover:bg-opacity-5 transition-all`}
              >
                Watch Reading
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={activeVideo}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
