import React, { useState, useRef, useEffect } from 'react';
import { AnalysisData, ChatMessage, Persona } from '../types';
import { askSalesCoach } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface CoachChatProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: AnalysisData;
  personas?: Persona[];
}

const CoachChat: React.FC<CoachChatProps> = ({ isOpen, onClose, analysisData, personas = [] }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await askSalesCoach(
        analysisData.transcription,
        messages,
        userMsg,
        analysisData,
        personas
      );
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I had trouble analyzing that request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-fade-in-up border-l border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight">AI Sales Coach</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Context-aware feedback</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/30 custom-scrollbar">
          <div className="flex flex-col gap-1 max-w-[85%]">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none p-3 shadow-sm text-sm text-slate-700 dark:text-slate-300">
              Hello! I've analyzed this call. I can provide tactical rewrites, evaluate your handling of specific objections, or offer advice based on the transcript. What would you like to explore?
            </div>
          </div>

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'self-end' : ''}`}>
              <div className={`rounded-2xl p-3 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-none markdown-body'
              }`}>
                {msg.role === 'model' ? (
                   <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                   msg.text
                )}
              </div>
            </div>
          ))}

          {isLoading && (
             <div className="flex flex-col gap-1 max-w-[85%]">
               <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none p-4 shadow-sm text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-75"></div>
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-150"></div>
                 <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-300"></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 relative">
            <textarea
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSend();
                 }
               }}
               placeholder="Ask about this call..."
               className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none h-[50px] custom-scrollbar"
               rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2">
             Example: "How could I have handled the pricing objection at 12:00?"
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
