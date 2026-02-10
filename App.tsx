import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ReportView from './components/ReportView';
import KnowledgeBase from './components/KnowledgeBase';
import { analyzeAudio } from './services/geminiService';
import { AnalysisData, Persona, ObjectionTemplate } from './types';

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
  const [activeView, setActiveView] = useState<'upload' | 'knowledge'>('upload');
  
  // Knowledge Base State
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_PERSONAS);
  const [objections, setObjections] = useState<ObjectionTemplate[]>(DEFAULT_OBJECTIONS);

  // Analysis State
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      // Pass the current personas and objections to the analysis service
      const data = await analyzeAudio(file, personas, objections);
      setAnalysisData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze the call. Please ensure your API Key is valid and the file is a supported audio format (mp3, wav, m4a).");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveView('upload'); setAnalysisData(null); }}>
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">SalesAuditor AI</span>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => { setActiveView('upload'); setAnalysisData(null); }}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${activeView === 'upload' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Call Analysis
              </button>
              <button
                onClick={() => setActiveView('knowledge')}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${activeView === 'knowledge' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Knowledge Base
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">
        
        {activeView === 'knowledge' && (
          <KnowledgeBase 
            personas={personas} 
            setPersonas={setPersonas} 
            objections={objections} 
            setObjections={setObjections} 
          />
        )}

        {activeView === 'upload' && !analysisData && !isLoading && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-8 fade-in">
             <div className="text-center max-w-2xl">
               <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
                 Turn Sales Calls into <span className="text-indigo-600">Revenue Science</span>
               </h1>
               <p className="text-lg text-slate-600">
                 Upload your call recording. Get brutally honest, AI-driven feedback on discovery, objection handling, and closing readiness in seconds.
               </p>
             </div>
             <FileUpload onFileSelected={handleFileSelected} isLoading={isLoading} />
             {error && (
               <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm max-w-md text-center">
                 {error}
               </div>
             )}
          </div>
        )}

        {activeView === 'upload' && isLoading && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-6">
            <div className="relative w-24 h-24">
               <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
               <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">Auditing Sales Call...</h3>
              <p className="text-slate-500 text-sm">Transcribing audio • Identifying personas • Checking objection library</p>
            </div>
          </div>
        )}

        {activeView === 'upload' && analysisData && (
          <div className="max-w-7xl mx-auto">
             <button
               onClick={() => setAnalysisData(null)}
               className="mb-6 flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
             >
               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               Analyze Another Call
             </button>
             <ReportView data={analysisData} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
