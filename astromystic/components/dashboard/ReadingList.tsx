"use client";

import React, { useState } from 'react';
import { Play, Calendar, Video, Star, X } from 'lucide-react';

interface ReadingsListProps {
  currentStyles: any;
  theme: 'sun' | 'moon';
  onBrowse: () => void;
}

// Mock Data with "Real" YouTube link structures for testing
const MOCK_READINGS = [
  {
    id: '1',
    title: 'Solar Return 2024',
    date: 'Oct 24, 2023',
    // Replace with your actual unlisted youtube links later
    videoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', 
    status: 'ready'
  },
  {
    id: '2',
    title: 'Natal Chart Deep Dive',
    date: 'Jan 12, 2023',
    videoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    status: 'ready'
  }
];

export default function ReadingsList({ currentStyles, theme, onBrowse }: ReadingsListProps) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Helper to extract ID from various YouTube URL formats
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
  };

  const handleWatch = (url: string) => {
    const embedUrl = getYouTubeEmbedUrl(url);
    if (embedUrl) {
      setActiveVideo(embedUrl);
    } else {
      window.open(url, '_blank'); // Fallback if URL parsing fails
    }
  };

  if (MOCK_READINGS.length === 0) {
    return (
      <div className="col-span-full py-16 text-center border border-dashed border-current border-opacity-20 rounded-xl">
        <Video className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <h3 className="text-xl font-serif mb-2">No readings yet</h3>
        <p className="opacity-60 mb-6">Your cosmic collection is waiting to begin.</p>
        <button onClick={onBrowse} className={`px-6 py-2 rounded-full font-bold ${currentStyles.button}`}>
          Browse Offerings
        </button>
      </div>
    );
  }

  return (
    <>
      {/* VIDEO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_READINGS.map((reading) => (
          <div key={reading.id} className={`group rounded-xl overflow-hidden border transition-all hover:shadow-xl ${currentStyles.panelBg} ${currentStyles.border}`}>
            {/* Thumbnail Area - Clickable */}
            <div 
              onClick={() => handleWatch(reading.videoUrl)}
              className="relative aspect-video bg-black/20 group-hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform`}>
                  <Play className="w-5 h-5 text-white ml-1" />
                </div>
              </div>
              {/* Placeholder Colored Background (or actual thumbnail image in future) */}
              <div className={`w-full h-full ${theme === 'sun' ? 'bg-amber-200' : 'bg-indigo-900'} opacity-20`} />
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-lg font-bold">{reading.title}</h3>
                {reading.status === 'ready' && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
              </div>
              <div className="flex items-center gap-2 text-xs opacity-60 mb-4">
                <Calendar className="w-3 h-3" />
                <span>{reading.date}</span>
              </div>
              <button 
                onClick={() => handleWatch(reading.videoUrl)}
                className={`block w-full py-2 text-center rounded-lg text-sm font-bold border border-current border-opacity-20 hover:bg-current hover:bg-opacity-5 transition-all`}
              >
                Watch Reading
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VIDEO PLAYER MODAL */}
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