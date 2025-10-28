// frontend/src/api/apiService.ts
/**
 * API Service for Fraud Detection Platform
 * Handles all communication with the backend API
 */

const API_BASE_URL = 'http://localhost:8000';

export interface PredictionResponse {
  request_id: string;
  prediction: string;
  confidence: number;
  risk_score: number;
  risk_level: string;
  details: string;
  recommendations: string[];
  model_version: string;
  processing_time_ms: number;
  timestamp: string;
  risk_factors?: {
    high_amount?: boolean;
    country_mismatch?: boolean;
    suspicious_merchant?: boolean;
    // add more as needed
  };
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
      // No auth needed (you disabled it)
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
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }
      
      return await response.json();
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

  // Transaction Analysis - FIXED: No wrapper
  async checkTransaction(transactionData: {
    amount: number;
    currency: string;
    merchant_name: string;
    merchant_country: string;
    customer_country: string;
    device_type?: string;
    card_type?: string;
    is_manual_entry?: boolean;
    transaction_type?: string;
  }): Promise<PredictionResponse> {
    return this.makeRequest<PredictionResponse>('/api/transaction-check', {
      method: 'POST',
      body: JSON.stringify(transactionData), // Direct object, no wrapper
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
  async checkTransactionsBatch(transactions: any[]): Promise<BatchPredictionResponse> {
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
  async reportFraud(reportData: any): Promise<any> {
    return this.makeRequest('/api/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }
}

// Singleton instance
export const apiService = new ApiService();
export default apiService;