"""
Transaction Inference Module
Provides predict_transaction and batch prediction utilities.
"""

from typing import Dict, List
import os
import numpy as np

from ..data.transaction_preprocessor import TransactionPreprocessor
from ..utils.model_loader import load_joblib

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'saved')

_RF_PATH = os.path.join(MODELS_DIR, 'transaction_rf_model.pkl')
_LGB_PATH = os.path.join(MODELS_DIR, 'transaction_lgb_model.pkl')
_SCALER_PATH = os.path.join(MODELS_DIR, 'transaction_scaler.pkl')
_FEATURES_PATH = os.path.join(MODELS_DIR, 'transaction_feature_names.pkl')

_preprocessor = TransactionPreprocessor()


def _load_txn_model():
    model = None
    if os.path.exists(_LGB_PATH):
        model = load_joblib(_LGB_PATH)
    elif os.path.exists(_RF_PATH):
        model = load_joblib(_RF_PATH)
    else:
        raise FileNotFoundError("No Transaction model found. Train models to create transaction_[rf|lgb]_model.pkl")
    scaler = load_joblib(_SCALER_PATH) if os.path.exists(_SCALER_PATH) else None
    feature_names = load_joblib(_FEATURES_PATH) if os.path.exists(_FEATURES_PATH) else None
    return model, scaler, feature_names


def _to_matrix(feature_dicts: List[Dict[str, float]], feature_names: List[str]):
    X = np.array([[fd.get(name, 0.0) for name in feature_names] for fd in feature_dicts], dtype=float)
    return X


def predict_transaction(transaction_data: Dict) -> Dict:
    model, scaler, feature_names = _load_txn_model()
    features = _preprocessor.extract_features(transaction_data)
    if feature_names is None:
        feature_names = list(features.keys())
    X = _to_matrix([features], feature_names)
    if scaler is not None:
        X = scaler.transform(X)
    proba = float(model.predict_proba(X)[0, 1])
    prediction = 'phishing' if proba >= 0.5 else 'legit'
    return {"prediction": prediction, "confidence": round(proba if prediction=='phishing' else 1 - proba, 4)}


def predict_transaction_batch(transactions: List[Dict]) -> List[Dict]:
    model, scaler, feature_names = _load_txn_model()
    feature_dicts = [_preprocessor.extract_features(t) for t in transactions]
    if feature_names is None:
        keys = sorted({k for fd in feature_dicts for k in fd.keys()})
        feature_names = keys
    X = _to_matrix(feature_dicts, feature_names)
    if scaler is not None:
        X = scaler.transform(X)
    probas = model.predict_proba(X)[:, 1]
    outs = []
    for p in probas:
        pred = 'phishing' if p >= 0.5 else 'legit'
        outs.append({"prediction": pred, "confidence": round(p if pred=='phishing' else 1 - p, 4)})
    return outs
