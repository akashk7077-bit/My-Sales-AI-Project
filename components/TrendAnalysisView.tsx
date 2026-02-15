import React from 'react';
import { TrendAnalysis } from '../types';

interface TrendAnalysisViewProps {
  data: TrendAnalysis;
  callCount: number;
}

const TrendAnalysisView: React.FC<TrendAnalysisViewProps> = ({ data, callCount }) => {
  
  const getPromotabilityColor = (status: string) => {
    switch (status) {
      case 'Yes': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Not Yet': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Too Early': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Improving': return '↗️';
      case 'Declining': return '↘️';
      case 'Stagnant': return '➡️';
      default: return '〰️';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
             <h2 className="text-3xl font-bold mb-2">Performance Pattern Analysis</h2>
             <p className="text-indigo-200">Based on data from {callCount} analyzed calls</p>
          </div>
          <div className={`px-6 py-3 rounded-lg border-2 font-bold text-xl uppercase ${getPromotabilityColor(data.promotability.status)} bg-opacity-90`}>
             Promotable? {data.promotability.status}
          </div>
        </div>
        <p className="mt-4 text-sm bg-white/10 p-4 rounded-lg border border-white/20">
          <span className="font-bold opacity-75 mr-2">VERDICT:</span>
          {data.promotability.reason}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Consistent Strengths */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <div className="flex items-center gap-3 mb-4 border-b pb-3">
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">💪</div>
             <h3 className="text-lg font-bold text-slate-800">Consistent Strengths</h3>
           </div>
           <div className="space-y-4">
             {data.strengths.map((item, idx) => (
               <div key={idx} className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                 <h4 className="font-bold text-emerald-800 mb-1">{item.strength}</h4>
                 <p className="text-sm text-slate-600 italic">"{item.evidence}"</p>
               </div>
             ))}
           </div>
        </div>

        {/* Repeating Mistakes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <div className="flex items-center gap-3 mb-4 border-b pb-3">
             <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-xl">🔁</div>
             <h3 className="text-lg font-bold text-slate-800">Repeating Mistakes</h3>
           </div>
           <div className="space-y-4">
             {data.mistakes.map((item, idx) => (
               <div key={idx} className="bg-rose-50/50 p-4 rounded-lg border border-rose-100">
                 <h4 className="font-bold text-rose-800 mb-1">{item.mistake}</h4>
                 <p className="text-sm text-slate-600 italic">"{item.examples}"</p>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Skill Trajectory & Coaching */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Skill Trajectory */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:col-span-1">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Skill Trajectory</h3>
           <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{getTrendIcon(data.improvement.trend)}</span>
              <div>
                <span className="text-2xl font-bold text-slate-900 block">{data.improvement.trend}</span>
                <span className="text-xs text-slate-500">Over last {callCount} calls</span>
              </div>
           </div>
           <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
             {data.improvement.proof}
           </p>
        </div>

        {/* High ROI Coaching Focus */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-indigo-100 p-6 md:col-span-2 relative overflow-hidden">
           <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
             HIGH ROI FOCUS
           </div>
           <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             One Thing to Fix
           </h3>
           <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h4 className="font-bold text-xl text-slate-800 mb-2">{data.coachingFocus.area}</h4>
                <p className="text-slate-600 text-sm">Targeting this specific area will yield the highest improvement in close rates for this rep.</p>
              </div>
              <div className="flex-1 bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-center">
                 <div>
                   <span className="block text-xs font-bold text-indigo-600 uppercase mb-1">Expected ROI</span>
                   <p className="text-indigo-900 font-medium">{data.coachingFocus.roi}</p>
                 </div>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default TrendAnalysisView;
