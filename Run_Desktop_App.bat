@echo off
TITLE CLIPMIND AI - Desktop Application
COLOR 0A

echo ======================================================================
echo                  CLIPMIND AI - PC DESKTOP SOFTWARE                    
echo ======================================================================
echo.

cd /d "%~dp0"

if not exist "backend\venv\Scripts\python.exe" (
    echo [INFO] Running first-time installation...
    call install.bat
)

echo [INFO] Launching CLIPMIND AI Desktop Studio...
call backend\venv\Scripts\python desktop_app.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] Launching via browser mode fallback...
    call Run_CLIPMIND_AI.bat
)
