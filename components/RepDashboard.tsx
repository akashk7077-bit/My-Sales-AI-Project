
import React, { useState } from 'react';
import { RepView } from '../types';

interface RepDashboardProps {
  data: RepView;
}

const RepDashboard: React.FC<RepDashboardProps> = ({ data }) => {
  const [expandedSkill, setExpandedSkill] = useState<number | null>(null);

  // Defensive defaults to prevent crashes if analysis data is partial
  const d = data || {};
  const perf = d.performanceSnapshot || { totalScore: 0, summary: '', strongestSkill: '', damagingMistake: '' };
  const skillBreakdown = d.skillBreakdown || [];

  // Helper for score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (score >= 50) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Performance Snapshot Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
        <div className="md:col-span-1 card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/10 opacity-50 z-0 transition-opacity duration-500 group-hover:opacity-70"></div>
           <h3 className="relative z-10 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Total Score</h3>
           <div className="relative z-10 w-32 h-32 flex items-center justify-center mb-2">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351} strokeDashoffset={351} className="text-indigo-600 dark:text-indigo-400 transition-all duration-[1500ms] ease-out-expo animate-circular-progress" style={{ strokeDashoffset: 351 - ((perf.totalScore || 0) / 100) * 351 }} />
             </svg>
             <span className="absolute text-5xl font-black text-slate-900 dark:text-white tracking-tighter animate-scale-in">{perf.totalScore}</span>
           </div>
           <p className="relative z-10 text-sm font-medium text-slate-600 dark:text-slate-300 italic px-2 animate-fade-in delay-500 opacity-0" style={{ animationFillMode: 'forwards' }}>"{perf.summary}"</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
           {/* Strongest Skill */}
           <div className="card-hover bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-6 rounded-2xl flex flex-col justify-center animate-fade-in-up delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Superpower</h4>
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">{perf.strongestSkill}</p>
           </div>
           
           {/* Damaging Mistake */}
           <div className="card-hover bg-rose-50/50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 p-6 rounded-2xl flex flex-col justify-center animate-fade-in-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-lg text-rose-600 dark:text-rose-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <h4 className="font-bold text-rose-900 dark:text-rose-300">Biggest Leak</h4>
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">{perf.damagingMistake}</p>
           </div>
        </div>
      </div>

      {/* 2. Skill Breakdown Interactive List */}
      <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
         <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skill Breakdown & Fixes</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Click on a skill to reveal detailed feedback.</p>
         </div>
         <div className="divide-y divide-slate-100 dark:divide-slate-700">
             {skillBreakdown?.map((skill, idx) => {
               const isOpen = expandedSkill === idx;
               return (
                  <div 
                    key={idx} 
                    className={`transition-all duration-300 ${isOpen ? 'bg-slate-50/50 dark:bg-slate-700/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                  >
                     <div 
                       className="p-5 cursor-pointer flex items-center justify-between group select-none"
                       onClick={() => setExpandedSkill(isOpen ? null : idx)}
                     >
                        <div className="flex items-center gap-4">
                           {/* Prominent Score */}
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-transform duration-300 group-hover:scale-110 shadow-sm border ${getScoreColor(skill.score)}`}>
                              {skill.score}
                           </div>
                           <div>
                              <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{skill.skill}</h4>
                              <p className={`text-sm transition-colors ${isOpen ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                                 {isOpen ? 'Viewing Details' : skill.improvement}
                              </p>
                           </div>
                        </div>
                        <div className={`transform transition-transform duration-500 p-2 rounded-full ${isOpen ? 'rotate-180 bg-indigo-100 text-indigo-600' : 'text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-700'}`}>
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                     </div>
                     
                     {/* Animated Reveal */}
                     <div 
                       className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                     >
                        <div className="px-6 pb-6 pt-2">
                           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                              
                              <div className="flex gap-4">
                                 <div className="w-1 bg-indigo-500 rounded-full"></div>
                                 <div className="flex-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Evidence</span>
                                    <p className="text-slate-800 dark:text-slate-200 italic text-sm font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                       "{skill.evidence}"
                                    </p>
                                 </div>
                              </div>

                              <div className="flex gap-4">
                                 <div className="w-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                                 <div className="flex-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Reasoning</span>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                       {skill.reasoning}
                                    </p>
                                 </div>
                              </div>
                              
                              <div className="mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-xl shadow-lg flex gap-4 items-start transform transition-transform hover:scale-[1.01]">
                                 <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                 </div>
                                 <div>
                                    <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider block mb-1">Actionable Fix</span>
                                    <p className="font-medium leading-snug">
                                       {skill.improvement}
                                    </p>
                                 </div>
                              </div>

                           </div>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* 3. Missed Opportunities & Rewrites */}
      <div className="grid md:grid-cols-2 gap-6">
          <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-fade-in-up delay-400 opacity-0" style={{ animationFillMode: 'forwards' }}>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Missed Buying Signals</h3>
             {data.missedOpportunities?.length > 0 ? (
                <ul className="space-y-4">
                   {data.missedOpportunities?.map((opp, idx) => (
                      <li key={idx} className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30 hover:border-amber-300 transition-colors animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'forwards' }}>
                         <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded">{opp.signal}</span>
                         <p className="text-slate-800 dark:text-slate-200 italic my-2 font-medium">"{opp.quote}"</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{opp.context}</p>
                      </li>
                   ))}
                </ul>
             ) : <p className="text-slate-500 italic">No major missed signals detected.</p>}
          </div>

          <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-fade-in-up delay-400 opacity-0" style={{ animationFillMode: 'forwards' }}>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tactical Rewrites</h3>
             {data.callRewrite?.length > 0 ? (
                 <div className="space-y-6">
                    {data.callRewrite?.map((rw, idx) => (
                       <div key={idx} className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'forwards' }}>
                          <div className="mb-3">
                             <span className="text-xs font-bold text-rose-500 uppercase">You Said</span>
                             <p className="text-sm text-slate-500 dark:text-slate-400 italic line-through decoration-rose-500/30">"{rw.original}"</p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30 group-hover:shadow-sm transition-all">
                             <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Say This Instead</span>
                             <p className="text-sm text-emerald-900 dark:text-emerald-200 font-bold mt-1">"{rw.better}"</p>
                          </div>
                       </div>
                    ))}
                 </div>
             ) : <p className="text-slate-500 italic">No specific rewrites suggested.</p>}
          </div>
       </div>

      {/* 4. Section F: Best Recommended Sentences */}
      {data.bestRecommendedSentences && data.bestRecommendedSentences?.length > 0 && (
         <div className="card-hover bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-lg p-8 text-white animate-fade-in-up delay-500 opacity-0" style={{ animationFillMode: 'forwards' }}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
               <svg className="w-6 h-6 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
               Magic Sentences for Next Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {data.bestRecommendedSentences?.map((sentence, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300 hover:translate-x-1 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'forwards' }}>
                     <span className="text-indigo-200 font-bold mr-2 text-lg">{idx + 1}.</span>
                     <span className="font-medium text-white">"{sentence}"</span>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* 5. Section G: Next Call Prep */}
      {data.nextCallPreparationPlan && (
         <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 animate-fade-in-up delay-500 opacity-0" style={{ animationFillMode: 'forwards' }}>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
               Next Call Blueprint
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
               <div className="md:col-span-1 space-y-6">
                  <div className="animate-fade-in-up delay-100" style={{ animationFillMode: 'forwards' }}>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Objective</h4>
                     <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {data.nextCallPreparationPlan.objective}
                     </p>
                  </div>
                  <div className="animate-fade-in-up delay-200" style={{ animationFillMode: 'forwards' }}>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confidence Reset</h4>
                     <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                        "{data.nextCallPreparationPlan.confidenceReset}"
                     </p>
                  </div>
               </div>

               <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
                  <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-xl border border-rose-100 dark:border-rose-800/30 animate-fade-in-up delay-300 hover:shadow-md transition-shadow" style={{ animationFillMode: 'forwards' }}>
                     <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Risks to Avoid
                     </h4>
                     <ul className="space-y-2">
                        {data.nextCallPreparationPlan.topRisks?.map((risk, i) => (
                           <li key={i} className="text-sm text-rose-900 dark:text-rose-200 flex gap-2">
                              <span>•</span> {risk}
                           </li>
                        ))}
                     </ul>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800/30 animate-fade-in-up delay-400 hover:shadow-md transition-shadow" style={{ animationFillMode: 'forwards' }}>
                     <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Strategic Questions
                     </h4>
                     <ul className="space-y-2">
                        {data.nextCallPreparationPlan.strategicQuestions?.map((q, i) => (
                           <li key={i} className="text-sm text-emerald-900 dark:text-emerald-200 italic">
                              "{q}"
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 animate-fade-in-up delay-500" style={{ animationFillMode: 'forwards' }}>
               <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1">
                     <span className="text-xs font-bold text-slate-400 uppercase">Objection Prep</span>
                     <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{data.nextCallPreparationPlan.objectionStrategy}</p>
                  </div>
                  <div className="flex-1 md:text-right">
                     <span className="text-xs font-bold text-indigo-500 uppercase">The Closer</span>
                     <p className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mt-1">"{data.nextCallPreparationPlan.closingLine}"</p>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default RepDashboard;
