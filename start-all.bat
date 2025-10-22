@echo off
echo Starting Fraud Detection Platform...
echo.
echo Starting Backend API Server...
start "Backend API" cmd /k "cd backend && python simple_main.py"
timeout /t 3 /nobreak > nul
echo.
echo Starting Frontend Development Server...
start "Frontend Dev" cmd /k "cd frontend && npm run dev"
echo.
echo Both services are starting...
echo Frontend will be available at: http://localhost:5174/
echo Backend API will be available at: http://localhost:8000/
echo API Documentation: http://localhost:8000/docs
pause
