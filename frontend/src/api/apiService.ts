/**
 * API Service for Fraud Detection Platform
 * Handles all communication with the backend API
 */

const API_BASE_URL = 'http://localhost:8000';

export interface PredictionResponse {
  prediction: string;
  confidence: number;
  risk_level: string;
  details: string;
  recommendations: string[];
  timestamp: string;
  risk_score?: number;
  suspicious_factors?: string[];
}

export interface BatchPredictionResponse {
  results: PredictionResponse[];
  total_processed: number;
  processing_time: number;
}

export interface HealthResponse {
  status: string;
  models: Record<string, string>;
  uptime: number;
  version: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token', // Mock token for now
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async getHealth(): Promise<HealthResponse> {
    return this.makeRequest<HealthResponse>('/health');
  }

  // URL Analysis
  async checkURL(url: string): Promise<PredictionResponse> {
    return this.makeRequest<PredictionResponse>('/api/url-check', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // Email Analysis
  async checkEmail(emailText: string): Promise<PredictionResponse> {
    return this.makeRequest<PredictionResponse>('/api/email-check', {
      method: 'POST',
      body: JSON.stringify({ email_text: emailText }),
    });
  }

  // Transaction Analysis
  async checkTransaction(transactionData: Record<string, any>): Promise<PredictionResponse> {
    return this.makeRequest<PredictionResponse>('/api/transaction-check', {
      method: 'POST',
      body: JSON.stringify({ transaction_data: transactionData }),
    });
  }

  // Batch URL Analysis
  async checkURLsBatch(urls: string[]): Promise<BatchPredictionResponse> {
    return this.makeRequest<BatchPredictionResponse>('/api/batch/url-check', {
      method: 'POST',
      body: JSON.stringify({ urls }),
    });
  }

  // Batch Email Analysis
  async checkEmailsBatch(emails: string[]): Promise<BatchPredictionResponse> {
    return this.makeRequest<BatchPredictionResponse>('/api/batch/email-check', {
      method: 'POST',
      body: JSON.stringify({ emails }),
    });
  }

  // Batch Transaction Analysis
  async checkTransactionsBatch(transactions: Record<string, any>[]): Promise<BatchPredictionResponse> {
    return this.makeRequest<BatchPredictionResponse>('/api/batch/transaction-check', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  }

  // Get Awareness Content
  async getAwarenessContent(): Promise<any> {
    return this.makeRequest('/api/awareness');
  }

  // Report Fraud
  async reportFraud(reportData: Record<string, any>): Promise<any> {
    return this.makeRequest('/api/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
