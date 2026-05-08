
import React, { useEffect, useState } from 'react';
import Logo from './Logo';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [text, setText] = useState('');
  const fullText = "AI-Powered Sales Intelligence";
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Typing effect
    let index = 0;
    const intervalId = setInterval(() => {
      setText(fullText.slice(0, index + 1));
      index++;
      if (index > fullText.length) {
        clearInterval(intervalId);
      }
    }, 40);

    // Auto dismiss after 3.5s + transition time
    const timeoutId = setTimeout(() => {
      handleComplete();
    }, 3500);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 800); // Match CSS transition duration
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Soft Gradient Background with Blur Mesh */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-rose-500/10 animate-gradient-xy"></div>
        <div className="absolute -top-1/2 -left-1/2 w-[150%] h-[150%] bg-blue-500/5 rounded-full blur-[100px] animate-gradient-x"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-[150%] h-[150%] bg-indigo-500/5 rounded-full blur-[100px] animate-gradient-y"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Animation: Scaling and Breathing */}
        <div className="w-32 h-32 bg-slate-900/90 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl mb-12 animate-logo-scale border border-white/10 ring-1 ring-white/20">
          <Logo className="w-20 h-20" />
        </div>

        {/* Text Fade In with Slide Up */}
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 opacity-0 animate-slide-up drop-shadow-sm text-center px-4" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          SalesAuditor <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">AI</span>
        </h1>

        {/* Typing Effect Subtitle */}
        <div className="h-8">
            <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 font-bold tracking-[0.2em] uppercase font-mono">
            {text}<span className="animate-pulse text-indigo-500">|</span>
            </p>
        </div>
      </div>

      <button 
        onClick={handleComplete}
        className="absolute bottom-16 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-[10px] font-bold transition-colors uppercase tracking-[0.25em] animate-pulse hover:scale-105 transform duration-300"
      >
        Skip Intro
      </button>

      <div className="absolute bottom-6 font-extrabold text-lg z-20 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse">
        &copy; 2026 Akash Krishna All rights reserved
      </div>
    </div>
  );
};

export default WelcomeScreen;
