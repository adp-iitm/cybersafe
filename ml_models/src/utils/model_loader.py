"""
Utility to lazily load and cache ML models for fast inference.
"""

import os
import joblib
from typing import Any, Dict
from threading import Lock


class _ModelCache:
    def __init__(self) -> None:
        self._objects: Dict[str, Any] = {}
        self._lock = Lock()

    def get(self, key: str, loader):
        if key in self._objects:
            return self._objects[key]
        with self._lock:
            if key in self._objects:
                return self._objects[key]
            obj = loader()
            self._objects[key] = obj
            return obj


MODEL_CACHE = _ModelCache()


def load_joblib(path: str):
    def _loader():
        if not os.path.exists(path):
            raise FileNotFoundError(f"Model file not found: {path}")
        return joblib.load(path)
    return MODEL_CACHE.get(path, _loader)
