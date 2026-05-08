
import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onInputSelected: (input: File[] | string, type: 'audio' | 'text') => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onInputSelected, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'text'>('audio');
  const [dragActive, setDragActive] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith('audio/') || f.type.startsWith('video/'));
    
    if (validFiles.length === 0) {
      alert("Please upload valid audio or video files.");
      return;
    }
    
    if (validFiles.length > 7) {
      alert("You can only upload up to 7 files at a time. The first 7 will be processed.");
    }
    
    onInputSelected(validFiles.slice(0, 7), 'audio');
  };
  
  const handleTextSubmit = () => {
    if (!transcriptText.trim()) return;
    onInputSelected(transcriptText, 'text');
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 group relative flex flex-col">
       <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
       
       {/* Tabs */}
       <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 relative z-20">
          <button 
             onClick={() => setActiveTab('audio')}
             className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all active:bg-slate-100 dark:active:bg-slate-800 ${activeTab === 'audio' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
             Upload Audio
          </button>
          <button 
             onClick={() => setActiveTab('text')}
             className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-wider transition-all active:bg-slate-100 dark:active:bg-slate-800 ${activeTab === 'text' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
             Paste Transcript
          </button>
       </div>
       
       <div className="p-8 relative z-10 min-h-[320px] flex flex-col justify-center">
          {activeTab === 'audio' ? (
              <div
                className={`relative p-8 border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/30 scale-[1.02]'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/30 hover:border-indigo-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                } ${isLoading ? 'opacity-50 pointer-events-none grayscale' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept="audio/*,video/*"
                  multiple
                  onChange={handleChange}
                />

                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-2 shadow-inner ring-4 ring-indigo-50 dark:ring-slate-800 animate-bounce">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Recordings</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Drag & drop or browse up to 7 files (MP3, WAV, M4A)</p>
                </div>
                <button
                  onClick={() => {
                    inputRef.current?.click();
                  }}
                  className={`mt-4 px-6 py-2.5 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 transform active:scale-95 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-sm`}
                >
                  Select Files
                </button>
                <p className="text-xs text-slate-400 mt-4 font-semibold max-w-xs mx-auto tracking-wide">
                   <span className="text-indigo-500">SECURE</span> • ENCRYPTED • <span className="text-indigo-500">PRIVATE</span>
                </p>
              </div>
          ) : (
              <div className="w-full animate-fade-in h-full flex flex-col">
                  <textarea
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    placeholder="Paste conversation transcript here...&#10;Speaker 1: Hello!&#10;Speaker 2: Hi there."
                    className="w-full h-48 p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm leading-relaxed mb-4 transition-shadow"
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={isLoading || !transcriptText.trim()}
                    className="w-full px-6 py-3 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 transform active:scale-95 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Analyze Transcript
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4 font-semibold tracking-wide">
                     AI text analysis without audio processing
                  </p>
              </div>
          )}
       </div>
    </div>
  );
};

export default FileUpload;
