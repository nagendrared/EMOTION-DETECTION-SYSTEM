const API_BASE_URL = 'http://localhost:5000';

class EmotionApiService {
  async predictSingle(text: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to predict emotion');
    }

    return response.json();
  }

  async predictBatch(texts: string[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/predict/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to predict emotions');
    }

    return response.json();
  }

  async getModelInfo(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/model/info`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get model info');
    }

    return response.json();
  }

  async getHealthStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get health status');
    }

    return response.json();
  }

  async getEmotions(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/emotions`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get emotions');
    }

    return response.json();
  }
}

export const emotionApi = new EmotionApiService();