import React, { useState, useCallback } from 'react';
import { Brain, MessageSquare, BarChart3, Info, History as HistoryIcon } from 'lucide-react';
import { SinglePrediction } from './components/SinglePrediction';
import { BatchPrediction } from './components/BatchPrediction';
import { ModelInfo } from './components/ModelInfo';
import { PredictionHistory } from './components/PredictionHistory';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { EmotionPrediction, HistoryItem } from './types/emotion';

type Tab = 'single' | 'batch' | 'history' | 'model';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('single');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('emotion-history', []);

  const handlePrediction = useCallback((prediction: EmotionPrediction) => {
    const historyItem: HistoryItem = {
      ...prediction,
      id: Math.random().toString(36).substr(2, 9),
      type: 'single'
    };
    
    setHistory(prev => [historyItem, ...prev.slice(0, 99)]); // Keep last 100 items
  }, [setHistory]);

  const tabs = [
    { id: 'single' as const, label: 'Single Analysis', icon: MessageSquare, color: 'from-blue-500 to-purple-600' },
    { id: 'batch' as const, label: 'Batch Analysis', icon: BarChart3, color: 'from-emerald-500 to-teal-600' },
    { id: 'history' as const, label: 'History', icon: HistoryIcon, color: 'from-indigo-500 to-purple-600' },
    { id: 'model' as const, label: 'Model Info', icon: Info, color: 'from-purple-500 to-pink-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-colors duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:opacity-20"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EmotionAI
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Advanced Emotion Detection System
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  {history.length > 0 && (
                    <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium">
                      {history.length} predictions
                    </div>
                  )}
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="sticky top-16 z-40 backdrop-blur-md bg-white/50 dark:bg-gray-900/50 border-b border-white/20 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 py-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    variant={isActive ? 'primary' : 'ghost'}
                    className={`whitespace-nowrap ${
                      isActive 
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` 
                        : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Welcome Banner */}
            {activeTab === 'single' && (
              <Card className="p-6 text-center bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20" gradient>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Welcome to EmotionAI
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Analyze the emotional content of your text using advanced machine learning. 
                  Get detailed insights into emotions, confidence scores, and more.
                </p>
              </Card>
            )}

            {/* Tab Content */}
            {activeTab === 'single' && <SinglePrediction onPrediction={handlePrediction} />}
            {activeTab === 'batch' && <BatchPrediction />}
            {activeTab === 'history' && <PredictionHistory />}
            {activeTab === 'model' && <ModelInfo />}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/20 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Powered by Advanced Machine Learning • Built with React & Flask
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                EmotionAI - Understand emotions in text with precision and style
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;