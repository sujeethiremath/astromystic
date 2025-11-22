"use client";

import React from 'react';

interface StarFieldProps {
  theme: 'sun' | 'moon';
}

const StarField = ({ theme }: StarFieldProps) => {
  if (theme === 'sun') return null;
  
  // Fixed positions for consistent rendering
  const stars = [
    { top: '10%', left: '15%', size: 2, opacity: 0.8 },
    { top: '20%', left: '85%', size: 3, opacity: 0.6 },
    { top: '35%', left: '45%', size: 2, opacity: 0.9 },
    { top: '55%', left: '10%', size: 3, opacity: 0.5 },
    { top: '70%', left: '80%', size: 2, opacity: 0.7 },
    { top: '85%', left: '25%', size: 3, opacity: 0.8 },
    { top: '15%', left: '60%', size: 2, opacity: 0.4 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star, i) => (
        <div 
          key={i}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${3 + i}s`
          }}
        />
      ))}
    </div>
  );
};

export default StarField;