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
    echo Please install FFmpeg or place ffmpeg.exe in your PATH.
)

echo [3/4] Setting up Python virtual environment and AI dependencies...
if not exist "backend\venv" (
    python -m venv backend\venv
)
call backend\venv\Scripts\pip install --upgrade pip
call backend\venv\Scripts\pip install -r backend\requirements.txt
call backend\venv\Scripts\pip install pywebview "opencv-python-headless>=4.9,<5.0" "opencv-python>=4.9,<5.0"

echo [4/4] Building production UI application...
if exist "frontend" (
    cd frontend
    call npm install
    call npm run build
    cd ..
)

echo.
echo ======================================================================
echo           INSTALLATION COMPLETE! CLIPMIND AI IS READY                
echo ======================================================================
echo.
echo To run the software as a desktop app, double-click:
echo   Run_Desktop_App.bat
echo.
echo To run the web studio in your browser, double-click:
echo   Run_CLIPMIND_AI.bat
echo.
pause
