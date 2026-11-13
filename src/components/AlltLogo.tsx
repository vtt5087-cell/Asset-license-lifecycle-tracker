import React, { useState } from 'react';

interface AlltLogoProps {
  className?: string;
  size?: number;
}

export const AlltLogo: React.FC<AlltLogoProps> = ({ className = 'w-10 h-10', size }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <svg
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={size ? { width: size, height: size } : undefined}
        aria-label="ALLT Logo"
      >
        <defs>
          <linearGradient id="allt-navy-base" x1="15" y1="65" x2="95" y2="35" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0a192f" />
            <stop offset="35%" stopColor="#112749" />
            <stop offset="65%" stopColor="#183b6b" />
            <stop offset="100%" stopColor="#0e2344" />
          </linearGradient>
          <linearGradient id="allt-sheen" x1="20" y1="75" x2="85" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#081426" />
            <stop offset="40%" stopColor="#1d4378" />
            <stop offset="70%" stopColor="#2962a4" />
            <stop offset="100%" stopColor="#15315b" />
          </linearGradient>
          <linearGradient id="allt-cyan-crest" x1="42" y1="65" x2="68" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="30%" stopColor="#0284c7" />
            <stop offset="70%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="allt-arrow-top" x1="70" y1="36" x2="96" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <linearGradient id="allt-arrow-bottom" x1="75" y1="32" x2="96" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#08182b" />
            <stop offset="70%" stopColor="#122c4d" />
            <stop offset="100%" stopColor="#1a3b63" />
          </linearGradient>
          <linearGradient id="allt-bar-1" x1="70" y1="42" x2="82" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="allt-bar-2" x1="64" y1="52" x2="74" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="allt-bar-3" x1="58" y1="60" x2="67" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#075985" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="allt-inner-loop" x1="30" y1="60" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#061220" />
            <stop offset="100%" stopColor="#142e50" />
          </linearGradient>
        </defs>
        <path
          d="M 14 54 C 20 66, 32 78, 52 82 C 68 85, 80 75, 90 48 L 82 43 C 74 66, 62 74, 48 72 C 34 70, 24 62, 19 53 Z"
          fill="url(#allt-sheen)"
        />
        <path
          d="M 14 54 C 18 63, 28 73, 44 76 C 62 80, 77 70, 88 44 C 91 37, 93 28, 95 18 C 91 26, 84 32, 78 36 C 72 56, 58 66, 42 66 C 26 66, 20 54, 30 46 C 36 41, 46 41, 56 46 C 63 42, 66 34, 68 26 C 58 27, 48 31, 38 35 C 24 41, 16 47, 14 54 Z"
          fill="url(#allt-navy-base)"
        />
        <path
          d="M 44 54 C 48 48, 54 42, 60 38 C 65 35, 68 30, 68 25 C 65 31, 58 38, 52 44 C 47 48, 44 51, 44 54 Z"
          fill="url(#allt-cyan-crest)"
        />
        <path
          d="M 38 48 C 45 42, 54 36, 62 31 C 67 28, 68 25, 68 25 C 68 25, 65 32, 58 39 C 52 45, 45 49, 38 48 Z"
          fill="url(#allt-arrow-top)"
        />
        <path
          d="M 28 58 C 24 53, 28 47, 36 45 C 45 43, 53 49, 52 55 C 51 60, 42 63, 34 62 C 30 61, 28 60, 28 58 Z"
          fill="url(#allt-inner-loop)"
          opacity="0.3"
        />
        <path d="M 64 61 L 70 54 L 75 56 L 68 64 Z" fill="url(#allt-bar-3)" />
        <path d="M 71 52 L 77 44 L 82 47 L 76 55 Z" fill="url(#allt-bar-2)" />
        <path d="M 78 42 L 84 34 L 89 37 L 83 45 Z" fill="url(#allt-bar-1)" />
        <path d="M 96 15 L 94 38 L 88 32 L 82 35 Z" fill="url(#allt-arrow-bottom)" />
        <path d="M 96 15 L 82 35 L 87 31 L 83 26 Z" fill="url(#allt-arrow-top)" />
        <path d="M 96 15 L 87 31" stroke="#ffffff" strokeWidth="0.75" strokeLinecap="round" opacity="0.7" />
      </svg>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="ALLT Logo"
      className={`${className} object-contain`}
      style={size ? { width: size, height: size } : undefined}
      onError={() => setImgError(true)}
      referrerPolicy="no-referrer"
    />
  );
};
