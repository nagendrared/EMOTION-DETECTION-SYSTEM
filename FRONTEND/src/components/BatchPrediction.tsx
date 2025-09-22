import React, { useState, useCallback } from 'react';
import { Upload, Download, Plus, Trash2, Loader2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { EmotionChart } from './EmotionChart';
import { Badge } from './ui/Badge';
import { emotionApi } from '../services/emotionApi';
import type { BatchPrediction } from '../types/emotion';

export const BatchPrediction: React.FC = () => {
  const [texts, setTexts] = useState<string[]>(['']);
  const [results, setResults] = useState<BatchPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTextInput = useCallback(() => {
    if (texts.length < 10) {
      setTexts(prev => [...prev, '']);
    }
  }, [texts.length]);

  const removeTextInput = useCallback((index: number) => {
    if (texts.length > 1) {
      setTexts(prev => prev.filter((_, i) => i !== index));
    }
  }, [texts.length]);

  const updateText = useCallback((index: number, value: string) => {
    setTexts(prev => prev.map((text, i) => i === index ? value : text));
  }, []);

  const handleBatchPredict = useCallback(async () => {
    const filteredTexts = texts.filter(text => text.trim());
    if (filteredTexts.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const result = await emotionApi.predictBatch(filteredTexts);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict emotions');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [texts]);

  const exportResults = useCallback(() => {
    if (!results) return;

    const data = {
      timestamp: new Date().toISOString(),
      total_predictions: results.total_texts,
      predictions: results.predictions
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotion-batch-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [results]);

  return (
    <Card className="p-6" gradient>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Upload className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Batch Analysis
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze multiple texts simultaneously (up to 10 texts)
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          {texts.map((text, index) => (
            <div key={index} className="flex space-x-2">
              <div className="flex-1">
                <Input
                  label={`Text ${index + 1}`}
                  placeholder={`Enter text ${index + 1} to analyze...`}
                  value={text}
                  onChange={(e) => updateText(index, e.target.value)}
                  multiline
                  rows={2}
                />
              </div>
              {texts.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTextInput(index)}
                  icon={Trash2}
                  className="mt-7"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}

          <div className="flex space-x-2">
            <Button
              onClick={addTextInput}
              disabled={texts.length >= 10}
              variant="outline"
              icon={Plus}
            >
              Add Text
            </Button>
            <Button
              onClick={handleBatchPredict}
              disabled={loading || !texts.some(t => t.trim())}
              loading={loading}
              icon={loading ? Loader2 : Upload}
              size="lg"
            >
              {loading ? 'Analyzing...' : 'Analyze Batch'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 font-medium">
              Error: {error}
            </p>
          </Card>
        )}

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Summary */}
            <Card className="p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Batch Results Summary
                </h3>
                <div className="flex space-x-2">
                  <Badge variant="success">
                    {results.total_texts} texts analyzed
                  </Badge>
                  <Button
                    onClick={exportResults}
                    variant="outline"
                    size="sm"
                    icon={Download}
                  >
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Analyzed at: {new Date(results.timestamp).toLocaleString()}
              </div>
            </Card>

            {/* Individual Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.predictions.map((prediction, index) => (
                <Card key={index} className="p-4" hover>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">
                        Text {prediction.index + 1}
                      </h4>
                      <Badge variant="primary">
                        {prediction.predicted_emotion}
                      </Badge>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {prediction.original_text}
                      </p>
                    </div>

                    <EmotionChart 
                      emotions={prediction.all_emotions} 
                      className="mt-4"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};