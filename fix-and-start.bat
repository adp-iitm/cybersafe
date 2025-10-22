@echo off
echo ========================================
echo    Fraud Detection Platform - Fix & Start
echo ========================================
echo.

echo 🔧 Fixing common issues...

echo 1. Killing any existing processes on ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /PID %%a /F >nul 2>&1

echo 2. Ensuring all required files are in place...
if not exist "frontend\tsconfig.node.json" (
    echo    Copying missing TypeScript config...
    copy "tsconfig.node.json" "frontend\" >nul 2>&1
)

if not exist "frontend\postcss.config.js" (
    echo    Copying missing PostCSS config...
    copy "postcss.config.js" "frontend\" >nul 2>&1
)

echo 3. Installing frontend dependencies...
cd frontend
call npm install >nul 2>&1
cd ..

echo 4. Installing backend dependencies...
cd backend
pip install -r requirements.txt >nul 2>&1
cd ..

echo.
echo 🚀 Starting services...

echo Starting Backend API Server...
start "Backend API" cmd /k "cd backend && python simple_main.py"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Development Server...
start "Frontend Dev" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both services are starting...
echo.
echo 🌐 Access Points:
echo    Frontend: http://localhost:5173/
echo    Backend:  http://localhost:8000/
echo    API Docs: http://localhost:8000/docs
echo.
echo 📝 Note: It may take a few seconds for both services to fully start.
echo    Check the terminal windows for any error messages.
echo.
pause
