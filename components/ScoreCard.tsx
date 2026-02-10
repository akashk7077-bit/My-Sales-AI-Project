import React from 'react';

interface ScoreCardProps {
  label: string;
  score: number;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, score }) => {
  let colorClass = "text-red-500";
  let bgClass = "bg-red-50";

  if (score >= 8) {
    colorClass = "text-emerald-600";
    bgClass = "bg-emerald-50";
  } else if (score >= 5) {
    colorClass = "text-amber-500";
    bgClass = "bg-amber-50";
  }

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-slate-100">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 text-center h-8 flex items-center">
        {label}
      </span>
      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${bgClass} ${colorClass} text-xl font-bold`}>
        {score}
      </div>
    </div>
  );
};

export default ScoreCard;
