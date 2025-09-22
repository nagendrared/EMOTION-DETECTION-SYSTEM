import React, { useState, useEffect } from 'react';
import { Brain, Activity, Database, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { emotionApi } from '../services/emotionApi';
import type { ModelInfo, HealthStatus } from '../types/emotion';

export const ModelInfo: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [modelData, healthData] = await Promise.all([
        emotionApi.getModelInfo(),
        emotionApi.getHealthStatus()
      ]);
      
      setModelInfo(modelData);
      setHealthStatus(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch model information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getHealthStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'success';
      case 'unhealthy':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Card className="p-6" gradient>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Model Information
            </h2>
          </div>
          <Button
            onClick={fetchData}
            loading={loading}
            variant="outline"
            size="sm"
            icon={RefreshCw}
          >
            Refresh
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 font-medium">
              Error: {error}
            </p>
          </Card>
        )}

        {/* Health Status */}
        {healthStatus && (
          <Card className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  API Health Status
                </h3>
              </div>
              <Badge variant={getHealthStatusVariant(healthStatus.status)}>
                {healthStatus.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Model Loaded: </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {healthStatus.model_loaded ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Last Check: </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {new Date(healthStatus.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Model Details */}
        {modelInfo && (
          <Card className="p-4 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Model Details
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Model Name: </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {modelInfo.model_name}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Model Type: </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {modelInfo.model_type}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Emotions: </span>
                  <Badge variant="primary">
                    {modelInfo.total_emotions}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Emotions:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {modelInfo.available_emotions.map((emotion) => (
                    <Badge key={emotion} variant="secondary" size="sm">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading model information...</p>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
};