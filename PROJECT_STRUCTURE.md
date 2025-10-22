# 🛡️ Fraud Detection Platform - Project Structure

## 📁 **Organized Folder Structure**

```
fraud-detection-platform/
├── 📁 backend/                    # FastAPI Backend
│   ├── simple_main.py            # Main API server
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # Backend documentation
│
├── 📁 frontend/                   # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/         # React components
│   │   │   ├── AnimatedResultDisplay.tsx
│   │   │   ├── InputForm.tsx
│   │   │   └── ui/               # UI components
│   │   ├── 📁 pages/             # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── URLCheck.tsx
│   │   │   ├── EmailCheck.tsx
│   │   │   ├── TransactionCheck.tsx
│   │   │   ├── Awareness.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── 📁 api/               # API services
│   │   │   └── apiService.ts     # API communication
│   │   ├── 📁 utils/             # Utilities
│   │   │   └── gsapAnimations.ts # Animation utilities
│   │   └── App.tsx              # Main app component
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── index.html              # Entry point
│
├── 📁 ml_models/                # Machine Learning Models
│   ├── 📁 src/
│   │   ├── 📁 api/              # API endpoints
│   │   ├── 📁 inference/        # ML inference
│   │   ├── 📁 utils/            # ML utilities
│   │   └── 📁 models/           # Trained models
│   └── requirements-ml.txt     # ML dependencies
│
├── 🚀 start-all.bat            # Start both services
├── 🚀 start-frontend.bat       # Start frontend only
├── 🚀 start-backend.bat        # Start backend only
├── 📄 README.md               # Main documentation
└── 📄 PROJECT_STRUCTURE.md   # This file
```

## 🚀 **How to Run the Platform**

### **Option 1: Start Everything (Recommended)**
```bash
# Double-click or run:
start-all.bat
```

### **Option 2: Start Services Separately**

**Backend (Terminal 1):**
```bash
cd backend
python simple_main.py
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

## 🌐 **Access Points**

- **Frontend**: http://localhost:5174/
- **Backend API**: http://localhost:8000/
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🎯 **Features Working**

### ✅ **Frontend Features**
- Cinematic GSAP animations
- Interactive awareness content
- Animated charts and dashboards
- Real-time API communication
- Responsive design

### ✅ **Backend Features**
- FastAPI with automatic documentation
- Mock ML predictions
- CORS enabled for frontend
- Health monitoring
- Error handling

### ✅ **API Endpoints**
- `POST /api/url-check` - URL analysis
- `POST /api/email-check` - Email analysis
- `POST /api/transaction-check` - Transaction analysis
- `GET /api/awareness` - Awareness content
- `POST /api/report` - Fraud reporting
- `GET /health` - System health

## 🔧 **Development Workflow**

1. **Backend Development**: Edit files in `backend/`
2. **Frontend Development**: Edit files in `frontend/src/`
3. **API Testing**: Use http://localhost:8000/docs
4. **Frontend Testing**: Use http://localhost:5174/

## 📝 **Next Steps**

1. **Test the Platform**: Visit http://localhost:5174/
2. **Try URL Checker**: Enter a URL to test
3. **Try Email Checker**: Paste email content
4. **Try Transaction Checker**: Enter transaction details
5. **Explore Awareness Page**: Interactive learning content
6. **Check Dashboard**: Animated analytics

## 🛠️ **Troubleshooting**

### **Frontend Issues**
- Check if port 5174 is available
- Run `npm install` in frontend folder
- Check browser console for errors

### **Backend Issues**
- Check if port 8000 is available
- Install Python dependencies: `pip install -r requirements.txt`
- Check terminal for error messages

### **API Connection Issues**
- Verify backend is running on port 8000
- Check CORS settings in backend
- Verify API endpoints in browser dev tools

## 🎨 **Enhanced Features**

- **Cinematic Animations**: GSAP-powered smooth transitions
- **Interactive Learning**: Scroll-triggered awareness content
- **Real-time Analytics**: Animated charts and dashboards
- **Responsive Design**: Works on all devices
- **API Integration**: Seamless frontend-backend communication

---

**🚀 The platform is now fully organized and ready for development!**
