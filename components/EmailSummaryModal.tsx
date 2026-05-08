
import React, { useState, useEffect } from 'react';
import { AnalysisData } from '../types';

interface EmailSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalysisData;
  userEmail?: string;
}

const EmailSummaryModal: React.FC<EmailSummaryModalProps> = ({ isOpen, onClose, data, userEmail }) => {
  const [recipient, setRecipient] = useState(userEmail || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Generate Smart Summary on Open
  useEffect(() => {
    if (isOpen) {
      const score = data.repView.performanceSnapshot.totalScore;
      const repName = data.context.extractedRepName || 'Rep';
      const riskLevel = data.managerView.dealRiskAssessment.riskLevel;
      
      setSubject(`Sales Audit: ${repName} (${score}/100) - ${riskLevel} Risk`);
      
      const summaryText = `
Team,

Here is the AI audit summary for the recent call with ${repName}.

PERFORMANCE SNAPSHOT
--------------------
Score: ${score}/100
Deal Health: ${riskLevel} Risk (${data.managerView.dealRiskAssessment.probability}% Probability)
Primary Driver: ${data.managerView.dealRiskAssessment.primaryDriver}

KEY INSIGHTS
------------
1. Strength: ${data.repView.performanceSnapshot.strongestSkill}
2. Critical Gap: ${data.repView.performanceSnapshot.damagingMistake}

COACHING PRIORITY
-----------------
Focus Area: ${data.managerView.coachingPriority.focusArea}
Action: ${data.repView.callRewrite[0]?.better || 'Review detailed report for script rewrites.'}

View the full interactive dashboard for audio playback and transcript analysis.

Best,
SalesAuditor AI
      `.trim();
      
      setBody(summaryText);
      setRecipient(userEmail || '');
      setIsSuccess(false);
      setIsSending(false);
    }
  }, [isOpen, data, userEmail]);

  const handleSend = () => {
    setIsSending(true);
    
    // Client-side "Send": Open the user's default email client
    // We use encodeURIComponent to ensure special characters don't break the link
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Trigger the email client
    window.location.href = mailtoLink;

    // Show feedback in UI
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      // Auto close after success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 3000);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            Email Manager Summary
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        {!isSuccess ? (
          <div className="p-6 space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">To</label>
                  <input 
                    type="email" 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="manager@company.com"
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
               </div>
            </div>

            <div className="space-y-1">
               <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">Message Body (AI Generated)</label>
                  <button 
                    onClick={() => navigator.clipboard.writeText(body)}
                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 uppercase"
                  >
                    Copy to Clipboard
                  </button>
               </div>
               <textarea 
                 value={body}
                 onChange={(e) => setBody(e.target.value)}
                 className="w-full h-64 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
               ></textarea>
            </div>

            <div className="pt-4 flex justify-end gap-3">
               <button 
                 onClick={onClose}
                 className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSend}
                 disabled={isSending || !recipient}
                 className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-all flex items-center gap-2 ${isSending || !recipient ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'}`}
               >
                 {isSending ? (
                    <>
                       <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       Opening Email...
                    </>
                 ) : (
                    <>
                       Draft in Email Client
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </>
                 )}
               </button>
            </div>

          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center animate-fade-in">
             <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             </div>
             <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email Client Opened</h3>
             <p className="text-slate-500 dark:text-slate-400">
               Please check your default email app to review and send the draft to <span className="font-bold text-slate-800 dark:text-slate-200">{recipient}</span>.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSummaryModal;
