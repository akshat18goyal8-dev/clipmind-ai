#!/usr/bin/env bash
cd "$(dirname "$0")"

source backend/venv/bin/activate
export PYTHONPATH=backend

echo "Starting CLIPMIND AI on http://localhost:8000 ..."
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
PID=$!

sleep 2

if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:8000"
elif command -v open &> /dev/null; then
    open "http://localhost:8000"
fi

wait $PID
