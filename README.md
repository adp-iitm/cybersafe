# 🛡️ Fraud Detection & Awareness Platform

A cutting-edge AI-powered fraud detection platform with cinematic animations, enhanced awareness content, and robust backend architecture. Built with React, FastAPI, and machine learning models for comprehensive fraud protection.

## ✨ Features

### 🎨 Frontend Enhancements
- **Cinematic Animations**: GSAP-powered smooth animations with Apple/Cyberpunk aesthetics
- **Scroll-Triggered Storytelling**: Interactive awareness content with parallax effects
- **Animated Charts**: Dynamic data visualization with Chart.js integration
- **Microinteractions**: Hover effects, loading animations, and result transitions
- **Responsive Design**: Fully responsive across all devices

### 🧠 Machine Learning
- **URL Phishing Detection**: Analyze URLs for phishing indicators
- **Email Fraud Analysis**: Detect scam emails and phishing attempts
- **Transaction Fraud Detection**: Assess financial transaction risks
- **Real-time Inference**: Fast model predictions with caching
- **Batch Processing**: Efficient bulk analysis capabilities

### 🔧 Backend Architecture
- **FastAPI**: High-performance async API with automatic documentation
- **Enhanced Error Handling**: Comprehensive error management and logging
- **Model Caching**: Thread-safe model caching with TTL
- **Authentication**: JWT-based security with role management
- **Health Monitoring**: API health checks and model status monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- pip for Python dependencies

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt
pip install -r ml_models/requirements-ml.txt

# Start FastAPI server
python main.py
```

## 🎯 Key Components

### Frontend Structure
```
src/
├── components/
│   ├── AnimatedResultDisplay.tsx    # Enhanced result display
│   ├── InputForm.tsx               # Animated form components
│   └── ui/                         # Reusable UI components
├── pages/
│   ├── Home.tsx                    # Cinematic hero section
│   ├── Awareness.tsx               # Interactive awareness content
│   └── Dashboard.tsx               # Animated charts and analytics
├── utils/
│   └── gsapAnimations.ts           # GSAP animation utilities
└── App.tsx                         # Main application
```

### Backend Structure
```
ml_models/src/
├── api/
│   └── main.py                     # Enhanced FastAPI application
├── inference/
│   └── enhanced_inference.py       # Improved ML inference
├── utils/
│   └── enhanced_model_loader.py    # Efficient model loading
└── models/                        # ML model files
```

## 🎨 Animation Features

### GSAP Animations
- **Hero Section**: Text split reveals with glowing effects
- **Background Waves**: Animated gradient waves
- **Scroll Triggers**: Parallax motion and reveal animations
- **Form Interactions**: Input focus effects with glow
- **Result Displays**: Animated color transitions and icons

### Chart Animations
- **Bar Charts**: Fraud trend visualization
- **Doughnut Charts**: Fraud type distribution
- **Line Charts**: Detection accuracy trends
- **Smooth Transitions**: Animated data updates

## 🔍 API Endpoints

### Core Detection
- `POST /api/url-check` - Analyze single URL
- `POST /api/email-check` - Analyze email content
- `POST /api/transaction-check` - Analyze transaction data

### Batch Processing
- `POST /api/batch/url-check` - Batch URL analysis
- `POST /api/batch/email-check` - Batch email analysis
- `POST /api/batch/transaction-check` - Batch transaction analysis

### Enhanced Features
- `GET /api/awareness` - Fraud awareness content
- `POST /api/report` - Report suspected fraud
- `GET /health` - API health and model status

## 🛡️ Security Features

- **JWT Authentication**: Secure API access
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Secure error responses
- **Rate Limiting**: API protection (configurable)
- **CORS Configuration**: Cross-origin security

## 📊 Dashboard Analytics

### Real-time Metrics
- URLs checked and fraud detected
- Email scans and phishing attempts
- Transaction analysis and fraud alerts
- Detection accuracy trends

### Interactive Charts
- Fraud type distribution
- Monthly trend analysis
- Detection accuracy over time
- Geographic fraud patterns

## 🎓 Awareness Content

### Interactive Learning
- **Scam Types**: Phishing, tech support, investment, romance scams
- **Fake vs Real Examples**: Side-by-side comparisons
- **Safety Steps**: Interactive security guidelines
- **Prevention Tips**: Actionable security advice

### Visual Storytelling
- Scroll-triggered animations
- Interactive infographics
- Animated safety steps
- Dynamic content reveals

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:3000"]

# Model Configuration
MODELS_DIR=./ml_models/models
CACHE_TTL_HOURS=24
```

### Model Loading
- Automatic model loading on startup
- Thread-safe caching with TTL
- Async model loading for performance
- Health monitoring and status reporting

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Docker)
```dockerfile
FROM python:3.9-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
```

## 📈 Performance

### Optimizations
- **Model Caching**: Reduced loading times
- **Async Processing**: Non-blocking operations
- **Batch Processing**: Efficient bulk operations
- **CDN Integration**: Static asset optimization

### Monitoring
- API response times
- Model loading status
- Error rates and logging
- Health check endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API docs at `/docs`

---

**Built with ❤️ for cybersecurity awareness and fraud prevention**
