
import React, { useState } from 'react';
import { ExecutiveView, ManagerView } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Sector, Tooltip } from 'recharts';

interface ExecutiveDashboardProps {
  execData: ExecutiveView;
  managerData: ManagerView;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill={fill} className="text-2xl font-black">
        {value}%
      </text>
      <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#64748b" className="text-xs font-bold uppercase tracking-wider">
        {payload.name.split(' ')[0]}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 15}
        fill={fill}
      />
    </g>
  );
};

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ execData, managerData }) => {
  const [boardroomMode, setBoardroomMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState(1); // Default active slice (Medium)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Pie Chart Data derived from Risk Levels
  const riskData = [
    { name: 'Low Risk Factors', value: 30, color: '#10b981' }, 
    { name: 'Med Risk Factors', value: 45, color: '#f59e0b' },
    { name: 'High Risk Factors', value: 25, color: '#f43f5e' },
  ];

  return (
    <div className={`transition-all duration-[800ms] cubic-bezier(0.16, 1, 0.3, 1) ${boardroomMode ? 'fixed inset-0 z-50 bg-slate-950 p-12 overflow-y-auto' : 'space-y-8 animate-fade-in-up'}`}>
      
      {/* Boardroom Toggle */}
      <div className="flex justify-between items-center mb-8">
        <h2 className={`transition-all duration-500 delay-100 ${boardroomMode ? 'text-3xl text-white font-light tracking-tight' : 'hidden'}`}>Strategic Revenue Intelligence</h2>
        <button 
          onClick={() => setBoardroomMode(!boardroomMode)}
          className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded border transition-colors duration-300 flex items-center gap-2 ${
             boardroomMode 
             ? 'border-white text-white hover:bg-white hover:text-black' 
             : 'border-slate-300 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
           <span className={`w-2 h-2 rounded-full ${boardroomMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
           {boardroomMode ? 'Exit Boardroom Mode' : 'Enter Boardroom Mode'}
        </button>
      </div>

      {/* 1. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Forecast Reliability */}
         <div className={`rounded-xl p-6 border transition-all duration-500 delay-100 hover:-translate-y-1 hover:shadow-lg ${boardroomMode ? 'bg-slate-900 border-slate-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}`}>
            <h3 className={`text-xs font-bold uppercase mb-2 ${boardroomMode ? 'text-slate-400' : 'text-slate-500'}`}>Forecast Reliability</h3>
            <div className={`text-3xl font-black mb-1 ${execData.revenueIntelligence.forecastReliability.includes('High') ? 'text-emerald-500' : 'text-amber-500'}`}>
               {execData.revenueIntelligence.forecastReliability}
            </div>
            <p className={`text-sm ${boardroomMode ? 'text-slate-500' : 'text-slate-400'}`}>Confidence Score</p>
         </div>

         {/* Sales Effectiveness */}
         <div className={`rounded-xl p-6 border transition-all duration-500 delay-200 hover:-translate-y-1 hover:shadow-lg ${boardroomMode ? 'bg-slate-900 border-slate-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}`}>
            <h3 className={`text-xs font-bold uppercase mb-2 ${boardroomMode ? 'text-slate-400' : 'text-slate-500'}`}>Sales Effectiveness</h3>
            <div className="text-3xl font-black mb-1 text-indigo-500">
               {execData.revenueIntelligence.salesEffectivenessScore}/100
            </div>
            <p className={`text-sm ${boardroomMode ? 'text-slate-500' : 'text-slate-400'}`}>Global Benchmark</p>
         </div>

         {/* Revenue Exposure */}
         <div className={`rounded-xl p-6 border transition-all duration-500 delay-300 hover:-translate-y-1 hover:shadow-lg ${boardroomMode ? 'bg-slate-900 border-slate-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}`}>
            <h3 className={`text-xs font-bold uppercase mb-2 ${boardroomMode ? 'text-slate-400' : 'text-slate-500'}`}>Estimated Revenue Risk</h3>
            <div className="text-3xl font-black mb-1 text-rose-500">
               {execData.revenueIntelligence.revenueLeakageRisk}
            </div>
            <p className={`text-sm ${boardroomMode ? 'text-slate-500' : 'text-slate-400'}`}>Deal Jeopardy Level</p>
         </div>
      </div>

      {/* 2. Strategic Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
         {/* Interactive Risk Distribution Chart */}
         <div className={`rounded-xl p-8 border flex flex-col items-center justify-center min-h-[350px] transition-all duration-500 delay-300 relative animate-fade-in-up opacity-0 ${boardroomMode ? 'bg-slate-900 border-slate-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}`} style={{ animationFillMode: 'forwards' }}>
            <div className="absolute top-6 left-6">
                <h3 className={`text-sm font-bold uppercase ${boardroomMode ? 'text-slate-300' : 'text-slate-600'}`}>Risk Distribution</h3>
                <p className="text-xs text-slate-400 mt-1">Interactive breakdown</p>
            </div>
            <div className="w-full h-72">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie 
                       activeIndex={activeIndex}
                       activeShape={renderActiveShape}
                       data={riskData} 
                       innerRadius={70} 
                       outerRadius={90} 
                       paddingAngle={4} 
                       dataKey="value"
                       onMouseEnter={onPieEnter}
                       animationDuration={1500}
                       animationEasing="ease-out"
                     >
                       {riskData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                       ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Executive Summary Card */}
         <div className={`rounded-xl p-8 border transition-all duration-500 delay-500 animate-fade-in-up opacity-0 ${boardroomMode ? 'bg-slate-900 border-slate-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}`} style={{ animationFillMode: 'forwards' }}>
            <h3 className={`text-sm font-bold uppercase mb-6 ${boardroomMode ? 'text-slate-300' : 'text-slate-600'}`}>Executive Summary</h3>
            <ul className="space-y-6">
               <li className="flex gap-4 group">
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 transition-transform group-hover:scale-150 ${boardroomMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></div>
                  <div>
                      <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Diagnosis</span>
                      <p className={`text-lg font-medium leading-tight mt-1 ${boardroomMode ? 'text-slate-200' : 'text-slate-800 dark:text-slate-200'}`}>
                         {execData.structuralWeakness.diagnosis}
                      </p>
                  </div>
               </li>
               <li className="flex gap-4 group">
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 transition-transform group-hover:scale-150 ${boardroomMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></div>
                  <div>
                      <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Deal Impact</span>
                      <p className={`text-lg font-medium leading-tight mt-1 ${boardroomMode ? 'text-slate-200' : 'text-slate-800 dark:text-slate-200'}`}>
                         {execData.dealImpact.reasoning}
                      </p>
                  </div>
               </li>
               <li className="flex gap-4 group">
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 transition-transform group-hover:scale-150 ${boardroomMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></div>
                  <div>
                      <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Pattern</span>
                      <p className={`text-lg font-medium leading-tight mt-1 ${boardroomMode ? 'text-slate-200' : 'text-slate-800 dark:text-slate-200'}`}>
                         {execData.organizationalPattern.observation}
                      </p>
                  </div>
               </li>
            </ul>
         </div>

      </div>

      {/* 3. Action Recommendation */}
      <div className={`rounded-xl p-8 border border-l-4 transition-all duration-700 delay-500 relative overflow-hidden group animate-fade-in-up opacity-0 ${boardroomMode ? 'bg-slate-900 border-slate-800 border-l-indigo-500' : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 border-l-indigo-500'}`} style={{ animationFillMode: 'forwards' }}>
          <div className="absolute right-0 top-0 p-32 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-1000"></div>
          
          <h3 className="text-xs font-bold uppercase text-indigo-500 mb-2 tracking-widest">Recommended Executive Action</h3>
          <p className={`text-xl md:text-2xl font-bold ${boardroomMode ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
             {execData.executiveAction.recommendation}
          </p>
          <p className={`mt-3 text-lg leading-relaxed max-w-4xl ${boardroomMode ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
             {execData.executiveAction.rationale}
          </p>
      </div>

    </div>
  );
};

export default ExecutiveDashboard;
