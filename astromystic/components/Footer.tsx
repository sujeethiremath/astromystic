"use client";

import React from 'react';

interface FooterProps {
  currentStyles: any;
}

export default function Footer({ currentStyles }: FooterProps) {
  return (
    <footer className={`py-12 px-4 border-t border-current border-opacity-10 text-center ${currentStyles.footerBg}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 text-sm">
        <div className="font-serif">© 2024 Astralumina. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:opacity-100">Instagram</a>
          <a href="#" className="hover:opacity-100">Twitter</a>
          <a href="#" className="hover:opacity-100">Newsletter</a>
        </div>
      </div>
    </footer>
  );
}