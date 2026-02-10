import React from 'react';
import { AnalysisData } from '../types';
import ScoreCard from './ScoreCard';

interface ReportViewProps {
  data: AnalysisData;
}

const ReportView: React.FC<ReportViewProps> = ({ data }) => {
  // Helper for Deal Health Badge
  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'HOT': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'WARM': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'COLD': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'UNQUALIFIED': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in">

      {/* Header Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analysis Complete</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
             <span className="text-slate-500 text-sm">{data.context.purpose}</span>
             <span className="text-slate-300">•</span>
             <span className="text-slate-500 text-sm">{data.context.prospectRole || 'Unknown Role'}</span>
             
             {data.context.matchedPersona && data.context.matchedPersona !== 'Unknown' && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Persona: {data.context.matchedPersona}
                  </span>
                </>
             )}
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg border-2 font-bold text-lg ${getHealthBadge(data.dealHealth.status)}`}>
          {data.dealHealth.status} DEAL
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Main Analysis */}
        <div className="lg:col-span-2 space-y-6">

          {/* Coaching Insights (Priority) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-indigo-900 px-6 py-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Coaching Insights
              </h3>
            </div>
            <div className="p-6 space-y-6">
               <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Replicable Behaviors (Keep)</h4>
                  <ul className="space-y-2">
                    {data.coaching.right.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                         <span className="text-emerald-500 mt-0.5">✓</span> {item}
                      </li>
                    ))}
                  </ul>
               </div>

               <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Areas for Improvement (Fix)</h4>
                  <ul className="space-y-2">
                    {data.coaching.wrong.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                         <span className="text-rose-500 mt-0.5">✗</span> {item}
                      </li>
                    ))}
                  </ul>
               </div>

               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Recommended Rephrase</h4>
                  <p className="text-slate-800 italic font-medium">"{data.coaching.rewrite}"</p>
               </div>

               <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2">The Missed Question</h4>
                  <p className="text-indigo-900 font-medium">"{data.coaching.missedQuestion}"</p>
               </div>
            </div>
          </div>

          {/* Framework Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <h3 className="text-lg font-bold text-slate-900 mb-4">Framework Breakdown</h3>

             <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <h4 className="font-semibold text-slate-800 mb-3 border-b pb-2">Discovery</h4>
                   <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex justify-between">
                        <span>Pain Identified:</span>
                        <span className={data.framework.discovery.painPointsIdentified ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                          {data.framework.discovery.painPointsIdentified ? "Yes" : "No"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Open-Ended Qs:</span>
                        <span className={data.framework.discovery.openEndedQuestions ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                          {data.framework.discovery.openEndedQuestions ? "Yes" : "No"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Business Impact:</span>
                         <span className={data.framework.discovery.businessImpactDiscussed ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                          {data.framework.discovery.businessImpactDiscussed ? "Yes" : "No"}
                        </span>
                      </li>
                   </ul>
                   <p className="mt-2 text-xs text-slate-500">{data.framework.discovery.summary}</p>
                </div>

                <div>
                   <h4 className="font-semibold text-slate-800 mb-3 border-b pb-2">Control & Flow</h4>
                   <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex justify-between">
                        <span>Talk Ratio (Rep/Pro):</span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{data.framework.control.talkTimeRatio}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Dynamic:</span>
                        <span className="font-medium">{data.framework.control.leadOrReact}</span>
                      </li>
                   </ul>
                </div>
             </div>

             {/* Objections */}
             <div className="mt-6">
               <h4 className="font-semibold text-slate-800 mb-3 border-b pb-2">Objection Handling</h4>
               {data.framework.objections.length === 0 ? (
                 <p className="text-sm text-slate-400 italic">No major objections detected.</p>
               ) : (
                 <div className="space-y-3">
                   {data.framework.objections.map((obj, idx) => (
                     <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100 relative">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold uppercase bg-slate-200 text-slate-600 px-2 py-1 rounded">{obj.type}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${obj.responseQuality === 'Strong' ? 'bg-emerald-100 text-emerald-700' : obj.responseQuality === 'Average' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {obj.responseQuality} Response
                          </span>
                       </div>
                       
                       <div className="mb-2">
                         <span className="text-xs text-slate-400 uppercase font-bold">Prospect Said:</span>
                         <p className="text-sm text-slate-800 italic">"{obj.quote}"</p>
                       </div>

                       {obj.suggestedLibraryResponse ? (
                         <div className="mt-3 bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
                            <div className="flex items-center gap-1 mb-1">
                                <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" /></svg>
                                <span className="text-xs font-bold text-indigo-700 uppercase">Library Match</span>
                            </div>
                            <p className="text-sm text-indigo-900 font-medium">"{obj.suggestedLibraryResponse}"</p>
                         </div>
                       ) : (
                        <div className="mt-2">
                           <span className="text-xs text-slate-400 uppercase font-bold">Missed Opportunity:</span>
                           <p className="text-xs text-slate-600">{obj.missedOpportunity}</p>
                        </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>

          {/* Transcript Accordion (Simplified) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-slate-800 hover:bg-slate-50">
                   <span>Full Transcription</span>
                   <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                   </span>
                </summary>
                <div className="text-slate-600 border-t border-slate-100 max-h-96 overflow-y-auto custom-scrollbar bg-slate-50 p-6 space-y-4">
                  {data.transcription.map((seg, idx) => (
                    <div key={idx} className={`flex gap-4 ${seg.speaker === 'SALES_REP' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${seg.speaker === 'SALES_REP' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {seg.speaker === 'SALES_REP' ? 'REP' : 'PRO'}
                      </div>
                      <div className={`flex-1 p-3 rounded-lg text-sm ${seg.speaker === 'SALES_REP' ? 'bg-white border border-indigo-100 text-right' : 'bg-white border border-emerald-100'}`}>
                        {seg.text}
                      </div>
                    </div>
                  ))}
                </div>
             </details>
          </div>

        </div>

        {/* RIGHT COLUMN: Scores & Summary */}
        <div className="space-y-6">

           {/* Overall Score */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <h3 className="text-slate-500 font-semibold uppercase tracking-wider text-sm mb-4">Overall Effectiveness</h3>
              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent"
                       strokeDasharray={351.86}
                       strokeDashoffset={351.86 - (351.86 * data.scores.overall) / 10}
                       className={data.scores.overall >= 8 ? 'text-emerald-500' : data.scores.overall >= 5 ? 'text-amber-500' : 'text-red-500'}
                    />
                 </svg>
                 <span className="absolute text-4xl font-bold text-slate-800">{data.scores.overall}</span>
              </div>
              <p className="mt-4 text-sm text-slate-500 leading-relaxed text-left">
                {data.scores.justification}
              </p>
           </div>

           {/* Score Breakdown */}
           <div className="grid grid-cols-2 gap-3">
              <ScoreCard label="Discovery" score={data.scores.discovery} />
              <ScoreCard label="Objections" score={data.scores.objectionHandling} />
              <ScoreCard label="Value" score={data.scores.valueArticulation} />
              <ScoreCard label="Closing" score={data.scores.closingReadiness} />
           </div>

           {/* Executive Summary */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Manager Summary</h3>
              <ul className="space-y-3">
                {data.managerSummary.map((point, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-indigo-400 mt-1.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
           </div>

           {/* Context Metadata */}
           <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
             <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Detected Context</h4>
             <dl className="space-y-2 text-sm">
               <div>
                 <dt className="text-slate-500">Product</dt>
                 <dd className="font-medium text-slate-800">{data.context.product || 'N/A'}</dd>
               </div>
               <div>
                 <dt className="text-slate-500">Price Mentioned</dt>
                 <dd className="font-medium text-slate-800">{data.context.price || 'None'}</dd>
               </div>
               <div>
                 <dt className="text-slate-500">Authority</dt>
                 <dd className="font-medium text-slate-800 truncate" title={data.context.authoritySignals}>{data.context.authoritySignals || 'Unclear'}</dd>
               </div>
             </dl>
           </div>

        </div>

      </div>
    </div>
  );
};

export default ReportView;
