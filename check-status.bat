@echo off
echo ========================================
echo    Fraud Detection Platform Status
echo ========================================
echo.

echo Checking Backend API (Port 8000)...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend API: RUNNING at http://localhost:8000/
    echo    API Docs: http://localhost:8000/docs
) else (
    echo ❌ Backend API: NOT RUNNING
)
echo.

echo Checking Frontend (Port 5173)...
curl -s http://localhost:5173/ >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Frontend: RUNNING at http://localhost:5173/
) else (
    echo ❌ Frontend: NOT RUNNING
)
echo.

echo ========================================
echo    Platform Status Summary
echo ========================================
echo.
echo 🚀 Ready to use:
echo    Frontend: http://localhost:5173/
echo    Backend:  http://localhost:8000/
echo    API Docs: http://localhost:8000/docs
echo.
pause
