# CLIPMIND AI — Universal Video Clipping Platform & Desktop Studio

AI-Powered Universal Video Clipping Platform. Turn long videos, streams, and podcasts into viral short-form clips (10s, 15s, 30s, 60s) with 9:16 vertical face tracking, dynamic burned captions, and multi-platform social media generation.

---

## Download & Run On Your Own PC

### Option 1: 1-Click Desktop Software (Windows)
1. Download or clone this repository.
2. Double-click **`Run_Desktop_App.bat`**.
   - If running for the first time, it automatically installs dependencies and starts the native desktop software window.

### Option 2: 1-Click Web Studio (Windows / Mac / Linux)
- **Windows**: Double-click **`Run_CLIPMIND_AI.bat`**. It starts the server and opens `http://localhost:8000` in your default browser.
- **Linux / macOS**:
  ```bash
  chmod +x install.sh run.sh
  ./install.sh
  ./run.sh
  ```

### Option 3: Docker Deployment
```bash
docker-compose up --build
```
Access the studio at `http://localhost:8000`.

---

## Core Features

- **Universal Input**: Single input for YouTube, Twitch, Kick, streams, or local video file upload (MP4, MOV, MKV, WebM up to 2GB).
- **16 Content Categories**: Gaming, Podcasts, Education, Comedy, Sports, Reactions, Interviews, Technology, etc., with intelligent Auto-Detect.
- **Multi-Signal AI Highlights**:
  - Acoustic energy analysis (identifies cheering, laughing, and volume peaks).
  - Speech transcription with word-level boundaries via `faster-whisper`.
  - Sentence pause snapping (no cuts in the middle of sentences).
  - Scene cut detection and motion activity scoring via `PySceneDetect`.
- **Smart 9:16 Video Editor**:
  - OpenCV face and subject tracking centers speakers automatically.
  - Dual-layer Gaussian background blur.
  - Automatic burned-in high-contrast captions and downloadable `.srt` files.
- **Viral Potential Score (0–100)**:
  - 6-metric breakdown: Hook Strength, Emotional Energy, Pacing & Engagement, Audience Excitement, Content Uniqueness, and Loopability.
- **Bilingual Social Media Generator**:
  - Ready-to-copy titles, captions, hooks, and hashtags for YouTube Shorts, Instagram Reels, TikTok, and Hindi regional audiences.
- **Batch Export Center**:
  - Package multiple clips into a ZIP bundle with transcripts and metadata in one click.

---

## Manual Developer Setup

### Backend (Python 3.10+)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (Node.js 18+)
```bash
cd frontend
npm install
npm run dev
```

---

## Verification & Testing
Run automated unit and pipeline tests:
```bash
cd backend
$env:PYTHONPATH='.'
python -m pytest tests/test_core.py
python tests/run_e2e_test.py
```
