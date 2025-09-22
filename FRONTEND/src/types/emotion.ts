export interface EmotionPrediction {
  predicted_emotion: string;
  confidence: number;
  all_emotions: Record<string, number>;
  processed_text: string;
  original_text: string;
  timestamp: string;
  error?: string;
}

export interface BatchPrediction {
  predictions: (EmotionPrediction & { index: number })[];
  total_texts: number;
  timestamp: string;
}

export interface ModelInfo {
  model_name: string;
  available_emotions: string[];
  total_emotions: number;
  model_type: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  model_loaded: boolean;
}

export interface HistoryItem extends EmotionPrediction {
  id: string;
  type: 'single' | 'batch';
}