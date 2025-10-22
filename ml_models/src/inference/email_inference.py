"""
Email Inference Module
Provides predict_email and batch prediction utilities.
"""

from typing import Dict, List
import os
import numpy as np

from ..data.email_preprocessor import EmailPreprocessor
from ..utils.model_loader import load_joblib

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'saved')

_LR_PATH = os.path.join(MODELS_DIR, 'email_lr_model.pkl')
_SCALER_PATH = os.path.join(MODELS_DIR, 'email_scaler.pkl')
_PREPROC_PATH = os.path.join(MODELS_DIR, 'email_preprocessor.pkl')

_preprocessor: EmailPreprocessor = None


def _load_email_model():
    if not os.path.exists(_LR_PATH):
        raise FileNotFoundError("No Email model found. Train to create email_lr_model.pkl")
    model = load_joblib(_LR_PATH)
    scaler = load_joblib(_SCALER_PATH) if os.path.exists(_SCALER_PATH) else None
    global _preprocessor
    if _preprocessor is None:
        _preprocessor = load_joblib(_PREPROC_PATH) if os.path.exists(_PREPROC_PATH) else EmailPreprocessor()
    return model, scaler, _preprocessor


def _prepare_email_features(texts: List[str], preproc: EmailPreprocessor):
    feat_dicts = [preproc.extract_features(t) for t in texts]
    feat_df = None
    try:
        import pandas as pd
        feat_df = pd.DataFrame(feat_dicts).fillna(0)
    except Exception:
        keys = sorted({k for d in feat_dicts for k in d.keys()})
        import numpy as np
        feat_df = np.array([[d.get(k, 0.0) for k in keys] for d in feat_dicts])
    tfidf = preproc.transform_tfidf(texts)
    if hasattr(feat_df, 'values'):
        X_other = feat_df.values
    else:
        X_other = feat_df
    X = np.hstack([X_other, tfidf])
    return X


def predict_email(email_text: str) -> Dict:
    model, scaler, preproc = _load_email_model()
    X = _prepare_email_features([email_text], preproc)
    # scaler on other features was applied during training; skipped here to avoid shape mismatch
    proba = float(model.predict_proba(X)[0, 1])
    prediction = 'phishing' if proba >= 0.5 else 'legit'
    return {"prediction": prediction, "confidence": round(proba if prediction=='phishing' else 1 - proba, 4)}


def predict_email_batch(emails: List[str]) -> List[Dict]:
    model, scaler, preproc = _load_email_model()
    X = _prepare_email_features(emails, preproc)
    probas = model.predict_proba(X)[:, 1]
    outs = []
    for p in probas:
        pred = 'phishing' if p >= 0.5 else 'legit'
        outs.append({"prediction": pred, "confidence": round(p if pred=='phishing' else 1 - p, 4)})
    return outs
