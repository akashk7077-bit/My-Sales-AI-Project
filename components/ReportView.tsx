
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AnalysisData, CallRecord, UserRole } from '../types';
import RepDashboard from './RepDashboard';
import ManagerDashboard from './ManagerDashboard';
import ExecutiveDashboard from './ExecutiveDashboard';
import EmailSummaryModal from './EmailSummaryModal';

interface ReportViewProps {
  data: AnalysisData;
  onViewRecommendations?: () => void;
  audioUrl?: string;
  videoUrl?: string;
  onUpdateRecord?: (updates: Partial<CallRecord>) => void;
  userRole?: UserRole;
  userEmail?: string;
}

const ReportView: React.FC<ReportViewProps> = ({ data, audioUrl, videoUrl, onUpdateRecord, userRole = 'EXECUTIVE', userEmail }) => {
  const [activeTab, setActiveTab] = useState<'REP' | 'MANAGER' | 'EXECUTIVE'>('REP');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  
  // Audio Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // View Colors and Styles
  const getTabStyle = (tab: string) => {
    const isActive = activeTab === tab;
    if (tab === 'REP') {
       return isActive 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-transparent' 
        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border-transparent hover:bg-indigo-50 dark:hover:bg-slate-700';
    }
    if (tab === 'MANAGER') {
       return isActive 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 border-transparent' 
        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border-transparent hover:bg-emerald-50 dark:hover:bg-slate-700';
    }
    if (tab === 'EXECUTIVE') {
       return isActive 
        ? 'bg-slate-800 text-white shadow-lg shadow-slate-500/30 border-transparent' 
        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700';
    }
    return '';
  };

  // Determine Available Tabs based on Role
  const canSeeManager = userRole === 'MANAGER' || userRole === 'EXECUTIVE';
  const canSeeExecutive = userRole === 'EXECUTIVE';

  // Redirect if current tab is not allowed
  useEffect(() => {
      if (activeTab === 'MANAGER' && !canSeeManager) setActiveTab('REP');
      if (activeTab === 'EXECUTIVE' && !canSeeExecutive) setActiveTab('REP');
  }, [userRole, activeTab, canSeeManager, canSeeExecutive]);

  // Audio Handlers
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const parseTimestamp = (ts: string) => {
    if (!ts) return 0;
    // Format [MM:SS] or MM:SS
    const cleanTs = ts.replace('[', '').replace(']', '');
    const parts = cleanTs.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return 0;
  };

  const handleTranscriptClick = (timestamp: string) => {
    const seconds = parseTimestamp(timestamp);
    if (audioRef.current && seconds >= 0) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Calculate active segment based on current time
  const activeSegmentIndex = useMemo(() => {
    return data.transcription.findIndex((t, i) => {
      const currentStart = parseTimestamp(t.timestamp);
      const nextStart = data.transcription[i + 1] ? parseTimestamp(data.transcription[i + 1].timestamp) : Infinity;
      return currentTime >= currentStart && currentTime < nextStart;
    });
  }, [currentTime, data.transcription]);

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentIndex !== -1 && transcriptContainerRef.current) {
      const activeEl = transcriptContainerRef.current.children[activeSegmentIndex] as HTMLElement;
      if (activeEl) {
        // Only scroll if we are not manually hovering (optional refinement, but for now strict sync)
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSegmentIndex]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 relative">
      
      {/* 1. MEDIA PLAYER SECTION */}
      {audioUrl && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 animate-fade-in-up sticky top-20 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-800/90">
           <audio 
             ref={audioRef} 
             src={audioUrl} 
             onTimeUpdate={handleTimeUpdate} 
             onLoadedMetadata={handleLoadedMetadata}
             onEnded={() => setIsPlaying(false)}
             className="hidden"
           />
           <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-indigo-500/30"
              >
                 {isPlaying ? (
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                 ) : (
                   <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                 )}
              </button>
              
              <div className="flex-1">
                 <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max={duration || 0} 
                   value={currentTime} 
                   onChange={handleSeek}
                   className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"
                 />
              </div>
           </div>
        </div>
      )}

      {/* 2. TRANSCRIPT VIEWER (Collapsible) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up delay-100">
         <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
             <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conversation Transcript</h3>
             <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-mono">
                {data.transcription.length} turns
             </span>
         </div>
         <div 
           ref={transcriptContainerRef}
           className="max-h-80 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-900/10 custom-scrollbar"
         >
            {data.transcription.map((t, idx) => {
                const isActive = idx === activeSegmentIndex;
                return (
                    <div 
                      key={idx} 
                      className={`flex gap-3 text-sm group transition-all duration-300 ${t.speaker === 'SALES_REP' ? 'flex-row-reverse' : ''} ${isActive ? 'scale-[1.01]' : 'opacity-80 hover:opacity-100'}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm transition-colors ${
                             isActive 
                             ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 dark:ring-indigo-900' 
                             : (t.speaker === 'SALES_REP' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300')
                        }`}>
                            {t.speaker === 'SALES_REP' ? 'REP' : 'PRO'}
                        </div>
                        <div className={`max-w-[85%] rounded-2xl p-3 relative transition-colors duration-300 ${
                            isActive 
                            ? 'bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 shadow-md ring-1 ring-indigo-100 dark:ring-indigo-800' 
                            : (t.speaker === 'SALES_REP' ? 'bg-indigo-50/50 dark:bg-indigo-900/10 text-slate-800 dark:text-slate-200 rounded-tr-none' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-600 rounded-tl-none')
                        }`}>
                            <div className={`flex items-center gap-2 mb-1 ${t.speaker === 'SALES_REP' ? 'flex-row-reverse' : ''}`}>
                                 <button 
                                   onClick={() => handleTranscriptClick(t.timestamp)}
                                   className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                      isActive 
                                      ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200' 
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500'
                                   }`}
                                 >
                                    {t.timestamp}
                                 </button>
                            </div>
                            <p className={`leading-relaxed ${isActive ? 'text-slate-900 dark:text-white font-medium' : ''}`}>
                               {t.text}
                            </p>
                        </div>
                    </div>
                );
            })}
         </div>
      </div>

      {/* 3. CONTEXT & VIEW TABS */}
      <div className="flex flex-col md:flex-row gap-6 animate-fade-in-up delay-200">
        {/* Context Card */}
        <div className="md:w-1/3 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 h-fit">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Deal Context</h3>
           <div className="space-y-4">
              <div>
                 <span className="text-xs text-slate-500">Product/Service</span>
                 <p className="font-bold text-slate-900 dark:text-white">{data.context.product || 'Not detected'}</p>
              </div>
              <div className="flex justify-between">
                 <div>
                    <span className="text-xs text-slate-500">Price Point</span>
                    <p className="font-bold text-slate-900 dark:text-white">{data.context.price || 'Unknown'}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-xs text-slate-500">Prospect Role</span>
                    <p className="font-bold text-slate-900 dark:text-white">{data.context.prospectRole || 'Unknown'}</p>
                 </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                 <span className="text-xs text-slate-500">Detected Persona</span>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                       {data.context.matchedPersona || 'General Lead'}
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Dynamic Views */}
        <div className="md:w-2/3 flex flex-col">
           {/* Tab Bar & Action Buttons */}
           <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl self-start">
                  <button 
                     onClick={() => setActiveTab('REP')}
                     className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${getTabStyle('REP')}`}
                  >
                     Rep View
                  </button>
                  {(userRole === 'MANAGER' || userRole === 'EXECUTIVE') && (
                      <button 
                         onClick={() => setActiveTab('MANAGER')}
                         className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${getTabStyle('MANAGER')}`}
                      >
                         Manager View
                      </button>
                  )}
                  {userRole === 'EXECUTIVE' && (
                      <button 
                         onClick={() => setActiveTab('EXECUTIVE')}
                         className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${getTabStyle('EXECUTIVE')}`}
                      >
                         Executive View
                      </button>
                  )}
              </div>

              <button 
                onClick={() => setIsEmailModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-all shadow-sm active:scale-95"
              >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                 Email Summary
              </button>
           </div>

           {/* Content Area */}
           <div className="min-h-[500px]">
              {activeTab === 'REP' && <RepDashboard data={data.repView} />}
              {activeTab === 'MANAGER' && <ManagerDashboard managerData={data.managerView} repData={data.repView} />}
              {activeTab === 'EXECUTIVE' && <ExecutiveDashboard execData={data.executiveView} managerData={data.managerView} />}
           </div>
        </div>
      </div>
      
      <EmailSummaryModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        data={data}
        userEmail={userEmail}
      />
    </div>
  );
};

export default ReportView;
