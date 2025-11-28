"use client";

import React from 'react';
import { Instagram } from 'lucide-react';

import { trackEvent } from '../lib/mixpanel';


// Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface FooterProps {
  currentStyles: any;
}

export default function Footer({ currentStyles }: FooterProps) {
  
  const handleSocialClick = (platform: string, url: string) => {
    // TRACK EVENT: Social Media Click
    trackEvent('Social Link Clicked', {
      platform: platform,
      url: url,
      location: 'Footer'
    });
  };

  return (
    <footer className={`py-12 px-4 border-t border-current border-opacity-10 text-center ${currentStyles.footerBg}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 text-sm">
        <div className="font-serif">© {new Date().getFullYear()} Practical Love Astrology. All rights reserved.</div>
        <div className="flex gap-8 items-center">
          <a 
            href="https://www.instagram.com/manifestwithnara" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-100 flex items-center gap-2 transition-opacity"
            onClick={() => handleSocialClick('Instagram', 'https://www.instagram.com/manifestwithnara')}
          >
            <Instagram className="w-5 h-5" />
            <span>Instagram</span>
          </a>
          <a 
            href="https://www.tiktok.com/@naraastrology" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-100 flex items-center gap-2 transition-opacity"
            onClick={() => handleSocialClick('TikTok', 'https://www.tiktok.com/@naraastrology')}
          >
            <TikTokIcon className="w-5 h-5" />
            <span>TikTok</span>
          </a>
        </div>
      </div>
    </footer>
  );
}