
import React, { useEffect, useState } from 'react';

interface AIAnalysisLoaderProps {
  status: string;
  progress: number;
}

const AIAnalysisLoader: React.FC<AIAnalysisLoaderProps> = ({ status, progress }) => {
  const [dots, setDots] = useState('');

  // Animated ellipsis for text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getStageStatus = (stageStart: number, stageEnd: number) => {
    if (progress >= stageEnd) return 'completed';
    if (progress > stageStart) return 'active';
    return 'pending';
  };

  const isComplete = progress === 100;

  return (
    <div className="w-full max-w-xl mx-auto min-h-[50vh] flex flex-col items-center justify-center p-6 animate-fade-in relative z-20">
      
      {/* Success Animation Overlay */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center z-50 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl transition-all duration-700 ${isComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
         <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/40 animate-[scaleIn_0.6s_cubic-bezier(0.16,1,0.3,1)]">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
         </div>
         <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-6 tracking-tight animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] opacity-0 translate-y-4">Analysis Complete</h2>
         <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium animate-[fadeInUp_0.8s_ease-out_0.4s_forwards] opacity-0 translate-y-4">Generating Report...</p>
      </div>

      {/* Main Loader Card */}
      <div className={`w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 relative overflow-hidden transition-all duration-500 ${isComplete ? 'scale-95 opacity-0' : 'opacity-100'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                 AI Processing Engine
              </h3>
           </div>
           <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
              {Math.min(progress, 99)}%
           </div>
        </div>

        {/* Main Progress Bar */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-10 relative">
           {/* Fill */}
           <div 
             className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-700 ease-out relative"
             style={{ width: `${progress}%` }}
           >
              <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/50 skew-x-[-20deg] animate-shimmer"></div>
           </div>
        </div>

        {/* Status Text with Typing Dots */}
        <div className="text-center mb-12 h-12 flex flex-col items-center justify-center">
           <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
             {status}
           </p>
           {/* Visual Typing Indicator */}
           <div className="flex items-center gap-1 mt-2">
             <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-0"></div>
             <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
             <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
           </div>
        </div>

        {/* Stages Indicators */}
        <div className="grid grid-cols-3 gap-2 relative">
           {/* Connector Line */}
           <div className="absolute top-5 left-[16%] right-[16%] h-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>
           
           {/* Upload Stage (0-5%) */}
           <StageIndicator 
             label="Uploading" 
             status={getStageStatus(-1, 5)} 
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
           />
           {/* Transcribe Stage (5-75%) */}
           <StageIndicator 
             label="Transcribing" 
             status={getStageStatus(5, 75)}
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
           />
           {/* Analyze Stage (75-100%) */}
           <StageIndicator 
             label="Analyzing" 
             status={getStageStatus(75, 99)}
             icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
           />
        </div>

      </div>
      
      <p className="mt-8 text-slate-400 dark:text-slate-500 text-[10px] font-mono tracking-widest uppercase opacity-60">
         Secured by Enterprise Grade AI
      </p>
    </div>
  );
};

interface StageIndicatorProps {
  label: string;
  status: 'pending' | 'active' | 'completed';
  icon: React.ReactNode;
}

const StageIndicator: React.FC<StageIndicatorProps> = ({ label, status, icon }) => {
  let colorClass = "text-slate-300 dark:text-slate-600";
  let borderClass = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800";
  let labelClass = "text-slate-400 dark:text-slate-600";

  if (status === 'active') {
    colorClass = "text-indigo-600 dark:text-indigo-400";
    borderClass = "border-indigo-500 dark:border-indigo-400 bg-white dark:bg-slate-800 shadow-lg shadow-indigo-500/20";
    labelClass = "text-indigo-600 dark:text-indigo-400 font-bold";
  } else if (status === 'completed') {
    colorClass = "text-white";
    borderClass = "border-emerald-500 bg-emerald-500 dark:border-emerald-500";
    labelClass = "text-emerald-600 dark:text-emerald-400 font-medium";
  }

  return (
    <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${status === 'pending' ? 'opacity-50 blur-[0.5px]' : 'opacity-100'}`}>
      <div className="relative">
         {/* Active Ring Spinner */}
         {status === 'active' && (
             <div className="absolute -inset-1 rounded-full border-2 border-indigo-100 dark:border-indigo-900 border-t-indigo-500 animate-spin"></div>
         )}
         
         <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${borderClass} ${colorClass} relative z-10`}>
             {status === 'completed' ? (
                <svg className="w-5 h-5 animate-[scaleIn_0.3s_ease-out]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             ) : (
                <div className={`${status === 'active' ? 'animate-pulse' : ''}`}>{icon}</div>
             )}
         </div>
      </div>
      <span className={`text-[10px] uppercase tracking-wider transition-colors duration-300 ${labelClass}`}>{label}</span>
    </div>
  );
};

export default AIAnalysisLoader;
