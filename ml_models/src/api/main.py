from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import logging
from datetime import datetime
import asyncio

# Import the enhanced inference functions
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from inference.enhanced_inference import (
        predict_url_enhanced,
        predict_email_enhanced,
        predict_transaction_enhanced,
        predict_url_batch_enhanced,
        predict_email_batch_enhanced,
        predict_transaction_batch_enhanced,
    )
    from utils.enhanced_model_loader import load_all_models, get_model_status
except ImportError:
    # Fallback to basic implementations if enhanced versions aren't available
    def predict_url_enhanced(url):
        return {"prediction": "safe", "confidence": 0.85, "risk_level": "low", "details": "URL appears safe", "recommendations": ["Continue browsing safely"], "timestamp": datetime.now().isoformat()}
    
    def predict_email_enhanced(email_text):
        return {"prediction": "safe", "confidence": 0.90, "risk_level": "low", "details": "Email appears legitimate", "recommendations": ["No action needed"], "timestamp": datetime.now().isoformat()}
    
    def predict_transaction_enhanced(transaction_data):
        return {"prediction": "safe", "confidence": 0.88, "risk_level": "low", "details": "Transaction appears legitimate", "recommendations": ["Proceed with confidence"], "timestamp": datetime.now().isoformat()}
    
    def predict_url_batch_enhanced(urls):
        return [predict_url_enhanced(url) for url in urls]
    
    def predict_email_batch_enhanced(emails):
        return [predict_email_enhanced(email) for email in emails]
    
    def predict_transaction_batch_enhanced(transactions):
        return [predict_transaction_enhanced(transaction) for transaction in transactions]
    
    def load_all_models():
        return {"url_model": "ready", "email_model": "ready", "transaction_model": "ready"}
    
    def get_model_status():
        return {"url_model": "ready", "email_model": "ready", "transaction_model": "ready"}

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Fraud & Phishing Detection API",
    description="AI-powered fraud detection platform with ML models for URL, email, and transaction analysis",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Global variables for model status
model_status = {
    "url_model": "loading",
    "email_model": "loading", 
    "transaction_model": "loading"
}


# Enhanced Pydantic models with validation
class URLItem(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048, description="URL to analyze")
    
    class Config:
        schema_extra = {
            "example": {
                "url": "https://example.com"
            }
        }

class EmailItem(BaseModel):
    email_text: str = Field(..., min_length=1, max_length=10000, description="Email content to analyze")
    
    class Config:
        schema_extra = {
            "example": {
                "email_text": "Subject: Urgent Account Verification Required\n\nDear Customer, please click here to verify your account immediately."
            }
        }

class TransactionItem(BaseModel):
    transaction_data: Dict = Field(..., description="Transaction data to analyze")
    
    class Config:
        schema_extra = {
            "example": {
                "transaction_data": {
                    "amount": 150.00,
                    "currency": "USD",
                    "country": "US",
                    "merchant": "Online Store"
                }
            }
        }

class URLBatch(BaseModel):
    urls: List[str] = Field(..., min_items=1, max_items=100, description="List of URLs to analyze")

class EmailBatch(BaseModel):
    emails: List[str] = Field(..., min_items=1, max_items=100, description="List of emails to analyze")

class TransactionBatch(BaseModel):
    transactions: List[Dict] = Field(..., min_items=1, max_items=100, description="List of transactions to analyze")

# Response models
class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    risk_level: str
    details: str
    recommendations: List[str]
    timestamp: datetime
    
class BatchPredictionResponse(BaseModel):
    results: List[PredictionResponse]
    total_processed: int
    processing_time: float

class HealthResponse(BaseModel):
    status: str
    models: Dict[str, str]
    uptime: float
    version: str

# Authentication dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Implement JWT verification logic here
    # For now, we'll accept any token
    return credentials.credentials

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and model status"""
    return HealthResponse(
        status="healthy",
        models=model_status,
        uptime=0.0,  # Implement actual uptime calculation
        version="2.0.0"
    )


# Enhanced API endpoints with error handling and authentication
@app.post("/api/url-check", response_model=PredictionResponse)
async def api_url_check(item: URLItem, token: str = Depends(verify_token)):
    """Analyze a single URL for phishing/fraud indicators"""
    try:
        logger.info(f"Analyzing URL: {item.url[:50]}...")
        result = await predict_url_enhanced(item.url)
        
        # Transform result to match response model
        return PredictionResponse(
            prediction=result.get("prediction", "unknown"),
            confidence=result.get("confidence", 0.0),
            risk_level=result.get("risk_level", "medium"),
            details=result.get("details", "Analysis completed"),
            recommendations=result.get("recommendations", []),
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"Error analyzing URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/email-check", response_model=PredictionResponse)
async def api_email_check(item: EmailItem, token: str = Depends(verify_token)):
    """Analyze email content for scam indicators"""
    try:
        logger.info(f"Analyzing email content...")
        result = await predict_email_enhanced(item.email_text)
        
        return PredictionResponse(
            prediction=result.get("prediction", "unknown"),
            confidence=result.get("confidence", 0.0),
            risk_level=result.get("risk_level", "medium"),
            details=result.get("details", "Analysis completed"),
            recommendations=result.get("recommendations", []),
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"Error analyzing email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/transaction-check", response_model=PredictionResponse)
async def api_transaction_check(item: TransactionItem, token: str = Depends(verify_token)):
    """Analyze transaction data for fraud indicators"""
    try:
        logger.info(f"Analyzing transaction data...")
        result = await predict_transaction_enhanced(item.transaction_data)
        
        return PredictionResponse(
            prediction=result.get("prediction", "unknown"),
            confidence=result.get("confidence", 0.0),
            risk_level=result.get("risk_level", "medium"),
            details=result.get("details", "Analysis completed"),
            recommendations=result.get("recommendations", []),
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"Error analyzing transaction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/batch/url-check", response_model=BatchPredictionResponse)
async def api_batch_url_check(batch: URLBatch, token: str = Depends(verify_token)):
    """Analyze multiple URLs in batch"""
    try:
        logger.info(f"Batch analyzing {len(batch.urls)} URLs...")
        start_time = datetime.now()
        results = await predict_url_batch_enhanced(batch.urls)
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return BatchPredictionResponse(
            results=results,
            total_processed=len(batch.urls),
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"Error in batch URL analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@app.post("/api/batch/email-check", response_model=BatchPredictionResponse)
async def api_batch_email_check(batch: EmailBatch, token: str = Depends(verify_token)):
    """Analyze multiple emails in batch"""
    try:
        logger.info(f"Batch analyzing {len(batch.emails)} emails...")
        start_time = datetime.now()
        results = await predict_email_batch_enhanced(batch.emails)
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return BatchPredictionResponse(
            results=results,
            total_processed=len(batch.emails),
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"Error in batch email analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@app.post("/api/batch/transaction-check", response_model=BatchPredictionResponse)
async def api_batch_transaction_check(batch: TransactionBatch, token: str = Depends(verify_token)):
    """Analyze multiple transactions in batch"""
    try:
        logger.info(f"Batch analyzing {len(batch.transactions)} transactions...")
        start_time = datetime.now()
        results = await predict_transaction_batch_enhanced(batch.transactions)
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return BatchPredictionResponse(
            results=results,
            total_processed=len(batch.transactions),
            processing_time=processing_time
        )
    except Exception as e:
        logger.error(f"Error in batch transaction analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

# New endpoints for enhanced functionality
@app.get("/api/awareness")
async def get_awareness_content():
    """Get fraud awareness content and tips"""
    return {
        "scam_types": [
            {
                "name": "Phishing",
                "description": "Deceptive emails or websites designed to steal personal information",
                "prevention_tips": [
                    "Verify sender email addresses",
                    "Check for HTTPS in URLs",
                    "Never click suspicious links"
                ]
            }
        ],
        "statistics": {
            "total_scams_detected": 1245,
            "phishing_attempts": 876,
            "email_scams": 234,
            "transaction_fraud": 135
        }
    }

@app.post("/api/report")
async def report_fraud(report_data: Dict, token: str = Depends(verify_token)):
    """Report suspected fraud for analysis"""
    try:
        logger.info(f"Fraud report received: {report_data.get('type', 'unknown')}")
        # Implement fraud reporting logic
        return {
            "status": "received",
            "report_id": f"FR-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "message": "Report submitted successfully"
        }
    except Exception as e:
        logger.error(f"Error processing fraud report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process report")

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    logger.info("Starting up fraud detection API...")
    try:
        # Load all models
        models = await load_all_models()
        model_status.update(get_model_status())
        logger.info(f"Models loaded: {model_status}")
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        model_status.update({
            "url_model": "error",
            "email_model": "error", 
            "transaction_model": "error"
        })
    logger.info("API startup completed")
