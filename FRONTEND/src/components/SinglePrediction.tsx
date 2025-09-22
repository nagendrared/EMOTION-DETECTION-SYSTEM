import React, { useState, useCallback } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { EmotionChart } from './EmotionChart';
import { emotionApi } from '../services/emotionApi';
import type { EmotionPrediction } from '../types/emotion';

interface SinglePredictionProps {
  onPrediction?: (prediction: EmotionPrediction) => void;
}

export const SinglePrediction: React.FC<SinglePredictionProps> = ({ onPrediction }) => {
  const [text, setText] = useState('');
  const [prediction, setPrediction] = useState<EmotionPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = useCallback(async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await emotionApi.predictSingle(text);
      setPrediction(result);
      onPrediction?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict emotion');
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }, [text, onPrediction]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handlePredict();
    }
  };

  return (
    <Card className="p-6" gradient hover>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Emotion Analysis
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your text below to analyze its emotional content
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <Input
            label="Text to Analyze"
            placeholder="Type your message here... (Press Ctrl+Enter to analyze)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            multiline
            rows={4}
            error={error}
          />

          <Button
            onClick={handlePredict}
            disabled={!text.trim() || loading}
            icon={loading ? Loader2 : Send}
            loading={loading}
            fullWidth
            size="lg"
          >
            {loading ? 'Analyzing...' : 'Analyze Emotion'}
          </Button>
        </div>

        {/* Results Section */}
        {prediction && !prediction.error && (
          <Card className="p-4 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20">
            <EmotionChart emotions={prediction.all_emotions} />
            
            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Confidence: </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Analyzed at: </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(prediction.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Error Display */}
        {prediction?.error && (
          <Card className="p-4 bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 font-medium">
              Error: {prediction.error}
            </p>
          </Card>
        )}
      </div>
    </Card>
  );
};