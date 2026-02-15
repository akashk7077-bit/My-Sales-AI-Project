import React, { useState, useEffect } from 'react';

interface ScoreCardProps {
  label: string;
  score: number;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  // Easing Animation for Counter
  useEffect(() => {
    let start = 0;
    const end = score;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // EaseOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setDisplayScore(Math.floor(start + (end - start) * ease));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(end);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  let colorClass = "text-rose-500 dark:text-rose-400";
  let strokeClass = "stroke-rose-500 dark:stroke-rose-400";
  let bgStrokeClass = "stroke-rose-100 dark:stroke-rose-900";
  
  // Logic for 0-100 scale using displayScore for dynamic color transition if desired, 
  // but using 'score' (target) makes colors stable during animation which is usually cleaner.
  // Using target score for color determination:
  if (score >= 80) {
    colorClass = "text-emerald-600 dark:text-emerald-400";
    strokeClass = "stroke-emerald-500 dark:stroke-emerald-400";
    bgStrokeClass = "stroke-emerald-100 dark:stroke-emerald-900";
  } else if (score >= 50) {
    colorClass = "text-amber-500 dark:text-amber-400";
    strokeClass = "stroke-amber-500 dark:stroke-amber-400";
    bgStrokeClass = "stroke-amber-100 dark:stroke-amber-900";
  }

  // Mini circle calculations
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  // Calculate offset based on current animated score
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-105 duration-300">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center h-8 flex items-center">
        {label}
      </span>
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            cx="32" cy="32" r={radius} 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="transparent" 
            className={`${bgStrokeClass} transition-colors duration-500`} 
          />
          <circle 
            cx="32" cy="32" r={radius} 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${strokeClass} transition-all duration-300 ease-out`}
            style={{ strokeDashoffset: offset }} 
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${colorClass} transition-colors duration-500`}>
          {displayScore}
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;