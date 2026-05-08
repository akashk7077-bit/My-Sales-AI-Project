
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import FileUpload from './components/FileUpload';
import ReportView from './components/ReportView';
import KnowledgeBase from './components/KnowledgeBase';
import HistoryView from './components/HistoryView';
import RecommendationsView from './components/RecommendationsView';
import RoleSelection from './components/RoleSelection';
import AIAnalysisLoader from './components/AIAnalysisLoader';
import WelcomeScreen from './components/WelcomeScreen';
import Logo from './components/Logo';
import { AIUsageIndicator } from './components/AIUsageIndicator';
import { analyzeCall, generateCombinedReview } from './services/geminiService';
import { AnalysisData, Persona, ObjectionTemplate, CallRecord, UserRole, UserProfile } from './types';

// Default Data
const DEFAULT_PERSONAS: Persona[] = [
  {
    id: '1',
    name: 'Enterprise Erin',
    role: 'VP of Operations',
    industry: 'SaaS / Tech',
    companySize: '1000+ employees',
    painPoints: ['Inefficient workflows', 'Security compliance', 'Scalability issues']
  },
  {
    id: '2',
    name: 'SMB Sam',
    role: 'Founder / CEO',
    industry: 'Retail',
    companySize: '1-50 employees',
    painPoints: ['Cost sensitivity', 'Immediate ROI', 'Ease of use']
  },
  {
    id: '3',
    name: 'Mid-Market Mary',
    role: 'Director of Sales',
    industry: 'Healthcare Technology',
    companySize: '50-500 employees',
    painPoints: ['Integration Challenges', 'Data Security Concerns', 'HIPAA Compliance']
  }
];

const DEFAULT_OBJECTIONS: ObjectionTemplate[] = [
  {
    id: '1',
    category: 'Price',
    trigger: 'Too expensive / Budget issue',
    response: "I understand budget is a factor. Let's look at the ROI. Our customers typically save 20% in operational costs within 3 months, which more than pays for the license."
  },
  {
    id: '2',
    category: 'Timing',
    trigger: 'Call me back next quarter',
    response: "I can certainly do that, but typically waiting only compounds the current inefficiency. If we start a small pilot now, you'll be fully ready to scale when the new quarter hits."
  }
];

function App() {
  // Auth & Access Control State
  const [showWelcome, setShowWelcome] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authStep, setAuthStep] = useState<'ROLE' | 'APP'>('ROLE');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // App State
  const [activeView, setActiveView] = useState<'upload' | 'history' | 'report' | 'recommendations' | 'knowledge'>('upload');
  const [darkMode, setDarkMode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Knowledge Base State
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [objections, setObjections] = useState<ObjectionTemplate[]>(DEFAULT_OBJECTIONS);

  // Data State
  const [callHistory, setCallHistory] = useState<CallRecord[]>(() => {
      const saved = localStorage.getItem('salesAuditorHistory');
      if (!saved) return [];
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse call history from localStorage", e);
        return [];
      }
  });
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Persistence Effect
  useEffect(() => {
      localStorage.setItem('salesAuditorHistory', JSON.stringify(callHistory.slice(0, 5)));
  }, [callHistory]);

  // Analysis State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Processing...');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Derived State
  const currentRecord = callHistory.find(r => r.id === selectedRecordId) || null;

  // Theme Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Notification Timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Trigger Confetti on Success
  useEffect(() => {
    if (loadingStatus === 'Analysis Complete!') {
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899']
        });
    }
  }, [loadingStatus]);

  // --- ACCESS CONTROL HANDLERS ---

  const handleRoleSelect = (role: UserRole) => {
    // Directly log in as generic user for that role (bypassing form)
    const profile: UserProfile = {
        name: 'Demo User',
        company: 'Sales Team',
        email: 'demo@example.com',
        role: role,
        timestamp: new Date().toISOString()
    };
    
    setUserProfile(profile);
    setSelectedRole(role);
    setAuthStep('APP');
    setNotification(`Welcome! Accessing as ${role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')}`);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to exit? You will need to re-verify to access the dashboard.")) {
        setUserProfile(null);
        setSelectedRole(null);
        setAuthStep('ROLE');
        setActiveView('upload');
    }
  };

  // --- ANALYSIS HANDLERS ---

  const processAnalysis = async (input: File | string, repNameFallback: string, fileName?: string, audioUrl?: string) => {
    setIsLoading(true);
    setLoadingStatus('Initializing audio processing...');
    setLoadingProgress(0);
    setError(null);

    try {
      const data = await analyzeCall(
        input, 
        personas, 
        objections, 
        (status, progress) => {
             setLoadingStatus(status);
             setLoadingProgress(progress);
        }
      );
      
      // Update usage
      const today = new Date().toISOString().split('T')[0];
      const count = localStorage.getItem(`transcriptions_${today}`) || 0;
      localStorage.setItem(`transcriptions_${today}`, (parseInt(count.toString()) + 1).toString());
      
      setLoadingStatus('Analysis Complete!');
      setLoadingProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 800)); 

      const detectedName = data.context?.extractedRepName;
      const finalRepName = (detectedName && detectedName !== "Sales Representative") 
        ? detectedName 
        : "Sales Representative";

      const newRecord: CallRecord = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(),
          repName: finalRepName,
          fileName: fileName || 'Transcript Paste',
          analysis: data,
          audioUrl: audioUrl 
      };

      setCallHistory(prev => [newRecord, ...prev].slice(0, 5));
      
      // AUTO-LEARN: Add discovered objections to global state
      if (data.discoveredObjections && data.discoveredObjections.length > 0) {
         const newObjections = data.discoveredObjections.map(obj => ({
            ...obj,
            id: Date.now().toString() + Math.random().toString().slice(2, 5) // Unique IDs
         }));
         
         setObjections(prev => [...prev, ...newObjections]);
         setNotification(`${newObjections.length} new objections auto-added to Knowledge Base!`);
      }

      setSelectedRecordId(newRecord.id);
      setActiveView('report');

    } catch (err) {
      console.error(err);
      setError("Failed to analyze the call. Please ensure your API Key is valid and try again.");
    } finally {
      setIsLoading(false);
      setLoadingStatus('Processing...');
      setLoadingProgress(0);
    }
  };

  const handleInputSelected = async (input: File[] | string, type: 'audio' | 'text') => {
    if (type === 'audio' && Array.isArray(input)) {
        await processMultipleAnalyses(input);
    } else if (type === 'text' && typeof input === 'string') {
        await processAnalysis(input, "Sales Representative", "Pasted Transcript", undefined);
    }
  };

  const processMultipleAnalyses = async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    const newRecords: CallRecord[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setLoadingStatus(`Processing file ${i + 1} of ${files.length}: ${file.name}...`);
        setLoadingProgress(0);
        
        const audioUrl = URL.createObjectURL(file);
        const data = await analyzeCall(
          file, 
          personas, 
          objections, 
          (status, progress) => {
               setLoadingStatus(`File ${i + 1}/${files.length} - ${status}`);
               setLoadingProgress(progress);
          }
        );
        
        // Update usage
        const today = new Date().toISOString().split('T')[0];
        const count = localStorage.getItem(`transcriptions_${today}`) || 0;
        localStorage.setItem(`transcriptions_${today}`, (parseInt(count.toString()) + 1).toString());
        
        const detectedName = data.context?.extractedRepName;
        const finalRepName = (detectedName && detectedName !== "Sales Representative") 
          ? detectedName 
          : "Sales Representative";

        const newRecord: CallRecord = {
            id: Date.now().toString() + Math.random().toString().slice(2, 5),
            date: new Date().toLocaleDateString(),
            repName: finalRepName,
            fileName: file.name,
            analysis: data,
            audioUrl: audioUrl 
        };
        
        newRecords.push(newRecord);

        // AUTO-LEARN: Add discovered objections to global state
        if (data.discoveredObjections && data.discoveredObjections.length > 0) {
           const newObjections = data.discoveredObjections.map(obj => ({
              ...obj,
              id: Date.now().toString() + Math.random().toString().slice(2, 5)
           }));
           
           setObjections(prev => {
               const combined = [...prev, ...newObjections];
               // Deduplicate if needed, or just add
               return combined;
           });
           setNotification(`${newObjections.length} new objections auto-added to Knowledge Base!`);
        }
      }
      
      let combinedAnalysisData = null;
      let finalRecords = [...newRecords];
      
      // If multiple files, do a combined analysis
      if (files.length > 1) {
          setLoadingStatus(`Generating combined review for ${files.length} calls...`);
          setLoadingProgress(50);
          
          try {
             // Pass the collected analysis data to generate a combined review
             combinedAnalysisData = await generateCombinedReview(newRecords.map(r => r.analysis));
             
             const combinedRecord: CallRecord = {
                 id: Date.now().toString() + "-combined",
                 date: new Date().toLocaleDateString(),
                 repName: "Combined Team Review",
                 fileName: `${files.length} Calls Batch Analysis`,
                 analysis: combinedAnalysisData,
             };
             finalRecords = [combinedRecord, ...finalRecords];
          } catch (combErr) {
             console.error("Combined analysis failed", combErr);
             setNotification("Individual analyses complete, but combined review failed.");
          }
      }
      
      setCallHistory(prev => {
          const updated = [...finalRecords, ...prev];
          return updated.slice(0, 50); // Keep more records since batch uploads
      });
      setSelectedRecordId(finalRecords[0].id);
      setActiveView('report');
      setLoadingStatus('Analysis Complete!');
      setLoadingProgress(100);
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
    } catch (err) {
      console.error("Batch processing error", err);
      setError("Failed to analyze one or more calls. Please ensure your API Key is valid and try again.");
    } finally {
      setIsLoading(false);
      setLoadingStatus('Processing...');
      setLoadingProgress(0);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if(window.confirm('Are you sure you want to delete this record?')) {
        setCallHistory(prev => prev.filter(r => r.id !== id));
        if (selectedRecordId === id) {
            setSelectedRecordId(null);
            setActiveView('history');
        }
    }
  };

  const handleUpdateRecord = (id: string, updates: Partial<CallRecord>) => {
      setCallHistory(prev => prev.map(record => 
          record.id === id ? { ...record, ...updates } : record
      ));
  };

  const handleViewReport = (record: CallRecord) => {
      setSelectedRecordId(record.id);
      setActiveView('report');
  };

  const handleViewRecommendations = (record: CallRecord) => {
      setSelectedRecordId(record.id);
      setActiveView('recommendations');
  };

  // --- RENDER FLOW ---

  if (showWelcome) {
    return <WelcomeScreen onComplete={() => setShowWelcome(false)} />;
  }

  if (authStep === 'ROLE') {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  // --- MAIN APP (PROTECTED) ---

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-500">
      
      {/* GLOBAL TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] bg-slate-900/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-slate-900 px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-up border border-slate-700/50 dark:border-slate-200/50 transition-all duration-300 hover:scale-105">
           <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
           <span className="text-sm font-semibold tracking-tight">{notification}</span>
        </div>
      )}

      {/* AMBIENT BACKGROUND EFFECTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] animate-gradient-xy opacity-70"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px] animate-gradient-xy opacity-70" style={{ animationDelay: '5s' }}></div>
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[80px] animate-pulse opacity-50"></div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-20"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 bg-glass border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 shadow-sm transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('upload')}>
              {/* Premium Brand Mark */}
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-slate-700 group-hover:scale-105 transition-all duration-300 animate-logo-breathe active:scale-95">
                <Logo className="w-6 h-6" />
              </div>
              
              <div className="flex flex-col">
                  <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white transition-colors leading-none">
                    SalesAuditor <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 font-extrabold">AI</span>
                  </span>
                  {userProfile && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Viewing as: <span className="text-indigo-600 dark:text-indigo-400">{userProfile.role}</span>
                      </span>
                  )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex space-x-1 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                <button
                  onClick={() => { setActiveView('upload'); setSelectedRecordId(null); }}
                  className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 ${activeView === 'upload' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                >
                  New Audit
                </button>
                <button
                  onClick={() => setActiveView('history')}
                  className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 ${activeView === 'history' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                >
                  History <span className="ml-1.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-[10px] px-1.5 py-0.5 rounded-full">{callHistory.length}</span>
                </button>
                {currentRecord && (activeView === 'report' || activeView === 'recommendations') && (
                    <>
                        <button
                          onClick={() => setActiveView('report')}
                          className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 ${activeView === 'report' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                        >
                          Analysis
                        </button>
                        <button
                          onClick={() => setActiveView('recommendations')}
                          className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 ${activeView === 'recommendations' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                        >
                          Coaching Plan
                        </button>
                    </>
                )}
                <button
                  onClick={() => setActiveView('knowledge')}
                  className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 ${activeView === 'knowledge' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                >
                  Knowledge Base
                </button>
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              
              {/* Logout */}
              <button 
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 transition-colors shadow-sm active:scale-95"
                title="Logout / Switch Role"
              >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 relative z-10">
        
        {activeView === 'knowledge' && (
          <div className="animate-fade-in">
            <KnowledgeBase 
              personas={personas} 
              setPersonas={setPersonas} 
              objections={objections} 
              setObjections={setObjections} 
            />
          </div>
        )}

        {activeView === 'history' && (
            <HistoryView 
                history={callHistory} 
                onViewReport={handleViewReport} 
                onViewRecommendations={handleViewRecommendations}
                onDeleteRecord={handleDeleteRecord}
                userRole={userProfile?.role}
            />
        )}

        {activeView === 'upload' && !isLoading && (
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center space-y-16 py-12 animate-slide-up">
             
             {/* HERO SECTION */}
             <div className="text-center max-w-4xl space-y-6 px-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  {userProfile?.role === 'REP' ? 'Rep Coaching Mode' : 'Manager Oversight Mode'}
               </div>
               <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                 AI-Powered Sales Coaching <br />
                 <span className="text-gradient-animated">& Revenue Intelligence</span>
               </h1>
               <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
                 {userProfile?.role === 'REP' 
                    ? "Get clear, actionable coaching after every call. Improve your win rate instantly." 
                    : "Analyze rep performance, identify coaching gaps, and forecast revenue risk with precision."
                 }
               </p>
             </div>

             {/* UPLOAD SECTION */}
             <div className="w-full max-w-2xl relative">
                {/* Decorative blobs behind upload */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>
                <FileUpload 
                  onInputSelected={handleInputSelected} 
                  isLoading={isLoading} 
                />
             </div>
             {error && (
               <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 text-sm max-w-md text-center font-medium shadow-sm animate-shake">
                 {error}
               </div>
             )}

          </div>
        )}

        {activeView === 'upload' && isLoading && (
            <AIAnalysisLoader status={loadingStatus} progress={loadingProgress} />
        )}

        {activeView === 'report' && currentRecord && (
          <div className="max-w-7xl mx-auto animate-fade-in">
             <div className="mb-8 flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-500">
               <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveView('history')}
                    className="flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to History
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <div className="flex flex-col">
                     <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Rep</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">{currentRecord.repName}</span>
                  </div>
               </div>
               <div className="flex gap-2">
                   <button 
                      onClick={() => setActiveView('recommendations')}
                      className="flex items-center text-sm font-bold text-white hover:text-indigo-50 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95"
                   >
                      View Coaching Plan
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                   </button>
               </div>
             </div>
             <ReportView 
                data={currentRecord.analysis} 
                onViewRecommendations={() => setActiveView('recommendations')}
                audioUrl={currentRecord.audioUrl}
                videoUrl={currentRecord.videoSummaryUrl}
                onUpdateRecord={(updates) => handleUpdateRecord(currentRecord.id, updates)}
                userRole={userProfile?.role}
                userEmail={userProfile?.email}
             />
          </div>
        )}

        {activeView === 'recommendations' && currentRecord && (
             <div className="max-w-7xl mx-auto animate-fade-in">
                 <div className="mb-8 flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-500">
                   <div className="flex items-center gap-4">
                       <button
                         onClick={() => setActiveView('report')}
                         className="flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                       >
                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                         Back to Report
                       </button>
                   </div>
                   <button 
                      onClick={() => setActiveView('history')}
                      className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                   >
                      View All History
                   </button>
                 </div>
                 <RecommendationsView 
                    data={currentRecord.analysis} 
                    repName={currentRecord.repName} 
                 />
             </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-12 mt-auto relative z-20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            &copy; 2025–2026 Akash Krishna. All rights reserved.
          </p>
          <AIUsageIndicator />
          <div className="flex justify-center items-center gap-4 opacity-70 mt-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-slate-400 dark:to-slate-600"></span>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
              Elite Sales Intelligence
            </p>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-slate-400 dark:to-slate-600"></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
