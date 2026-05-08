
import React, { useState } from 'react';
import { ManagerView, RepView } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

interface ManagerDashboardProps {
  managerData: ManagerView;
  repData: RepView;
}

const CustomRadarTooltip = ({ active, payload, coordinate }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-sm text-white p-4 rounded-xl shadow-2xl max-w-xs border border-slate-700 animate-fade-in z-50">
        <h4 className="font-bold text-indigo-400 mb-1 text-sm uppercase tracking-wider">{data.subject}</h4>
        <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-white">{data.score}</span>
            <span className="text-slate-400 text-sm">/100</span>
        </div>
        <div className="border-l-2 border-indigo-500 pl-3 my-2">
            <p className="text-xs text-slate-300 italic leading-relaxed">"{data.evidence}"</p>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 uppercase font-bold">Reasoning:</p>
        <p className="text-xs text-slate-400">{data.reasoning}</p>
      </div>
    );
  }
  return null;
};

const CustomRiskTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
             <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-xs z-50 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{data.name}</span>
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Risk Exposure: <span className="text-slate-900 dark:text-white font-bold">{data.risk}%</span>
                </div>
                <div className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 italic">
                    {data.reasoning ? `"${data.reasoning}"` : "Performance gap detected in this area."}
                </div>
             </div>
        )
    }
    return null;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ managerData, repData }) => {
  const [activeRisk, setActiveRisk] = useState<string | null>(null);

  // Defensive defaults to prevent crashes if analysis data is partial
  const md = managerData || {};
  const rd = repData || { skillBreakdown: [] };
  const skillBreakdown = rd.skillBreakdown || [];
  const riskSignals = md.revenueRiskSignals || [];
  const competitorAnalysis = md.competitorAnalysis || [];
  const riskAssessment = md.dealRiskAssessment || { probability: 0, riskLevel: 'N/A', primaryDriver: 'N/A' };
  const coachingPriority = md.coachingPriority || { focusArea: 'N/A', level: 'N/A' };
  const patternAnalysis = md.patternAnalysis || { issueType: 'N/A', rootCause: 'N/A' };
  const coachingPlan = md.coachingPlan || { drills: [], roleplay: '', kpi: '', trainingPlan: [] };

  // Enhanced Data Mappings including evidence for tooltips
  const skillData = skillBreakdown.map(skill => ({
    subject: skill.skill,
    score: skill.score,
    evidence: skill.evidence,
    reasoning: skill.reasoning,
    fullMark: 100
  }));

  // Create Revenue Risk Data (Inverted Skills + Explicit Risks)
  const riskBarData = skillBreakdown.map(skill => ({
    name: skill.skill,
    risk: 100 - skill.score,
    reasoning: skill.reasoning,
    color: (100 - skill.score) > 70 ? '#f43f5e' : (100 - skill.score) > 40 ? '#f59e0b' : '#10b981'
  })).sort((a, b) => b.risk - a.risk);

  // Gauge Data for Risk Level
  const gaugeValue = riskAssessment.probability || 0;
  const gaugeColor = gaugeValue < 30 ? '#f43f5e' : gaugeValue < 70 ? '#f59e0b' : '#10b981';

  return (
    <div className="space-y-8">
      
      {/* 1. Control Panel Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
        {/* Deal Risk Gauge */}
        <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <h3 className="text-sm font-bold text-slate-500 uppercase mb-2 relative z-10">Deal Health Probability</h3>
           <div className="relative w-48 h-24 mt-4 overflow-hidden z-10">
               {/* Half Donut using CSS/SVG for simpler gauge than Recharts Pie for half-circle */}
               <svg viewBox="0 0 100 50" className="w-full h-full transform transition-all duration-1000">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    stroke={gaugeColor} 
                    strokeWidth="10" 
                    strokeLinecap="round"
                    strokeDasharray="126"
                    strokeDashoffset={126 - (126 * gaugeValue) / 100}
                    className="transition-all duration-1000 ease-out drop-shadow-lg"
                    style={{ transitionDuration: '1.5s', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
               </svg>
               <div className="absolute bottom-0 left-0 w-full text-center">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter drop-shadow-sm animate-scale-in">{gaugeValue}%</span>
               </div>
           </div>
           <p className="mt-4 text-center font-medium text-slate-600 dark:text-slate-300 relative z-10">
             {riskAssessment.riskLevel} Risk
           </p>
           <div className="mt-2 text-xs text-center text-slate-400 relative z-10">
             Driver: {riskAssessment.primaryDriver}
           </div>
        </div>

        {/* Coaching Priority Matrix */}
        <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative group delay-100 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
           <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Coaching Priority Matrix</h3>
           <div className="h-40 w-full relative bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
              
              {/* Axis Labels */}
              <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">High Impact</div>
              <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">High Skill</div>
              
              {/* Quadrant Lines */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-200 dark:bg-slate-700 border-l border-dashed"></div>
              <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-200 dark:bg-slate-700 border-t border-dashed"></div>

              {/* Plotted Point (Simulated based on Priority Level) */}
              <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-4 h-4 rounded-full bg-indigo-600 animate-ping absolute opacity-75"></div>
                  <div className="w-4 h-4 rounded-full bg-indigo-600 relative shadow-[0_0_15px_rgba(79,70,229,0.5)] border-2 border-white dark:border-slate-800 cursor-pointer group-hover:scale-125 transition-transform duration-300">
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-32 bg-slate-900 text-white text-xs p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center pointer-events-none">
                         <div className="font-bold mb-1">Focus Here:</div>
                         {coachingPriority.focusArea}
                         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                      </div>
                  </div>
              </div>
           </div>
           <div className="mt-3 flex justify-between items-center">
              <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${coachingPriority.level === 'Immediate' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                 {coachingPriority.level} Priority
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                 {coachingPriority.focusArea}
              </span>
           </div>
        </div>

        {/* Pattern Analysis */}
        <div className="card-hover bg-slate-900 text-white rounded-2xl shadow-sm p-6 flex flex-col justify-center relative overflow-hidden delay-200 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
           {/* Abstract Background Decoration */}
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500 rounded-full mix-blend-overlay filter blur-xl opacity-20 animate-pulse"></div>
           <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-purple-500 rounded-full mix-blend-overlay filter blur-xl opacity-20 animate-pulse delay-700"></div>

           <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 relative z-10">Root Cause Analysis</h3>
           <div className="text-3xl font-bold mb-1 text-indigo-400 relative z-10">{patternAnalysis.issueType}</div>
           <p className="text-sm text-slate-300 mb-4 opacity-80 relative z-10">Primary Gap Identified</p>
           <div className="bg-white/10 p-3 rounded-lg border border-white/10 text-sm leading-relaxed backdrop-blur-sm relative z-10 hover:bg-white/15 transition-colors">
             "{patternAnalysis.rootCause}"
           </div>
        </div>
      </div>

      {/* 2. Visual Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Coaching & Training Plan */}
         <div className="card-hover bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 p-6 xl:p-8 animate-fade-in-up delay-300 overflow-hidden relative">
            {/* Background flourish */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                   Personalized Coaching Plan
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Actionable steps to elevate this rep's performance.</p>
              </div>
              {coachingPlan.kpi && (
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target KPI</span>
                  <span className="inline-flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold shadow-sm border border-indigo-200 dark:border-indigo-800/50">
                    {coachingPlan.kpi}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Left Column: Roleplay & Drills */}
                <div className="space-y-8">
                  {coachingPlan.roleplay && (
                    <div className="bg-white dark:bg-slate-800/80 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                      <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                        Mock Arena Scenario
                      </h4>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        "{coachingPlan.roleplay}"
                      </p>
                    </div>
                  )}

                  {coachingPlan.drills && coachingPlan.drills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Target Execution Drills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {coachingPlan.drills.map((drill, idx) => (
                           <span key={idx} className="inline-flex items-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800/30 shadow-sm transition-transform hover:-translate-y-0.5">
                             {drill}
                           </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Training Plan & Sentences */}
                <div className="space-y-8">
                  {coachingPlan.trainingPlan && coachingPlan.trainingPlan.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">1-on-1 Action Plan</h4>
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                        {coachingPlan.trainingPlan.map((item, idx) => (
                          <div key={idx} className="relative flex items-center gap-4">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 z-10 shadow-sm">
                               {idx + 1}
                            </div>
                            <div className="flex-1 bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                               <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {repData.bestRecommendedSentences && repData.bestRecommendedSentences.length > 0 && (
                    <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl p-0.5 shadow-sm">
                       <div className="bg-white dark:bg-slate-900 rounded-[10px] p-4 h-full">
                         <h4 className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            "Magic" Phrases to Feed Rep
                         </h4>
                         <ul className="space-y-2">
                           {repData.bestRecommendedSentences.map((sentence, idx) => (
                             <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                               <span className="text-violet-400 text-lg leading-none mt-0.5">❝</span>
                               <span className="font-medium">{sentence}</span>
                             </li>
                           ))}
                         </ul>
                       </div>
                    </div>
                  )}
                </div>
            </div>
         </div>

         {/* Interactive Skill Radar */}
         <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-96 relative group animate-fade-in-up delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
            <div className="absolute top-6 left-6 z-10">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-1">Rep Skill Profile</h3>
                <p className="text-xs text-slate-400">Hover for evidence</p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="55%" outerRadius="75%" data={skillData}>
                  <PolarGrid stroke="#e2e8f0" strokeOpacity={0.5} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: '600' }} 
                  />
                  <Radar 
                    name="Rep Score" 
                    dataKey="score" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fill="#6366f1" 
                    fillOpacity={0.3} 
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                  <Tooltip content={<CustomRadarTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
               </RadarChart>
            </ResponsiveContainer>
         </div>

         {/* Animated Revenue Risk Bar Chart */}
         <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-96 relative animate-fade-in-up delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
            <div className="absolute top-6 left-6 z-10">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-1">Risk Exposure by Area</h3>
                <p className="text-xs text-slate-400">Hover to see gap analysis</p>
            </div>
            <ResponsiveContainer width="100%" height="90%">
               <BarChart data={riskBarData} layout="vertical" margin={{ top: 50, right: 30, left: 10, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={110} 
                    tick={{ fontSize: 11, fontWeight: '600', fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomRiskTooltip />} cursor={{fill: 'rgba(241, 245, 249, 0.4)'}} />
                  <Bar 
                    dataKey="risk" 
                    radius={[0, 4, 4, 0]} 
                    barSize={20} 
                    animationDuration={2000} 
                    animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
                  >
                    {riskBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>

      </div>

      {/* 3. Interactive Risk Signals */}
      <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up delay-400 opacity-0" style={{ animationFillMode: 'forwards' }}>
         <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transcript Risk Audit</h3>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full font-bold">
               {riskSignals.length} Alerts Found
            </span>
         </div>
         <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {riskSignals.map((signal, idx) => (
               <div 
                  key={idx} 
                  onClick={() => setActiveRisk(activeRisk === idx.toString() ? null : idx.toString())}
                  className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 opacity-0 animate-fade-in-up group ${activeRisk === idx.toString() ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'forwards' }}
               >
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-all duration-300 ${signal.impact.includes('High') ? 'bg-rose-500 shadow-rose-500/50' : 'bg-amber-500 shadow-amber-500/50 group-hover:scale-150'}`}></div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {signal.flag}
                        </span>
                     </div>
                     <div className="flex items-center gap-3">
                         <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${signal.impact.includes('High') ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900'}`}>
                            {signal.impact} Impact
                         </span>
                         <svg className={`w-4 h-4 text-slate-400 transform transition-transform duration-300 ${activeRisk === idx.toString() ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                     </div>
                  </div>
                  
                  {activeRisk === idx.toString() && (
                     <div className="mt-4 ml-6 animate-fade-in-up origin-top">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 block">Verbatim Evidence</span>
                           <p className="text-slate-800 dark:text-slate-200 italic font-medium">"{signal.quote}"</p>
                        </div>
                     </div>
                  )}
               </div>
            ))}
         </div>
      </div>

      {/* 4. Competitor Intelligence */}
      {competitorAnalysis && competitorAnalysis.length > 0 && (
        <div className="card-hover bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up delay-500 opacity-0" style={{ animationFillMode: 'forwards' }}>
           <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Competitor Intelligence</h3>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full font-bold">
                 {competitorAnalysis.length} Detected
              </span>
           </div>
           <div className="p-6 grid gap-4">
              {competitorAnalysis.map((comp, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                             <span className="text-xl">🏢</span> {comp.competitor}
                          </h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                              comp.effectiveness === 'Effective' ? 'bg-emerald-100 text-emerald-700' :
                              comp.effectiveness === 'Ineffective' ? 'bg-rose-100 text-rose-700' :
                              'bg-slate-200 text-slate-600'
                          }`}>
                              {comp.effectiveness} Response
                          </span>
                      </div>
                      <div className="space-y-3">
                          <div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Context</span>
                              <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{comp.context}"</p>
                          </div>
                          <div>
                              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Rep Response</span>
                              <p className="text-sm text-slate-700 dark:text-slate-200">{comp.repResponse}</p>
                          </div>
                      </div>
                  </div>
              ))}
           </div>
        </div>
      )}

    </div>
  );
};

export default ManagerDashboard;
