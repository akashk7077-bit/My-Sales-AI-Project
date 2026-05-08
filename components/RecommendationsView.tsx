
import React from 'react';
import { AnalysisData } from '../types';

interface RecommendationsViewProps {
  data: AnalysisData;
  repName: string;
}

const RecommendationsView: React.FC<RecommendationsViewProps> = ({ data, repName }) => {
  const managerSummary = data?.managerSummary || [];
  const coaching = data?.coaching || { rewrite: '', missedQuestion: '', callKillers: [], wrong: [] };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center relative overflow-hidden transition-colors duration-500 animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Coaching & Recommendations</h2>
        <p className="text-slate-500 dark:text-slate-400">Actionable intelligence for <span className="font-bold text-indigo-600 dark:text-indigo-400">{repName}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* The Brutal Truth (Manager Summary) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:col-span-2 transition-colors duration-500 animate-fade-in-up delay-100">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">The Brutal Truth</h3>
           </div>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-lg border border-slate-100 dark:border-slate-700 card-hover">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Manager Summary</h4>
                 <ul className="space-y-3">
                   {managerSummary.slice(0, 4).map((point, i) => (
                     <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                       <span className="text-slate-400 font-bold">•</span>
                       <span className="leading-relaxed">{point}</span>
                     </li>
                   ))}
                 </ul>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-lg border border-slate-100 dark:border-slate-700 card-hover">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Revenue Risks</h4>
                 <ul className="space-y-3">
                   {managerSummary.slice(4).map((point, i) => (
                     <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                       <span className="text-rose-400 font-bold">⚠️</span>
                       <span className="leading-relaxed">{point}</span>
                     </li>
                   ))}
                 </ul>
              </div>
           </div>
        </div>

        {/* Script Doctor (Rewrite) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-500 animate-fade-in-up delay-200 hover:shadow-lg">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Script Doctor</h3>
           </div>
           <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Instead of the weak response used in the call, here is a revenue-generating alternative:</p>
           <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/50 italic text-indigo-900 dark:text-indigo-200 font-medium text-lg leading-relaxed shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 transform transition-transform group-hover:scale-y-110"></div>
              "{coaching.rewrite}"
           </div>
        </div>

        {/* Missed Opportunity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-500 animate-fade-in-up delay-300 hover:shadow-lg">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">The Missed Question</h3>
           </div>
           <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">The one question that would have cracked the deal open:</p>
           <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 font-bold text-lg leading-relaxed shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 transform transition-transform group-hover:scale-y-110"></div>
              "{coaching.missedQuestion}"
           </div>
        </div>

        {/* Call Killers - Expanded */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:col-span-2 transition-colors duration-500 animate-fade-in-up delay-400">
            <div className="bg-rose-600 -mx-6 -mt-6 px-6 py-4 rounded-t-xl flex justify-between items-center mb-6 shadow-md">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Deal Killers
                </h3>
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm">Critical Issues</span>
            </div>
            
            {coaching.callKillers && coaching.callKillers.length > 0 ? (
                <div className="space-y-4">
                  {coaching.callKillers.map((killer: any, i: number) => (
                    <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border border-rose-100 dark:border-rose-900/50 rounded-lg hover:bg-rose-50/30 dark:hover:bg-rose-900/20 transition-all duration-300 card-hover">
                       <div className="md:w-1/3">
                          <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">The Mistake</span>
                          <p className="mt-1 text-slate-800 dark:text-slate-200 italic text-sm">"{killer.quote}"</p>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1 block">{killer.timestamp}</span>
                       </div>
                       <div className="md:w-1/3">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Why it Hurt</span>
                          <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm">{killer.harm}</p>
                       </div>
                       <div className="md:w-1/3">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">The Fix</span>
                          <p className="mt-1 text-emerald-800 dark:text-emerald-300 font-medium text-sm">{killer.betterAlternative}</p>
                       </div>
                    </div>
                  ))}
                </div>
            ) : (
                <p className="text-center text-slate-500 py-8">No specific deal killers detected. Solid execution.</p>
            )}
        </div>
        
        {/* Actionable Advice */}
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:col-span-2 transition-colors duration-500 animate-fade-in-up delay-500">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Immediate Action Plan</h3>
            <div className="grid md:grid-cols-2 gap-4">
               {coaching.wrong && coaching.wrong.map((item: string, i: number) => (
                   <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg card-hover">
                       <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                           {i + 1}
                       </div>
                       <p className="text-slate-700 dark:text-slate-300 text-sm">{item}</p>
                   </div>
               ))}
            </div>
         </div>

      </div>
    </div>
  );
};

export default RecommendationsView;
