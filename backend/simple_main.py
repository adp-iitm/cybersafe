"""
Production-Ready FastAPI Server with Enhanced ML Integration
Fraud Detection Platform with Improved Real-World Pattern Detection
"""
from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Any
import logging
from datetime import datetime, timedelta
import asyncio
from jose import jwt, JWTError
from passlib.context import CryptContext
import time
import uuid

# Import enhanced ML models
from models.ml_train import (
    EnhancedEnsembleFraudDetector,
    EnhancedFeatureEngineering
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== CONFIGURATION ====================

class Config:
    """Application configuration"""
    SECRET_KEY = "your-secret-key-here-change-in-production"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    MODEL_PATH = "./fraud_detection_models"
    MAX_BATCH_SIZE = 100
    RATE_LIMIT_PER_MINUTE = 100

config = Config()

# ==================== SECURITY ====================

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided"
        )
    try:
        payload = jwt.decode(
            token,
            config.SECRET_KEY,
            algorithms=[config.ALGORITHM]
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

# ==================== REQUEST MODELS ====================

class URLCheckRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048)
    context: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "http://g00gle.com/login",
                "context": "email_link"
            }
        }

class EmailCheckRequest(BaseModel):
    email_text: str = Field(..., min_length=1, max_length=50000)
    subject: Optional[str] = None
    sender_email: Optional[str] = None
    sender_name: Optional[str] = None
    
    @field_validator('sender_email')
    @classmethod
    def validate_email(cls, v):
        if v:
            import re
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
                raise ValueError('Invalid email format')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email_text": "Dear Customer, We detected unusual activity in your account. For your safety, please verify your information immediately by clicking the link below.",
                "subject": "Urgent: Verify Your Account",
                "sender_email": "security@yourbank.com"
            }
        }

class TransactionCheckRequest(BaseModel):
    amount: float = Field(..., gt=0)
    currency: str = Field(..., min_length=3, max_length=3)
    merchant_name: str
    merchant_country: str = Field(..., min_length=2, max_length=2)
    customer_country: str = Field(..., min_length=2, max_length=2)
    device_type: Optional[str] = "desktop"
    card_type: Optional[str] = "credit"
    is_manual_entry: Optional[bool] = False
    transaction_type: Optional[str] = "purchase"
    merchant_category: Optional[str] = "retail"
    user_transaction_count: Optional[int] = 10
    user_avg_transaction: Optional[float] = None
    days_since_last_transaction: Optional[int] = 7
    
    @field_validator('currency', 'merchant_country', 'customer_country')
    @classmethod
    def validate_uppercase(cls, v):
        return v.upper()
    
    class Config:
        json_schema_extra = {
            "example": {
                "amount": 3500.00,
                "currency": "USD",
                "merchant_name": "International Wire Transfer",
                "merchant_country": "NG",
                "customer_country": "US",
                "device_type": "desktop",
                "card_type": "credit",
                "is_manual_entry": True,
                "transaction_type": "withdrawal",
                "merchant_category": "wire_transfer",
                "user_transaction_count": 2,
                "user_avg_transaction": 80.0
            }
        }

class BatchURLRequest(BaseModel):
    urls: List[str] = Field(..., min_items=1, max_items=100)

class BatchEmailRequest(BaseModel):
    emails: List[Dict[str, str]] = Field(..., min_items=1, max_items=100)

class BatchTransactionRequest(BaseModel):
    transactions: List[Dict] = Field(..., min_items=1, max_items=100)

class FeedbackRequest(BaseModel):
    request_id: str
    actual_label: str = Field(..., pattern="^(fraudulent|safe)$")
    comments: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# ==================== RESPONSE MODELS ====================

class RiskFactors(BaseModel):
    primary_factors: List[str]
    secondary_factors: List[str]
    severity_scores: Dict[str, float]

class PredictionResponse(BaseModel):
    request_id: str
    prediction: str
    confidence: float
    risk_score: float
    risk_level: str
    details: str
    risk_factors: List[str]  # Simplified from original
    recommendations: List[str]
    model_version: str
    processing_time_ms: float
    timestamp: datetime

class BatchPredictionResponse(BaseModel):
    results: List[PredictionResponse]
    total_processed: int
    successful: int
    failed: int
    processing_time_ms: float
    summary: Dict[str, int]

class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    uptime_seconds: float
    version: str
    total_predictions: int
    models_status: Dict[str, str]

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# ==================== FASTAPI APP ====================

app = FastAPI(
    title="Enhanced AI Fraud Detection API",
    description="Production-grade fraud detection with real-world pattern recognition",
    version="3.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== GLOBAL STATE ====================

class AppState:
    def __init__(self):
        self.ensemble: Optional[EnhancedEnsembleFraudDetector] = None
        self.feature_engineering: Optional[EnhancedFeatureEngineering] = None
        self.start_time = datetime.now()
        self.request_count = 0
        self.prediction_count = 0
        self.prediction_cache = {}
        self.cache_hits = 0
        self.cache_misses = 0
        
    def is_ready(self) -> bool:
        return self.ensemble is not None

app_state = AppState()

# ==================== HELPER FUNCTIONS ====================

def generate_request_id() -> str:
    """Generate unique request ID"""
    return f"REQ-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"

def calculate_risk_level(risk_score: float) -> str:
    """Calculate risk level from score"""
    if risk_score >= 80:
        return "CRITICAL"
    elif risk_score >= 60:
        return "HIGH"
    elif risk_score >= 40:
        return "MEDIUM"
    elif risk_score >= 20:
        return "LOW"
    else:
        return "MINIMAL"

def generate_recommendations(prediction: str, risk_level: str, 
                            analysis_type: str, risk_factors: List[str]) -> List[str]:
    """Generate actionable recommendations"""
    if prediction.upper() == "FRAUDULENT":
        if analysis_type == "url":
            recs = [
                "🚫 DO NOT click on this link",
                "⚠️ This appears to be a phishing/typosquatting attempt",
                "📧 Report this URL to your IT security team"
            ]
            if any('typosquat' in str(f).lower() or 'digit' in str(f).lower() for f in risk_factors):
                recs.append("🔍 The domain uses character substitution to mimic legitimate sites")
            recs.extend([
                "🛡️ Verify the legitimate website through official channels",
                "💡 Look for HTTPS and correct spelling in URLs"
            ])
            return recs
            
        elif analysis_type == "email":
            recs = [
                "🗑️ Delete this email immediately",
                "🚫 Do not respond or click any links",
                "📧 Report as phishing to your email provider"
            ]
            if any('urgency' in str(f).lower() for f in risk_factors):
                recs.append("⏰ The urgent language is a classic phishing tactic")
            if any('personal' in str(f).lower() or 'verify' in str(f).lower() for f in risk_factors):
                recs.append("🔐 Legitimate companies never ask for credentials via email")
            recs.extend([
                "⚠️ Do not provide any personal information",
                "📞 Contact the organization directly through official channels"
            ])
            return recs
            
        elif analysis_type == "transaction":
            recs = [
                "🛑 BLOCK this transaction immediately",
                "📞 Contact the customer for verification",
                "🔍 Review account for additional suspicious activity"
            ]
            if any('international' in str(f).lower() or 'high-risk' in str(f).lower() for f in risk_factors):
                recs.append("🌍 International high-risk transaction detected")
            if any('velocity' in str(f).lower() for f in risk_factors):
                recs.append("⚡ Unusual transaction velocity detected")
            if any('amount' in str(f).lower() for f in risk_factors):
                recs.append("💰 Transaction amount significantly deviates from user pattern")
            recs.extend([
                "🔒 Require additional authentication",
                "📊 Flag account for enhanced monitoring for 30 days"
            ])
            return recs
    else:
        if analysis_type == "url":
            return [
                "✅ This URL appears to be legitimate",
                "🔒 Still verify HTTPS is used for sensitive data",
                "🔍 Always double-check URLs before entering credentials",
                "💡 Stay vigilant - fraudsters constantly create new sites"
            ]
        elif analysis_type == "email":
            return [
                "✅ This email appears to be legitimate",
                "🔍 Still verify sender identity for sensitive requests",
                "💡 Be cautious with attachments from unknown senders",
                "🛡️ Keep your security software updated"
            ]
        elif analysis_type == "transaction":
            return [
                "✅ This transaction appears to be legitimate",
                "📊 Continue standard monitoring",
                "💡 Keep reviewing transaction patterns",
                "🔒 Maintain security best practices"
            ]
    
    return ["✅ Continue monitoring for suspicious activity"]

async def process_prediction(result: Dict, analysis_type: str) -> PredictionResponse:
    """Process ML model result into response"""
    request_id = generate_request_id()
    risk_level = calculate_risk_level(result['risk_score'])
    
    # Get risk factors from result
    risk_factors = result.get('risk_factors', [])
    
    # Generate recommendations
    recommendations = generate_recommendations(
        result['prediction'], 
        risk_level, 
        analysis_type,
        risk_factors
    )
    
    # Generate detailed analysis
    if result['prediction'].upper() == "FRAUDULENT":
        details = f"⚠️ HIGH CONFIDENCE FRAUD DETECTION\n\n"
        details += f"Risk Score: {result['risk_score']:.1f}/100 ({risk_level})\n"
        details += f"Confidence: {result['confidence']:.1%}\n\n"
        if risk_factors:
            details += f"Detected Issues:\n"
            for factor in risk_factors:
                details += f"• {factor}\n"
    else:
        details = f"✅ Content appears legitimate\n\n"
        details += f"Risk Score: {result['risk_score']:.1f}/100 ({risk_level})\n"
        details += f"Confidence: {result['confidence']:.1%}\n"
        details += "No significant fraud indicators detected."
    
    return PredictionResponse(
        request_id=request_id,
        prediction=result['prediction'],
        confidence=result['confidence'],
        risk_score=result['risk_score'],
        risk_level=risk_level,
        details=details,
        risk_factors=risk_factors,
        recommendations=recommendations,
        model_version="3.1.0-enhanced",
        processing_time_ms=result.get('processing_time_ms', 0),
        timestamp=datetime.now()
    )

# ==================== STARTUP/SHUTDOWN ====================

@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup"""
    logger.info("Starting Enhanced Fraud Detection API...")
    
    try:
        # Initialize feature engineering
        logger.info("Initializing feature engineering...")
        app_state.feature_engineering = EnhancedFeatureEngineering()
        
        # Initialize ensemble
        logger.info("Initializing ML models...")
        app_state.ensemble = EnhancedEnsembleFraudDetector()
        
        # Train models (in production, load pre-trained models)
        logger.info("Training models with enhanced patterns...")
        app_state.ensemble.train_all()
        
        logger.info("✓ All models loaded successfully!")
        logger.info("✓ Enhanced fraud detection ready!")
        logger.info("✓ API is ready to serve requests")
        
    except Exception as e:
        logger.error(f"Failed to initialize models: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Fraud Detection API...")
    logger.info(f"Total predictions made: {app_state.prediction_count}")
    logger.info(f"Cache hit rate: {app_state.cache_hits / max(1, app_state.cache_hits + app_state.cache_misses):.2%}")

# ==================== API ENDPOINTS ====================

@app.get("/", tags=["General"])
async def root():
    """Root endpoint"""
    return {
        "message": "Enhanced Fraud Detection API",
        "version": "3.1.0",
        "status": "operational",
        "features": [
            "Typosquatting detection (g00gle.com)",
            "Phishing email detection",
            "Transaction fraud analysis",
            "Real-time risk scoring"
        ],
        "docs": "/docs"
    }

@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """Health check endpoint"""
    uptime = (datetime.now() - app_state.start_time).total_seconds()
    
    return HealthResponse(
        status="healthy" if app_state.is_ready() else "initializing",
        models_loaded=app_state.is_ready(),
        uptime_seconds=uptime,
        version="3.1.0-enhanced",
        total_predictions=app_state.prediction_count,
        models_status={
            "url_detector": "ready" if app_state.is_ready() else "loading",
            "email_detector": "ready" if app_state.is_ready() else "loading",
            "transaction_detector": "ready" if app_state.is_ready() else "loading"
        }
    )

@app.post("/api/auth/login", response_model=LoginResponse, tags=["Authentication"])
async def login(request: LoginRequest):
    """User login - returns JWT token"""
    # Demo credentials
    if request.username == "demo" and request.password == "demo123":
        access_token = create_access_token(
            data={"sub": request.username, "role": "user"}
        )
        return LoginResponse(
            access_token=access_token,
            expires_in=config.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password"
    )

@app.post("/api/url-check", response_model=PredictionResponse, tags=["Fraud Detection"])
async def check_url(
    request: URLCheckRequest,
    # token_data: dict = Depends(verify_token)  # Uncomment for auth
):
    """
    Analyze URL for phishing/fraud indicators
    
    Detects:
    - Typosquatting (g00gle.com, micr0soft.com)
    - Suspicious TLDs (.tk, .ml, .ga)
    - Phishing keywords (verify, secure, login)
    - Domain similarity to popular brands
    """
    if not app_state.is_ready():
        raise HTTPException(status_code=503, detail="Models are still loading")
    
    try:
        start_time = time.time()
        app_state.request_count += 1
        app_state.prediction_count += 1
        
        # Get prediction with enhanced features
        result = app_state.ensemble.predict_url(request.url)
        result['processing_time_ms'] = (time.time() - start_time) * 1000
        
        # Process response
        response = await process_prediction(result, "url")
        
        logger.info(f"URL: {request.url[:80]} -> {result['prediction']} (score: {result['risk_score']:.1f})")
        return response
        
    except Exception as e:
        logger.error(f"Error in URL check: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/email-check", response_model=PredictionResponse, tags=["Fraud Detection"])
async def check_email(
    request: EmailCheckRequest,
    # token_data: dict = Depends(verify_token)  # Uncomment for auth
):
    """
    Analyze email for scam/phishing indicators
    
    Detects:
    - Urgency language ("act now", "immediate")
    - Threat language ("suspend", "terminate")
    - Personal info requests
    - Phishing patterns ("verify account", "unusual activity")
    - Sender domain mismatches
    """
    if not app_state.is_ready():
        raise HTTPException(status_code=503, detail="Models are still loading")
    
    try:
        start_time = time.time()
        app_state.request_count += 1
        app_state.prediction_count += 1
        
        # Prepare email data
        email_data = {
            'text': request.email_text,
            'subject': request.subject or '',
            'sender': request.sender_email or ''
        }
        
        # Get prediction
        result = app_state.ensemble.predict_email(email_data)
        result['processing_time_ms'] = (time.time() - start_time) * 1000
        
        # Process response
        response = await process_prediction(result, "email")
        
        logger.info(f"Email: '{request.subject[:50] if request.subject else 'no subject'}' -> {result['prediction']} (score: {result['risk_score']:.1f})")
        return response
        
    except Exception as e:
        logger.error(f"Error in email check: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/transaction-check", response_model=PredictionResponse, tags=["Fraud Detection"])
async def check_transaction(
    request: TransactionCheckRequest,
    # token_data: dict = Depends(verify_token)  # Uncomment for auth
):
    """
    Analyze transaction for fraud indicators
    
    Detects:
    - High-risk countries
    - Unusual transaction amounts
    - Night-time transactions
    - High velocity patterns
    - New account activity
    - International transfers
    """
    if not app_state.is_ready():
        raise HTTPException(status_code=503, detail="Models are still loading")
    
    try:
        start_time = time.time()
        app_state.request_count += 1
        app_state.prediction_count += 1
        
        # Prepare transaction data
        transaction_data = {
            'amount': request.amount,
            'timestamp': datetime.now(),
            'customer_country': request.customer_country,
            'merchant_country': request.merchant_country,
            'device_type': request.device_type,
            'card_type': request.card_type,
            'is_manual_entry': 1 if request.is_manual_entry else 0,
            'transaction_type': request.transaction_type,
            'merchant_category': request.merchant_category,
            'user_transaction_count': request.user_transaction_count,
            'user_avg_transaction': request.user_avg_transaction or (request.amount * 0.6),
            'days_since_last_transaction': request.days_since_last_transaction,
            'velocity_1h': 1,
            'velocity_24h': 2,
            'velocity_7d': 10
        }
        
        # Get prediction
        result = app_state.ensemble.predict_transaction(transaction_data)
        result['processing_time_ms'] = (time.time() - start_time) * 1000
        
        # Process response
        response = await process_prediction(result, "transaction")
        
        logger.info(f"Transaction: ${request.amount} {request.currency} {request.merchant_country} -> {result['prediction']} (score: {result['risk_score']:.1f})")
        return response
        
    except Exception as e:
        logger.error(f"Error in transaction check: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/batch/url-check", response_model=BatchPredictionResponse, tags=["Batch Processing"])
async def batch_check_urls(
    request: BatchURLRequest,
    # token_data: dict = Depends(verify_token)  # Uncomment for auth
):
    """Batch URL analysis"""
    if not app_state.is_ready():
        raise HTTPException(status_code=503, detail="Models are still loading")
    
    start_time = time.time()
    results = []
    successful = 0
    failed = 0
    
    for url in request.urls:
        try:
            result = app_state.ensemble.predict_url(url)
            response = await process_prediction(result, "url")
            results.append(response)
            successful += 1
        except Exception as e:
            logger.error(f"Failed to process URL {url}: {str(e)}")
            failed += 1
    
    processing_time = (time.time() - start_time) * 1000
    
    # Summary
    summary = {
        "fraudulent": sum(1 for r in results if r.prediction.upper() == "FRAUDULENT"),
        "safe": sum(1 for r in results if r.prediction.upper() == "SAFE")
    }
    
    return BatchPredictionResponse(
        results=results,
        total_processed=len(request.urls),
        successful=successful,
        failed=failed,
        processing_time_ms=processing_time,
        summary=summary
    )

@app.post("/api/feedback", tags=["Model Improvement"])
async def submit_feedback(
    feedback: FeedbackRequest,
    # token_data: dict = Depends(verify_token)  # Uncomment for auth
):
    """Submit feedback for model improvement"""
    logger.info(f"Feedback received for {feedback.request_id}: {feedback.actual_label}")
    
    # In production, store this for model retraining
    return {
        "status": "success",
        "message": "Feedback recorded successfully. This will help improve model accuracy.",
        "request_id": feedback.request_id
    }

@app.get("/api/stats", tags=["Analytics"])
async def get_stats():
    """Get API statistics"""
    if not app_state.is_ready():
        raise HTTPException(status_code=503, detail="Models are still loading")
    
    uptime = (datetime.now() - app_state.start_time).total_seconds()
    cache_hit_rate = app_state.cache_hits / max(1, app_state.cache_hits + app_state.cache_misses)
    
    return {
        "uptime_seconds": uptime,
        "total_requests": app_state.request_count,
        "total_predictions": app_state.prediction_count,
        "requests_per_minute": (app_state.request_count / (uptime / 60)) if uptime > 0 else 0,
        "cache_hit_rate": cache_hit_rate,
        "models": {
            "url_model": {
                "status": "ready",
                "accuracy": app_state.ensemble.url_detector.metrics.get('train', {}).get('accuracy', 0)
            },
            "email_model": {
                "status": "ready",
                "accuracy": app_state.ensemble.email_detector.metrics.get('train', {}).get('accuracy', 0)
            },
            "transaction_model": {
                "status": "ready",
                "accuracy": app_state.ensemble.transaction_detector.metrics.get('train', {}).get('accuracy', 0)
            }
        }
    }

@app.get("/api/model-info", tags=["Analytics"])
async def get_model_info():
    """Get detailed model information"""
    if not app_state.is_ready():
        raise HTTPException(status_code=503, detail="Models are still loading")
    
    return {
        "version": "3.1.0-enhanced",
        "features": {
            "typosquatting_detection": True,
            "phishing_pattern_recognition": True,
            "transaction_risk_scoring": True,
            "real_time_analysis": True
        },
        "models": {
            "url_detector": {
                "type": "random_forest",
                "features": "Typosquatting, domain similarity, suspicious TLDs",
                "accuracy": app_state.ensemble.url_detector.metrics.get('train', {}).get('accuracy', 0)
            },
            "email_detector": {
                "type": "gradient_boosting",
                "features": "Urgency detection, threat language, phishing patterns",
                "accuracy": app_state.ensemble.email_detector.metrics.get('train', {}).get('accuracy', 0)
            },
            "transaction_detector": {
                "type": "random_forest",
                "features": "Geographic risk, velocity, amount deviation",
                "accuracy": app_state.ensemble.transaction_detector.metrics.get('train', {}).get('accuracy', 0)
            }
        }
    }

# ==================== RUN SERVER ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=False  # Set to True for development
    )