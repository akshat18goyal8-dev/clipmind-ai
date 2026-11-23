# CLIPMIND AI

AI-Powered Universal Video Clipping Platform.

## Overview
CLIPMIND AI automatically analyzes videos, livestreams, and uploaded media files to extract high-engagement, platform-ready short clips (10s, 15s, 30s, 60s) with 9:16 vertical subject framing and multi-platform social media copy.

## Core Features
- Universal Video Input (YouTube, Twitch, streams, and direct file uploads)
- Content Category Engine (Gaming, Podcasts, Education, Comedy, Sports, etc.)
- Multi-Signal Highlight Detection (audio waveform peaks, scene changes, speech-to-text)
- Smart 9:16 Vertical Video Framing with OpenCV face tracking
- Viral Potential Scoring (0-100 metric breakdown)
- Platform Copy Generator (YouTube Shorts, Instagram Reels, TikTok, Hindi regional)
- Batch Export System with SRT subtitle files

## Architecture
- Backend: Python 3.11, FastAPI, FFmpeg, PySceneDetect, faster-whisper, OpenCV, SQLAlchemy (asyncio)
- Frontend: React 18, TypeScript, Tailwind CSS, Vite
- Storage: Structured local storage with SQLite / PostgreSQL support

## Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Docker Deployment
```bash
docker-compose up --build
```
