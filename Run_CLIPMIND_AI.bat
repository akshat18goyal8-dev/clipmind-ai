@echo off
TITLE CLIPMIND AI - Universal Video Clipping Platform
COLOR 0A

echo ======================================================================
echo                 CLIPMIND AI - LOCAL STUDIO LAUNCHER                   
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking environment...
if not exist "backend\venv\Scripts\python.exe" (
    echo [INFO] Running initial setup...
    call install.bat
)

echo [2/3] Preparing Studio Interface...
if not exist "frontend\dist\index.html" (
    if exist "frontend\package.json" (
        cd frontend
        call npm install
        call npm run build
        cd ..
    )
)

echo [3/3] Checking CLIPMIND AI Studio on http://localhost:8000 ...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] CLIPMIND AI engine is already active and healthy!
    start http://localhost:8000
    echo Studio is opened in your browser at http://localhost:8000
    echo Keep this window open or press any key to close launcher.
    pause
    exit /b 0
)

start "" /b cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:8000"

cd backend
set PYTHONPATH=.
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000

pause
