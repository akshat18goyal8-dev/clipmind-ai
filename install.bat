@echo off
TITLE CLIPMIND AI - Automated Installer
COLOR 0B

echo ======================================================================
echo                  CLIPMIND AI - AUTOMATED INSTALLER                    
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in system PATH.
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

echo [2/4] Checking FFmpeg installation...
ffmpeg -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] FFmpeg is not found in PATH.
    echo Please install FFmpeg (https://ffmpeg.org) and add it to your system PATH for video clipping.
)

echo [3/4] Setting up Python virtual environment and AI dependencies...
if not exist "backend\venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv backend\venv
)

echo Upgrading pip and installing required AI packages...
call backend\venv\Scripts\python.exe -m pip install --upgrade pip
call backend\venv\Scripts\pip install -r backend\requirements.txt
call backend\venv\Scripts\pip install pywebview "opencv-python-headless>=4.9,<5.0" "opencv-python>=4.9,<5.0"

echo [4/4] Verifying production studio UI...
if exist "frontend\dist\index.html" (
    echo [OK] Pre-compiled high-performance Studio UI is verified and ready.
) else (
    if exist "frontend\package.json" (
        echo [INFO] Building UI bundle from source...
        cd frontend
        call npm install
        call npm run build
        cd ..
    )
)

echo.
echo ======================================================================
echo           INSTALLATION COMPLETE! CLIPMIND AI IS READY!               
echo ======================================================================
echo.
echo To run the software in standalone desktop mode, double-click:
echo   Run_Desktop_App.bat
echo.
echo To run in web browser mode, double-click:
echo   Run_CLIPMIND_AI.bat
echo.
pause
