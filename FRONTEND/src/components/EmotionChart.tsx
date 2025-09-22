import React from 'react';
import { Badge } from './ui/Badge';

interface EmotionChartProps {
  emotions: Record<string, number>;
  className?: string;
}

const getEmotionColor = (emotion: string): string => {
  const colorMap: Record<string, string> = {
    joy: 'bg-yellow-400',
    happiness: 'bg-yellow-400',
    love: 'bg-pink-400',
    excitement: 'bg-orange-400',
    sadness: 'bg-blue-400',
    anger: 'bg-red-400',
    fear: 'bg-purple-400',
    surprise: 'bg-green-400',
    disgust: 'bg-gray-400',
    neutral: 'bg-gray-300',
    positive: 'bg-emerald-400',
    negative: 'bg-red-400'
  };

  const normalizedEmotion = emotion.toLowerCase();
  return colorMap[normalizedEmotion] || 'bg-indigo-400';
};

export const EmotionChart: React.FC<EmotionChartProps> = ({ emotions, className = '' }) => {
  const sortedEmotions = Object.entries(emotions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6); // Show top 6 emotions

  const maxConfidence = Math.max(...Object.values(emotions));
  const topEmotion = sortedEmotions[0];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Emotion Display */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Emotion Analysis
        </h3>
        {topEmotion && (
          <Badge variant="primary" size="lg">
            {topEmotion[0]} ({(topEmotion[1] * 100).toFixed(1)}%)
          </Badge>
        )}
      </div>

      {/* Emotion Bars */}
      <div className="space-y-3">
        {sortedEmotions.map(([emotion, confidence]) => {
          const percentage = (confidence / maxConfidence) * 100;
          const colorClass = getEmotionColor(emotion);

          return (
            <div key={emotion} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {emotion}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {(confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 ${colorClass} rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Confidence Indicator */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Confidence
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${maxConfidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {(maxConfidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};