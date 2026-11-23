@echo off
TITLE CLIPMIND AI - Universal Video Clipping Platform
COLOR 0A

echo ======================================================================
echo                 CLIPMIND AI - LOCAL STUDIO LAUNCHER                   
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python virtual environment...
if not exist "backend\venv\Scripts\python.exe" (
    echo [INFO] Initializing Python virtual environment...
    python -m venv backend\venv
    call backend\venv\Scripts\pip install -r backend\requirements.txt
)

echo [2/3] Checking production frontend build...
if not exist "frontend\dist\index.html" (
    echo [INFO] Building frontend production bundle...
    cd frontend
    call npm install
    call npm run build
    cd ..
)

echo [3/3] Starting CLIPMIND AI Engine on http://localhost:8000 ...
start "" "http://localhost:8000"

cd backend
set PYTHONPATH=.
.\venv\Scripts\python main.py

pause
