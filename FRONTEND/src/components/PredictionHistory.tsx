import React, { useState } from 'react';
import { History, Download, Trash2, Search, Filter } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { EmotionChart } from './EmotionChart';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { HistoryItem } from '../types/emotion';

export const PredictionHistory: React.FC = () => {
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('emotion-history', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('');

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.original_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEmotion ? item.predicted_emotion === filterEmotion : true;
    return matchesSearch && matchesFilter;
  });

  const uniqueEmotions = [...new Set(history.map(item => item.predicted_emotion))];

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
    }
  };

  const exportHistory = () => {
    const data = {
      timestamp: new Date().toISOString(),
      total_predictions: history.length,
      predictions: history
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotion-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const removeItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <Card className="p-6" gradient>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Prediction History
            </h2>
            <Badge variant="primary">
              {history.length} predictions
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={exportHistory}
              disabled={history.length === 0}
              variant="outline"
              size="sm"
              icon={Download}
            >
              Export
            </Button>
            <Button
              onClick={clearHistory}
              disabled={history.length === 0}
              variant="outline"
              size="sm"
              icon={Trash2}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search predictions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterEmotion}
              onChange={(e) => setFilterEmotion(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All emotions</option>
              {uniqueEmotions.map(emotion => (
                <option key={emotion} value={emotion}>
                  {emotion}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* History Items */}
        {filteredHistory.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {history.length === 0 
                ? "No predictions yet. Start analyzing some text!" 
                : "No predictions match your filters."
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card key={item.id} className="p-4" hover>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="primary">
                          {item.predicted_emotion}
                        </Badge>
                        <Badge variant="secondary" size="sm">
                          {item.type}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {item.original_text}
                      </p>
                    </div>
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="text-red-500 hover:text-red-700"
                    />
                  </div>
                  
                  <EmotionChart emotions={item.all_emotions} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};