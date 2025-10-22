"""
Enhanced Model Loader for efficient ML model loading and caching
"""
import os
import pickle
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import threading
import asyncio
from pathlib import Path

logger = logging.getLogger(__name__)

class ModelCache:
    """Thread-safe model cache with TTL"""
    
    def __init__(self, ttl_hours: int = 24):
        self.cache = {}
        self.timestamps = {}
        self.ttl = timedelta(hours=ttl_hours)
        self.lock = threading.RLock()
    
    def get(self, model_name: str) -> Optional[Any]:
        """Get model from cache if not expired"""
        with self.lock:
            if model_name in self.cache:
                if datetime.now() - self.timestamps[model_name] < self.ttl:
                    return self.cache[model_name]
                else:
                    # Expired, remove from cache
                    del self.cache[model_name]
                    del self.timestamps[model_name]
            return None
    
    def set(self, model_name: str, model: Any) -> None:
        """Store model in cache"""
        with self.lock:
            self.cache[model_name] = model
            self.timestamps[model_name] = datetime.now()
    
    def clear(self) -> None:
        """Clear all cached models"""
        with self.lock:
            self.cache.clear()
            self.timestamps.clear()

class EnhancedModelLoader:
    """Enhanced model loader with caching, error handling, and async support"""
    
    def __init__(self, models_dir: str = "models"):
        self.models_dir = Path(models_dir)
        self.cache = ModelCache()
        self.loaded_models = {}
        self.model_configs = {
            "url_model": {
                "filename": "url_phishing_model.pkl",
                "type": "sklearn",
                "preprocessor": "url_preprocessor.pkl"
            },
            "email_model": {
                "filename": "email_fraud_model.pkl", 
                "type": "sklearn",
                "preprocessor": "email_preprocessor.pkl"
            },
            "transaction_model": {
                "filename": "transaction_fraud_model.pkl",
                "type": "sklearn", 
                "preprocessor": "transaction_preprocessor.pkl"
            }
        }
    
    async def load_model(self, model_name: str) -> Optional[Any]:
        """Asynchronously load a model with caching"""
        try:
            # Check cache first
            cached_model = self.cache.get(model_name)
            if cached_model:
                logger.info(f"Model {model_name} loaded from cache")
                return cached_model
            
            # Load from disk
            if model_name not in self.model_configs:
                raise ValueError(f"Unknown model: {model_name}")
            
            config = self.model_configs[model_name]
            model_path = self.models_dir / config["filename"]
            
            if not model_path.exists():
                logger.warning(f"Model file not found: {model_path}")
                return None
            
            # Load model in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            model = await loop.run_in_executor(None, self._load_model_file, model_path)
            
            if model:
                # Cache the model
                self.cache.set(model_name, model)
                self.loaded_models[model_name] = model
                logger.info(f"Model {model_name} loaded successfully")
            
            return model
            
        except Exception as e:
            logger.error(f"Error loading model {model_name}: {str(e)}")
            return None
    
    def _load_model_file(self, model_path: Path) -> Any:
        """Load model file synchronously"""
        try:
            with open(model_path, 'rb') as f:
                return pickle.load(f)
        except Exception as e:
            logger.error(f"Error loading model file {model_path}: {str(e)}")
            return None
    
    async def load_all_models(self) -> Dict[str, Any]:
        """Load all configured models"""
        results = {}
        tasks = []
        
        for model_name in self.model_configs.keys():
            task = self.load_model(model_name)
            tasks.append((model_name, task))
        
        # Execute all loads concurrently
        for model_name, task in tasks:
            try:
                model = await task
                results[model_name] = model
            except Exception as e:
                logger.error(f"Failed to load {model_name}: {str(e)}")
                results[model_name] = None
        
        return results
    
    def get_model(self, model_name: str) -> Optional[Any]:
        """Get loaded model"""
        return self.loaded_models.get(model_name)
    
    def is_model_loaded(self, model_name: str) -> bool:
        """Check if model is loaded"""
        return model_name in self.loaded_models and self.loaded_models[model_name] is not None
    
    def get_model_status(self) -> Dict[str, str]:
        """Get status of all models"""
        status = {}
        for model_name in self.model_configs.keys():
            if self.is_model_loaded(model_name):
                status[model_name] = "ready"
            else:
                status[model_name] = "not_loaded"
        return status
    
    async def reload_model(self, model_name: str) -> bool:
        """Reload a specific model"""
        try:
            # Remove from cache and loaded models
            if model_name in self.loaded_models:
                del self.loaded_models[model_name]
            
            # Load fresh
            model = await self.load_model(model_name)
            return model is not None
            
        except Exception as e:
            logger.error(f"Error reloading model {model_name}: {str(e)}")
            return False
    
    def clear_cache(self) -> None:
        """Clear model cache"""
        self.cache.clear()
        self.loaded_models.clear()
        logger.info("Model cache cleared")

# Global model loader instance
model_loader = EnhancedModelLoader()

# Convenience functions
async def load_url_model():
    """Load URL phishing detection model"""
    return await model_loader.load_model("url_model")

async def load_email_model():
    """Load email fraud detection model"""
    return await model_loader.load_model("email_model")

async def load_transaction_model():
    """Load transaction fraud detection model"""
    return await model_loader.load_model("transaction_model")

async def load_all_models():
    """Load all models"""
    return await model_loader.load_all_models()

def get_model_status():
    """Get status of all models"""
    return model_loader.get_model_status()
