# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Monorepo with a React + Vite frontend and a FastAPI backend for ML-powered fraud detection (URL, email, transaction).
- Backends: a simplified FastAPI server in backend/simple_main.py and a fuller ML API in ml_models/src/api/main.py.

Common commands
- Frontend (Vite + React)
  - Install: cd frontend && npm install
  - Dev server: npm run dev (exposes on http://localhost:5173)
  - Build: npm run build (outputs to frontend/dist)
  - Lint: npm run lint
  - Preview built app: npm run preview
  - API base URL (used by src/api/apiService.ts): default http://localhost:8000. To override for Vite-based code using import.meta.env, set VITE_API_BASE_URL in a frontend/.env.local file, e.g. VITE_API_BASE_URL=http://localhost:8000

- Backend (FastAPI)
  - Install deps (full ML stack):
    - pip install -r ml_models/requirements-ml.txt
    - (or) pip install -r backend/requirements.txt (contains the same stack)
  - Run ML API (recommended):
    - uvicorn ml_models.src.api.main:app --reload --host 0.0.0.0 --port 8000
  - Run simplified API (mock heuristics, no models):
    - python backend/simple_main.py (runs uvicorn programmatically on :8000)

- Minimal “tests” present
  - ML smoke test script (no pytest configured):
    - python ml_models/src/inference/test_models.py
  - Quick API checks (single-endpoint “tests”):
    - Health: curl http://localhost:8000/health
    - URL: curl -X POST http://localhost:8000/api/url-check -H "Content-Type: application/json" -H "Authorization: Bearer mock" -d '{"url":"https://example.com"}'
    - Email: curl -X POST http://localhost:8000/api/email-check -H "Content-Type: application/json" -H "Authorization: Bearer mock" -d '{"email_text":"Hello world"}'
    - Transaction: curl -X POST http://localhost:8000/api/transaction-check -H "Content-Type: application/json" -H "Authorization: Bearer mock" -d '{"transaction_data":{"amount":123,"country":"US"}}'

Architecture and code structure (big picture)
- Frontend (frontend/)
  - Stack: React 18, TypeScript, Vite, Tailwind, Framer Motion, GSAP, Chart.js.
  - Composition:
    - pages/: URLCheck.tsx, EmailCheck.tsx, TransactionCheck.tsx, Awareness.tsx, Dashboard.tsx, Home.tsx — user flows and visualizations.
    - components/: AnimatedResultDisplay.tsx, InputForm/UI components, Navbar/Footer, etc. — presentation + microinteractions.
    - api/: apiService.ts (primary; fetches real FastAPI endpoints at http://localhost:8000), api.ts (simulated responses for demos).
    - constants/: index.ts exposes API_BASE_URL via Vite env (VITE_API_BASE_URL) with fallback to http://localhost:8000.
  - Data flow: form inputs -> apiService methods -> FastAPI JSON -> AnimatedResultDisplay and charts.

- Backend (Python, FastAPI)
  - ML API (ml_models/src/api/main.py)
    - Endpoints: /health, /api/url-check, /api/email-check, /api/transaction-check and batch variants; /api/awareness, /api/report.
    - Uses Pydantic request/response models, CORS middleware (allow_all for dev), HTTPBearer for JWT (verification stubbed; accepts any token).
    - Startup loads models via utils.enhanced_model_loader.load_all_models(), with graceful fallbacks if enhanced modules are unavailable.
    - Inference contracts (enhanced_inference.*): return prediction, confidence, risk_level, details, recommendations, timestamp; batch functions mirror shape.
  - Simplified API (backend/simple_main.py)
    - Mirrors endpoint surface with deterministic/random heuristics for responses — useful when models aren’t available.

- ML code (ml_models/src)
  - inference/: enhanced_inference.py (async-friendly interfaces for URL/email/transaction, plus batch), plus basic variants referenced by tests.
  - utils/: enhanced_model_loader.py and model_loader.py for model discovery/caching and status reporting.
  - tests: only a smoke runner at src/inference/test_models.py that exercises inference functions directly.

Notable integration details and caveats
- Frontend expects API at http://localhost:8000 by default (apiService.ts). Ensure a FastAPI server is running there.
- README shows python main.py; no such file exists. Use uvicorn ml_models.src.api.main:app (preferred) or python backend/simple_main.py.
- README lists envs (API_HOST, API_PORT, CORS_ORIGINS, MODELS_DIR, CACHE_TTL_HOURS). Current code does not read these explicitly; adjust uvicorn flags or implement env parsing if needed.
- No formal test framework (Jest/Vitest/pytest) is configured. Use the smoke script and curl for targeted checks.

What to do first in a fresh checkout
1) Start the backend
- Option A (models-enabled API):
  - pip install -r ml_models/requirements-ml.txt
  - uvicorn ml_models.src.api.main:app --reload --host 0.0.0.0 --port 8000
- Option B (mock backend):
  - pip install -r backend/requirements.txt
  - python backend/simple_main.py

2) Start the frontend
- cd frontend && npm install && npm run dev
- If needed, create frontend/.env.local with VITE_API_BASE_URL=http://localhost:8000

3) Validate end-to-end
- Visit http://localhost:5173 and use the URL/Email/Transaction pages.
- Watch FastAPI logs for requests; use /docs for interactive Swagger UI.
