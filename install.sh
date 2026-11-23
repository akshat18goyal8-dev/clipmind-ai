#!/usr/bin/env bash
set -e

echo "======================================================================"
echo "                  CLIPMIND AI - AUTOMATED INSTALLER                   "
echo "======================================================================"

cd "$(dirname "$0")"

echo "[1/4] Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 is required. Please install Python 3.10+."
    exit 1
fi

echo "[2/4] Checking FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "[WARNING] ffmpeg is not installed. Please run: sudo apt install ffmpeg or brew install ffmpeg"
fi

echo "[3/4] Setting up Python virtual environment..."
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
fi

source backend/venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install pywebview "opencv-python-headless>=4.9,<5.0" "opencv-python>=4.9,<5.0"

echo "[4/4] Building production UI..."
if [ -d "frontend" ]; then
    cd frontend
    npm install
    npm run build
    cd ..
fi

echo "======================================================================"
echo "Installation complete! Run ./run.sh to start CLIPMIND AI."
echo "======================================================================"
