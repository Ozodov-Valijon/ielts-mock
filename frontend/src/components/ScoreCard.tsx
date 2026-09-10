import React from 'react';

interface ScoreCardProps {
  title: string;
  score?: number | null;
  maxScore?: number;
}

export default function ScoreCard({ title, score, maxScore = 9 }: ScoreCardProps) {
  if (score === null || score === undefined) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center border-t-4 border-amber-400">
        <h3 className="text-gray-500 uppercase tracking-wider text-sm font-semibold mb-2">{title}</h3>
        <div className="text-2xl font-bold mb-1 text-amber-600 flex items-center space-x-1">
          <span>⏳</span>
          <span className="text-lg">Kutilmoqda</span>
        </div>
        <div className="text-amber-500 text-xs font-medium">Ustoz tekshiruvida</div>
      </div>
    );
  }

  let color = 'text-red-500 border-red-500';
  if (score >= 7) color = 'text-green-500 border-green-500';
  else if (score >= 5) color = 'text-blue-500 border-blue-500';
  else if (score >= 4) color = 'text-orange-500 border-orange-500';

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center border-t-4 border-gray-100">
      <h3 className="text-gray-500 uppercase tracking-wider text-sm font-semibold mb-2">{title}</h3>
      <div className={`text-4xl font-bold mb-1 ${color.split(' ')[0]}`}>
        {score.toFixed(1)}
      </div>
      <div className="text-gray-400 text-xs font-medium">/ {maxScore.toFixed(1)}</div>
    </div>
  );
}
