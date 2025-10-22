"""
URL Inference Module
Provides predict_url and batch prediction utilities.
"""

from typing import Dict, List
import os
import numpy as np

from ..data.url_preprocessor import URLPreprocessor
from ..utils.model_loader import load_joblib

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'saved')

_RF_PATH = os.path.join(MODELS_DIR, 'url_rf_model.pkl')
_XGB_PATH = os.path.join(MODELS_DIR, 'url_xgb_model.pkl')
_SCALER_PATH = os.path.join(MODELS_DIR, 'url_scaler.pkl')
_FEATURES_PATH = os.path.join(MODELS_DIR, 'url_feature_names.pkl')

_preprocessor = URLPreprocessor()


def _load_url_model():
    model = None
    if os.path.exists(_XGB_PATH):
        model = load_joblib(_XGB_PATH)
    elif os.path.exists(_RF_PATH):
        model = load_joblib(_RF_PATH)
    else:
        raise FileNotFoundError("No URL model found. Train models to create url_[rf|xgb]_model.pkl")
    scaler = load_joblib(_SCALER_PATH) if os.path.exists(_SCALER_PATH) else None
    feature_names = load_joblib(_FEATURES_PATH) if os.path.exists(_FEATURES_PATH) else None
    return model, scaler, feature_names


def _to_matrix(feature_dicts: List[Dict[str, float]], feature_names: List[str]):
    X = np.array([[fd.get(name, 0.0) for name in feature_names] for fd in feature_dicts], dtype=float)
    return X


def predict_url(url: str) -> Dict:
    model, scaler, feature_names = _load_url_model()
    features = _preprocessor.extract_features(url)
    if feature_names is None:
        feature_names = list(features.keys())
    X = _to_matrix([features], feature_names)
    if scaler is not None:
        X = scaler.transform(X)
    proba = float(model.predict_proba(X)[0, 1])
    prediction = 'phishing' if proba >= 0.5 else 'legit'
    return {"prediction": prediction, "confidence": round(proba if prediction=='phishing' else 1 - proba, 4)}


def predict_url_batch(urls: List[str]) -> List[Dict]:
    model, scaler, feature_names = _load_url_model()
    feature_dicts = [_preprocessor.extract_features(u) for u in urls]
    if feature_names is None:
        keys = sorted({k for fd in feature_dicts for k in fd.keys()})
        feature_names = keys
    X = _to_matrix(feature_dicts, feature_names)
    if scaler is not None:
        X = scaler.transform(X)
    probas = model.predict_proba(X)[:, 1]
    outputs = []
    for p in probas:
        pred = 'phishing' if p >= 0.5 else 'legit'
        outputs.append({"prediction": pred, "confidence": round(p if pred=='phishing' else 1 - p, 4)})
    return outputs
