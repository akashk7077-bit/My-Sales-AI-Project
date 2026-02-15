
import React, { useState } from 'react';
import { CallRecord, UserRole } from '../types';

interface HistoryViewProps {
  history: CallRecord[];
  onViewReport: (record: CallRecord) => void;
  onViewRecommendations?: (record: CallRecord) => void;
  onDeleteRecord: (id: string) => void;
  userRole?: UserRole;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onViewReport, onViewRecommendations, onDeleteRecord, userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HOT': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'WARM': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'COLD': return 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const filteredHistory = history.filter(record => {
    const query = searchQuery.toLowerCase();
    const repNameMatch = record.repName.toLowerCase().includes(query);
    const fileNameMatch = (record.fileName || '').toLowerCase().includes(query);
    return repNameMatch || fileNameMatch;
  });

  const showDealStatus = userRole !== 'REP';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Call History</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Archive of all analyzed sales conversations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search rep or file..."
                    className="pl-10 pr-4 py-2 w-full sm:w-64 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap flex items-center justify-center">
               Total Calls: <span className="font-bold text-indigo-600 dark:text-indigo-400 ml-1">{filteredHistory.length}</span>
               {searchQuery && filteredHistory.length !== history.length && (
                   <span className="text-xs text-slate-400 ml-1">/ {history.length}</span>
               )}
            </div>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-16 text-center transition-colors duration-500 animate-fade-in-up delay-100">
           <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
           </div>
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
               {history.length === 0 ? "No History Yet" : "No Matches Found"}
           </h3>
           <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
               {history.length === 0 
                 ? "Upload and analyze your first sales call to see it appear here." 
                 : `No records found matching "${searchQuery}". Try a different search term.`}
           </p>
           {history.length > 0 && (
               <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 active:scale-95 transition-transform"
               >
                   Clear Search
               </button>
           )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-500 animate-fade-in-up delay-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sales Rep</th>
                  {showDealStatus && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deal Status</th>
                  )}
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredHistory.map((record, idx) => (
                  <tr 
                    key={record.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group animate-slide-up opacity-0"
                    style={{ animationDelay: `${150 + (idx * 50)}ms`, animationFillMode: 'forwards' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {record.date}
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 max-w-[120px] truncate" title={record.fileName}>
                        {record.fileName || 'Transcript'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                             {record.repName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{record.repName}</span>
                       </div>
                    </td>
                    {showDealStatus && (
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.analysis?.dealHealth?.status || 'UNQUALIFIED')}`}>
                            {record.analysis?.dealHealth?.status || 'N/A'}
                        </span>
                        </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                       <div className="flex flex-col items-center">
                         <span className={`text-lg font-bold ${getScoreColor(record.analysis?.scores?.overall || 0)}`}>
                           {record.analysis?.scores?.overall || 0}
                         </span>
                         <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                         <button 
                            onClick={() => onViewReport(record)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors active:scale-95 transform"
                         >
                            Report
                         </button>
                         {onViewRecommendations && (
                             <button 
                                onClick={() => onViewRecommendations(record)}
                                className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors active:scale-95 transform"
                             >
                                Coaching
                             </button>
                         )}
                         <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteRecord(record.id); }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-1 active:scale-95 transform"
                            title="Delete Record"
                         >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
