import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="auditorGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F472B6" stopOpacity="0.8" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main geometric shapes */}
      {/* Abstract chart bars going up */}
      <rect x="20" y="55" width="12" height="25" rx="4" fill="url(#auditorGradient)" opacity="0.6" />
      <rect x="42" y="38" width="12" height="42" rx="4" fill="url(#auditorGradient)" opacity="0.8" />
      
      {/* Front glowing majestic graph line swooping up */}
      <path 
        d="M 15 65 C 30 65, 35 45, 50 35 C 65 25, 75 25, 90 10" 
        stroke="url(#glowGradient)" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#glow)"
      />
      
      {/* AI Star / Eye inside magnifying glass effect */}
      <circle cx="78" cy="22" r="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-white" opacity="0.9" />
      <path 
        d="M 88 32 L 95 39" 
        stroke="currentColor" 
        strokeWidth="5" 
        strokeLinecap="round" 
        className="text-white"
        opacity="0.9" 
      />
      
      <circle cx="78" cy="22" r="4" fill="url(#auditorGradient)" />
    </svg>
  );
};

export default Logo;
