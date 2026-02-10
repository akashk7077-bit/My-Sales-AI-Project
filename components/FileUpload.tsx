import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Basic validation for audio/video
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      onFileSelected(file);
    } else {
      alert("Please upload a valid audio or video file.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div
        className={`relative p-10 border-2 border-dashed rounded-xl transition-all duration-300 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-slate-300 bg-white hover:border-slate-400'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
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
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-4 mb-4 bg-indigo-100 rounded-full text-indigo-600">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Upload Sales Call
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Drag and drop your audio file (MP3, WAV, M4A)
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            className="px-6 py-2 mt-6 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Select File
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
