import { API_BASE_URL } from '../constants';

interface PredictionResult {
  prediction: string;
  confidence: number;
}

interface ErrorResponse {
  detail: string;
}

// Generic API call function
async function callApi<T>(
  endpoint: string,
  method: 'POST',
  data: any
): Promise<T | ErrorResponse> {
  try {
    // In a real scenario, this would fetch from your FastAPI backend.
    // For WebContainer demonstration, we'll simulate a response.
    console.log(`Simulating API call to: ${API_BASE_URL}${endpoint}`);
    console.log('Request data:', data);

    // Simulate network delay
    await new Promise(resolve => setTimeout(Math.random() * 1000 + 500, resolve));

    // Always simulate success for now to ensure clear feedback
    let prediction: string;
    let confidence: number;

    if (endpoint.includes('url-check')) {
      // For URL check, simulate a "phishing" result for specific keywords, otherwise "legit"
      if (endpoint.includes('batch')) {
        const batchPredictions: PredictionResult[] = data.urls.map((url: string) => ({
          prediction: url.includes('malicious') || url.includes('phish') ? 'phishing' : 'legit',
          confidence: (url.includes('malicious') || url.includes('phish')) ? 0.95 : 0.99,
        }));
        return batchPredictions as T;
      } else {
        prediction = data.url.includes('malicious') || data.url.includes('phish') ? 'phishing' : 'legit';
        confidence = (data.url.includes('malicious') || data.url.includes('phish')) ? 0.95 : 0.99;
      }
    } else if (endpoint.includes('email-check')) {
      // For email check, simulate "phishing" for specific keywords, otherwise "legit"
      if (endpoint.includes('batch')) {
        const batchPredictions: PredictionResult[] = data.emails.map((email_text: string) => ({
          prediction: email_text.includes('scam') || email_text.includes('urgent') ? 'phishing' : 'legit',
          confidence: (email_text.includes('scam') || email_text.includes('urgent')) ? 0.88 : 0.97,
        }));
        return batchPredictions as T;
      } else {
        prediction = data.email_text.includes('scam') || data.email_text.includes('urgent') ? 'phishing' : 'legit';
        confidence = (data.email_text.includes('scam') || data.email_text.includes('urgent')) ? 0.88 : 0.97;
      }
    } else if (endpoint.includes('transaction-check')) {
      // For transaction check, simulate "fraudulent" for specific conditions, otherwise "legit"
      if (endpoint.includes('batch')) {
        const batchPredictions: PredictionResult[] = data.transactions.map((tx: any) => {
          const txIsFraud = tx.amount > 10000 || tx.country === 'Nigeria';
          return {
            prediction: txIsFraud ? 'fraudulent' : 'legit',
            confidence: txIsFraud ? 0.92 : 0.96,
          };
        });
        return batchPredictions as T;
      } else {
        const isFraud = data.transaction_data.amount > 10000 || data.transaction_data.country === 'Nigeria';
        prediction = isFraud ? 'fraudulent' : 'legit';
        confidence = isFraud ? 0.92 : 0.96;
      }
    } else {
      prediction = 'unknown';
      confidence = 0.5;
    }

    return { prediction, confidence } as T;

  } catch (error) {
    console.error('API call failed:', error);
    return { detail: 'Network error or unexpected response.' };
  }
}

export const checkUrl = (url: string): Promise<PredictionResult | ErrorResponse> => {
  return callApi<PredictionResult>('/api/url-check', 'POST', { url });
};

export const checkEmail = (email_text: string): Promise<PredictionResult | ErrorResponse> => {
  return callApi<PredictionResult>('/api/email-check', 'POST', { email_text });
};

export const checkTransaction = (transaction_data: object): Promise<PredictionResult | ErrorResponse> => {
  return callApi<PredictionResult>('/api/transaction-check', 'POST', { transaction_data });
};

export const checkUrlBatch = (urls: string[]): Promise<PredictionResult[] | ErrorResponse> => {
  return callApi<PredictionResult[]>('/api/batch/url-check', 'POST', { urls });
};

export const checkEmailBatch = (emails: string[]): Promise<PredictionResult[] | ErrorResponse> => {
  return callApi<PredictionResult[]>('/api/batch/email-check', 'POST', { emails });
};

export const checkTransactionBatch = (transactions: object[]): Promise<PredictionResult[] | ErrorResponse> => {
  return callApi<PredictionResult[]>('/api/batch/transaction-check', 'POST', { transactions });
};
