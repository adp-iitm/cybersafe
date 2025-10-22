"""
Enhanced inference module with improved error handling and response formatting
"""
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio

from ..utils.enhanced_model_loader import model_loader

logger = logging.getLogger(__name__)

class FraudDetectionResult:
    """Structured result for fraud detection"""
    
    def __init__(self, prediction: str, confidence: float, details: str = "", recommendations: List[str] = None):
        self.prediction = prediction
        self.confidence = confidence
        self.details = details
        self.recommendations = recommendations or []
        self.timestamp = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "prediction": self.prediction,
            "confidence": self.confidence,
            "risk_level": self._get_risk_level(),
            "details": self.details,
            "recommendations": self.recommendations,
            "timestamp": self.timestamp.isoformat()
        }
    
    def _get_risk_level(self) -> str:
        """Determine risk level based on confidence"""
        if self.confidence >= 0.8:
            return "high"
        elif self.confidence >= 0.6:
            return "medium"
        else:
            return "low"

async def predict_url_enhanced(url: str) -> Dict[str, Any]:
    """Enhanced URL prediction with better error handling"""
    try:
        # Load model if not already loaded
        model = await model_loader.load_model("url_model")
        if not model:
            raise Exception("URL model not available")
        
        # Preprocess URL
        processed_url = _preprocess_url(url)
        
        # Make prediction
        prediction = model.predict([processed_url])[0]
        confidence = model.predict_proba([processed_url])[0].max()
        
        # Generate result
        result = FraudDetectionResult(
            prediction="fraudulent" if prediction == 1 else "safe",
            confidence=float(confidence),
            details=_get_url_details(url, prediction, confidence),
            recommendations=_get_url_recommendations(prediction, confidence)
        )
        
        return result.to_dict()
        
    except Exception as e:
        logger.error(f"Error in URL prediction: {str(e)}")
        return {
            "prediction": "error",
            "confidence": 0.0,
            "risk_level": "unknown",
            "details": f"Analysis failed: {str(e)}",
            "recommendations": ["Please try again or contact support"],
            "timestamp": datetime.now().isoformat()
        }

async def predict_email_enhanced(email_text: str) -> Dict[str, Any]:
    """Enhanced email prediction with better error handling"""
    try:
        # Load model if not already loaded
        model = await model_loader.load_model("email_model")
        if not model:
            raise Exception("Email model not available")
        
        # Preprocess email
        processed_email = _preprocess_email(email_text)
        
        # Make prediction
        prediction = model.predict([processed_email])[0]
        confidence = model.predict_proba([processed_email])[0].max()
        
        # Generate result
        result = FraudDetectionResult(
            prediction="fraudulent" if prediction == 1 else "safe",
            confidence=float(confidence),
            details=_get_email_details(email_text, prediction, confidence),
            recommendations=_get_email_recommendations(prediction, confidence)
        )
        
        return result.to_dict()
        
    except Exception as e:
        logger.error(f"Error in email prediction: {str(e)}")
        return {
            "prediction": "error",
            "confidence": 0.0,
            "risk_level": "unknown",
            "details": f"Analysis failed: {str(e)}",
            "recommendations": ["Please try again or contact support"],
            "timestamp": datetime.now().isoformat()
        }

async def predict_transaction_enhanced(transaction_data: Dict[str, Any]) -> Dict[str, Any]:
    """Enhanced transaction prediction with better error handling"""
    try:
        # Load model if not already loaded
        model = await model_loader.load_model("transaction_model")
        if not model:
            raise Exception("Transaction model not available")
        
        # Preprocess transaction
        processed_transaction = _preprocess_transaction(transaction_data)
        
        # Make prediction
        prediction = model.predict([processed_transaction])[0]
        confidence = model.predict_proba([processed_transaction])[0].max()
        
        # Generate result
        result = FraudDetectionResult(
            prediction="fraudulent" if prediction == 1 else "safe",
            confidence=float(confidence),
            details=_get_transaction_details(transaction_data, prediction, confidence),
            recommendations=_get_transaction_recommendations(prediction, confidence)
        )
        
        return result.to_dict()
        
    except Exception as e:
        logger.error(f"Error in transaction prediction: {str(e)}")
        return {
            "prediction": "error",
            "confidence": 0.0,
            "risk_level": "unknown",
            "details": f"Analysis failed: {str(e)}",
            "recommendations": ["Please try again or contact support"],
            "timestamp": datetime.now().isoformat()
        }

# Batch processing functions
async def predict_url_batch_enhanced(urls: List[str]) -> List[Dict[str, Any]]:
    """Enhanced batch URL prediction"""
    results = []
    for url in urls:
        result = await predict_url_enhanced(url)
        results.append(result)
    return results

async def predict_email_batch_enhanced(emails: List[str]) -> List[Dict[str, Any]]:
    """Enhanced batch email prediction"""
    results = []
    for email in emails:
        result = await predict_email_enhanced(email)
        results.append(result)
    return results

async def predict_transaction_batch_enhanced(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Enhanced batch transaction prediction"""
    results = []
    for transaction in transactions:
        result = await predict_transaction_enhanced(transaction)
        results.append(result)
    return results

# Helper functions
def _preprocess_url(url: str) -> str:
    """Preprocess URL for model input"""
    # Basic preprocessing - implement actual preprocessing logic
    return url.lower().strip()

def _preprocess_email(email_text: str) -> str:
    """Preprocess email for model input"""
    # Basic preprocessing - implement actual preprocessing logic
    return email_text.lower().strip()

def _preprocess_transaction(transaction_data: Dict[str, Any]) -> List[float]:
    """Preprocess transaction data for model input"""
    # Basic preprocessing - implement actual preprocessing logic
    features = []
    features.append(transaction_data.get("amount", 0))
    features.append(len(transaction_data.get("merchant", "")))
    features.append(len(transaction_data.get("country", "")))
    return features

def _get_url_details(url: str, prediction: int, confidence: float) -> str:
    """Generate detailed analysis for URL"""
    if prediction == 1:
        return f"URL '{url}' shows characteristics of a phishing site with {confidence:.1%} confidence"
    else:
        return f"URL '{url}' appears to be legitimate with {confidence:.1%} confidence"

def _get_email_details(email_text: str, prediction: int, confidence: float) -> str:
    """Generate detailed analysis for email"""
    if prediction == 1:
        return f"Email content shows characteristics of a scam with {confidence:.1%} confidence"
    else:
        return f"Email content appears to be legitimate with {confidence:.1%} confidence"

def _get_transaction_details(transaction_data: Dict[str, Any], prediction: int, confidence: float) -> str:
    """Generate detailed analysis for transaction"""
    amount = transaction_data.get("amount", 0)
    if prediction == 1:
        return f"Transaction of ${amount} shows characteristics of fraud with {confidence:.1%} confidence"
    else:
        return f"Transaction of ${amount} appears to be legitimate with {confidence:.1%} confidence"

def _get_url_recommendations(prediction: int, confidence: float) -> List[str]:
    """Get recommendations for URL analysis"""
    if prediction == 1:
        return [
            "Do not click on this link",
            "Verify the website through official channels",
            "Report this as a phishing attempt"
        ]
    else:
        return [
            "This URL appears safe to visit",
            "Always verify the website's authenticity",
            "Use HTTPS when entering sensitive information"
        ]

def _get_email_recommendations(prediction: int, confidence: float) -> List[str]:
    """Get recommendations for email analysis"""
    if prediction == 1:
        return [
            "Do not respond to this email",
            "Delete the email immediately",
            "Report this as spam/phishing"
        ]
    else:
        return [
            "This email appears to be legitimate",
            "Always verify sender identity",
            "Be cautious with any requests for personal information"
        ]

def _get_transaction_recommendations(prediction: int, confidence: float) -> List[str]:
    """Get recommendations for transaction analysis"""
    if prediction == 1:
        return [
            "Review this transaction carefully",
            "Contact your bank if suspicious",
            "Consider additional verification"
        ]
    else:
        return [
            "This transaction appears legitimate",
            "Monitor your account for any unusual activity",
            "Keep transaction records for your records"
        ]
